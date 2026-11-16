import { Link, Outlet } from "react-router-dom";

export function AppShell() {
  return (
    <div>
      <div className="wrap">
        <nav className="nav">
          <Link to="/" className="brand">Avni</Link>
          <div className="links">
            <Link to="/features">Features</Link>
            <Link to="/games">Games</Link>
            <Link to="/commands">Commands</Link>
            <Link to="/setup">Setup</Link>
            <Link to="/app">Mini App</Link>
          </div>
        </nav>
      </div>
      <Outlet />
      <div className="wrap">
        <footer>
          Avni · <Link to="/privacy">Privacy</Link> · <Link to="/terms">Terms</Link> · Drafts need legal review.
        </footer>
      </div>
    </div>
  );
}
