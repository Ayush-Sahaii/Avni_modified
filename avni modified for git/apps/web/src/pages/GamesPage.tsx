import { POSTERS } from "../posters";

export function GamesPage() {
  return (
    <div className="wrap">
      <section className="hero"><h1>Games</h1><p>Owner poster art. Server-authoritative rules.</p></section>
      <div className="grid">
        {POSTERS.map((g) => (
          <article className="glass card" key={g.id}>
            <div className="poster" style={{ minHeight: 180, marginBottom: 12 }}>
              <img src={g.src} alt={g.title} />
            </div>
            <h3>{g.title}</h3>
            <p>{g.rules}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
