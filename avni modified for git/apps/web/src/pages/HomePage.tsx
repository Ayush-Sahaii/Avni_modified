import { Link } from "react-router-dom";
import { POSTERS } from "../posters";

export function HomePage() {
  return (
    <div className="wrap">
      <section className="hero">
        <h1>Quiet power for lively groups.</h1>
        <p>
          Moderation that actually holds, original real-time games, and a Mini App that feels like a product — not a bot menu.
        </p>
        <div className="row">
          <a className="btn btn-primary" href="https://t.me/AvniBot?startgroup=1">Add to your group</a>
          <Link className="btn btn-ghost" to="/app">Open Mini App</Link>
        </div>
      </section>
      <div className="grid">
        {["Locks you can trust", "Seat-based rooms", "Economy & family", "Developer ops"].map((t) => (
          <article className="glass card" key={t}>
            <h3>{t}</h3>
            <p>Built from a single command registry, a single database of record, and server-authoritative games.</p>
          </article>
        ))}
      </div>
      <h2>Games</h2>
      <div className="grid">
        {POSTERS.map((g) => (
          <Link to="/games" key={g.id} className="poster">
            <img src={g.src} alt={g.title} />
          </Link>
        ))}
      </div>
    </div>
  );
}
