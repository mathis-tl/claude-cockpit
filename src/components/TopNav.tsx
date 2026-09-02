import type { Route } from "../hooks/useHashRoute";
import { ClaudeMark } from "./Icon";
import "./TopNav.css";

interface TopNavProps {
  route: Route;
  navigate: (route: Route) => void;
  onOpenPalette: () => void;
}

export function TopNav({ route, navigate, onOpenPalette }: TopNavProps) {
  const onHome =
    route.view === "home" || route.view === "workflow" || route.view === "category";

  return (
    <header className="top-nav">
      <button
        type="button"
        className="top-nav__brand"
        onClick={() => navigate({ view: "home" })}
        aria-label="Retour à l'accueil"
      >
        <ClaudeMark className="top-nav__mark" size={18} />
        <span className="top-nav__brand-text">Claude Cockpit</span>
      </button>

      <nav className="top-nav__links" aria-label="Navigation principale">
        <button type="button" className={onHome ? "is-active" : ""} onClick={() => navigate({ view: "home" })}>
          Workflows
        </button>
        <button
          type="button"
          className={route.view === "quick-reference" ? "is-active" : ""}
          onClick={() => navigate({ view: "quick-reference" })}
        >
          Repères
        </button>
        <button
          type="button"
          className={route.view === "stack" ? "is-active" : ""}
          onClick={() => navigate({ view: "stack" })}
        >
          Stack
        </button>
      </nav>

      <div className="top-nav__right">
        <button type="button" className="top-nav__search" onClick={onOpenPalette}>
          <span>Rechercher…</span>
          <kbd>⌘K</kbd>
        </button>
      </div>
    </header>
  );
}
