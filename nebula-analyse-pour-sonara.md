# Analyse complète de la maquette « Nebula Music App » → adaptation SONARA

> Sections volontairement exclues : « 02 / The Process » (Strategy / Discovery / Solution) et « Flows » (flowchart). Elles ne figurent pas sur SONARA.

Source : Behance, « Nebula Music App – UI/UX Design » (Anu Niyaz, juillet 2025, © All Rights Reserved).
Format analysé : 8 planches de 1400 px de large empilées, environ 22 200 px de haut au total. Toutes les couleurs ci-dessous ont été relevées au pixel sur les images originales.

> Règle d'usage : on reprend la structure, la mise en page, le rythme et les effets. On ne reprend ni les photos d'artistes, ni les textes mot pour mot, ni le nom Nebula. Pour SONARA, on garde le logo, la typographie (MuseoModerno pour les titres, Inter pour le texte) et les couleurs SONARA. La règle « aucun emoji » s'applique partout. Les formes rondes de la maquette sont **conservées telles quelles** : voir la partie 6.

---

## 1. L'ADN visuel en une phrase

On alterne trois « ambiances » de fond : un dégradé orange incandescent, un noir profond et un beige papier. Par-dessus, un éditorial suisse très aéré. On voit des micro-labels de 11 px terminés par « / », d'énormes phrases en Light dont les lignes s'effacent en dégradé de gris, des mockups de téléphone au centre, des cartes d'interface qui flottent autour et une petite série de boutons lecteur (précédent / pause / suivant) qui revient comme une signature.

---

## 2. Design tokens

### 2.1 Couleurs relevées

| Rôle | Hex | Où |
|---|---|---|
| Noir de fond | `#080808` | sections sombres (01, 04, Podcast, Micro hub, Outro) |
| Noir des pills / tags | `#050505` | pills des graisses (Typeface) |
| Carte UI sombre | `#111111` | cartes flottantes (Invite Friends, Create New) |
| Carte UI sombre 2 | `#171717` / `#1F1F1F` | boutons de contrôle dans l'app, cartes stem |
| Bouton secondaire | `#333333` | bouton « Invite » |
| Beige papier | `#CCC5B8` | sections Typeface, 3D Audio |
| Crème (boutons hero) | `#E9E1DB` | les 3 boutons lecteur du hero |
| Orange accent (UI) | `#E75001` / `#E35201` | anneau « Create New », points des curseurs, icônes |
| Orange bouton | `#E85E16` | « Play All », icônes des boutons crème |
| Orange vif (glow) | `#F35524` / `#FF8B56` | halos, faisceaux lumineux |
| Rouge sombre (coin de dégradé) | `#200000` → `#400000` | coin haut gauche du hero et des bandeaux orange |
| Rouge brique | `#860100` / `#A10D01` / `#C23401` | transition du dégradé |
| Orange central | `#DE5810` / `#D74F0D` | cœur du hero |
| Pêche / crème chaud | `#E6C789` / `#D3561A` | bas droite du hero (lumière) |
| Brun (section AI Search) | `#381309` → `#2A0F05` | fond dégradé sombre |
| Rose « Live » | ~`#FF9AD5` (texte noir) | badges « Live », anneau du timer « 5s » |
| Orange final (outro) | `#D03C00` / `#D74800` | disque grainé de fin |

Le texte sur fond sombre fonctionne en paliers de gris, toujours du plus clair au plus foncé ligne par ligne : `#EDEDED` → `#BDBDBD` → `#8F8F8F` → `#5A5A5A`.
Sur beige, le texte principal est `#111`, le secondaire `#6B6B6B` et les labels `#8A8378`.

### 2.2 Typographie

