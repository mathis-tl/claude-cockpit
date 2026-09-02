import { useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";
import {
  EMPTY_OVERLAY,
  parseOverlay,
  serializeOverlay,
  type NotesOverlay,
  type OverlayScope,
} from "../lib/notesOverlay";

const STORAGE_KEY = "cockpit.notesOverlay";

export function useNotesOverlay() {
  const [overlay, setOverlay] = useLocalStorage<NotesOverlay>(STORAGE_KEY, EMPTY_OVERLAY);

  const setField = useCallback(
    (scope: OverlayScope, id: string, field: string, value: string) => {
      setOverlay((prev) => ({
        ...prev,
        [scope]: {
          ...prev[scope],
          [id]: { ...prev[scope][id], [field]: value },
        },
      }));
    },
    [setOverlay],
  );

  const resetField = useCallback(
    (scope: OverlayScope, id: string, field: string) => {
      setOverlay((prev) => {
        const entry = { ...prev[scope][id] } as Record<string, string | undefined>;
        delete entry[field];
        const nextScope = { ...prev[scope] };
        if (Object.values(entry).some((v) => v !== undefined)) {
          nextScope[id] = entry;
        } else {
          delete nextScope[id];
        }
        return { ...prev, [scope]: nextScope };
      });
    },
    [setOverlay],
  );

  /** Drops every personal edit on one entry at once. */
  const resetEntry = useCallback(
    (scope: OverlayScope, id: string) => {
      setOverlay((prev) => {
        if (!prev[scope][id]) return prev;
        const nextScope = { ...prev[scope] };
        delete nextScope[id];
        return { ...prev, [scope]: nextScope };
      });
    },
    [setOverlay],
  );

  const resetWorkflow = useCallback(
    (id: string) => resetEntry("workflows", id),
    [resetEntry],
  );

  const resetAll = useCallback(() => setOverlay(EMPTY_OVERLAY), [setOverlay]);

  const exportJson = useCallback(() => serializeOverlay(overlay), [overlay]);

  const importJson = useCallback(
    (raw: string) => {
      const parsed = parseOverlay(raw);
      setOverlay(parsed);
    },
    [setOverlay],
  );

  const isEmpty =
    Object.keys(overlay.categories).length === 0 && Object.keys(overlay.workflows).length === 0;

  return {
    overlay,
    setField,
    resetField,
    resetEntry,
    resetWorkflow,
    resetAll,
    exportJson,
    importJson,
    isEmpty,
  };
}
