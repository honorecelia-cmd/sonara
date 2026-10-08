# Audit des écrans à l'ancien habillage (feature/ecrans-fin)

Branche créée depuis main (3d32bcb). Mesures faites dans le navigateur
(getComputedStyle et CSS.getPlatformFontsForNode) sur chaque écran `.page`.

## Écrans et chemins d'accès

| Écran | Ancien habillage | Affiché aujourd'hui ? | Chemin |
|---|---|---|---|
| `#s-multi` (choix Créer / Rejoindre) | DM Sans, bleu nuit, logo en texte `SON<em>A</em>RA` | Oui | bouton « Retour » de `#s-create` et `#s-join`, « Quitter » de la salle d'attente |
| `#s-create` (créer une salle) | DM Sans, bleu nuit, cartes néon `.tc` avec `.glow` | Oui | `#s-multi` puis « Créer » |
| `#s-join` (rejoindre une salle) | DM Sans, bleu nuit, bordure rouge `var(--red)` en cas d'erreur | Oui | Son-nom, mode En direct, « J'ai un code de salle » ; ou `#s-multi` puis « Rejoindre » |
| `#s-load` (chargement) | DM Sans, logo en texte, fond JPG, roue `.spin` | Oui | lancement d'une partie solo (`launchFromModal`) |
| `#s-entre` (défi à partager) | DM Sans, classes `fig-*`, faux compteur « 246 joueurs en ligne » | Oui | Son-nom, mode Défi ; lien « Défi à partager » du footer |
| `#s-solo` (ancienne grille d'univers) | DM Sans, classes `fig-*`, `fig-tc` | **Non, jamais** | seul accès : `startFromLanding()` (jamais appelée) et le bouton retour de `#s-pseudo` |
| `#s-pseudo` (ancien pseudo solo) | DM Sans, bleu nuit | **Non, jamais** | aucun `showPage('s-pseudo')` ; `launchSolo()` jamais appelée ailleurs |
| Modales `.modal-bg` (9, une par univers) | anciennes classes | Jamais affichées | toujours **utilisées** par la logique : `launchFromModal` lit leur champ pseudo |

Écrans déjà refaits : landing, `#s-parcours`, `#s-game`, `#s-res`, `#s-lobby`.

## Polices réellement utilisées

DM Sans est hébergée en local (`fonts/dmsans-*.woff2`, déclarée dans
`fonts/fonts.css`) et réellement rendue (« DM Sans 9pt » d'après le
navigateur) là où elle est demandée.

| Écran | Textes visibles | Hors Inter / MuseoModerno |
|---|---|---|
| landing | 192 | aucun |
| `#s-parcours` | 30 | aucun |
| `#s-game` | tous les états | aucun |
| `#s-res` | tous | aucun |
| `#s-lobby` | 8 | aucun |
| `#s-multi` | 9 | 4 en DM Sans (bouton retour, sous-titre, descriptions) |
| `#s-create` | 26 | 13 en DM Sans (retour, libellés, champ pseudo, cartes) |
| `#s-join` | 9 | 4 en DM Sans (retour, libellés, champ pseudo) |
| `#s-load` | 4 | 2 en DM Sans (« Chargement… », « Annuler ») |
| `#s-entre` | 18 | 1 en DM Sans (bouton retour) |
| `#s-solo` | 17 | 1 en DM Sans (bouton retour) |
| `#s-pseudo` | 8 | 4 en DM Sans |

La règle globale `html,body{font-family:'DM Sans'}` de `sonara.css` est la
source de la plupart de ces cas.

## Limites (logique non modifiable)

- Erreurs de « Rejoindre » : le serveur ne renvoie qu'un cas, salle
  introuvable (404). Il n'y a ni limite de joueurs ni refus d'une partie
  commencée (`/room/info` renvoie `started`, mais `joinRoom` ne le lit pas).
  Les messages « salle pleine » et « partie déjà commencée » demanderaient
  de toucher la logique.
- L'écran de chargement n'a pas de barre de progression.
