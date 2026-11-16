import { Link } from "react-router-dom";
export function NotFound() {
  return (
    <div className="wrap hero">
      <h1>404</h1>
      <p>That page is not here.</p>
      <Link className="btn btn-primary" to="/">Home</Link>
    </div>
  );
}
