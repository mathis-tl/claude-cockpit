import { useLayoutEffect, useRef, useState } from "react";
import type { OverlayScope } from "../lib/notesOverlay";
import { Icon } from "./Icon";
import "./EditableText.css";

interface EditableTextProps {
  scope: OverlayScope;
  id: string;
  field: string;
  /** Accessible name for the edit control; not rendered as a form label. */
  label: string;
  baseValue: string;
  overrideValue: string | undefined;
  placeholder?: string;
  onSetField: (scope: OverlayScope, id: string, field: string, value: string) => void;
  onResetField: (scope: OverlayScope, id: string, field: string) => void;
}

/**
 * Text that reads as text until you edit it.
 *
 * No labelled box and no button row: the pencil appears on hover or keyboard
 * focus, editing swaps in a textarea in place, and Cmd/Ctrl+Enter or blur
 * saves while Escape cancels. Saving a value equal to the base — or an empty
 * one — clears the override rather than storing a duplicate.
 */
export function EditableText({
  scope,
  id,
  field,
  label,
  baseValue,
  overrideValue,
  placeholder,
  onSetField,
  onResetField,
}: EditableTextProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const cancelled = useRef(false);
  const isOverridden = Boolean(overrideValue);
  const displayValue = overrideValue ?? baseValue;

  useLayoutEffect(() => {
    const element = textareaRef.current;
    if (!isEditing || !element) return;
    element.style.height = "auto";
    element.style.height = `${element.scrollHeight}px`;
  }, [isEditing, draft]);

  function startEditing() {
    cancelled.current = false;
    setDraft(displayValue);
    setIsEditing(true);
  }

  function commit() {
    if (cancelled.current) return;
    const trimmed = draft.trim();
    if (trimmed.length === 0 || trimmed === baseValue) {
      if (isOverridden) onResetField(scope, id, field);
    } else if (trimmed !== overrideValue) {
      onSetField(scope, id, field, trimmed);
    }
    setIsEditing(false);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Escape") {
      event.stopPropagation();
      cancelled.current = true;
      setIsEditing(false);
      return;
    }
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      commit();
    }
  }

  if (isEditing) {
    return (
      <div className="editable editable--active">
        <textarea
          ref={textareaRef}
          className="editable__input"
          value={draft}
          placeholder={placeholder}
          aria-label={label}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={commit}
          autoFocus
        />
        <p className="editable__hint">⌘↵ pour enregistrer · Échap pour annuler</p>
      </div>
    );
  }

  return (
    <div className="editable">
      {displayValue ? (
        <p className="editable__text">{displayValue}</p>
      ) : (
        <p className="editable__text editable__text--empty">{placeholder ?? "Aucune note."}</p>
      )}
      <button
        type="button"
        className="editable__edit"
        onClick={startEditing}
        aria-label={`Modifier : ${label}`}
      >
        <Icon name="edit" size={13} />
      </button>
      {isOverridden && (
        <span className="editable__state">
          modifié
          <button
            type="button"
            className="editable__restore"
            onClick={() => onResetField(scope, id, field)}
          >
            rétablir
          </button>
        </span>
      )}
    </div>
  );
}
