import { Link } from "@tanstack/react-router";
import UrlForm from "../components/UrlForm";

const HomePage = () => (
  <main className="home-page">
    <section className="shorten-stage" aria-labelledby="shorten-title">
      <div className="shorten-panel" id="shorten">
        <h1 id="shorten-title">Big URL? Little fix.</h1>
        <p>Paste your long link below. We’ll take it from here.</p>
        <UrlForm />
      </div>
    </section>
    <footer className="home-footer">
      <span>Small links. Made for sharing.</span>
      <Link to="/auth">Want to keep your links? Sign in ↗</Link>
    </footer>
  </main>
);

export default HomePage;
