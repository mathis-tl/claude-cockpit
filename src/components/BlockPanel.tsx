import { useEffect, useRef } from "react";
import type { GuideData, StackData, Workflow } from "../content/types";
import type { Route } from "../hooks/useHashRoute";
import type { NotesOverlay, OverlayScope } from "../lib/notesOverlay";
import { mergeWorkflow } from "../lib/notesOverlay";
import { matchStackItems } from "../lib/stackMatch";
import { AUTOMATION_LABEL } from "../lib/guideModel";
import { CopyButton } from "./CopyButton";
import { Icon } from "./Icon";
import { EditableText } from "./EditableText";
import "./BlockPanel.css";

interface BlockPanelProps {
  guide: GuideData;
  stack: StackData;
  route: Extract<Route, { view: "workflow" }>;
  overlay: NotesOverlay;
  onSetField: (scope: OverlayScope, id: string, field: string, value: string) => void;
  onResetField: (scope: OverlayScope, id: string, field: string) => void;
  onResetWorkflow: (id: string) => void;
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (id: string) => void;
  navigate: (route: Route) => void;
  onClose: () => void;
}

function getFocusable(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
    ),
  );
}

export function BlockPanel({
  guide,
  stack,
  route,
  overlay,
  onSetField,
  onResetField,
  onResetWorkflow,
  isFavorite,
  onToggleFavorite,
  navigate,
  onClose,
}: BlockPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<Element | null>(null);

  useEffect(() => {
    triggerRef.current = document.activeElement;
    panelRef.current?.focus();
    return () => {
      if (triggerRef.current instanceof HTMLElement) {
        triggerRef.current.focus();
      }
    };
  }, []);

  useEffect(() => {
    panelRef.current?.scrollTo({ top: 0 });
  }, [route]);

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Escape") {
      onClose();
      return;
    }
    if (event.key === "Tab" && panelRef.current) {
      const focusable = getFocusable(panelRef.current);
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
    <div className="block-panel-overlay" onMouseDown={onClose}>
      <div
        ref={panelRef}
        className="block-panel"
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        onMouseDown={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <WorkflowPanel
          guide={guide}
          stack={stack}
          workflowId={route.id}
          overlay={overlay}
          onSetField={onSetField}
          onResetField={onResetField}
          onResetWorkflow={onResetWorkflow}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
          navigate={navigate}
          onClose={onClose}
        />
      </div>
    </div>
  );
}

