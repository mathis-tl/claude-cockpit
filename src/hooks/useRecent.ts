import { useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";

const STORAGE_KEY = "cockpit.recent";
const MAX_RECENT = 6;

export function useRecent() {
  const [recent, setRecent] = useLocalStorage<string[]>(STORAGE_KEY, []);

  const pushRecent = useCallback(
    (id: string) => {
      setRecent((prev) => [id, ...prev.filter((r) => r !== id)].slice(0, MAX_RECENT));
    },
    [setRecent],
  );

  return { recent, pushRecent };
}
