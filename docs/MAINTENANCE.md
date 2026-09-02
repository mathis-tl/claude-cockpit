# Maintenance — Claude Cockpit

## Quand la stack change

1. Modifier `content/stack.json`
   - incrémenter `stackVersion`;
   - mettre `updatedAt`;
   - ajouter/retirer/modifier le composant.

2. Modifier `content/guide-content.json` seulement si le changement affecte les workflows quotidiens.

3. Si la structure JSON change, modifier le schéma correspondant et incrémenter `schemaVersion`.

4. Ajouter une note dans `CHANGELOG.md`.

5. Demander à Claude :

```text
The Claude stack has changed.

Read:
- content/stack.json
- content/guide-content.json
- schemas/

Update Claude Cockpit only where required by the data/schema change.
Do not redesign unrelated UI.
Run the relevant validation afterwards.
```

## Export / transmission

Les exports doivent toujours être générés à partir de `content/stack.json`.

Ne maintiens jamais manuellement plusieurs copies du schéma.

Formats V1 :
- JSON canonique;
- Markdown;
- ASCII tree;
- bloc "transmission" compact pour une autre session/IA.

## Ajouter un workflow

Un workflow est une intention utilisateur, pas un outil.

Bon :
- Debugger un bug
- Reprendre un projet
- Comparer deux implémentations

Mauvais :
- Page Codebase Memory
- Page tdd-adaptive
- Page Agent Reach

Les outils apparaissent à l'intérieur des workflows.
