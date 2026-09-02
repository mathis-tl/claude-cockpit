import { useEffect, useRef, useState } from "react";
import type { GuideData, StackData } from "../content/types";
import { copyToClipboard, downloadTextFile } from "../lib/clipboard";
import { overlayFilename } from "../lib/notesOverlay";
import { CopyButton } from "./CopyButton";
import { Icon } from "./Icon";
import "./UtilityTray.css";

interface UtilityTrayProps {
  guide: GuideData;
  stack: StackData;
  overlayIsEmpty: boolean;
  exportOverlay: () => string;
  importOverlay: (raw: string) => void;
  resetOverlay: () => void;
}

/**
 * Commands, rules and note management, kept one click away instead of holding a
 * permanent rail beside the map (DESIGN_SPEC §8).
 */
export function UtilityTray({
  guide,
  stack,
  overlayIsEmpty,
  exportOverlay,
  importOverlay,
  resetOverlay,
}: UtilityTrayProps) {
  const [open, setOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [importError, setImportError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    function onPointerDown(event: PointerEvent) {
      if (!panelRef.current?.contains(event.target as Node)) setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  function handleExport() {
    downloadTextFile(overlayFilename(), exportOverlay());
  }

  async function handleImportFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const text = await file.text();
      importOverlay(text);
      setImportError(null);
    } catch {
      setImportError("Fichier de notes invalide.");
    }
  }

  return (
    <div className="utility-tray" ref={panelRef}>
      {open && (
        <div className="utility-tray__panel" role="group" aria-label="Utilitaires">
          <section className="utility-tray__section">
            <p className="utility-tray__label">Commandes de session</p>
            <div className="utility-tray__commands">
              {guide.quickCommands.map((cmd) => (
                <button
                  key={cmd.id}
                  type="button"
                  className="utility-tray__command"
                  title={`${cmd.purpose} — copier ${cmd.command}`}
                  onClick={() => copyToClipboard(cmd.command)}
                >
                  <span className="utility-tray__command-label">{cmd.label}</span>
                  <span className="utility-tray__command-purpose">{cmd.purpose}</span>
                </button>
              ))}
            </div>
          </section>

          {stack.stackFooter?.format && (
            <section className="utility-tray__section">
              <p className="utility-tray__label">Récapitulatif de stack</p>
              <p className="utility-tray__hint">
                La ligne à faire produire en fin de réponse, une fois le travail vérifié.
              </p>
              <pre className="utility-tray__format">{stack.stackFooter.format}</pre>
              <CopyButton text={stack.stackFooter.format} label="Copier le format" />
            </section>
          )}

          <section className="utility-tray__section">
            <p className="utility-tray__label">Règles générales</p>
            <ul className="utility-tray__principles">
              {stack.principles.map((principle, i) => (
                <li key={i}>{principle}</li>
              ))}
            </ul>
          </section>

          <section className="utility-tray__section">
            <p className="utility-tray__label">Notes personnelles</p>
            <p className="utility-tray__hint">
              Les textes modifiés restent en local, par-dessus le contenu de base.
            </p>
            <div className="utility-tray__actions">
              <button type="button" onClick={handleExport} disabled={overlayIsEmpty}>
                Exporter
              </button>
              <button type="button" onClick={() => fileInputRef.current?.click()}>
                Importer
              </button>
              <button
                type="button"
                className="utility-tray__reset"
                onClick={resetOverlay}
                disabled={overlayIsEmpty}
              >
                Tout réinitialiser
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              className="utility-tray__file-input"
              onChange={handleImportFile}
            />
            {importError && <p className="utility-tray__error">{importError}</p>}
          </section>
        </div>
      )}

      <button
        type="button"
        className="utility-tray__toggle"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <Icon name="stack" size={16} />
        Utilitaires
      </button>
    </div>
  );
}
