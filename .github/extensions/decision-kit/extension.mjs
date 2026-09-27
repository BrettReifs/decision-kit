import { createServer } from "node:http";
import { CanvasError, createCanvas, joinSession } from "@github/copilot-sdk/extension";
import { renderHtml } from "./renderer.mjs";
import { runDemoDecision, runLiveDecision } from "./provider.mjs";
import { getScenario, scenarioSummaries } from "./scenarios.mjs";
import { validateRunInput } from "./core.mjs";

const servers = new Map();
let credentialDenied = false;

function initialState(scenarioId = "incident") {
    const scenario = getScenario(scenarioId);
    return {
        scenarioId,
        context: scenario.context,
        scenarios: scenarioSummaries().map((summary) => ({
            ...summary,
            options: getScenario(summary.id).options,
        })),
        mode: process.env.OPENROUTER_API_KEY ? "live" : "demo",
        status: "empty",
        progressMessage: "",
        result: null,
        error: null,
        credentialDenied,
    };
}

function sendJson(res, status, payload) {
    res.writeHead(status, {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
    });
    res.end(JSON.stringify(payload));
}

async function readJson(req) {
    const chunks = [];
    let size = 0;
    for await (const chunk of req) {
        size += chunk.length;
        if (size > 64 * 1024) throw new Error("Request body exceeds 64 KiB.");
        chunks.push(chunk);
    }
    try {
        return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
    } catch {
        throw new Error("Request body must be valid JSON.");
    }
}

function broadcast(entry) {
    const message = `data: ${JSON.stringify(entry.state)}\n\n`;
    for (const client of entry.clients) client.write(message);
}

function resetEntry(entry, scenarioId = "incident") {
    entry.state = initialState(scenarioId);
    broadcast(entry);
    return entry.state;
}

async function execute(entry, input) {
    if (entry.running) throw new Error("A decision is already running.");
    const { scenario, context } = validateRunInput(input);
    entry.running = true;
    entry.state = {
        ...entry.state,
        scenarioId: scenario.id,
        context,
        status: "jev",
        progressMessage: "Preparing typed questions.",
        result: null,
        error: null,
    };
    broadcast(entry);

    const onProgress = (status, progressMessage) => {
        entry.state = { ...entry.state, status, progressMessage };
        broadcast(entry);
    };

    try {
        const runner = process.env.OPENROUTER_API_KEY ? runLiveDecision : runDemoDecision;
        const result = await runner({
            scenario,
            context,
            apiKey: process.env.OPENROUTER_API_KEY,
            onProgress,
        });
        entry.state = { ...entry.state, status: "success", progressMessage: "", result };
        broadcast(entry);
        return result;
    } catch (error) {
        entry.state = {
            ...entry.state,
            status: "error",
            progressMessage: "",
            error: error instanceof Error ? error.message : "Decision failed.",
        };
        broadcast(entry);
        throw error;
    } finally {
        entry.running = false;
    }
}

async function startServer(instanceId, scenarioId) {
    const entry = {
        server: null,
        url: "",
        state: initialState(scenarioId),
        clients: new Set(),
        running: false,
    };
    const server = createServer(async (req, res) => {
        const url = new URL(req.url ?? "/", "http://127.0.0.1");
        try {
            if (req.method === "GET" && url.pathname === "/") {
                res.writeHead(200, {
                    "Content-Type": "text/html; charset=utf-8",
                    "Cache-Control": "no-store",
                    "Content-Security-Policy":
                        "default-src 'self'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; connect-src 'self'",
                });
                res.end(renderHtml());
                return;
            }
            if (req.method === "GET" && url.pathname === "/state") {
                sendJson(res, 200, entry.state);
                return;
            }
            if (req.method === "GET" && url.pathname === "/events") {
                res.writeHead(200, {
                    "Content-Type": "text/event-stream",
                    "Cache-Control": "no-cache",
                    Connection: "keep-alive",
                });
                res.write(`data: ${JSON.stringify(entry.state)}\n\n`);
                entry.clients.add(res);
                req.on("close", () => entry.clients.delete(res));
                return;
            }
            if (req.method === "POST" && url.pathname === "/run") {
                const input = await readJson(req);
                sendJson(res, 202, { accepted: true });
                void execute(entry, input).catch(() => {});
                return;
            }
            if (req.method === "POST" && url.pathname === "/reset") {
                sendJson(res, 200, resetEntry(entry));
                return;
            }
            sendJson(res, 404, { error: "Route not found." });
        } catch (error) {
            sendJson(res, 400, {
                error: error instanceof Error ? error.message : "Request failed.",
            });
        }
    });
    entry.server = server;
    await new Promise((resolve, reject) => {
        server.once("error", reject);
        server.listen(0, "127.0.0.1", resolve);
    });
    const address = server.address();
    const port = typeof address === "object" && address ? address.port : 0;
    entry.url = `http://127.0.0.1:${port}/`;
    servers.set(instanceId, entry);
    return entry;
}

const canvas = createCanvas({
    id: "decision-kit",
    displayName: "Decision Kit",
    description: "Run typed Jev decisions and inspect confidence-gated, context-selected actions.",
    inputSchema: {
        type: "object",
        additionalProperties: false,
        properties: {
            scenarioId: { type: "string", enum: ["incident", "feature", "escalation"] },
        },
    },
    actions: [
        {
            name: "run_preset",
            description: "Run one decision preset, optionally with edited context.",
            inputSchema: {
                type: "object",
                additionalProperties: false,
                required: ["scenarioId"],
                properties: {
                    scenarioId: {
                        type: "string",
                        enum: ["incident", "feature", "escalation"],
                    },
                    context: { type: "string", minLength: 20, maxLength: 12000 },
                },
            },
            handler: async (ctx) => {
                const entry = servers.get(ctx.instanceId);
                if (!entry) throw new CanvasError("decision_canvas_closed", "Open the canvas first.");
                const scenario = getScenario(ctx.input.scenarioId);
                try {
                    return await execute(entry, {
                        scenarioId: scenario.id,
                        context: ctx.input.context ?? scenario.context,
                    });
                } catch (error) {
                    throw new CanvasError(
                        "decision_run_failed",
                        error instanceof Error ? error.message : "Decision failed.",
                    );
                }
            },
        },
        {
            name: "reset_state",
            description: "Reset the workbench to its initial incident scenario.",
            inputSchema: { type: "object", additionalProperties: false },
            handler: (ctx) => {
                const entry = servers.get(ctx.instanceId);
                if (!entry) throw new CanvasError("decision_canvas_closed", "Open the canvas first.");
                resetEntry(entry);
                return { reset: true, scenarioId: entry.state.scenarioId };
            },
        },
    ],
    open: async (ctx) => {
        let entry = servers.get(ctx.instanceId);
        if (!entry) entry = await startServer(ctx.instanceId, ctx.input?.scenarioId ?? "incident");
        return { title: "Decision Kit", url: entry.url, status: entry.state.mode };
    },
    onClose: async (ctx) => {
        const entry = servers.get(ctx.instanceId);
        if (!entry) return;
        servers.delete(ctx.instanceId);
        for (const client of entry.clients) client.end();
        await new Promise((resolve) => entry.server.close(resolve));
    },
});

try {
    await joinSession({
        requestedEnvironmentVariables: ["OPENROUTER_API_KEY"],
        canvases: [canvas],
    });
} catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!/(denied|declined|not granted)/i.test(message)) throw error;
    credentialDenied = true;
    await joinSession({ canvases: [canvas] });
}
