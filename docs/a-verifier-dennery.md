# Univers Dennery Segment : morceaux à vérifier

Date : 15 novembre 2026. Branche `feature/univers-dennery`.

Ces morceaux ont un artiste ou un titre provisoire, choisi d'après le nom du fichier téléchargé (les tags ID3 ne donnent que le nom de la chaîne YouTube). Ils sont marqués `// A VERIFIER` dans `sonara.js` (liste `'dennery-segment'`).

| Fichier (`audio/`) | Artiste provisoire | Titre provisoire | Doute |
|---|---|---|---|
| `Andrew-Fighting_for_a_biscuit.mp3` | Andrew | Fighting for a biscuit | Artiste : le tag ne donne que la chaîne « Dennery Segment 758 » |
| `Breezethru_ft_Tallyboy-Wed_remix.mp3` | Breezethru ft Tallyboy | Wed (remix) | Titre : « Wed » ? |
| `Release-Bumpa_down.mp3` | Release | Bumpa down | Artiste : tag « Release - Topic » |
| `Tallyboy_ft_Samo-Uh_t_tak.mp3` | Tallyboy ft Samo | Uh T Tak | Orthographe du titre |
| `Krome_ft_Nassis-Bend_dong_for_di_hmm.mp3` | Krome ft Nassis | Bend dong for di hmm | Titre (« HMM ») |
| `Freezy_ft_Motto-Maltet_freestyle.mp3` | Freezy ft Motto | Maltet freestyle | Titre : la source dit « MALTET (CA) FREESTYLE » |

## Corriger sans rien casser

1. Dans `sonara.js`, ne changer que `t` (titre affiché et attendu) et `a` (artiste). Le champ `preview` reste tel quel : le nom du fichier n'a pas besoin de suivre.
2. Pour accepter aussi l'ancienne orthographe en réponse, l'ajouter dans `ta:[…]` (comme pour les autres univers).
3. Retirer le commentaire `// A VERIFIER` de la ligne, et la ligne du tableau ci-dessus.
4. `npm run check`.

Renommer le fichier est possible mais pas nécessaire. Dans ce cas, changer `preview` en même temps : `npm run check` signale un extrait manquant ou un fichier orphelin si l'un des deux est oublié.
