import { LOCK_CATEGORIES, type LockAction, type LockCategory } from "@avni/shared";

export interface GroupSettings {
  locks: Partial<Record<LockCategory, { enabled: boolean; action: LockAction; mute_seconds: number }>>;
  forceSub: {
    enabled: boolean;
    channel_id: string;
    action: string;
    fail_policy: "open" | "closed";
  };
  warn_limit: number;
  welcome_text: string;
  filters: Array<{ keyword: string }>;
}

export const defaultSettings = (): GroupSettings => ({
  locks: {},
  forceSub: { enabled: false, channel_id: "", action: "delete", fail_policy: "open" },
  warn_limit: 3,
  welcome_text: "",
  filters: [],
});

export function validateSettings(raw: unknown): GroupSettings {
  const d = defaultSettings();
  if (!raw || typeof raw !== "object") throw new Error("invalid settings");
  const o = raw as Record<string, unknown>;
  if (o.locks && typeof o.locks === "object") {
    for (const [k, v] of Object.entries(o.locks as Record<string, { enabled?: boolean; action?: string; mute_seconds?: number }>)) {
      if (!LOCK_CATEGORIES.includes(k as LockCategory)) throw new Error(`unknown lock ${k}`);
      const action = (v.action ?? "delete") as LockAction;
      if (!["delete", "mute", "kick", "ban"].includes(action)) throw new Error("bad action");
      d.locks[k as LockCategory] = {
        enabled: Boolean(v.enabled),
        action,
        mute_seconds: Number(v.mute_seconds ?? 3600),
      };
    }
  }
  if (o.forceSub && typeof o.forceSub === "object") {
    const f = o.forceSub as Record<string, unknown>;
    d.forceSub = {
      enabled: Boolean(f.enabled),
      channel_id: String(f.channel_id ?? ""),
      action: String(f.action ?? "delete"),
      fail_policy: f.fail_policy === "closed" ? "closed" : "open",
    };
  }
  if (typeof o.warn_limit === "number" && o.warn_limit >= 1 && o.warn_limit <= 20) d.warn_limit = o.warn_limit;
  if (typeof o.welcome_text === "string") d.welcome_text = o.welcome_text.slice(0, 4000);
  if (Array.isArray(o.filters)) {
    d.filters = o.filters.map((x) => ({ keyword: String((x as { keyword?: string }).keyword ?? "").slice(0, 64) })).filter((x) => x.keyword);
  }
  return d;
}

export interface Db {
  query: (sql: string, params?: unknown[]) => Promise<{ rows: Record<string, unknown>[] }>;
}

export async function loadSettings(db: Db, chatId: number): Promise<GroupSettings> {
  const s = defaultSettings();
  const locks = await db.query("select category, enabled, action, mute_seconds from lock_rules where chat_id = $1", [chatId]);
  for (const row of locks.rows) {
    s.locks[row.category as LockCategory] = {
      enabled: Boolean(row.enabled),
      action: row.action as LockAction,
      mute_seconds: Number(row.mute_seconds ?? 3600),
    };
  }
  const st = await db.query(
    "select warn_limit, welcome_text from chat_settings where chat_id = $1",
    [chatId],
  );
  if (st.rows[0]) {
    s.warn_limit = Number(st.rows[0].warn_limit ?? 3);
    s.welcome_text = String(st.rows[0].welcome_text ?? "");
  }
  const fs = await db.query(
    "select enabled, channel_id, action, fail_policy from force_sub_config where chat_id = $1",
    [chatId],
  );
  if (fs.rows[0]) {
    s.forceSub = {
      enabled: Boolean(fs.rows[0].enabled),
      channel_id: String(fs.rows[0].channel_id ?? ""),
      action: String(fs.rows[0].action ?? "delete"),
      fail_policy: fs.rows[0].fail_policy === "closed" ? "closed" : "open",
    };
  }
  const fl = await db.query("select keyword from filters where chat_id = $1", [chatId]);
  s.filters = fl.rows.map((r) => ({ keyword: String(r.keyword) }));
  return s;
}

