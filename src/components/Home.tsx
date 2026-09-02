import type { GuideData, StackData } from "../content/types";
import type { Route } from "../hooks/useHashRoute";
import { workflowsByIds } from "../lib/guideModel";
import { WorkflowMap } from "./WorkflowMap";
import { UtilityTray } from "./UtilityTray";
import "./Home.css";

interface HomeProps {
  guide: GuideData;
  stack: StackData;
  route: Route;
  onOpenWorkflow: (id: string) => void;
  onSelectCategory: (id: string) => void;
  onClearSelection: () => void;
  favorites: string[];
  recent: string[];
  overlayIsEmpty: boolean;
  exportOverlay: () => string;
  importOverlay: (raw: string) => void;
  resetOverlay: () => void;
}

/** Category the camera should sit on: the selected one, or the open workflow's. */
function focusedCategory(route: Route, guide: GuideData): string | null {
  if (route.view === "category") return route.id;
  if (route.view === "workflow") {
    return guide.workflows.find((w) => w.id === route.id)?.category ?? null;
  }
  return null;
}

export function Home({
  guide,
  stack,
  route,
  onOpenWorkflow,
  onSelectCategory,
  onClearSelection,
  favorites,
  recent,
  overlayIsEmpty,
  exportOverlay,
  importOverlay,
  resetOverlay,
}: HomeProps) {
  const favoriteWorkflows = workflowsByIds(guide, favorites).slice(0, 6);
  const recentWorkflows = workflowsByIds(guide, recent)
    .filter((w) => !favorites.includes(w.id))
    .slice(0, 5);

  return (
    <div className="home">
      <div className="home__intro">
        <p className="eyebrow">Claude Cockpit</p>
        <h1>Où en es-tu&nbsp;?</h1>
      </div>

      {(favoriteWorkflows.length > 0 || recentWorkflows.length > 0) && (
        <div className="home__quick">
          {favoriteWorkflows.length > 0 && (
            <div className="home__quick-group">
              <span className="home__quick-label">Favoris</span>
              <div className="home__quick-chips">
                {favoriteWorkflows.map((w) => (
                  <button
                    key={w.id}
                    type="button"
                    className="home__quick-chip"
                    onClick={() => onOpenWorkflow(w.id)}
                  >
                    {w.title}
                  </button>
                ))}
              </div>
            </div>
          )}
          {recentWorkflows.length > 0 && (
            <div className="home__quick-group">
              <span className="home__quick-label">Récents</span>
              <div className="home__quick-chips">
                {recentWorkflows.map((w) => (
                  <button
                    key={w.id}
                    type="button"
                    className="home__quick-chip"
                    onClick={() => onOpenWorkflow(w.id)}
                  >
                    {w.title}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="home__cockpit">
        <WorkflowMap
          guide={guide}
          selectedCategoryId={focusedCategory(route, guide)}
          activeWorkflowId={route.view === "workflow" ? route.id : null}
          onSelectCategory={onSelectCategory}
          onSelectWorkflow={onOpenWorkflow}
          onClearSelection={onClearSelection}
        />
        <UtilityTray
          guide={guide}
          stack={stack}
          overlayIsEmpty={overlayIsEmpty}
          exportOverlay={exportOverlay}
          importOverlay={importOverlay}
          resetOverlay={resetOverlay}
        />
      </div>
    </div>
  );
}
