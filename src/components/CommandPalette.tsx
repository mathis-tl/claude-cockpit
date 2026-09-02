import { useEffect, useMemo, useRef, useState } from "react";
import type { GuideData, StackComponent } from "../content/types";
import { searchGuide, type SearchResult } from "../lib/search";
import type { NotesOverlay } from "../lib/notesOverlay";
import type { Route } from "../hooks/useHashRoute";
import "./CommandPalette.css";

interface CommandPaletteProps {
  guide: GuideData;
  stackComponents: StackComponent[];
  overlay: NotesOverlay;
  onClose: () => void;
  onNavigate: (route: Route) => void;
}

const KIND_LABEL: Record<SearchResult["kind"], string> = {
  workflow: "Workflow",
  command: "Commande",
  stack: "Stack",
  category: "Catégorie",
};

function getFocusable(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
    ),
  );
}

export function CommandPalette({
  guide,
  stackComponents,
  overlay,
  onClose,
  onNavigate,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<Element | null>(null);

  useEffect(() => {
    triggerRef.current = document.activeElement;
    return () => {
      if (triggerRef.current instanceof HTMLElement) {
        triggerRef.current.focus();
      }
    };
  }, []);

  const results = useMemo(() => {
    if (!query.trim()) {
      return guide.workflows.slice(0, 8).map<SearchResult>((w) => ({
        kind: "workflow",
        id: w.id,
        title: w.title,
        subtitle: w.summary,
        score: 0,
      }));
    }
    return searchGuide(guide, stackComponents, query, overlay).slice(0, 20);
  }, [guide, stackComponents, query, overlay]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    const activeEl = listRef.current?.querySelector('[aria-selected="true"]');
    activeEl?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  function commit(result: SearchResult) {
    if (result.kind === "workflow") {
      onNavigate({ view: "workflow", id: result.id });
    } else if (result.kind === "category") {
      onNavigate({ view: "category", id: result.id });
    } else if (result.kind === "stack") {
      onNavigate({ view: "stack" });
    } else {
      onNavigate({ view: "quick-reference" });
    }
    onClose();
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Escape") {
      onClose();
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      const target = results[activeIndex];
      if (target) commit(target);
      return;
    }
    if (event.key === "Tab" && dialogRef.current) {
      const focusable = getFocusable(dialogRef.current);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const current = document.activeElement;
      if (event.shiftKey && current === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && current === last) {
        event.preventDefault();
        first.focus();
      }
    }
  }

  return (
    <div className="command-palette-overlay" onMouseDown={onClose}>
      <div
        ref={dialogRef}
        className="command-palette"
        role="dialog"
        aria-modal="true"
        aria-label="Recherche rapide"
        onMouseDown={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className="command-palette__input-row">
          <span className="command-palette__prompt" aria-hidden="true">
            ⌘K
          </span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Que veux-tu faire ?"
            aria-label="Recherche"
            autoComplete="off"
            spellCheck={false}
          />
          <button type="button" className="command-palette__close" onClick={onClose}>
            Échap
          </button>
        </div>
        <div className="command-palette__results" ref={listRef} role="listbox">
          {results.length === 0 && <p className="command-palette__empty">Aucun résultat.</p>}
          {results.map((result, index) => (
            <button
              type="button"
              key={`${result.kind}-${result.id}`}
              role="option"
              aria-selected={index === activeIndex}
              className={`command-palette__result ${index === activeIndex ? "is-active" : ""}`}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => commit(result)}
            >
              <span className="command-palette__result-tick" aria-hidden="true" />
              <span className="command-palette__result-kind">{KIND_LABEL[result.kind]}</span>
              <span className="command-palette__result-body">
                <span className="command-palette__result-title">{result.title}</span>
                <span className="command-palette__result-subtitle">{result.subtitle}</span>
                {result.fromNotes && (
                  <span className="command-palette__result-note">trouvé dans tes notes</span>
                )}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