export async function saveSettings(db: Db, chatId: number, settings: GroupSettings): Promise<void> {
  await db.query(
    `insert into chats (chat_id, type) values ($1, 'supergroup') on conflict (chat_id) do nothing`,
    [chatId],
  );
  await db.query(
    `insert into chat_settings (chat_id, warn_limit, welcome_text, updated_at)
     values ($1, $2, $3, now())
     on conflict (chat_id) do update set warn_limit = $2, welcome_text = $3, updated_at = now()`,
    [chatId, settings.warn_limit, settings.welcome_text],
  );
  for (const cat of LOCK_CATEGORIES) {
    if (cat === "all") continue;
    const rule = settings.locks[cat] ?? { enabled: false, action: "delete" as const, mute_seconds: 3600 };
    await db.query(
      `insert into lock_rules (chat_id, category, enabled, action, mute_seconds, updated_at)
       values ($1,$2,$3,$4,$5, now())
       on conflict (chat_id, category) do update set enabled=$3, action=$4, mute_seconds=$5, updated_at=now()`,
      [chatId, cat, rule.enabled, rule.action, rule.mute_seconds],
    );
  }
  await db.query(
    `insert into force_sub_config (chat_id, channel_id, enabled, action, fail_policy, updated_at)
     values ($1,$2,$3,$4,$5, now())
     on conflict (chat_id) do update set channel_id=$2, enabled=$3, action=$4, fail_policy=$5, updated_at=now()`,
    [chatId, settings.forceSub.channel_id || null, settings.forceSub.enabled, settings.forceSub.action, settings.forceSub.fail_policy],
  );
  await db.query("delete from filters where chat_id = $1", [chatId]);
  for (const f of settings.filters) {
    await db.query("insert into filters (chat_id, keyword) values ($1,$2)", [chatId, f.keyword]);
  }
}

/** In-memory stand-in used when DATABASE_URL is unset. Same interface as pg. */
export function memoryDb(): Db & { store: Map<string, Record<string, unknown>[]> } {
  const store = new Map<string, Record<string, unknown>[]>();
  const key = (sql: string) => sql.replace(/\s+/g, " ").trim().slice(0, 80);
  return {
    store,
    async query(sql, params = []) {
      const k = key(sql);
      if (sql.includes("insert into chats")) return { rows: [] };
      if (sql.startsWith("select category")) {
        return { rows: store.get(`locks:${params[0]}`) ?? [] };
      }
      if (sql.includes("from chat_settings")) {
        return { rows: store.get(`cs:${params[0]}`) ?? [] };
      }
      if (sql.includes("from force_sub_config")) {
        return { rows: store.get(`fs:${params[0]}`) ?? [] };
      }
      if (sql.includes("from filters") && sql.includes("select keyword")) {
        return { rows: store.get(`fl:${params[0]}`) ?? [] };
      }
      if (sql.includes("insert into chat_settings")) {
        store.set(`cs:${params[0]}`, [{ warn_limit: params[1], welcome_text: params[2] }]);
        return { rows: [] };
      }
      if (sql.includes("insert into lock_rules")) {
        const list = store.get(`locks:${params[0]}`) ?? [];
        const rest = list.filter((r) => r.category !== params[1]);
        rest.push({ category: params[1], enabled: params[2], action: params[3], mute_seconds: params[4] });
        store.set(`locks:${params[0]}`, rest);
        return { rows: [] };
      }
      if (sql.includes("insert into force_sub_config")) {
        store.set(`fs:${params[0]}`, [
          { channel_id: params[1], enabled: params[2], action: params[3], fail_policy: params[4] },
        ]);
        return { rows: [] };
      }
      if (sql.includes("delete from filters")) {
        store.set(`fl:${params[0]}`, []);
        return { rows: [] };
      }
      if (sql.includes("insert into filters")) {
        const list = store.get(`fl:${params[0]}`) ?? [];
        list.push({ keyword: params[1] });
        store.set(`fl:${params[0]}`, list);
        return { rows: [] };
      }
      void k;
      return { rows: [] };
    },
  };
}
