# Synthetic handoff: support ticket → agent summary

## Purpose

Support-ticket caller → summarizing agent → caller: send ticket text and receive
a short summary. Synthetic golden-path demonstration, not code-derived.
Replace these synthetic values and rules with evidence from the chosen boundary;
the JSON below contains valid example values, not placeholders.

## Input JSON

```json
{
  "request_id": "req-demo-123",
  "ticket_text": "I reset my password, but I still cannot sign in."
}
```

## Output JSON

```json
{
  "request_id": "req-demo-123",
  "summary": "Customer cannot sign in after resetting their password."
}
```

## Field map

| Input | Output | What to do |
|---|---|---|
| `ticket_text` | `summary` | Generate a concise summary, not a verbatim copy. Assumed—confirm. |

## Handling rules

- **Assumed—confirm:** Require nonempty `ticket_text`.
- **Assumed—confirm:** Return `request_id` unchanged to match the response.
- **Assumed—confirm:** Treat `summary` as generated text, not a verified fact.
- **Still to decide:** What error shape is returned if summarization fails?