- **Police unique :** Helvetica Now Display (Monotype), présentée dans la maquette avec les graisses Thin, Light, Regular, Medium, Bold, Extra Bold et Black.
- **Rôles observés** (tailles rapportées à une largeur de 1400 px ; entre parenthèses, l'équivalent en `vw`) :

| Usage | Graisse | Taille | Interligne | Approche (tracking) |
|---|---|---|---|---|
| Titre hero « The future of… » | Bold | ~92 px (6.6vw) | 0.95 | -0.03em |
| Méga-titres de section (« Control sound. », « Bionic listening », « Micro music control hub ») | Bold / Black | 120–160 px (9–11vw) | 0.9 | -0.04em |
| Grandes phrases éditoriales (« Boring music apps?… ») | Light | ~64 px (4.5vw) | 1.05 | -0.02em |
| Paragraphe d'accroche du hero | Light | ~36 px (2.6vw) | 1.15 | -0.01em |
| Paragraphes de description | Regular | 15–17 px | 1.35 | 0 |
| Micro-labels (« Insights / », « 01 / ») | Regular | 13–15 px | 1.2 | 0 |
| Bandeau de section (« Nebula … Music App UI/UX ») | Regular | 13 px | 1 | 0 |
| Textes dans l'UI du téléphone | Medium / Bold | 11–22 px | — | — |
| Lettrage géant de fond (« NEBULA », « Nebula Nebula », « Artists Artists ») | Regular / Medium | 25–30vw | 0.8 | lettres réparties sur toute la largeur |
| Outro « Thanks! » | serif italique condensée, style script | ~50 px | — | — |
| Outro « Chill out & Relax! » | Black | ~70 px | 0.9 | -0.03em |

- **Effets typographiques récurrents :**
  1. **Lignes en fondu** : chaque ligne d'une grande phrase est un cran plus sombre que la précédente. On peut le faire avec un `background-clip:text` sur un dégradé vertical, ou une couleur par ligne.
  2. **Remplissage dégradé sur les méga-titres** : du blanc en haut au gris translucide en bas (« Bionic listening », « Micro music control hub »). Sur fond orange, le titre passe en brun translucide (`mix-blend-mode: multiply` ou opacité 0.7) : « Control sound. In space. »
  3. **Titre hero** : blanc chaud `#F3E3DC` sur la ligne 1, qui s'estompe en rose-orangé translucide sur la ligne 3.

### 2.3 Grille et espacements

- Canevas de 1400 px, marges latérales de **68 px (4.85 %)**, 12 colonnes.
- Repères de colonnes très réguliers (en % de la largeur) : **4.85 %** (bord gauche), **20.4 %** (colonne de texte secondaire), **36 %** (début des grandes phrases), **61–67 %** (colonne de droite), **95.1 %** (bord droit).
- Les sections sont très hautes (1600 à 3600 px). Beaucoup de vide entre les blocs : souvent 150 à 250 px.
- Chaque section commence par un **bandeau** de 13 px placé à 32 px du haut : nom du produit à gauche, « Music App UI/UX » à droite, en gris.

### 2.4 Formes, ombres, matières

- Pills totalement arrondies (tags, boutons), cartes avec un rayon de 20 à 24 px, boutons ronds. **On les garde pour SONARA, avec les mêmes rayons (voir l'inventaire en partie 6).**
- Les mockups de téléphone sont des iPhone 15 Pro (cadre titane graphite et Dynamic Island).
- Les cartes flottantes sont noires (`#111`) et légèrement translucides, sans ombre portée visible. On sent un très léger flou d'arrière-plan.
- Un **grain** fin couvre les dégradés orange et le disque de l'outro.
- **Halos** : lueur orange autour du micro et de la carte « Artist of the Day » (dorée), anneaux de points concentriques (motif en « pointillé radial »).
- **Faisceaux lumineux** : longues traînées diagonales orange-blanc façon lens flare (section AI Search et Bionic listening).
- **Cercles orbitaux** : fines lignes de 1 px semi-transparentes qui entourent les téléphones (section UI Design et 3D Audio).

---

## 3. Composants récurrents

1. **Micro-label** : `Insights /`, `About /`, `Artists /`… en 13–15 px, gris, toujours avec l'espace et le slash final.
2. **Numéro de section** : `01 /` en gris, avec dessous le titre (`The Core Idea`) en blanc ou noir, 14 px, aligné sur la marge gauche.
3. **Icône de section** : petit cercle de 32 px à contour 1 px, avec 4 points en losange au centre. Il est posé juste avant les micro-labels.
4. **Trio lecteur signature** : trois boutons précédent / pause / suivant. Dans le hero, ce sont de grands boutons crème `#E9E1DB` de 80 px empilés verticalement, avec des icônes orange. En pied de section, ce sont de petites pastilles orange de 24 px côte à côte.
5. **Pied de section** : une icône globe en trait, puis « Future of music / Interaction » sur deux lignes en bas à gauche. Le trio lecteur miniature est en bas à droite.
6. **Tags** : pills noires `#050505`, texte blanc de 13 px, 10 × 18 px de padding (utilisées pour les graisses de la section Typeface).
7. **Cartes UI flottantes** autour des téléphones : Invite Friends, Create New (anneau orange avec « + »), avatars + badge « Live », barre de recherche IA, mini-player, carte artiste.
8. **Barre de recherche IA** : pill sombre avec un liseré doré-orangé lumineux, le placeholder « Morning, **Anu!**, What's your pick? » (le prénom en blanc, le reste en gris) et un orbe micro orange dégradé à droite.
9. **Lettrage géant en fond** : le mot de la marque ou de la section, très grand, en couleur de fond +10 à 20 % de luminosité. Il passe derrière les téléphones et sert de marquee horizontal.
10. **Boutons de contrôle de l'app** : 3 grandes cases sombres `#1F1F1F` (précédent / pause / suivant) avec des icônes orange, sous une barre de progression fine (1:45 — 3:10) dont le curseur est orange.

---

## 4. Analyse section par section (de haut en bas)

### Section 0 — HERO (fond dégradé orange, ratio 1400 × 1640)

- **Fond** : dégradé radial. Coin haut gauche presque noir-rouge `#200000`, puis rouge `#860100` / `#C23401`, puis cœur orange `#DE5810` au centre. Une lumière pêche `#E6C789` monte en bas à droite. Grain léger.
- **Ligne méta du haut** (y ≈ 30 px, 13 px) : 4 colonnes, chacune avec un label gris clair et une valeur blanche dessous.
  - à 4.85 % : `UI/UX` / `Mobile App`
  - à 33 % : `Category` / `Music App`
  - à 61 % : `Project Duration` / `4 Weeks`
  - à droite, aligné à 95 % : le logotype de l'auteur sur 2 lignes, lettres géométriques, avec ®
- **Titre** (gauche, y ≈ 170 px, Bold 92 px, 3 lignes) : « The future of / music listening / experience ». Blanc sur la ligne 1, puis translucide de plus en plus rosé.
- **Accroche** (droite, x = 67 %, Light 36 px, 6 lignes) : « Redefines what a music app can be— transforming passive listening into an immersive, interactive experience. »
- **Métadonnées flottantes** (14 px, blanc) :
  - à gauche (y ≈ 565) : « Nebula / Music App »
  - à droite (y ≈ 565, aligné à droite) : « Jun 17 / 2025 »
  - à 20 % (y ≈ 735) : « Project Type: / Experimental »
- **Téléphone central** (environ 38 % à 62 % de la largeur), tenu par une **main en silhouette noire** qui monte du bas. L'écran affiche le lecteur : photo plein écran teintée rouge, flèche retour et partage en haut, 3 boutons ronds empilés à droite (réglages, sous-titres, bouton « 3D » orange plein), le titre du morceau en Bold blanc avec l'artiste en gris dessous, puis la barre de progression et les 3 cases de contrôle.
- **Lettrage géant « NEBULA »** en fond (y ≈ 860–1060, environ 28vw), blanc à 15–20 % d'opacité, lettres réparties sur toute la largeur. Le téléphone et la main passent **devant**.
- **Bas du hero** (sur la zone pêche, x = 67 %) : une liste « Research / Wireframing / Designing / Prototyping » (16 px, noir), puis « Location: / Kerala, India ».
- **Trio lecteur crème** empilé verticalement, aligné à droite (x ≈ 92 %, diamètre 80 px, fond `#E9E1DB`, icônes orange `#E85E16`).

### Section 1 — « 01 / The Core Idea » (fond `#080808`)

- Bandeau : « Nebula » / « Music App UI/UX ».
- À gauche : `01 /` et `The Core Idea`. Icône de section à environ 32 %.
- À x = 36 % : `Insights /`, puis la grande phrase Light de 64 px sur 4 lignes en fondu : « Boring music apps? / Outta here! Nebula / spins your sound into / next-gen magic! ».
- **Composition du téléphone « Home »** (centré à environ 50 %) : logo NEBULA en Black, avatar, barre de recherche IA lumineuse, onglets « Your Space » (actif, blanc, petit badge orange « New Track »), « Podcast » (gris, badge « Live »), « Playli… » (coupé). Ensuite un carrousel de pochettes (une centrale grande avec bouton play rond translucide et « + », deux latérales coupées), le texte « Based on your 8AM gym session », le titre « Day-Starter / Beats » (le 2e mot en gris) avec le bouton pill orange « ▶ Play All », puis la carte « Podcast Picks / 28 Tracks » avec « View All ».
- **Satellites autour du téléphone** :
  - carte « Invite Friends / Invite & earn upto 1000 Credits / [Invite] » qui déborde à gauche du téléphone
  - pill « (+) Create New » à droite
  - icône onde sonore dans un cercle
  - vignette carrée orange avec silhouette et bouton play (bord droit)
- À gauche (x = 4.85 %) : `About /` + paragraphe de 13 px.
- **2e rangée** : téléphone « Podcast player » à gauche (x ≈ 21–41 %), liste `Problems` (gris) à droite → « Static / Passive / Boring UI / Zero Control » en fondu, puis le téléphone « Player » qui sort du cadre en bas à droite.
- **Bloc problème** (gauche) : icône, `The Problem /`, puis une phrase Light de 34 px sur 5 lignes en fondu : « Today's players treat music like a flat MP3 file — play, pause, skip. No interaction. No discovery. Just passive consumption. Users deserve to feel their music, not just hear it. »

### Section 2 — Typeface (dégradé orange qui se fond dans le beige `#CCC5B8`)

- Le haut de la section reprend le dégradé orange. Il **fond progressivement** dans le beige sur environ 600 px : c'est une transition de section par la couleur.
- À x = 31 % : icône, puis `Typeface / used /` sur 2 lignes. À x = 36 % : « Helvetica / Now Display » en Regular 64 px, noir.
- Ligne « Used Weights: » (x = 20 %), avec les pills noires des 7 graisses sur 2 lignes. À droite (x = 67 %), un paragraphe gris : « Helvetica Now Font is a simple, clean Font family created by Monotype with a modern design and remarkable appearance. »
- **Carrousel 3D de 3 cartes** (centré) : la carte centrale est de face (portrait 1:1.2, rayon 16, photo, badge « 2.4K », icône onde, titre « Can AI replace DJs? », sous-titre, bouton pill contour « Listen ▶ »). Les cartes latérales sont tournées en perspective (rotateY d'environ ±20°, bord extérieur plus grand). **Derrière** passe un marquee « Nebula Nebula Nebula » en gris taupe `#8F887C`, d'environ 80 px.
- Sous le carrousel, un **sélecteur vertical façon roue iOS** : « AI+ » (estompé, petit), « Tech » (sélectionné, contour orange 1 px, plus grand), « Comedy » (estompé).

### Section 4 — « 04/ UI Design » (noir, halo brun-orange au centre, cercles orbitaux fins)

- Gauche : `04/` + `UI Design`. À x = 20 % : grande phrase Light de 64 px sur 4 lignes en fondu : « Boring / interfaces? / Not in this / galaxy! ». À droite, en Light 34 px sur 3 lignes en fondu : « Skip the flat screens. / Enter a whole new / interface universe. »
- Une **main réaliste** tient le téléphone Home **en perspective** (incliné d'environ 15°), dans une lumière rasante orange. Des cercles concentriques de 1 px sont centrés sur le téléphone.
- Satellite : une pill de 2 avatars avec badge rose « Live » (gauche, y ≈ 640).
- `Home Screen /` (x = 20 %) : « The smart home screen powered by AI greets you by name and serves personalized music picks. The AI search bar handles voice/text requests while live updates. »
- Fil d'Ariane gris (14 px) : « Dynamic Search Bar / Top Recommendations / AI Recommendation ».
- Grande phrase sur 4 lignes en fondu : « Reimagines music / listening as an / immersive, interactive / experience. »
- **2 téléphones côte à côte** (x ≈ 20–41 % et 51–72 %) avec derrière eux un marquee « Artists Artists Artists » gris foncé de 90 px :
  - **Artist of the Day** : titre doré en dégradé, une étoile en haut, une carte « trading card » translucide qui brille (photo, médaillon étoile doré, « Hanumankind », « Rapper and singer », « 20,234 Monthly Listeners », « 120 Tracks »), une particule dorée et le bouton « Listen Now ».
  - **Artists** : onglets (Playlist / **Artists** / Premium) et une grille 2 colonnes en quinconce (masonry décalée). Chaque artiste a une photo carrée colorée, un nom + coche orange « vérifié », un rôle, des écoutes et un pays. En bas, une barre « Search Artists » avec un bouton filtre orange.
- Colonne de droite (x = 82 %) : icône, `Artists /` et le paragraphe.

### Section 5 — AI Search (dégradé brun `#381309` qui s'assombrit vers le noir)

- Gauche, grande phrase : « Finally - an / assistant that / gets your / music taste ».
- Gauche (y médian), labels en orange-beige : « AI Search / Ambient music finder ».
- **Téléphone central** à l'écran dégradé brun-orange : la requête « Play fun does not exist by **Natacha Atlas** » est écrite en direct (le nom de l'artiste est encore estompé = saisie vocale en cours). Un **orbe micro** orange lumineux est posé dans un halo de points en anneaux. En bas : globe, « Listening ▮▯ » et un bouton « × ».
- **Faisceaux lumineux** diagonaux orange-blanc qui traversent l'écran derrière le téléphone (deux à gauche, deux à droite), avec un halo de points concentriques autour de la base du téléphone.
- La barre de recherche IA flotte à droite, à mi-hauteur, et chevauche le téléphone.
- À droite en bas : `AI Search /` + « Nebula's smart search listens to your voice, hums, or nearby music - then serves perfect matches. Part assistant, part sonic bloodhound, it's always ready to track down your next favorite song. »

### Section 6 — Playlist & Profile (dégradé brun → noir `#080808`)

- Droite (x = 51 %), grande phrase sur 5 lignes : « Play-pause is / so last-gen— / Let's unlocks a / playground of / sound ».
- **Téléphone Playlist** (gauche) : onglets, « 24 Playlists » + « Create New », puis des rangées de 3 pochettes avec leur titre (Starboy, Bad Guy, Calm Down…). Bloc « Road Trip Anthems » : « 02 / 28 Songs », « 2 hours 32 Minutes », bouton « Pause ⏸ ». Bloc « Desert Mirage Fusion » : bouton « Play All ▶ ».
- Satellites : la pill « Create New », une **grande** carte Invite Friends (gauche) et une carte Premium (droite).
- **Téléphone Profile** (droite) : « Hey, **Niyaz** » + pastille rose « 120 ». Stats en Bold : 1.2K Followers / 248 Following / 19 Playlists. Grille de cartes : Premium (« Your plan will expires on Dec 2025 », [Cancel]), QR code en points ([Share Profile]), Invite Friends, Payment Method (Card **** 1234, [Update]) et « Logout ».
- `Profile /` : « Nebula's profile tracks your stats and premium status while making it easy to share your taste or invite friends. Everything you need, nothing you don't. »

### Section 7 — 3D Audio + Stem Splitter (dégradé rouge-orange qui se fond dans le beige)

- **Méga-titre** centré « Control sound. / In space. » en Black d'environ 160 px, brun translucide sur l'orange.
- Gauche : « Put sounds / exactly where / your ears / want them! », en Light 54 px et en fondu (noir → taupe).
- **Téléphone « 3d Audio Controller »** : une sphère de points blancs (grille sphérique) dans un anneau gradué, avec des repères Top / Bottom / Left / Right et des flèches orange. Toggles orange « Auto Spatial Rotate » et « Lock Position ». Une carte montre un buste 3D chromé avec casque et un orbe orange qui représente la source sonore. Données en monospace : X 1.50, Y 1.05, Z 0.05, HRTF +3dB / 2kHz.
- Colonne de 5 pastilles d'icônes crème empilées à droite. En dessous : globe, `3D Audio Controller /` et « Drag, spin, and lock audio in 3D space—like a DJ for your ears. »
- **Rangée de 5 pills de fonctionnalités** (fond `#E9E5DE`, pastille d'icône à gauche) : Drag-to-Place Interface, Real-Time Audio Rotation, Position Locking, AI Auto-Balance, Head-Tracking Mode.
- **Téléphone « AI Stem Splitter »** : forme d'onde (partie lue en orange, reste en gris), temps 1:45 / 3:10, 4 potards en donut (Vocals 45 %, Instruments 25 %, Bass 50 %, Drums 45 %) avec un curseur rond orange ou gris sur l'arc.
  - Satellites : un potard 45 % isolé dans une carte noire (gauche), une liste `Controls` (Vocals / Instruments / Bass / Drums) et une carte de forme d'onde grise.
  - `AI Stem Splitter /` : « Isolate vocals, instruments, bass, or drums with surgical precision. Adjust levels in real-time to create your perfect mix—no studio gear needed. »
- **Composition « éclatée »** : le téléphone 3D Audio est vu en perspective forte, entouré d'arcs orbitaux pointillés. Des étiquettes pills blanches sont posées sur les orbites (Drag-to-Place Interface, Position Locking, AI Auto-Balance, Head-Tracking Mode). Une carte sphère sombre est à gauche, une carte de forme d'onde en verre dépoli blanc en bas à droite. Une ligne d'horizon fine de 1 px traverse toute la largeur.
  - À droite : « Audiophile-Grade Customization » et « Neurological Sound Mapping ».
- Pied de section : globe + trio lecteur.

### Section 8 — Bionic listening / Podcast (bandeau dégradé rouge-orange-jaune qui finit en noir)

- Méga-titre « Bionic / listening » en Bold d'environ 160 px, rempli d'un dégradé blanc → gris. Le téléphone passe **devant** le bas des lettres.
- Gauche (x = 20 %) : « Stop Listening. / Start Interacting ».
- **Téléphone Podcast Player incliné** en 3D (rotations X et Z), devant un **faisceau lumineux** diagonal orange qui traverse toute la section. Écran : photo de l'animateur, titre « Can AI replace DJs? », rangée de 4 intervenants en avatars ronds, carte « Next in this topic » avec avatars, badge « Live » et timer circulaire rose « 5s ». En bas : commentaires (badge 128), gros bouton pause, sous-titres.
- Droite : `Podcast Player /` + « Dive into AI-curated podcasts with live discussions, tailored recommendations, and seamless playback—all designed for curious minds who crave quality content without the hunt. »
- Grande phrase sur 4 lignes en fondu : « Say goodbye to / boring music listening / experiences Nebula / brings sound to life ».
- `Podcast /` : « Live debates, curated recommendations, and speakers worth following - all in one scroll. »
- **Téléphone Live Podcast** (à droite) : roue de catégories (AI+ / Tech / Comedy), carrousel de cartes, « Speakers you Follow », « You Might Like ». Satellites : la carte des 4 intervenants qui chevauche le téléphone, une carte artiste « Billie Eilish ✓ Singer » avec « + », la barre de recherche IA, la carte « Next in this topic » en grand, et une reprise du téléphone Artists.

### Section 9 — Micro music control hub (noir, glow orange flou en bas)

- Label centré gris « Music Preview ».
- Méga-titre centré « Micro music / control hub » en Bold d'environ 150 px, en dégradé blanc → gris. Les téléphones sortent de derrière la 2e ligne.
- Deux téléphones superposés et décalés :
  - le premier montre la **Dynamic Island** étendue (pochette + onde)
  - le second montre le **widget de l'écran verrouillé** : pochette, « Starboy / The Weeknd », icône onde, barre de progression 1:45—3:10 avec point orange, et 3 contrôles dont le bouton pause large au centre
- **Mini-player pill** flottant en bas à gauche : pochette ronde avec une onde par-dessus, titre/artiste, suivant, pause.
- Fond noir, avec un **nuage de lumière orange/jaune très flou** qui monte du bas : c'est la transition vers l'outro.

### Section 10 — Outro (noir)

- **Disque orange grainé** au centre (environ 300 px), entouré d'un halo de points concentriques et traversé par une **ellipse orbitale** blanche de 1 px inclinée (effet planète).
- « Thanks! » en serif italique noire, puis « Chill out / & Relax! » en Black noir-brun `#2A0A00`.

---

## 5. Effets et animations à imaginer (la maquette est statique)

1. **Fondu des lignes au scroll** : chaque ligne (ou chaque mot) d'une grande phrase passe de `#3A3A3A` à sa couleur finale à mesure qu'on scrolle (scroll-scrub). C'est la signature de la maquette.
2. **Hero** : le dégradé « respire » lentement (en douceur, sur 12 s). Le lettrage géant glisse en parallaxe plus lentement que le téléphone. Au scroll, le téléphone monte puis **se réduit pour aller se loger dans le header** (c'est le comportement voulu pour SONARA).
3. **Satellites en parallaxe** : chaque carte flottante a sa propre vitesse (0.8× à 1.2×) et une légère rotation au survol.
4. **Carrousel 3D** de pochettes : perspective de 1200 px, rotateY sur les cartes latérales, drag ou flèches, et marquee infini derrière.
5. **Roue de catégories** façon iOS : scroll snap vertical, l'élément central grossit et prend le contour accent.
6. **Transitions de fond entre sections** : la couleur du `body` est interpolée au scroll (orange → noir → beige), au lieu de coupures nettes.
7. **Méga-titres** : apparition en remontant derrière un masque (clip-path), puis le téléphone passe devant.
8. **Faisceaux lumineux** : bandes en `linear-gradient` floutées qui balaient lentement en diagonale.
9. **Halo de points** : anneaux de points en SVG qui pulsent au rythme d'un BPM.
10. **Sphère de points** en rotation continue (canvas ou SVG) et forme d'onde animée.
11. **Trio lecteur** : vrais contrôles cliquables (hover : légère montée et inversion des couleurs).
12. **Grain** global en overlay (SVG `feTurbulence`, opacité 0.06).
13. `prefers-reduced-motion` : tout passe en apparition simple.

---

## 6. Adaptation SONARA : ce qu'il faut changer

### 6.1 Priorités

1. **Le logo SONARA et son identité passent avant tout.** On garde la typographie et les couleurs SONARA. Nebula est en Helvetica Now, donc on transpose les rôles typographiques : MuseoModerno 800-900 pour les méga-titres, le titre hero et tous les vrais titres ; Inter Light 300 pour les grandes phrases en fondu (des phrases à lire, pas des titres) ; Inter pour les paragraphes et labels. Syne n'est plus utilisée nulle part.
2. **On reprend fidèlement tout le reste de la maquette**, formes rondes comprises, puisque l'identité SONARA est déjà très proche de Nebula.
3. **Aucun emoji** nulle part.
4. **Grand dégradé orange de Nebula conservé**, à l'identique. On le reprend sur le hero, les bandeaux de transition (au-dessus de « Les univers » et de « Comment jouer »), la section « Nouveautés » (version rouge-orange-jaune) et la lueur floue avant l'outro. Sa recette est en partie 6.2 bis.
5. Pas de son sur la landing. Pas de compteur « joueurs en ligne ». Le son-nom se choisit après le clic sur « Jouer ».
6. Visuels : pas de photos d'artistes réels sous droits. Utiliser les futures pochettes SONARA refaites ou des placeholders.

### 6.2 Inventaire des formes rondes à reproduire

| Élément | Forme dans Nebula | CSS conseillé |
|---|---|---|
| Tags, pills de graisses, boutons texte (« Play All », « Invite », « View All », « Listen », « Cancel », « Update ») | pill entièrement arrondie | `border-radius: 999px` |
| Trio lecteur du hero (précédent / pause / suivant) | 3 cercles crème de 80 px empilés | `border-radius: 50%`, fond `#E9E1DB`, icônes accent |
| Trio lecteur des pieds de section | 3 cercles accent de 24 px côte à côte | `border-radius: 50%` |
| Icône de section | cercle de 32 px à contour 1 px, 4 points au centre | `border-radius: 50%; border: 1px solid` |
| Pastilles d'icône (colonne 3D Audio, pills de fonctionnalités) | cercles crème de 52 à 60 px | `border-radius: 50%` |
| Bouton « Create New » | anneau accent de 40 px avec « + » dans une pill sombre | anneau `border-radius: 50%; border: 1.5px solid accent` |
| Avatars (intervenants, « Live », profil) | cercles, groupés avec chevauchement de 30 % | `border-radius: 50%`, marge négative |
| Badge « Live » / pastille de crédits | petite pill rose | `border-radius: 999px` |
| Bouton play sur pochette | cercle translucide de 44 px | `border-radius: 50%; backdrop-filter: blur(8px)` |
| Orbe micro / orbe de recherche | sphère accent lumineuse | `border-radius: 50%` + `radial-gradient` + `box-shadow` de glow |
| Barre de recherche | pill longue à liseré lumineux | `border-radius: 999px` |
| Timer « 5s » / potards de jeu | anneau de progression | SVG `circle` avec `stroke-dasharray` |
| Curseurs de barre de progression | point de 8 px | `border-radius: 50%` |
| Halo de points autour des orbes | anneaux concentriques de points | SVG ou `repeating-radial-gradient` |
| Sphère de points | grille sphérique de points blancs | canvas ou SVG |
| Cercles orbitaux | grands cercles de 1 px autour des mockups | `border-radius: 50%; border: 1px solid rgba(255,255,255,.12)` |
| Ellipse orbitale de l'outro | ellipse inclinée de 1 px | SVG `ellipse` en rotation |
| Disque de l'outro | disque accent grainé de 300 px | `border-radius: 50%` + grain |
| Mini-player | pill avec pochette ronde à gauche | pill `999px`, pochette `50%` |
| Roue de catégories | items en pill, le sélectionné avec contour accent | `border-radius: 999px` |
| Cartes et cartes satellites | rectangles arrondis | `border-radius: 20px` à `24px` |
| Pochettes du carrousel | rectangles arrondis | `border-radius: 16px` |
| Mockups de téléphone | iPhone 15 Pro, coins arrondis et Dynamic Island | `border-radius: 48px` pour le cadre, `40px` pour l'écran, Dynamic Island en pill |

### 6.2 bis Recette du grand dégradé orange

Les couleurs ont été relevées au pixel sur la maquette.

```css
:root{
  --neb-ink:   #200000; /* coin haut gauche, presque noir */
  --neb-wine:  #860100;
  --neb-brick: #C23401;
  --neb-core:  #DE5810; /* cœur orange */
  --neb-hot:   #F35524;
  --neb-peach: #E6C789; /* lumière pêche, bas droite */
  --neb-cream: #CCC5B8; /* fond beige de transition */
}
/* Hero : plusieurs radial-gradient superposés pour un rendu « lumière » */
.hero{
  background:
    radial-gradient(60% 55% at 85% 95%, var(--neb-peach) 0%, transparent 70%),
    radial-gradient(70% 70% at 55% 60%, var(--neb-core) 0%, transparent 75%),
    radial-gradient(90% 80% at 75% 20%, var(--neb-brick) 0%, transparent 80%),
    linear-gradient(135deg, var(--neb-ink) 0%, var(--neb-wine) 30%, var(--neb-brick) 55%, var(--neb-core) 80%, var(--neb-hot) 100%);
}
/* Bandeau de transition orange → beige (avant « Les univers », « Comment jouer ») */
.band-to-cream{
  background:
    radial-gradient(80% 60% at 20% 0%, var(--neb-wine) 0%, transparent 70%),
    radial-gradient(70% 60% at 70% 10%, var(--neb-core) 0%, transparent 75%),
    linear-gradient(180deg, var(--neb-brick) 0%, var(--neb-hot) 20%, var(--neb-peach) 45%, var(--neb-cream) 75%);
}
/* « Nouveautés » : rouge à gauche, orange au centre, jaune en haut à droite, fond noir en bas */
.band-hot{
  background:
    radial-gradient(50% 50% at 90% 10%, #F6C04A 0%, transparent 70%),
    radial-gradient(60% 60% at 60% 30%, var(--neb-hot) 0%, transparent 75%),
    linear-gradient(180deg, #821100 0%, #C23401 35%, #080808 100%);
}
/* Lueur floue avant l'outro */
.glow-bottom{ background: radial-gradient(70% 50% at 30% 100%, #FF8B56 0%, #E35201 35%, transparent 75%), #080808; }
```

- **Grain obligatoire** par-dessus : SVG `feTurbulence` à 6–8 % d'opacité. C'est lui qui donne l'aspect « photo » de Nebula et évite les bandes de couleur.
- **Respiration** : les centres des radial-gradients dérivent lentement de 3 à 5 % sur 12 s (variables CSS animées avec `@property`).
- **Transition au scroll** : le bas de chaque bandeau orange se fond dans la couleur de la section suivante (beige `#CCC5B8` ou noir `#080808`), sans coupure nette.
- Si le logo SONARA ou ses couleurs ne ressortent pas assez sur l'orange, le logo passe en blanc ou en noir. On ne touche pas au dégradé.

### 6.3 Correspondance des sections Nebula → landing SONARA

| Nebula | SONARA |
|---|---|
| Hero (titre, accroche, téléphone tenu, lettrage géant, trio lecteur) | Hero : logo SONARA, « SONARA » en lettrage géant de fond, titre sur la culture antillaise et le blind test, accroche courte, mockup de la partie en cours (pochette qui se dévoile, réponses), CTA pill « Jouer ». Ligne méta en haut : « Blind test / Multijoueur », « Univers / 9 », « Musiques / Antilles ». Trio lecteur rond à droite. Le téléphone part dans le header au scroll. |
| 01 The Core Idea + The Problem | « 01 / Qu'est-ce que SONARA » : grande phrase en fondu sur la mission (promouvoir la culture antillaise, rassembler les gens). Puis « L'histoire / Comment l'idée est venue » en bloc problème. |
| Typeface + carrousel 3D + roue de catégories | « Les univers » : carrousel 3D des 9 pochettes avec marquee « SONARA SONARA » derrière. Roue verticale de pills avec les noms d'univers, celui sélectionné cerclé en couleur accent. |
| 04 UI Design + Artists | « Les possibilités » / « Le site » : téléphone en perspective (partie, podium, salons multijoueur), cercles orbitaux autour. Le « Artist of the Day » devient **« L'artiste à l'honneur »** (carte aux couleurs SONARA). |
| AI Search (faisceaux, saisie live) | Moment « reveal » : la réponse s'écrit en direct (titre puis artiste qui apparaît), orbe lumineux, la pochette se dévoile. |
| Playlist & Profile | Profil joueur / historique des parties / podium (en option). |
| 3D Audio / Stem Splitter | « Comment jouer » : la rangée de 5 pills de fonctionnalités (avec leur pastille d'icône ronde) devient les étapes (Choisis ton son-nom / Choisis l'univers / Écoute / Trouve titre et artiste / Podium). Le mockup montre la partie avec timer en anneau, scores en potards ronds et reveal progressif de la pochette (concept « La Pochette »). |
| Bionic listening / Podcast | « Nouveautés » : articles, nouveaux sons, mise en lumière du morceau et de l'artiste (cartes magazine, avatars ronds des artistes). |
| Micro music control hub | Bandeau « Le lecteur » / mini-player pill du jeu (en jeu uniquement, pas de son sur la landing). |
| Outro « Thanks! Chill out & Relax! » | Clôture : disque grainé aux couleurs SONARA avec halo de points et ellipse orbitale, slogan créole ou français, puis CTA final « Jouer ». |

### 6.4 Composants à garder tels quels

Micro-labels « Label / », numéros de section « 01 / », icône de section ronde, bandeau de section (« SONARA » à gauche, « THE Blind test » à droite), pied de section avec un globe et le trio lecteur rond, lignes en fondu, méga-titres avec un mockup qui passe devant, cartes satellites flottantes, pills, avatars ronds, orbes, halos de points, cercles orbitaux, lettrage géant de fond, marquee, grain.

---

## 7. Prompt prêt à coller dans Claude Code

```
Refonte de la landing SONARA, reproduction fidèle de la maquette « Nebula Music
App » (Behance). Ne pas reproduire les sections « The Process » ni « Flows ».
Lis d'abord le fichier nebula-analyse-pour-sonara.md (spécification complète),
puis le CSS existant de SONARA pour récupérer le logo, les variables de couleur
et les fonts (MuseoModerno, Inter).

Priorités :
- le logo SONARA et son identité passent avant tout : garder le logo, MuseoModerno, Inter et la
  palette SONARA ; ne pas importer Helvetica ;
- tout le reste suit la maquette Nebula au plus près, formes rondes comprises ;
- reprendre le grand dégradé orange de Nebula (recette CSS en partie 6.2 bis :
  #200000 → #860100 → #C23401 → #DE5810 → #F35524, lumière pêche #E6C789 en
  bas à droite) sur le hero, les bandeaux de transition vers le beige
  #CCC5B8, la section « Nouveautés » et la lueur avant l'outro ; toujours avec
  un grain SVG à 6–8 % et une lente « respiration » des centres lumineux ;
- aucun emoji ;
- pas de son sur la landing, pas de compteur de joueurs en ligne ;
- aucune image d'artiste réel : placeholders de pochettes.
- textes : utiliser exactement ceux de la partie 8 du fichier (aucun texte de
  Nebula) ; les crochets [ ] sont des emplacements de contenu dynamique, le
  lorem ipsum des Nouveautés est temporaire.

Ordre des sections : Hero → 01 Qu'est-ce que SONARA (+ L'histoire) → 02 Les
possibilités → 03 Le site, la révélation → 04 Comment jouer → 05 Les univers
(carrousel 3D) → 06 Nouveautés → Un jeu, tous les écrans → Outro.

Formes rondes à reproduire (voir l'inventaire en partie 6.2 du fichier) :
- pills (border-radius: 999px) : tags, boutons texte, CTA « Jouer », barre de
  recherche, badges « Live », roue de catégories, mini-player, Dynamic Island ;
- cercles (border-radius: 50%) : trio lecteur du hero (80px, fond #E9E1DB) et
  des pieds de section (24px, accent), icône de section (32px, contour 1px),
  pastilles d'icône (52–60px), anneau « Create New », avatars en chevauchement,
  boutons play translucides, orbe micro lumineux, curseurs de progression,
  disque grainé de l'outro ;
- anneaux SVG : timer et potards (stroke-dasharray), halos de points
  concentriques, sphère de points, cercles orbitaux de 1px autour des mockups,
  ellipse orbitale inclinée de l'outro ;
- rayons : cartes 20–24px, pochettes 16px, cadre téléphone 48px, écran 40px.

À reproduire :
1. Grille 12 colonnes, marges 4.85 %, colonnes repères à 20.4 % / 36 % / 67 %.
2. Bandeau de section 13 px (SONARA à gauche, sous-titre à droite).
3. Micro-labels « Label / », numéros « 01 / » + icône de section ronde.
4. Grandes phrases Inter Light 300 dont chaque ligne s'éclaircit au scroll
   (scroll-scrub, du gris foncé vers la couleur finale).
5. Méga-titres MuseoModerno 800 (9–11vw, interligne 0.9, tracking -0.04em) avec un
   mockup qui passe devant la 2e ligne.
6. Lettrage géant « SONARA » en fond du hero (28vw, opacité 0.15) en parallaxe.
7. Hero : ligne méta en 4 colonnes, titre 3 lignes à gauche, accroche à droite,
   mockup central qui, au scroll, se réduit et se loge dans le header, trio
   lecteur rond empilé à droite.
8. Carrousel 3D des 9 pochettes d'univers (perspective 1200px, rotateY ±20° sur
   les latérales) + marquee infini derrière + roue verticale de pills.
9. Cartes satellites flottantes en parallaxe autour des mockups, entourées de
   cercles orbitaux.
10. Orbe lumineux avec halo de points qui pulse, faisceaux lumineux diagonaux.
11. Transitions de couleur de fond interpolées entre sections (le dégradé orange
   se fond dans le beige ou le noir de la section suivante).
12. Trio lecteur rond (précédent / pause / suivant) en signature de pied de
   section, avec le globe à gauche.
13. Outro : disque grainé avec halo de points et ellipse orbitale en rotation.
14. Overlay de grain SVG à 6 % d'opacité ; prefers-reduced-motion respecté.
Responsive : desktop d'abord, puis mobile (les colonnes se replient, les
méga-titres passent à 14vw, les satellites se masquent).
```

---

## 8. Textes SONARA validés

Les textes suivent la structure Nebula adaptée et ton ordre : qu'est-ce que SONARA, les possibilités, le site, comment jouer, puis les univers et les nouveautés.

Les textes entre crochets [ ] sont des emplacements à remplir avec le contenu réel du jeu. Les textes en lorem ipsum seront remplacés plus tard.

---

### Éléments communs

> **Nom dans les textes : « Sonara »** (casse normale) dans tous les textes, titres et sous-titres. Seul le logo reste en capitales. Aucun `text-transform: uppercase` ne doit le remettre en majuscules.
>
> **Slogan officiel : « THE Blind test »** (« THE » en majuscules, « Blind test » en deux mots). Il remplace « Blind test caribéen » partout (bandeau des sections, méta flottante) et donne le titre de la page : `<title>SONARA, THE Blind test</title>`.

| Emplacement | Texte |
|---|---|
| Slogan officiel | THE Blind test |
| Bandeau de section, gauche | Sonara |
| Bandeau de section, droite | THE Blind test |
| Pied de section, à côté du globe | Musique caribéenne / en multijoueur |
| Bouton principal (partout) | Jouer |
| Lettrage géant de fond | SONARA |

---

### Hero

| Emplacement | Texte |
|---|---|
| Méta 1 (gauche) | logo SONARA |
| Méta 2 | menu « Univers » : Dancehall · Kompa · Zouk · Rap · Trap · Soca · Reggae · Shatta · Mix |
| Méta 3 | menu « Mode » : Solo · Multijoueur |
| Logo géant + slogan (à gauche du téléphone) | logo SONARA / THE Blind test |
| Titre (3 lignes) | Le blind test / qui fait vibrer / la Caraïbe |
| Accroche (droite) | Écoute un extrait, trouve le titre et l'artiste, et défie tes proches où qu'ils soient. Le zouk, le kompa ou le dancehall deviennent un jeu à partager. |
| Méta flottante gauche | Sonara / THE Blind test |
| Méta flottante droite (plus bas) | Made in Martinique |
| Méta flottante centre-gauche | Pour qui ? / Tous les univers |
| Liste bas droite (4 lignes) | Écouter / Deviner / Marquer / Partager |
| Sous la liste | Origine : / Martinique, Antilles |
| Écran du téléphone | Manche 3/10 · « Qui chante ? » · barre de temps · pochette plein écran (maquette Figma en attendant les nouvelles) |
| CTA | Jouer |

---

### 01 / Qu'est-ce que SONARA

| Emplacement | Texte |
|---|---|
| Numéro + titre | 01 / Qu'est-ce que Sonara |
| Label | L'idée / |
| Grande phrase (4 lignes en fondu) | Un blind test qui / sonne comme chez nous. / Sonara met la musique / antillaise au cœur du jeu. |
| À propos / | Sonara est un jeu de blind test en ligne dédié aux musiques des Antilles et de la Caraïbe. On y joue seul ou à plusieurs, à distance, pour partager un vrai moment ensemble. |
| Liste (fondu) — titre « Notre mission » | Transmettre / Rassembler / Faire découvrir / S'amuser |
| Satellite « inviter » | Invite tes proches / Partage le lien de ta salle / [Inviter] |
| Satellite pill | Créer une salle |
| Onglets du téléphone | Univers · Salles · Classement |
| Carte du téléphone | Morceau à l'honneur / [Titre] — [Artiste] / [Lancer la partie] |
| Label | L'histoire / |
| Phrase histoire (5 lignes en fondu) | Tout est parti d'une soirée entre frère et sœur, autour d'un blind test. / On s'est dit qu'il nous fallait un jeu fait pour nous, / avec les sons qu'on aime / et qui nous font vibrer. / Sonara est né ce soir-là. |

---

### 02 / Les possibilités

| Emplacement | Texte |
|---|---|
| Numéro + titre | 02 / Les possibilités |
| Grande phrase (4 lignes en fondu) | Seul ou à plusieurs ? / Les deux. / Et toujours / ensemble. |
| Phrase droite (3 lignes) | Joue en solo pour t'entraîner. / Crée une salle et défie / tes proches à distance. |
| Label + texte | Salle de jeu / Crée ta salle, partage le lien et lance la partie quand tout le monde est prêt. Les scores s'affichent en direct pour chaque joueur. |
| Fil d'Ariane | Solo / Multijoueur / Classement |
| Grande phrase 2 (4 lignes) | Chaque partie / met en lumière / un morceau / et son artiste. |
| Carte dorée | L'artiste à l'honneur / [Nom de l'artiste] / [Univers] / [X titres dans Sonara] / [Découvrir] |
| Marquee | Artistes Artistes Artistes |
| Label + texte | Les artistes / Découvre les artistes qui font vivre les univers de Sonara, des grands classiques aux nouvelles voix. |

---

### 03 / Le site — la révélation

| Emplacement | Texte |
|---|---|
| Grande phrase (4 lignes) | Le moment / où tout / se révèle. |
| Label gauche | La révélation / Titre et artiste |
| Écran du téléphone | Ta réponse s'écrit en direct : « [Titre] par **[Artiste]** » · « À l'écoute » |
| Barre de réponse flottante | Titre ou artiste… [orbe] |
| Label + texte droite | Ta réponse / Tape ta réponse pendant l'extrait. Les accents et les petites fautes ne comptent pas : si c'est le bon titre, Sonara le reconnaît. À la fin du temps, la pochette se dévoile. |
| Grande phrase 2 (5 lignes) | Appuyer sur play, / c'est dépassé. / Ici, on écoute / pour gagner. |
| Profil (version ultérieure, ne pas intégrer maintenant) | Ton profil / Tes parties, tes scores et ta place au classement. |

---

### 04 / Comment jouer

| Emplacement | Texte |
|---|---|
| Méga-titre | Écoute. / Devine. |
| Phrase gauche (4 lignes) | Trouve le titre, / trouve l'artiste / et grimpe / au classement ! |
| 5 pills d'étapes | Choisis ton son-nom · Choisis ton univers · Écoute l'extrait · Trouve titre et artiste · Monte sur le podium |
| Label + texte | Comment jouer / Écoute l'extrait et tape l'artiste, le titre, ou les deux. La manche s'arrête dès que tout le monde a trouvé, ou au bout de 30 secondes. |
| Liste « Les points » | Artiste ou titre : 15 points chacun. / Les deux d'un coup : 30 points. / Réponds vite pour multiplier tes points : ×3 dans les 5 premières secondes, ×2 entre 5 et 10 secondes. / Jusqu'à 90 points par morceau. |
| Potards | Rapidité · Précision · Série · Score |
| Étiquettes sur les orbites | Réponse rapide · Fautes tolérées · Score en direct · Podium final |
| Texte droite | Un jeu simple à comprendre / Difficile à lâcher |

---

### 05 / Les univers

| Emplacement | Texte |
|---|---|
| Label | Univers / musicaux / |
| Grand titre | 9 univers, / une seule Caraïbe |
| Texte droite | Du zouk au shatta, chaque univers a ses morceaux, ses artistes et sa pochette. Choisis le tien avant chaque partie. |
| Carte centrale | [Univers] / [X titres] / [Jouer cet univers] |
| Roue de sélection (9 univers) | Dancehall · Kompa · Zouk · Rap · Trap · Soca · Reggae · Shatta · Mix |
| Marquee | Sonara Sonara Sonara |

---

### 06 / Nouveautés

Section intégrée maintenant, avec du lorem ipsum dans les cartes. Le contenu réel viendra plus tard.

| Emplacement | Texte |
|---|---|
| Méga-titre | Les / nouveautés |
| Gauche | Nouveaux sons. / Nouvelles voix. |
| Label + texte | À l'honneur / Chaque nouveauté met en avant un morceau et son artiste : son histoire, son univers et où l'écouter. |
| Grande phrase (4 lignes) | La musique antillaise / bouge tout le temps. / Sonara aussi : / de nouveaux sons arrivent. |
| Cartes (3) | Catégorie : Nouveau son · Article · Artiste à l'honneur. Titre : « Lorem ipsum dolor sit amet ». Texte : « Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore. » Bouton : Lire |
| Carte en avant | Lorem ipsum dolor / Lorem ipsum · [Univers] / [Lire] |

---

### Le jeu sur tous les écrans (Micro hub)

| Emplacement | Texte |
|---|---|
| Label | En partie |
| Méga-titre | Un jeu, / tous les écrans |
| Mini-player | [Titre] / [Artiste] |

---

### Outro

| Emplacement | Texte |
|---|---|
| Script italique | Mèsi ! |
| Titre Black | An nou / jwé ! |
| CTA | Jouer |

---

## 9. Codes de la landing (référentiel pour tous les écrans du jeu)

État validé au commit `17acf58`. Toute nouvelle page ou tout écran refait reprend ces codes ; rien d'autre.

### 9.1 Règles générales

- Aucun emoji. Aucun « -- » ni « — » dans les textes. « Sonara » en casse normale ; seul le logo est en capitales.
- Aplats uniquement. Seules exceptions : le dégradé du hero (et lui seul), la texture des sillons et le reflet des vinyles.
- Formes rondes partout : pills `999px`, cercles `50%`, cartes `20–24px`, grande carte `40px`, pochettes `16px`.
- Pas de compteur « joueurs en ligne », pas de vert néon, pas de bleu nuit.

### 9.2 Palette et variables CSS

| Variable | Valeur | Usage |
|---|---|---|
| `--accent` | `#C34503` | bouton principal sur fond clair, liens actifs, pastilles numérotées, badge « En direct » |
| `--cream` | `#FDDDB8` | fond crème, texte sur fond sombre, bouton « Jouer » sur fond sombre ou orange |
| `--ink` | `#2D1002` | brun très sombre : fond brun, texte sur crème, pastilles sombres |
| `--neb-orange` | `#E85E16` | orange vif : bouton « Jouer » du header, curseurs, icônes, anneaux |
| `--neb-black` | `#080808` | noir de fond (header fixe, boutons noirs) |
| `--neb-card` | `#111111` | cartes et pastilles sombres (son-nom, satellites) |
| `--neb-ctrl` | `#1F1F1F` | cases de contrôle dans les maquettes |
| `--fond-orange` | `var(--neb-core)` = `#DE5810` | aplat orange de section |
| `--fond-brun` | `var(--ink)` | aplat brun de section (texte blanc ou crème) |
| `--fond-creme` | `var(--cream)` | aplat crème de section (texte `--ink`) |
| `--univers-*` | voir `univers.css` | une couleur pleine par univers (dancehall `#C34503`, soca `#E85E16`, zouk `#A10D01`, reggae `#6B3A0E`, trap `#2D1002`, rap `#5A2318`, mix `#F35524`, kompa `#860100`, shatta `#D3561A`) |

Dégradé du hero (exception) : `--neb-ink #200000`, `--neb-wine #860100`, `--neb-brick #C23401`, `--neb-core #DE5810`, `--neb-hot #F35524`, `--neb-peach #E6C789`, animé lentement sur 12 s, avec grain SVG à 8 % en `soft-light`.

Textes secondaires : sur fond sombre `rgba(255,255,255,.55–.62)` ; sur fond crème `rgba(45,16,2,.55–.82)`.

### 9.3 Typographie

| Rôle | Police | Graisse | Taille (desktop / mobile) | Interligne / approche |
|---|---|---|---|---|
| Titre hero | MuseoModerno | 800 | 5.3vw / 9.2vw | .95 / -.03em |
| Grands titres de section (`.nb-title`) | MuseoModerno | 800 | 3.4–6.4vw / 6.6–13vw | .95 / -.03em |
| Méga-titre (« Écoute. Devine. ») | MuseoModerno | 800 | 11vw / 14vw | .9 / -.04em |
| Titres de carte, footer | MuseoModerno | 800 | 22–30px | 1.05–1.1 / -.02em |
| Grandes phrases et accroches (`.nb-phrase`) | Inter | 300 | 4.5vw (2.2–2.4vw en petit) / 6–7vw | 1.05–1.15 / -.02em |
| Paragraphes (`.nb-body`) | Inter | 400 | 15px | 1.45 |
| Micro-labels « Label / » (`.nb-label`) | Inter | 400 | 14px | |
| Numéro + nom de section (`.nb-secnum`) | Inter | 400 / 500 | 14px | « 01 / » au-dessus du nom |
| Boutons, pastilles | Inter | 600 | 13–15px | |
| Textes dans les maquettes de téléphone | Inter | 600–700 | en fraction de la largeur du téléphone | |

Polices chargées : MuseoModerno 400–900 et Inter 300–900 (Google Fonts). Ne jamais utiliser Syne ni DM Sans.

### 9.4 Composants

- **Bouton principal (`.nb-pill`)** : pill `999px`, Inter 600 15px, `padding:16px 30px`, hauteur 47px. Survol : monte de 2px. Focus : contour blanc 2px décalé de 3px.
  - Sur fond sombre ou orange : crème `--cream`, texte `--ink` (survol blanc).
  - Sur fond crème : orange `--accent`, texte blanc (survol `--ink` + texte crème).
  - Header fixe : `--neb-orange`, texte blanc, `.nb-pill--sm` (`11px 22px`, 14px).
- **Champ de saisie (`.nb-input`)** : pill `999px`, hauteur 52px, `padding:0 22px`, fond `#1a1a1a`, bord `rgba(255,255,255,.14)`, focus bord orange.
- **Pastilles d'étape** : pill `--ink`, texte crème Inter 600 14px, rond numéroté 40px `--accent` chiffre blanc.
- **Pastilles réseaux** : pill `--ink`, icône trait 18px + texte crème 13px ; survol `--accent`.
- **Badge** (« En direct ») : pill `--accent`, texte crème, Inter 600 12px, `6px 12px`.
- **Pastille satellite** (« Créer une salle ») : pill `--neb-card`, texte crème, anneau 40px orange avec « + ».
- **Cartes** : rayon 24px, fond `--neb-card` sur fond sombre ou `#fff6ea` sur fond crème, `padding:16–36px`. Grande carte du footer : crème, rayon 40px.
- **Fenêtre (son-nom)** : carte `--neb-card`, rayon 24px, `max-width:520px`, fond flouté `rgba(8,8,8,.6)` + `blur(10px)`.
- **Header fixe** : 64px (56px mobile), fond `rgba(8,8,8,.72)` + `blur(14px)`, logo à gauche, un seul bouton « Jouer ».
- **Vinyle (`.vy`)** : étiquette-pochette 33 %, trou 2,5 %, sillons fins, reflet fixe, 8 s par tour.
- **Pochettes** : rayon 16px, `object-fit: cover`.

### 9.5 Espacements et grille

- Marge latérale : `--neb-margin` = 4.85vw (16px sur mobile).
- Colonnes repères : 20.4vw, 36vw, 61–67vw.
- Haut de section : 7–11vw ; bas de section : 5–10vw (40–64px sur mobile).
- Écart entre blocs : 3–5vw ; entre pastilles : 6–12px ; entre colonnes : 40px.
- Point de rupture mobile : 760px (767px pour les univers) ; colonnes empilées, satellites masqués.
- `scroll-padding-top` = hauteur du header.

### 9.6 Animations

- Easing commun : `--ease-nb: cubic-bezier(.65,0,.35,1)`.
- Durées : 0.25s (survols), 0.4s (couleurs), 0.5s (changement d'univers), 0.6s (apparitions), 0.9s (dévoilement de pochette), 12s (respiration du hero), 8s par tour de vinyle.
- Décalages en cascade : 70 ms (lettres), 90 ms (étapes).
- Apparitions : opacité 0 → 1 et translation 18–48px.
- Défilement : lissage du téléphone du hero, mots qui s'allument au fil du défilement.
- `prefers-reduced-motion` : tout est affiché directement, aucune animation.