function WorkflowPanel({
  guide,
  stack,
  workflowId,
  overlay,
  onSetField,
  onResetField,
  onResetWorkflow,
  isFavorite,
  onToggleFavorite,
  navigate,
  onClose,
}: {
  guide: GuideData;
  stack: StackData;
  workflowId: string;
  overlay: NotesOverlay;
  onSetField: BlockPanelProps["onSetField"];
  onResetField: BlockPanelProps["onResetField"];
  onResetWorkflow: BlockPanelProps["onResetWorkflow"];
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (id: string) => void;
  navigate: (route: Route) => void;
  onClose: () => void;
}) {
  const baseWorkflow = guide.workflows.find((w) => w.id === workflowId);
  if (!baseWorkflow) {
    return (
      <div className="block-panel__empty">
        <p>Workflow introuvable.</p>
        <button type="button" onClick={onClose}>
          Fermer
        </button>
      </div>
    );
  }

  const workflow = mergeWorkflow(baseWorkflow, overlay.workflows[workflowId]);
  const category = guide.categories.find((c) => c.id === workflow.category);
  const related = workflow.related
    .map((id) => guide.workflows.find((w) => w.id === id))
    .filter((w): w is Workflow => Boolean(w));
  const stackItems = matchStackItems(workflow.stack, stack.components);
  const hasOverrides = Boolean(overlay.workflows[workflowId]);

  return (
    <>
      {category && (
        <button
          type="button"
          className="block-panel__back"
          onClick={() => navigate({ view: "category", id: category.id })}
        >
          ‹ {category.label}
        </button>
      )}

      <div className="block-panel__header">
        <div className="block-panel__header-icon">
          <Icon name={workflow.icon} size={22} />
        </div>
        <div className="block-panel__header-body">
          <h1>{workflow.title}</h1>
        </div>
        <button type="button" className="block-panel__close" onClick={onClose} aria-label="Fermer">
          ×
        </button>
      </div>

      <p className="block-panel__automation">
        <span className={`automation-badge automation-badge--${workflow.automation}`}>
          {AUTOMATION_LABEL[workflow.automation]}
        </span>
        <span className="block-panel__automation-note">
          {workflow.automation === "automatic"
            ? "Se déclenche sans que tu aies à le demander."
            : workflow.automation === "mixed"
              ? "Une partie se déclenche seule, le reste s’invoque."
              : "À invoquer explicitement."}
        </span>
      </p>

      <EditableText
        scope="workflows"
        id={workflowId}
        field="summary"
        label="Résumé"
        baseValue={baseWorkflow.summary}
        overrideValue={overlay.workflows[workflowId]?.summary}
        onSetField={onSetField}
        onResetField={onResetField}
      />

      <button
        type="button"
        className={`block-panel__fav ${isFavorite(workflow.id) ? "is-active" : ""}`}
        onClick={() => onToggleFavorite(workflow.id)}
        aria-pressed={isFavorite(workflow.id)}
      >
        ★ {isFavorite(workflow.id) ? "Favori" : "Ajouter aux favoris"}
      </button>

      <div className="block-panel__when-grid">
        <div className="block-panel__when block-panel__when--do">
          <p className="eyebrow">Quand l&rsquo;utiliser</p>
          <ul>
            {workflow.whenToUse.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="block-panel__when block-panel__when--dont">
          <p className="eyebrow">Quand ne pas l&rsquo;utiliser</p>
          <ul>
            {workflow.whenNotToUse.length > 0 ? (
              workflow.whenNotToUse.map((item, i) => <li key={i}>{item}</li>)
            ) : (
              <li className="block-panel__muted">Pas de restriction notable.</li>
            )}
          </ul>
        </div>
      </div>

      <details className="block-panel__section" open>
        <summary>Étapes recommandées</summary>
        <ol className="block-panel__steps">
          {workflow.steps.map((step, i) => (
            <li key={i}>
              <span className="block-panel__step-index">{i + 1}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </details>

      <details className="block-panel__section" open>
        <summary>Prompt prêt à copier</summary>
        <div className="block-panel__prompt">
          <CopyButton text={workflow.promptTemplate} label="Copier le prompt" variant="primary" />
          <pre>{workflow.promptTemplate}</pre>
        </div>
      </details>

      {stackItems.length > 0 && (
        <details className="block-panel__section">
          <summary>Stack recommandée</summary>
          <ul className="block-panel__stack-list">
            {stackItems.map((item, i) => (
              <li key={i}>
                <span>{item.text}</span>
                {item.component && (
                  <span className={`automation-badge automation-badge--${item.component.automation}`}>
                    {AUTOMATION_LABEL[item.component.automation]}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </details>
      )}

      {workflow.antiPatterns.length > 0 && (
        <details className="block-panel__section">
          <summary>Anti-patterns</summary>
          <ul className="block-panel__anti-list">
            {workflow.antiPatterns.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </details>
      )}

      {related.length > 0 && (
        <div className="block-panel__related">
          <p className="eyebrow">Workflows liés</p>
          <div className="block-panel__related-chips">
            {related.map((w) => (
              <button key={w.id} type="button" onClick={() => navigate({ view: "workflow", id: w.id })}>
                {w.title}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="block-panel__section block-panel__notes">
        <div className="block-panel__notes-head">
          <p className="eyebrow">Notes personnelles</p>
          {hasOverrides && (
            <button
              type="button"
              className="block-panel__reset-workflow"
              onClick={() => onResetWorkflow(workflowId)}
            >
              Rétablir ce workflow
            </button>
          )}
        </div>
        <EditableText
          scope="workflows"
          id={workflowId}
          field="notes"
          label="Notes personnelles"
          baseValue=""
          overrideValue={overlay.workflows[workflowId]?.notes}
          placeholder="Ajoute une note personnelle sur ce workflow…"
          onSetField={onSetField}
          onResetField={onResetField}
        />
      </div>
    </>
  );
}
