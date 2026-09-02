import type { GuideData } from "../content/types";
import { CopyButton } from "./CopyButton";
import "./QuickReference.css";

interface QuickReferenceProps {
  guide: GuideData;
}

export function QuickReference({ guide }: QuickReferenceProps) {
  return (
    <div className="quick-reference">
      <div className="quick-reference__intro">
        <p className="eyebrow">Repères rapides</p>
        <h1>Commandes de session</h1>
        <p className="quick-reference__sub">
          Les commandes à connaître pour gérer contexte et sessions sans y repenser.
        </p>
      </div>
      <div className="quick-reference__list">
        {guide.quickCommands.map((cmd) => (
          <article key={cmd.id} className="quick-reference__row">
            <code>{cmd.label}</code>
            <p>{cmd.purpose}</p>
            <CopyButton text={cmd.command} />
          </article>
        ))}
      </div>
    </div>
  );
}
