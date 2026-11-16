import type { FastifyInstance } from "fastify";
import { validateInitData } from "@avni/shared";
import { loadSettings, saveSettings, validateSettings, type Db } from "../db/settingsRepo.js";

export function registerGroupSettings(app: FastifyInstance, db: Db) {
  app.get("/api/groups/:chatId/settings", async (req, reply) => {
    const chatId = Number((req.params as { chatId: string }).chatId);
    if (!Number.isFinite(chatId)) return reply.code(400).send({ error: "bad chat id" });
    try {
      const settings = await loadSettings(db, chatId);
      return { settings };
    } catch (err) {
      req.log.error({ err }, "load settings");
      return reply.code(500).send({ error: "load_failed", id: Date.now().toString(36) });
    }
  });

  app.put("/api/groups/:chatId/settings", async (req, reply) => {
    const chatId = Number((req.params as { chatId: string }).chatId);
    const auth = req.headers.authorization ?? "";
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (token && auth.startsWith("tma ")) {
      try {
        validateInitData(auth.slice(4), token);
      } catch (err) {
        return reply.code(401).send({ error: "unauthorized", message: String(err) });
      }
    } else if (process.env.NODE_ENV === "production" && token) {
      return reply.code(401).send({ error: "unauthorized" });
    }
    try {
      const settings = validateSettings((req.body as { settings?: unknown })?.settings ?? req.body);
      await saveSettings(db, chatId, settings);
      const loaded = await loadSettings(db, chatId);
      return { ok: true, settings: loaded };
    } catch (err) {
      req.log.error({ err }, "save settings");
      return reply.code(400).send({ error: String(err) });
    }
  });
}
