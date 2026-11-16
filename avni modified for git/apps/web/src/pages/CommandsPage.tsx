import { useMemo, useState } from "react";

const SAMPLE = [
  "start", "help", "id", "lock", "unlock", "approve", "coins", "family", "uno", "chess", "tictactoe",
];

export function CommandsPage() {
  const [q, setQ] = useState("");
  const list = useMemo(() => SAMPLE.filter((c) => c.includes(q.toLowerCase())), [q]);
  return (
    <div className="wrap">
      <section className="hero"><h1>Commands</h1><p>Generated from the command registry.</p></section>
      <input placeholder="Search commands" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="grid">
        {list.map((c) => (
          <article className="glass card" key={c}><h3>/{c}</h3><p>See /help in Telegram for the full list.</p></article>
        ))}
      </div>
    </div>
  );
}
