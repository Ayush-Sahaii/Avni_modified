import { useMemo, useState } from "react";
import { LOCK_CATEGORIES, promotionReadiness } from "@avni/shared";

type Tab = "locks" | "forcesub" | "moderation" | "greetings" | "filters" | "readiness";

const TABS: Tab[] = ["locks", "forcesub", "moderation", "greetings", "filters", "readiness"];

export function GroupDashboard() {
  const [tab, setTab] = useState<Tab>("locks");
  const chatId = "-1001";
  const [dirty, setDirty] = useState(false);
  const [saveState, setSaveState] = useState("");
  const [locks, setLocks] = useState<Record<string, { on: boolean; action: string }>>({});
  const [fs, setFs] = useState({ enabled: false, channel: "", action: "delete", failOpen: true });
  const [warnLimit, setWarnLimit] = useState(3);
  const [welcome, setWelcome] = useState("Hello {name}");
  const [filters, setFilters] = useState<string[]>([]);
  const [filterDraft, setFilterDraft] = useState("");
  const ready = useMemo(
    () =>
      promotionReadiness({
        botIsAdmin: false,
        privacyModeOff: false,
        botToBotMode: false,
        canDelete: false,
      }),
    [],
  );

  return (
    <div>
      <h1>Group</h1>
      <div className="row" style={{ marginBottom: 12 }}>
        {TABS.map((t) => (
          <button key={t} className={tab === t ? "btn btn-primary" : "btn btn-ghost"} type="button" onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>
      {tab === "locks" && (
        <div>
          {LOCK_CATEGORIES.filter((c) => c !== "all").map((c) => (
            <label key={c} className="glass card" style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span>{c}</span>
              <input
                type="checkbox"
                checked={Boolean(locks[c]?.on)}
                onChange={(e) => {
                  setLocks({ ...locks, [c]: { on: e.target.checked, action: locks[c]?.action ?? "delete" } });
                  setDirty(true);
                }}
              />
            </label>
          ))}
          <p style={{ color: "var(--muted)", fontSize: 13 }}>Members who send locked content will have the message deleted.</p>
        </div>
      )}
      {tab === "forcesub" && (
        <div className="glass card">
          <label>
            Channel ID
            <input value={fs.channel} onChange={(e) => { setFs({ ...fs, channel: e.target.value }); setDirty(true); }} />
          </label>
          <label>
            Enabled
            <input type="checkbox" checked={fs.enabled} onChange={(e) => { setFs({ ...fs, enabled: e.target.checked }); setDirty(true); }} />
          </label>
          <p>Fail policy: {fs.failOpen ? "open (allow if Telegram errors)" : "closed"}</p>
        </div>
      )}
      {tab === "moderation" && (
        <div className="glass card">
          <label>
            Warn limit
            <input type="number" value={warnLimit} onChange={(e) => { setWarnLimit(Number(e.target.value)); setDirty(true); }} />
          </label>
        </div>
      )}
      {tab === "greetings" && (
        <div className="glass card">
          <textarea value={welcome} onChange={(e) => { setWelcome(e.target.value); setDirty(true); }} />
          <p>Preview: {welcome.replace("{name}", "Ada")}</p>
        </div>
      )}
      {tab === "filters" && (
        <div>
          <input value={filterDraft} onChange={(e) => setFilterDraft(e.target.value)} placeholder="keyword" />
          <button className="btn btn-primary" type="button" onClick={() => { setFilters([...filters, filterDraft]); setFilterDraft(""); setDirty(true); }}>
            Add
          </button>
          <ul>{filters.map((f) => <li key={f}>{f}</li>)}</ul>
        </div>
      )}
      {tab === "readiness" && (
        <article className="glass card">
          <h3>{ready.ready ? "Ready" : "Not ready"}</h3>
          {ready.missing.map((m) => <p key={m}>{m}</p>)}
        </article>
      )}
      {dirty && (
        <div className="glass card" style={{ marginTop: 12 }}>
          <p>Unsaved changes</p>
          <button
            className="btn btn-primary"
            type="button"
            onClick={async () => {
              const payload = {
                settings: {
                  locks: Object.fromEntries(Object.entries(locks).map(([k, v]) => [k, { enabled: v.on, action: v.action ?? "delete" }])),
                  forceSub: { enabled: fs.enabled, channel_id: fs.channel, action: fs.action, fail_policy: fs.failOpen ? "open" : "closed" },
                  warn_limit: warnLimit,
                  welcome_text: welcome,
                  filters: filters.map((keyword) => ({ keyword })),
                },
              };
              try {
                const res = await fetch(`/api/groups/${chatId}/settings`, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(payload),
                });
                if (!res.ok) throw new Error(await res.text());
                setDirty(false);
                setSaveState("Saved");
              } catch (e) {
                setSaveState(String(e));
              }
            }}
          >
            Save
          </button>
          <p>{saveState}</p>
        </div>
      )}
    </div>
  );
}
