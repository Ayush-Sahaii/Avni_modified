import { z } from "zod";

export const envSchema = z.object({
  TELEGRAM_BOT_TOKEN: z.string().min(10),
  DATABASE_URL: z.string().min(1),
  PUBLIC_BASE_URL: z.string().url(),
  WEBHOOK_SECRET: z.string().min(32),
  DEV_IDS: z.string().default(""),
  AI_API_KEY: z.string().optional(),
  AI_BASE_URL: z.string().default("https://api.groq.com/openai/v1"),
  AI_MODELS: z.string().default("llama-3.1-8b-instant"),
  AI_TIMEOUT_MS: z.coerce.number().default(20000),
  PERSONALITY_FILE: z.string().default("config/personality/personality.txt"),
  BOT_USERNAME: z.string().default("AvniBot"),
  BOT_ID: z.string().optional(),
  BOT_DISPLAY_NAME: z.string().default("Avni"),
  MINI_APP_URL: z.string().url().optional(),
  WEBSITE_URL: z.string().url().optional(),
  SENTRY_DSN: z.string().optional(),
  LOG_LEVEL: z.string().default("info"),
  NODE_ENV: z.string().default("development"),
  PORT: z.coerce.number().default(8080),
  TRUST_PROXY: z.coerce.boolean().default(true),
  ALLOW_MISSING_POSTERS: z.coerce.boolean().default(true),
});

export type Env = z.infer<typeof envSchema>;

export function parseEnv(raw: NodeJS.Dict<string>): Env {
  const r = envSchema.safeParse(raw);
  if (!r.success) {
    const missing = r.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("\n");
    throw new Error(`Invalid environment:\n${missing}`);
  }
  return r.data;
}
