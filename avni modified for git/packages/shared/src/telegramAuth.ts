import { createHmac, createHash } from "node:crypto";

export function validateInitData(initData: string, botToken: string, maxAgeSec = 86400): Record<string, string> {
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) throw new Error("missing hash");
  params.delete("hash");
  const dataCheck = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("\n");
  const secret = createHmac("sha256", "WebAppData").update(botToken).digest();
  const digest = createHmac("sha256", secret).update(dataCheck).digest("hex");
  if (digest !== hash) throw new Error("invalid hash");
  const authDate = Number(params.get("auth_date") ?? 0);
  const now = Math.floor(Date.now() / 1000);
  if (authDate > now + 300) throw new Error("future dated");
  if (now - authDate > maxAgeSec) throw new Error("stale");
  return Object.fromEntries(params.entries());
}

export function webhookSecretOk(got: string | undefined, expected: string): boolean {
  if (!got || got.length !== expected.length) return false;
  const a = Buffer.from(got);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return createHash("sha256").update(a).digest("hex") === createHash("sha256").update(b).digest("hex")
    ? timingSafe(a, b)
    : timingSafe(a, b);
}

function timingSafe(a: Buffer, b: Buffer): boolean {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a[i]! ^ b[i]!;
  return r === 0;
}
