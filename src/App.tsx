import { useCallback, useEffect, useState } from "react";
import { stackData, guideData } from "./content/loadContent";
import { useHashRoute } from "./hooks/useHashRoute";
import { useFavorites } from "./hooks/useFavorites";
import { useRecent } from "./hooks/useRecent";
import { useNotesOverlay } from "./hooks/useNotesOverlay";
import { TopNav } from "./components/TopNav";
import { CommandPalette } from "./components/CommandPalette";
import { Home } from "./components/Home";
import { BlockPanel } from "./components/BlockPanel";
import { StackInspector } from "./components/StackInspector";
import { QuickReference } from "./components/QuickReference";
import "./App.css";

export default function App() {
  const { route, navigate } = useHashRoute();
  const { favorites, isFavorite, toggleFavorite } = useFavorites();
  const { recent, pushRecent } = useRecent();
  const {
    overlay,
    setField,
    resetField,
    resetWorkflow,
    resetAll,
    exportJson,
    importJson,
    isEmpty,
  } = useNotesOverlay();
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    if (route.view === "workflow" && guideData.workflows.some((w) => w.id === route.id)) {
      pushRecent(route.id);
    }
  }, [route, pushRecent]);

  const onOpenWorkflow = (id: string) => navigate({ view: "workflow", id });
  const onSelectCategory = (id: string) => navigate({ view: "category", id });

  /** Detail closes back onto the category it was opened from, not to overview. */
  const closeDetail = useCallback(() => {
    if (route.view === "workflow") {
      const category = guideData.workflows.find((w) => w.id === route.id)?.category;
      navigate(category ? { view: "category", id: category } : { view: "home" });
      return;
    }
    navigate({ view: "home" });
  }, [route, navigate]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const isModK = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
      if (isModK) {
        event.preventDefault();
        setPaletteOpen((open) => !open);
        return;
      }
      if (event.key !== "Escape") return;
      // Escape unwinds one layer at a time: palette, then detail (handled by
      // the panel itself, which owns focus), then focused category.
      if (paletteOpen) {
        setPaletteOpen(false);
        return;
      }
      if (route.view === "category") navigate({ view: "home" });
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [paletteOpen, route, navigate]);

  return (
    <div className="app">
      <TopNav route={route} navigate={navigate} onOpenPalette={() => setPaletteOpen(true)} />

      <main className="app__main">
        {(route.view === "home" ||
          route.view === "workflow" ||
          route.view === "category") && (
          <Home
            guide={guideData}
            stack={stackData}
            route={route}
            onOpenWorkflow={onOpenWorkflow}
            onSelectCategory={onSelectCategory}
            onClearSelection={() => navigate({ view: "home" })}
            favorites={favorites}
            recent={recent}
            overlayIsEmpty={isEmpty}
            exportOverlay={exportJson}
            importOverlay={importJson}
            resetOverlay={resetAll}
          />
        )}
        {route.view === "stack" && <StackInspector stack={stackData} />}
        {route.view === "quick-reference" && <QuickReference guide={guideData} />}
      </main>

      {route.view === "workflow" && (
        <BlockPanel
          guide={guideData}
          stack={stackData}
          route={route}
          overlay={overlay}
          onSetField={setField}
          onResetField={resetField}
          onResetWorkflow={resetWorkflow}
          isFavorite={isFavorite}
          onToggleFavorite={toggleFavorite}
          navigate={navigate}
          onClose={closeDetail}
        />
      )}

      {paletteOpen && (
        <CommandPalette
          guide={guideData}
          stackComponents={stackData.components}
          overlay={overlay}
          onClose={() => setPaletteOpen(false)}
          onNavigate={navigate}
        />
      )}
    </div>
  );
}
