export function DesignGuide() {
  return (
    <div className="wrap">
      <section className="hero"><h1>Design tokens</h1></section>
      <div className="grid">
        {["Primary button", "Ghost button", "Glass card", "Poster"].map((t) => (
          <article className="glass card" key={t}><h3>{t}</h3><p>Monochrome glass system. No emoji icons.</p></article>
        ))}
      </div>
      <button className="btn btn-primary" type="button">Primary</button>
    </div>
  );
}
