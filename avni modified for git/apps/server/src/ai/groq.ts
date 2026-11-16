import { assembleSystemPrompt, triggerLayer } from "./prompt.js";
import type { PersonalityState } from "./personality.js";
import { AI_UNAVAILABLE } from "./personality.js";

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export async function completeChat(opts: {
  personality: PersonalityState;
  userText: string;
  history: ChatTurn[];
  fetchImpl?: typeof fetch;
}): Promise<{ text: string; source: "notice" | "model" }> {
  const canned = triggerLayer(opts.userText);
  if (canned) return { text: canned, source: "notice" };
  const system = assembleSystemPrompt(opts.personality);
  const key = process.env.AI_API_KEY;
  if (!system || !key) return { text: AI_UNAVAILABLE, source: "notice" };

  const base = (process.env.AI_BASE_URL ?? "https://api.groq.com/openai/v1").replace(/\/$/, "");
  const model = (process.env.AI_MODELS ?? "llama-3.1-8b-instant").split(",")[0]!.trim();
  const timeout = Number(process.env.AI_TIMEOUT_MS ?? 20000);
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeout);
  try {
    const fetchFn = opts.fetchImpl ?? fetch;
    const res = await fetchFn(`${base}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.8,
        max_tokens: 400,
        messages: [
          { role: "system", content: system },
          ...opts.history.slice(-10),
          { role: "user", content: opts.userText },
        ],
      }),
      signal: ctrl.signal,
    });
    if (!res.ok) {
      return { text: AI_UNAVAILABLE, source: "notice" };
    }
    const json = (await res.json()) as {
      choices?: Array<{ finish_reason?: string; message?: { content?: string } }>;
    };
    const choice = json.choices?.[0];
    const content = choice?.message?.content?.trim();
    if (!content || choice?.finish_reason === "content_filter") {
      return { text: AI_UNAVAILABLE, source: "notice" };
    }
    return { text: content, source: "model" };
  } catch {
    return { text: AI_UNAVAILABLE, source: "notice" };
  } finally {
    clearTimeout(t);
  }
}
