# Changelog

## 1.5.1 — 2026-09-01

Remplacement de l'icône placeholder Tauri (fusée par défaut) par une icône
propre à Claude Cockpit : le mark existant (`ClaudeMark`, `Icon.tsx`, 12
barres en soleil/astérisque) recréé à 1024×1024, blanc sur fond arrondi
orange de marque (`--claude` `#D97757`), même géométrie que le glyphe déjà
utilisé dans `TopNav`. Icône source régénérée via `tauri icon` dans
`src-tauri/icons/` (32×32, 128×128, 128×128@2x, `icon.icns`, `icon.ico`) ;
jeux iOS/Android auto-générés supprimés (aucune cible mobile). Rebuild
`.app`/`.dmg` de debug confirmé avec la nouvelle icône embarquée (vérifié
via `icon.icns` du bundle). Vérifié : typecheck, lint, tests (32/32), build
web, build `.app` debug.

## 1.5.0 — 2026-09-01

Ajout d'un empaquetage macOS natif via Tauri (`src-tauri/`), en plus de l'app
web existante — aucun changement de code frontend, aucun backend ajouté.
Tauri encapsule le même build statique (`dist/`) dans une fenêtre WKWebView
native (`tauri.conf.json` : identifiant `com.claudecockpit.app`, fenêtre
1280×800, min 760×560). Scripts npm ajoutés : `app:dev` (fenêtre native +
serveur Vite en dev), `app:build` (bundle `.app`/`.dmg` de production).
Build de validation (`npm run app:build -- --debug`) réussi, `.app` lancée et
processus confirmé actif. `PROJECT_SPEC.md` §3 précise que l'app web reste la
source de vérité et doit continuer à fonctionner de façon autonome. Icône
d'application encore le placeholder par défaut de Tauri — à remplacer si
besoin. Vérifié : typecheck, lint, tests (32/32), build web, build `.app`
debug.

## 1.4.1 — 2026-09-01

