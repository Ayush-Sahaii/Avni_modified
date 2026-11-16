import Fastify from "fastify";
import websocket from "@fastify/websocket";
import cors from "@fastify/cors";
import { webhookSecretOk } from "@avni/shared";
import { handleUpdate } from "./bot/handleUpdate.js";
import { RoomHub } from "./games/roomHub.js";
import { loadPersonality } from "./ai/personality.js";
import { VERSION } from "./version.js";
import { memoryDb } from "./db/settingsRepo.js";
import { pgDb } from "./db/pgPool.js";
import { registerGroupSettings } from "./api/groupSettings.js";

const PORT = Number(process.env.PORT ?? 8080);
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET ?? "";

async function main() {
  const app = Fastify({ logger: true });
  await app.register(cors, { origin: true });
  await app.register(websocket);

  const personality = loadPersonality(process.env.PERSONALITY_FILE ?? "config/personality/personality.txt");
  const rooms = new RoomHub();
  const db = process.env.DATABASE_URL ? pgDb(process.env.DATABASE_URL) : memoryDb();
  registerGroupSettings(app, db);
  let maintenance = false;

  app.get("/healthz", async () => ({ ok: true, version: VERSION }));
  app.get("/readyz", async (_req, reply) => {
    if (!process.env.TELEGRAM_BOT_TOKEN && process.env.NODE_ENV === "production") {
      return reply.code(503).send({ ok: false, reason: "missing TELEGRAM_BOT_TOKEN" });
    }
    return { ok: true, db: Boolean(process.env.DATABASE_URL), personality: personality.status };
  });
  app.get("/api/status", async () => ({
    uptime: process.uptime(),
    version: VERSION,
    maintenance,
    incident: null,
  }));
  app.get("/api/version", async () => ({
    version: VERSION,
    personality: { status: personality.status, checksum: personality.checksum, size: personality.size },
  }));
  app.get("/api/commands", async () => {
    const { COMMANDS, helpText } = await import("@avni/shared");
    return { commands: COMMANDS, help: helpText() };
  });

  app.addHook("onRequest", async (req, reply) => {
    if (maintenance && !req.url.startsWith("/healthz") && !req.url.startsWith("/readyz")) {
      if (req.url.startsWith("/api") || req.url.startsWith("/ws")) {
        return reply.code(503).send({ error: "maintenance", message: "The service is in maintenance mode." });
      }
    }
  });

  app.post("/telegram/webhook", async (req, reply) => {
    const secret = (req.headers["x-telegram-bot-api-secret-token"] as string | undefined) ?? "";
    if (WEBHOOK_SECRET && !webhookSecretOk(secret, WEBHOOK_SECRET)) {
      return reply.code(403).send({ error: "forbidden" });
    }
    try {
      const result = await handleUpdate(req.body as Record<string, unknown>, {
        personality,
        setMaintenance: (v) => {
          maintenance = v;
        },
        maintenance: () => maintenance,
      });
      return result ?? { ok: true };
    } catch (err) {
      req.log.error({ err }, "update failed");
      return reply.code(200).send({ ok: true });
    }
  });

  app.get("/ws", { websocket: true }, (socket) => {
    const client = { send: (data: string) => socket.send(data) };
    socket.on("message", (raw) => {
      try {
        const msg = JSON.parse(String(raw)) as Record<string, unknown>;
        const out = rooms.handle(msg, client);
        socket.send(JSON.stringify(out));
      } catch (err) {
        console.error("ws message", err);
        socket.send(JSON.stringify({ error: "bad_message", message: String(err) }));
      }
    });
    socket.on("close", () => rooms.drop(client));
  });

  await app.listen({ port: PORT, host: "0.0.0.0" });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
