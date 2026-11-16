export function LegalPage({ kind }: { kind: "privacy" | "terms" }) {
  return (
    <div className="wrap">
      <section className="hero">
        <h1>{kind === "privacy" ? "Privacy Policy" : "Terms"}</h1>
        <p>Needs legal review. Not legal advice.</p>
      </section>
      <article className="glass card">
        <p>
          We store Telegram IDs, usernames, group settings, economy balances, game results, and short-lived whispers.
          Message text is not logged. AI memory lasts 7 days. Whispers expire in 24 hours. Audit logs prune after 90 days.
        </p>
      </article>
    </div>
  );
}
