import { useCallback, useEffect, useState } from "react";

export type Route =
  | { view: "home" }
  | { view: "category"; id: string }
  | { view: "workflow"; id: string }
  | { view: "stack" }
  | { view: "quick-reference" };

function parseHash(hash: string): Route {
  const clean = hash.replace(/^#\/?/, "");
  const [segment, id] = clean.split("/");
  if (segment === "category" && id) return { view: "category", id: decodeURIComponent(id) };
  if (segment === "workflow" && id) return { view: "workflow", id: decodeURIComponent(id) };
  // The terminal is an ordinary category now; keep old links working.
  if (segment === "final") return { view: "category", id: "final" };
  if (segment === "stack") return { view: "stack" };
  if (segment === "quick-reference") return { view: "quick-reference" };
  return { view: "home" };
}

function routeToHash(route: Route): string {
  switch (route.view) {
    case "category":
      return `#/category/${encodeURIComponent(route.id)}`;
    case "workflow":
      return `#/workflow/${encodeURIComponent(route.id)}`;
    case "stack":
      return "#/stack";
    case "quick-reference":
      return "#/quick-reference";
    default:
      return "#/";
  }
}

export function useHashRoute() {
  const [route, setRoute] = useState<Route>(() =>
    typeof window === "undefined" ? { view: "home" } : parseHash(window.location.hash),
  );

  useEffect(() => {
    const onHashChange = () => setRoute(parseHash(window.location.hash));
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const navigate = useCallback((next: Route) => {
    const nextHash = routeToHash(next);
    if (window.location.hash !== nextHash) {
      window.location.hash = nextHash;
    } else {
      setRoute(next);
    }
  }, []);

  return { route, navigate };
}
