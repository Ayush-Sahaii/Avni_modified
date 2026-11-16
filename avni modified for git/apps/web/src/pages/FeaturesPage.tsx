export function FeaturesPage() {
  return (
    <div className="wrap">
      <section className="hero">
        <h1>Features</h1>
        <p>Moderation, force-subscribe, economy, family, whispers, AI chat (when a personality file is loaded), and seven games.</p>
      </section>
      <div className="grid">
        {[
          ["Moderation", "Per-category locks, configurable punishments, approvals, flood, warns."],
          ["Games", "Chess, Carrom, Ice Hockey, UNO, Ludo, Scrabble, Tic-Tac-Toe."],
          ["AI", "External personality file only. Disabled until the owner supplies it."],
          ["Economy", "Coins, XP, kill/rob with persisted timers."],
        ].map(([t, d]) => (
          <article className="glass card" key={t}>
            <h3>{t}</h3>
            <p>{d}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
