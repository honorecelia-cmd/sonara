# Morceaux à vérifier

Mise à jour : 15 novembre 2026, branche `fix/univers-dennery-2`.

Source : `sonara-morceaux-denery (1).xlsx` (feuilles « tous » et « Nouveaux Denery Segment »). Les corrections notées « sûr » sont appliquées dans `sonara.js`, ainsi que deux lignes « probable » (Koffee – Rapture vers Reggae, Shenseea – Talk to me nuh vers Dancehall). Les lignes ci-dessous restent telles qu'avant, en attente de vérification.

## Probable

| Univers | Crédit actuel | Correction proposée |
|---|---|---|
| Zouk | Kalipsau – Mona Lisa | Artiste : Kalipsxau |
| Zouk | Tina Ly – À tes côtés | Tina Ly ft Richard Cave (vérifier la version) |
| Reggae | Mavado – Come into my room | Mavado ft Stacious & Stephen "Di Genius" McGregor (vérifier la version) |
| Soca | Problem Child – Holiday | Problem Child ft Jus Jay King & Nelieux (vérifier la version) |
| Soca | Sugar Daddy – Sweet soca | Sugar Daddy ft Dedi ; titre « Sweet Soca Music » |
| Shatta | Meryl ft Blackboy – Click | Univers : Dennery Segment |
| Shatta | Mikado – Applaudissement | Natoxie ft TKD |
| Rap | Booba ft Pichon ft Gato da bato – GM | Booba ft Evil P & Gato |
| Dennery Segment | Subance ft Uncle Ellis – Back bend (remix) | Subance seul, ou Mighty & Subance |
| Dennery Segment | Umpa ft Sully – One drop | Genre du titre non confirmé |
| Dennery Segment | Meryl ft Deejay Asap – Hello | La feuille parle de « Tik Tak » : vérifier le titre du fichier |

## À vérifier

| Univers | Crédit actuel | Remarque |
|---|---|---|
| Dancehall | Magic ft Magic – Poumpoumbambam | Titre et artiste introuvables |
| Dancehall | Magic ft Magic – Lecococo | Titre et artiste introuvables |
| Soca | Olakira – In my Maserati | Afrobeats (Nigeria) : à retirer ou à garder |
| Soca | Mr. Vegas – Congrats Te Amo | Introuvable ; « Te Amo » de Mr. Vegas ft Yaksta & Topo La Maskara |
| Shatta | QLM – Comme à la maison | Meryl a un « Comme à la maison » (2020) |
| Trap | CLR – ABCD | « ABCD » de Gambi G, Walton & STG (2021) |

## Titres signalés, non modifiés

- Patrice Roberts ft Kes – Like it like that : titre exact « Like It Like This ».
- Theodora ft Jahlys – Boss lady : titre exact « Big Boss Lady ».
- Motto ft Problem Child & Mr. Legz – Bend dong (remix) et Dub Master J – That shot pt2 : la feuille cite l'original, nos fichiers sont le remix et la « Pt2 ».
- Breezethru ft Tallyboy – Wed (remix) et Umpa ft Mikado – Pain killer : crédit gardé (la feuille crédite Breezethru seul et Umpa seul).

## Corriger sans rien casser

Dans `sonara.js`, ne changer que `t` (titre) et `a` (artiste) ; `preview` (nom du fichier) reste tel quel. Plusieurs artistes : les séparer par « ft », « & » ou une virgule, un seul suffit en réponse. Ancienne orthographe à accepter : `ta:[…]`. Puis `npm run check`.
