export function SetupPage() {
  return (
    <div className="wrap">
      <section className="hero"><h1>Setup</h1></section>
      <article className="glass card">
        <h3>BotFather</h3>
        <p>Disable privacy mode for promotion lock. Enable Bot-to-Bot Communication Mode. Set the menu button domain. Enable inline mode with 100% feedback. Add a webhook secret.</p>
      </article>
      <article className="glass card" style={{ marginTop: 16 }}>
        <h3>Admin rights</h3>
        <p>Delete messages for locks. Restrict members for mute/kick/ban. Invite users if you use force-subscribe checks that need channel membership.</p>
      </article>
    </div>
  );
}