Retrait des illustrations raster des 6 cartes hero (jugées peu convaincantes)
au profit du système d'icônes ligne déjà en place (`Icon.tsx`) : chaque carte
affiche désormais son glyphe existant (`spark`, `history`, `blocks`, `bug`,
`branch`, `check` — déjà sémantiquement corrects) en grand (44px) dans une
tuile circulaire neutre, qui passe en teinte orange douce + icône accentuée
au survol/focus de la carte (seul usage de l'accent sur cet élément, limité à
l'état interactif). Nettoyage complet du câblage d'images devenu inutile :
`src/content/workflowImages.ts` et `src/assets/workflows/*.webp` supprimés,
champ `image` retiré de `content/guide-content.json`, `src/content/types.ts`
et `schemas/guide-content.schema.json`. Bundle de production allégé
(~224 Ko d'assets image en moins ; JS/CSS inchangés). Vérifié : typecheck,
lint, tests (32/32), build, `vite preview` (build de production servi et
chargé avec succès) — l'app reste 100% statique/déployable sans backend ni
variables d'environnement.

## 1.4.0 — 2026-09-01

Correction de direction visuelle (voir `docs/DESIGN_SPEC.md` v4) : la v3
(canvas champagne, portails hero encre foncée, sidebar pleine hauteur) est
remplacée par une UI claire et neutre, image-driven, inspirée d'Apple Store
(pas d'un habillage Apple littéral). `tokens.css` réécrit : `--canvas`
`#F5F5F7`, `--surface` `#FFFFFF`, `--ink` `#1D1D1F`, hairlines en gris neutre
(`#E5E5EA`/`#D2D2D7`) ; tokens de plan sombre (`--portal-ink*`, `--cream*`)
supprimés. Orange (`--claude*`) audité usage par usage et retiré de tout
emploi décoratif (tuile d'icône du tiroir, marqueur de section, badges
d'étape, texte de commande dans Repères) — conservé strictement pour CTA,
états actifs/focus/sélectionnés. `Sidebar` (pleine hauteur, beige) supprimée
au profit de `TopNav` (fine, 56px, fond blanc) ; favoris/récents migrent en
rangée compacte sur l'accueil (`home__quick`). Portails hero de `Home.tsx`
réécrits en `hero-card` blanches — illustration sur fond blanc se fondant
dans la carte, eyebrow neutre, titre, résumé sur 2 lignes max, CTA "Ouvrir"
plein orange explicite, grille responsive 3→2→1 colonnes (plus de piste à
défilement). Survol de toutes les cartes : suppression de tout `translateY`,
uniquement ombre/bordure renforcées + zoom d'image `1.01` sur le hero.
`CopyButton` gagne une variante `primary` (fond plein, réservée au bouton
"Copier le prompt" du tiroir) vs `secondary` (contour neutre, par défaut,
utilisée dans l'inspecteur de stack où plusieurs actions de copie coexistent).
Aucun changement de modèle de données JSON, de recherche, de ⌘K, d'exports de
stack ou du comportement du tiroir de workflow. Vérifié : typecheck, lint,
tests (32/32), build.

## 1.3.1 — 2026-09-01

Illustrations pour les 6 portails hero. Six visuels techniques (trame
noir/blanc, accents cyan, perspective isométrique) extraits d'une planche
de référence fournie par l'utilisateur, recadrés individuellement (texte
de légende et illustrations voisines retirés, marges/canvas homogènes
640×640), exportés en WebP optimisé (~27–50 Ko/fichier) dans
`src/assets/workflows/`. Nouveau champ optionnel `image` dans le schéma
(`schemas/guide-content.schema.json`), `src/content/types.ts` et
`content/guide-content.json` (les 6 workflows `featured`) — clé logique
résolue vers l'asset bundlé via `src/content/workflowImages.ts`
(`import.meta.glob`), donc aucun chemin d'image codé en dur dans les
composants. `Home.tsx`/`Home.css` : le portail hero affiche l'illustration
en grand sur le fond encre foncé (qui sert de "grounding" à la trame
noir/blanc), reste sur l'`Icon` ligne existant pour les workflows sans
image. Effet de survol des portails simplifié : suppression du
`translateY` (levée + clipping en haut de piste), remplacé par un léger
renforcement d'ombre/bordure et un zoom d'image très subtil (`scale(1.015)`),
`prefers-reduced-motion` respecté. `tsconfig.json` : ajout de `vite/client`
aux `types` (requis pour `import.meta.glob`). Vérifié : typecheck, lint,
tests (32/32), build.

## 1.3.0 — 2026-08-31

Deuxième refonte visuelle (voir `docs/DESIGN_SPEC.md` v3) : abandon de
l'identité éditoriale liste/hairline/serif au profit d'une identité
produit premium, plus proche des interfaces Apple. Typographie serif
retirée de toute l'UI au profit d'un sans-serif gras (mono conservé
uniquement pour commandes/labels). Canvas plus chaud, blond/champagne
(`#F3E5C7`), cartes en surface quasi-blanche chaude (`#FBF6E9`), radius et
ombres douces réintroduits (cartes, portails, tiroir). Nouvelle navigation
gauche compacte (`Sidebar`) remplaçant l'`InstrumentBar` du haut : favoris,
récents, catégories, actions de session, Stack/Repères. Accueil : bande de
6 portails "hero" (fond encre foncé, glyphe de ligne propre à chaque
workflow, glow terracotta discret) pilotée par un nouveau champ
`featured: boolean` dans `content/guide-content.json` — pas de contenu
codé en dur. Le champ `icon`, jusqu'ici inutilisé, alimente désormais un
système d'icônes ligne (`Icon.tsx`, 16 glyphes) partagé entre les portails
et les lignes de workflow. Ouverture d'un workflow : tiroir latéral droit
au-dessus de l'accueil au lieu d'une navigation plein écran (`#/workflow/:id`
reste profond-linkable). `PROJECT_SPEC.md` §4/§9 et le `CLAUDE.md` du
projet mis à jour. Aucun changement de hooks, de routing sous-jacent ou de
valeurs de contenu existantes — refonte visuelle et structurelle de
présentation uniquement. Vérifié : typecheck, lint, tests (32/32), build.

## 1.2.0 — 2026-08-31

Refonte visuelle complète (voir `docs/DESIGN_SPEC.md`) : abandon du thème
dark-first / accent ambre / grille de cartes au profit d'un canvas clair et
chaud (`#F6F2E8`), encre presque-noire, accent unique aligné sur la couleur
de marque Claude (terracotta), mark Claude recréé en SVG plat dans
l'`InstrumentBar`. Accueil, inspecteur de stack et référence rapide passent
de grilles de cartes à des listes denses séparées par des filets hairline,
avec coche `▎` en `--claude` pour les états actifs/sélectionnés/favoris à la
place des fonds pleins colorés. Statuts de stack : point d'encre à trois
niveaux d'opacité au lieu de trois teintes. `PROJECT_SPEC.md` §4/§9 et le
`CLAUDE.md` du projet mis à jour en conséquence. Aucun changement de
logique, de routing ou de contenu JSON — refonte visuelle uniquement.
Vérifié : typecheck, lint, tests (32/32), build.

## 1.1.0 — 2026-08-31

Implémentation de l'application Claude Cockpit (Vite + React + TypeScript,
sans backend) à partir du bootstrap : accueil intention-first, détail de
workflow, inspecteur de stack avec exports, référence rapide, palette de
commandes (⌘K), favoris et historique récent en localStorage.

Correction de contenu : `content/guide-content.json` contenait un
double-échappement (`\\n` au lieu de `\n`) dans presque tous les
`promptTemplate`, ce qui produisait des prompts copiés sur une seule ligne
littérale au lieu de plusieurs lignes. Corrigé, avec test de non-régression.

## 1.0.0 — 2026-08-31

Bootstrap initial de Claude Cockpit.

Stack documentée :
Claude Code, Global CLAUDE.md, Codebase Memory, Agent Reach,
frontend-design, mcp-builder, skill-creator, tdd-adaptive,
verification-loop, fresh-code-reviewer, SkillSpector, Headroom,
Graphify (usage ponctuel).
