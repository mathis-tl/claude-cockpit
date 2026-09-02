import { useMemo } from "react";
import type { StackComponent, StackData } from "../content/types";
import { StatusLamp } from "./StatusLamp";
import { CopyButton } from "./CopyButton";
import {
  exportStackAsAsciiTree,
  exportStackAsJson,
  exportStackAsMarkdown,
  exportStackAsTransmission,
  stackSnapshotFilename,
} from "../lib/stackExport";
import { downloadTextFile } from "../lib/clipboard";
import "./StackInspector.css";

interface StackInspectorProps {
  stack: StackData;
}

function groupByKind(components: StackComponent[]): [string, StackComponent[]][] {
  const map = new Map<string, StackComponent[]>();
  for (const c of components) {
    const bucket = map.get(c.kind) ?? [];
    bucket.push(c);
    map.set(c.kind, bucket);
  }
  return [...map.entries()];
}

export function StackInspector({ stack }: StackInspectorProps) {
  const groups = useMemo(() => groupByKind(stack.components), [stack]);
  const json = useMemo(() => exportStackAsJson(stack), [stack]);
  const markdown = useMemo(() => exportStackAsMarkdown(stack), [stack]);
  const ascii = useMemo(() => exportStackAsAsciiTree(stack), [stack]);
  const transmission = useMemo(() => exportStackAsTransmission(stack), [stack]);

  return (
    <div className="stack-inspector">
      <div className="stack-inspector__header">
        <div>
          <p className="eyebrow">Stack actuelle</p>
          <h1>{stack.name}</h1>
          <p className="stack-inspector__meta">
            Version <code>{stack.stackVersion}</code> · Mise à jour <code>{stack.updatedAt}</code>
          </p>
        </div>
        <div className="stack-inspector__exports">
          <CopyButton text={json} label="Copier JSON" />
          <CopyButton text={markdown} label="Copier Markdown" />
          <CopyButton text={ascii} label="Copier ASCII" />
          <CopyButton text={transmission} label="Copier transmission" />
          <button
            type="button"
            className="stack-inspector__download"
            onClick={() => downloadTextFile(stackSnapshotFilename(stack), json)}
          >
            Télécharger le snapshot
          </button>
        </div>
      </div>

      {stack.principles?.length > 0 && (
        <div className="stack-inspector__principles">
          <p className="eyebrow">Principes</p>
          <ul>
            {stack.principles.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </div>
      )}

      {groups.map(([kind, components]) => (
        <section key={kind} className="stack-inspector__group">
          <p className="eyebrow">{kind}</p>
          <div className="stack-inspector__list">
            {components.map((component) => (
              <article key={component.id} className="stack-row">
                <div className="stack-row__head">
                  <h3>{component.name}</h3>
                  <StatusLamp status={component.status} />
                </div>
                <p className="stack-row__role">{component.role}</p>
                <dl className="stack-row__meta">
                  <div>
                    <dt>Portée</dt>
                    <dd>{component.scope}</dd>
                  </div>
                  {component.configPath && (
                    <div>
                      <dt>Config</dt>
                      <dd>
                        <code>{component.configPath}</code>
                      </dd>
                    </div>
                  )}
                  {component.command && (
                    <div>
                      <dt>Commande</dt>
                      <dd>
                        <code>{component.command}</code>
                      </dd>
                    </div>
                  )}
                </dl>
                {(component.whenToUse.length > 0 || component.whenNotToUse.length > 0) && (
                  <div className="stack-row__when-grid">
                    {component.whenToUse.length > 0 && (
                      <div className="stack-row__when">
                        <p className="eyebrow">Utiliser quand</p>
                        <ul>
                          {component.whenToUse.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {component.whenNotToUse.length > 0 && (
                      <div className="stack-row__when stack-row__when--dont">
                        <p className="eyebrow">Éviter quand</p>
                        <ul>
                          {component.whenNotToUse.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
