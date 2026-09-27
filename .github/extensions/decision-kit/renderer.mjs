export function renderHtml() {
    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Decision Kit</title>
  <style>
    :root {
      color-scheme: light dark;
      --canvas: var(--background-color-default, #f7f8fa);
      --surface: var(--background-color-default, #ffffff);
      --ink: var(--text-color-default, #17202a);
      --muted: var(--text-color-muted, #66707c);
      --line: var(--border-color-default, #d8dee4);
      --focus: var(--color-focus-outline, #0969da);
      --signal: var(--true-color-blue, #0969da);
      --signal-soft: var(--true-color-blue-muted, #ddf4ff);
      --risk: var(--true-color-red, #cf222e);
      --risk-soft: var(--true-color-red-muted, #ffebe9);
      --ok: #1a7f37;
      --ok-soft: #dafbe1;
      --space: 8px;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0; background: var(--canvas); color: var(--ink);
      font-family: Inter, var(--font-sans, system-ui, sans-serif);
      font-size: var(--text-body-medium, 14px); line-height: var(--leading-body-medium, 1.5);
    }
    button, textarea { font: inherit; }
    button:focus-visible, textarea:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; }
    .shell { min-height: 100vh; display: grid; grid-template-columns: minmax(176px, 23%) 1fr; }
    .rail { border-right: 1px solid var(--line); padding: calc(var(--space) * 3); background: var(--surface); }
    .brand { margin-bottom: calc(var(--space) * 4); }
    .brand-mark { font: 700 12px/1 var(--font-mono, monospace); letter-spacing: .14em; color: var(--signal); }
    h1 { margin: 8px 0 0; font-size: 20px; line-height: 1.1; letter-spacing: -.025em; }
    .scenario-list { display: grid; gap: 8px; }
    .scenario {
      width: 100%; padding: 12px; text-align: left; color: var(--ink); background: transparent;
      border: 1px solid transparent; border-radius: 6px; cursor: pointer;
    }
    .scenario:hover { border-color: var(--line); }
    .scenario[aria-pressed="true"] { border-color: var(--signal); background: var(--signal-soft); }
    .scenario small { display: block; color: var(--muted); font: 600 10px/1.4 var(--font-mono, monospace); text-transform: uppercase; letter-spacing: .08em; }
    .scenario strong { display: block; margin-top: 4px; font-size: 13px; }
    main { min-width: 0; padding: calc(var(--space) * 4); }
    .topline { display: flex; justify-content: space-between; align-items: center; gap: 16px; margin-bottom: 24px; }
    .mode { display: inline-flex; align-items: center; gap: 7px; font: 600 11px/1 var(--font-mono, monospace); text-transform: uppercase; letter-spacing: .08em; }
    .mode::before { content: ""; width: 7px; height: 7px; border-radius: 50%; background: var(--muted); }
    .mode.live::before { background: var(--ok); }
    .mode.demo::before { background: #bf8700; }
    .reset { border: 0; background: transparent; color: var(--muted); cursor: pointer; text-decoration: underline; text-underline-offset: 3px; }
    .workbench { max-width: 980px; margin: 0 auto; }
    .brief { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 16px; align-items: end; border-bottom: 1px solid var(--line); padding-bottom: 24px; }
    .eyebrow { color: var(--signal); font: 700 11px/1 var(--font-mono, monospace); text-transform: uppercase; letter-spacing: .1em; }
    h2 { max-width: 680px; margin: 8px 0 16px; font-size: clamp(24px, 4vw, 42px); line-height: 1.04; letter-spacing: -.04em; }
    label { display: block; margin-bottom: 8px; font-weight: 600; }
    textarea { width: 100%; min-height: 132px; resize: vertical; padding: 14px; color: var(--ink); background: var(--surface); border: 1px solid var(--line); border-radius: 6px; }
    .run { min-width: 132px; padding: 12px 16px; color: #fff; background: #1f6feb; border: 1px solid #1f6feb; border-radius: 6px; font-weight: 700; cursor: pointer; }
    .run:hover { background: #1158c7; }
    .run:disabled { opacity: .55; cursor: wait; }
    .notice, .error { margin: 16px 0 0; padding: 12px 14px; border-left: 3px solid #bf8700; background: #fff8c5; color: #4d2d00; }
    .error { border-color: var(--risk); background: var(--risk-soft); color: var(--risk); }
    .progress { margin: 24px 0; display: grid; grid-template-columns: 1fr 24px 1fr; align-items: center; }
    .step { min-height: 58px; padding: 11px 12px; border: 1px solid var(--line); background: var(--surface); }
    .step.active { border-color: var(--signal); }
    .step.done { border-color: var(--ok); }
    .step span { display: block; color: var(--muted); font: 600 10px/1.3 var(--font-mono, monospace); text-transform: uppercase; letter-spacing: .08em; }
    .step strong { display: block; margin-top: 4px; }
    .connector { height: 1px; background: var(--line); }
    .empty { padding: 48px 0; color: var(--muted); text-align: center; }
    .decision { display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(220px, .8fr); gap: 16px; align-items: start; }
    .panel { border: 1px solid var(--line); background: var(--surface); padding: 20px; }
    .panel h3 { margin: 0 0 14px; font-size: 16px; }
    .branch { margin: 8px 0; font-size: clamp(22px, 3vw, 32px); line-height: 1.1; letter-spacing: -.03em; }
    .metric-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: var(--line); border: 1px solid var(--line); margin-top: 18px; }
    .metric { padding: 12px; background: var(--surface); }
    .metric span { display: block; color: var(--muted); font: 10px/1.3 var(--font-mono, monospace); text-transform: uppercase; }
    .metric strong { display: block; margin-top: 5px; font-size: 18px; }
    .gate { border-left: 4px solid var(--ok); }
    .gate.review { border-left-color: var(--risk); }
    .gate.review .gate-title { color: var(--risk); }
    .distribution { display: grid; gap: 10px; }
    .bar-head { display: flex; justify-content: space-between; gap: 12px; font: 12px/1.3 var(--font-mono, monospace); }
    .track { height: 5px; margin-top: 4px; background: var(--line); }
    .fill { height: 100%; background: var(--signal); transform-origin: left; animation: reveal .45s ease-out both; }
    .narrative { margin-top: 16px; border-top: 1px solid var(--line); padding-top: 16px; }
    .narrative p { margin: 0 0 12px; }
    .narrative ol { margin: 0; padding-left: 20px; }
    details { margin-top: 16px; color: var(--muted); }
    summary { cursor: pointer; font-family: var(--font-mono, monospace); }
    dl { display: grid; grid-template-columns: max-content 1fr; gap: 6px 12px; font: 11px/1.4 var(--font-mono, monospace); }
    dt { color: var(--muted); } dd { margin: 0; overflow-wrap: anywhere; color: var(--ink); }
    @keyframes reveal { from { transform: scaleX(0); } }
    @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: .01ms !important; } }
    @media (max-width: 680px) {
      .shell { display: block; }
      .rail { position: sticky; top: 0; z-index: 2; padding: 12px 16px; border-right: 0; border-bottom: 1px solid var(--line); }
      .brand { display: none; }
      .scenario-list { display: flex; overflow-x: auto; }
      .scenario { min-width: 150px; }
      main { padding: 20px 16px; }
      .brief, .decision { grid-template-columns: 1fr; }
      .run { width: 100%; }
      .metric-row { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <div class="shell">
    <aside class="rail" aria-label="Decision scenarios">
      <div class="brand"><div class="brand-mark">DECISION / KIT</div><h1>Make the branch visible.</h1></div>
      <nav id="scenario-list" class="scenario-list"></nav>
    </aside>
    <main><div class="workbench">
      <div class="topline"><div id="mode" class="mode">Checking mode</div><button id="reset" class="reset" type="button">Reset state</button></div>
      <section class="brief" aria-labelledby="prompt">
        <div><div id="eyebrow" class="eyebrow"></div><h2 id="prompt"></h2><label for="context">Decision context</label><textarea id="context"></textarea></div>
        <button id="run" class="run" type="button">Run decision</button>
      </section>
      <div id="message" aria-live="polite"></div>
      <section class="progress" aria-label="Decision progress">
        <div id="jev-step" class="step"><span>Stage 1 · typed</span><strong>Jev decision</strong></div>
        <div class="connector"></div>
        <div id="llm-step" class="step"><span>Stage 2 · narrative</span><strong>LLM explanation</strong></div>
      </section>
      <section id="output"><div class="empty">Choose a scenario, shape the context, then run the decision.</div></section>
    </div></main>
  </div>
  <script>
    const els = Object.fromEntries(["scenario-list","mode","reset","eyebrow","prompt","context","run","message","jev-step","llm-step","output"].map(id => [id, document.getElementById(id)]));
    let state;
    const esc = value => String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\\"":"&quot;","'":"&#39;"}[c]));
    const pct = value => Math.round(value * 100) + "%";

    function render() {
      if (!state) return;
      const current = state.scenarios.find(item => item.id === state.scenarioId);
      els["scenario-list"].innerHTML = state.scenarios.map(item => \`<button class="scenario" type="button" data-id="\${esc(item.id)}" aria-pressed="\${item.id === state.scenarioId}"><small>\${esc(item.eyebrow)}</small><strong>\${esc(item.label)}</strong></button>\`).join("");
      els.eyebrow.textContent = current.eyebrow;
      els.prompt.textContent = current.prompt;
      if (document.activeElement !== els.context) els.context.value = state.context;
      els.mode.className = "mode " + state.mode;
      els.mode.textContent = state.mode === "live" ? "Live · OpenRouter" : "Demo · deterministic";
      els.run.disabled = state.status === "jev" || state.status === "llm";
      els.run.textContent = els.run.disabled ? "Working…" : "Run decision";
      els["jev-step"].className = "step " + (state.status === "jev" ? "active" : ["llm","success"].includes(state.status) ? "done" : "");
      els["llm-step"].className = "step " + (state.status === "llm" ? "active" : state.status === "success" ? "done" : "");
      els.message.innerHTML = state.error ? \`<div class="error" role="alert">\${esc(state.error)}</div>\` : state.result?.demoNotice ? \`<div class="notice">\${esc(state.result.demoNotice)}</div>\` : "";
      if (state.status === "jev" || state.status === "llm") {
        els.output.innerHTML = \`<div class="empty">\${esc(state.progressMessage)}</div>\`;
      } else if (state.result) {
        renderResult(state.result);
      } else if (!state.error) {
        els.output.innerHTML = '<div class="empty">Choose a scenario, shape the context, then run the decision.</div>';
      }
    }

    function renderResult(result) {
      const d = result.decision;
      const scenario = state.scenarios.find(item => item.id === state.scenarioId);
      const branchLabel = scenario.options?.[d.chosenBranch] || d.chosenBranch;
      const bars = Object.entries(d.probabilities).sort((a,b) => b[1]-a[1]).map(([name,value]) => \`<div><div class="bar-head"><span>\${esc(name)}</span><strong>\${pct(value)}</strong></div><div class="track"><div class="fill" style="width:\${pct(value)}"></div></div></div>\`).join("");
      const review = d.requiresHumanReview;
      els.output.innerHTML = \`
        <div class="decision">
          <article class="panel">
            <div class="eyebrow">Jev decision · authoritative typed output</div>
            <div class="branch">\${esc(branchLabel)}</div>
            <div class="metric-row">
              <div class="metric"><span>Confidence</span><strong>\${pct(d.confidence)}</strong></div>
              <div class="metric"><span>Urgency score</span><strong>\${d.score.toFixed(2)}</strong></div>
              <div class="metric"><span>Jev latency</span><strong>\${d.latencyMs} ms</strong></div>
            </div>
            \${d.components.includes("option-distribution") ? \`<section class="narrative"><h3>Option distribution</h3><div class="distribution">\${bars}</div></section>\` : ""}
            <details><summary>Audit trace</summary><dl>
              <dt>Mode</dt><dd>\${esc(result.mode)}</dd><dt>Jev model</dt><dd>\${esc(d.providerModel)}</dd>
              <dt>Provider</dt><dd>\${esc(d.provider)}</dd><dt>Human-review probability</dt><dd>\${pct(d.reviewProbability)}</dd>
              <dt>Confidence threshold</dt><dd>\${pct(d.threshold)}</dd><dt>LLM model</dt><dd>\${esc(result.narrative.model)}</dd>
            </dl></details>
          </article>
          <aside class="panel gate \${review ? "review" : ""}">
            <div class="eyebrow">\${review ? "Human checkpoint" : "Confidence gate passed"}</div>
            <h3 class="gate-title">\${review ? "Review before action" : "Recommended action"}</h3>
            <p>\${review ? "The typed result is not authorization. A person must validate the evidence and choose the final action." : esc(branchLabel)}</p>
            <section class="narrative">
              <div class="eyebrow">LLM narrative · explanatory only</div>
              <p>\${esc(result.narrative.rationale)}</p>
              <ol>\${result.narrative.nextSteps.map(step => \`<li>\${esc(step)}</li>\`).join("")}</ol>
            </section>
          </aside>
        </div>\`;
    }

    async function load() { state = await fetch("/state").then(r => r.json()); render(); }
    els["scenario-list"].addEventListener("click", event => {
      const button = event.target.closest("[data-id]"); if (!button) return;
      const scenario = state.scenarios.find(item => item.id === button.dataset.id);
      state.scenarioId = scenario.id; state.context = scenario.context; state.result = null; state.error = null; render(); els.context.focus();
    });
    els.context.addEventListener("input", () => { state.context = els.context.value; });
    els.run.addEventListener("click", async () => {
      const response = await fetch("/run", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({scenarioId: state.scenarioId, context: els.context.value}) });
      if (!response.ok) { const data = await response.json(); state.error = data.error; render(); }
    });
    els.reset.addEventListener("click", () => fetch("/reset", {method:"POST"}));
    const events = new EventSource("/events");
    events.onmessage = event => { state = JSON.parse(event.data); render(); };
    events.onerror = () => { els.message.innerHTML = '<div class="error" role="alert">The local canvas connection was interrupted. Reopen the canvas to reconnect.</div>'; };
    load();
  </script>
</body>
</html>`;
}
