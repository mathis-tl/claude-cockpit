import { useEffect, useRef, useState } from "react";
import { copyToClipboard } from "../lib/clipboard";
import "./CopyButton.css";

interface CopyButtonProps {
  text: string;
  label?: string;
  copiedLabel?: string;
  variant?: "primary" | "secondary";
}

export function CopyButton({
  text,
  label = "Copier",
  copiedLabel = "Copié",
  variant = "secondary",
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const resetTimeout = useRef<number | undefined>(undefined);

  useEffect(() => {
    return () => window.clearTimeout(resetTimeout.current);
  }, []);

  async function handleClick() {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(true);
      window.clearTimeout(resetTimeout.current);
      resetTimeout.current = window.setTimeout(() => setCopied(false), 1600);
    }
  }

  return (
    <button
      type="button"
      className={`copy-button copy-button--${variant} ${copied ? "is-copied" : ""}`}
      onClick={handleClick}
      aria-live="polite"
    >
      {copied ? copiedLabel : label}
    </button>
  );
}
