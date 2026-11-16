const api = () => `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;

export async function tg(method: string, body: Record<string, unknown>, fetchImpl: typeof fetch = fetch) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN missing");
  const res = await fetchImpl(`${api()}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = (await res.json()) as { ok: boolean; result?: unknown; description?: string };
  if (!json.ok) throw new Error(json.description ?? method);
  return json.result;
}

export type MemberStatus = "creator" | "administrator" | "member" | "restricted" | "left" | "kicked";

export async function getChatMember(
  chatId: number | string,
  userId: number,
  fetchImpl?: typeof fetch,
): Promise<{ status: MemberStatus }> {
  return tg("getChatMember", { chat_id: chatId, user_id: userId }, fetchImpl) as Promise<{ status: MemberStatus }>;
}

export async function forceSubscribeCheck(opts: {
  channelId: number | string;
  userId: number;
  failOpen: boolean;
  fetchImpl?: typeof fetch;
}): Promise<{ ok: boolean; status: string; failOpen?: boolean }> {
  try {
    const m = await getChatMember(opts.channelId, opts.userId, opts.fetchImpl);
    const ok = ["creator", "administrator", "member", "restricted"].includes(m.status);
    return { ok, status: m.status };
  } catch (err) {
    if (opts.failOpen) return { ok: true, status: "unknown", failOpen: true };
    throw err;
  }
}
