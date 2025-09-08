import { Link } from "react-router-dom";
import "./NotFound.css";

export default function NotFound() {
  return (
    <div className="notfound-container">
      <h1 className="notfound-code">404</h1>
      <h2 className="notfound-title">Page not found</h2>
      <p className="notfound-desc">The route you requested does not exist.</p>
      <Link to="/" className="notfound-link">
        Return home
      </Link>
    </div>
  );
}
