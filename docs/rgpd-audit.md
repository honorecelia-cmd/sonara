# Audit RGPD de Sonara

Date : 13 octobre 2026. Branche `fix/rgpd`, partie de `main` (0c20813).
Méthode : lecture du code (server.js, store.js, sonara.js, ecran-*.js, pages légales) et vérification dans un navigateur (Chrome) sur la production `sonara-production-e1f0.up.railway.app` : requêtes réseau, cookies, stockage, en-têtes HTTP, URL WebSocket, contenu partagé. Aucun score de test n'a été envoyé au classement (POST /score intercepté). Les essais d'attaque ont été faits uniquement sur un serveur local.

Cet audit décrit l'état **avant** corrections.

## 1. Inventaire des données

| Donnée | Lieu et forme | Durée | Qui y accède | Finalité | Base légale probable |
|---|---|---|---|---|---|
| Son-nom (pseudonyme, 2 à 16 caractères côté navigateur) | Navigateur : `localStorage["sonara-son-nom"]` | Illimitée, jusqu'à effacement par le joueur | Le joueur seul | Préremplir le champ | Exemption de consentement (stockage strictement nécessaire au service demandé, art. 82 loi Informatique et Libertés) |
| Son-nom en multijoueur | Mémoire du serveur (`rooms[code].players[].name`), transmis dans **l'URL WebSocket** (`/ws?code=…&id=…&name=…`) et renvoyé par `/room/info` | Durée de vie de la salle (voir « Salles ») | Joueurs de la salle ; toute personne qui connaît ou devine le code (`/room/info`) ; journaux HTTP de Railway (URL) | Afficher les joueurs | Exécution du service demandé |
| Classement : son-nom, score, univers, date (`name, score, theme, at`) | Disque du serveur : `DATA_DIR/store.json`, tableau `leaderboard` | 12 mois (purge au démarrage et toutes les 24 h, déjà en place). Liste globale de 200 lignes, tous univers confondus | **Public** : `/leaderboard` renvoie les 10 premiers, tous univers ou par univers | Classement | Intérêt légitime |
| Scores multijoueur | Chaque joueur envoie son propre score à `/score` à la fin de la partie | Idem classement | Idem | Idem | Idem |
| Compteur de parties (`stats.gamesPlayed`) | `store.json` | Illimitée | Public (réponse de `/score` et `/leaderboard`) | Statistique | Non personnelle |
| Liens Défi (`customLinks[code] = {theme, themeName, at}`) | `store.json` | **Illimitée, jamais purgés** | Toute personne qui a le lien | Partager un univers | Non personnelle (aucun nom, aucun identifiant) |
| Code de salle (4 caractères parmi 32, environ 1 million de codes) | Mémoire du serveur ; dans le lien d'invitation `/?salle=CODE` ; dans les URL `/room/info?code=` et `/ws?code=` | Salle supprimée 2 h après sa création ou le dernier lancement | Joueurs ; journaux HTTP de Railway | Rejoindre une salle | Exécution du service |
| Identifiant de joueur (`p` + 9 caractères aléatoires, `Math.random`) | Mémoire du serveur ; URL WebSocket ; **renvoyé à tous par `/room/info`** | Durée de la salle | Joueurs, et toute personne qui interroge `/room/info` | Distinguer les joueurs | Exécution du service |
| Identifiant de visite (compteur « en ligne ») | Mémoire (`seen`), dans l'URL `/ping?id=…` toutes les 30 s | 70 s en mémoire ; durée des journaux Railway pour l'URL | Serveur, journaux Railway | Compter les joueurs connectés | Intérêt légitime |
| Adresse IP, user-agent, date et heure, URL demandée | **Pas** dans le code de Sonara. Journaux HTTP de la plateforme Railway (proxy « hikari », point d'entrée `mia1`, Miami, observé dans les en-têtes) | Selon l'offre Railway (à vérifier) | Railway, et vous via le tableau de bord | Sécurité, fonctionnement | Intérêt légitime |
| Réponses tapées pendant la partie | Restent dans le navigateur ; seuls les points partent au serveur (`answer` : points, fin de manche) | Durée de la page | Le joueur | Jeu | Exécution du service |
| Requête Deezer (artiste + titre d'un extrait) | Envoyée **par le serveur** à api.deezer.com via `/deezer` (aucune donnée du joueur) | Aucune | Deezer | Enrichir les extraits | Non personnelle |

Journaux applicatifs (`console.log` / `console.error`) : seulement « SONARA on port … » au démarrage et « [store] echec sauvegarde » en cas d'erreur disque. **Aucun son-nom, aucune adresse IP, aucun code de salle n'est journalisé par Sonara.** Mais un son-nom mal formé fait planter le serveur (voir écart B2) et la pile d'erreur est alors écrite dans les journaux.

Dossier `data/` : contient `store.json` (`customLinks`, `leaderboard`, `stats`). En local il est vide. En production le chemin dépend de `DATA_DIR` (volume Railway). Le classement public ne contient aujourd'hui que 7 lignes, la plus ancienne datée du 8 octobre 2026. Les données semblent donc remises à zéro à chaque déploiement, faute de volume monté : à vérifier (section 8).

## 2. Stockage dans le navigateur (vérifié en production)

| Stockage | Contenu | Finalité | Durée |
|---|---|---|---|
| Cookies | Aucun (ni posé par Sonara, ni par Railway) | sans objet | sans objet |
| localStorage | `sonara-son-nom` = dernier son-nom saisi | Préremplir le champ | Illimitée |
| sessionStorage | Vide | sans objet | sans objet |
| IndexedDB | Aucune base | sans objet | sans objet |
| Cache Storage, service worker | Aucun | sans objet | sans objet |

## 3. Requêtes vers des tiers (vérifié en production)

Landing, partie solo et création de salle : **80 requêtes, toutes vers `sonara-production-e1f0.up.railway.app`**. Polices (Inter, MuseoModerno) déjà auto-hébergées dans `fonts/`. Les extraits audio sont servis par le site (`/audio/…`), sans pochette externe. Il n'y a ni outil de statistiques, ni publicité, ni CDN tiers. Les liens Instagram et TikTok du pied de page sont de simples liens : ils ne déclenchent aucune requête.

## 4. URL, mediaSession, partage

- `navigator.mediaSession` : non utilisé (aucun titre ni artiste exposé à l'écran de verrouillage).
- Lien d'invitation (`navigator.share`, vérifié) : `{title:"Sonara", text:"Rejoins ma partie Sonara : https://…/?salle=CODE", url:"https://…/?salle=CODE"}`. Il contient le code de salle et ne contient pas le son-nom. Le paramètre est retiré de la barre d'adresse dès la lecture.
- Lien Défi : `/fr/custom-CODE` (code à 6 caractères, renvoie un univers).
- Partage du score : texte avec **le son-nom**, le score et le rang, partagé à l'initiative du joueur.
- URL WebSocket : `wss://…/ws?code=CODE&id=ID&name=SON-NOM`. **Le son-nom et le code de salle sont dans l'URL**, donc dans les journaux HTTP de Railway.
- `/room/info?code=CODE` et `/ping?id=ID` : code de salle et identifiant de visite dans l'URL.

## 5. Sécurité

- HTTPS : `http://` est redirigé vers `https://` (301, fait par Railway). WebSocket en `wss://`. **Pas de HSTS.**
- En-têtes de sécurité absents : CSP, X-Content-Type-Options, Referrer-Policy, Permissions-Policy. `Access-Control-Allow-Origin: *` sur toutes les réponses, alors qu'aucun autre site n'a besoin d'appeler l'API.
- Codes de salle : 4 caractères parmi 32 (environ 1 million de codes), tirés avec `Math.random`. Il n'y a aucune limitation des requêtes. Énumérer `/room/info` permet donc de trouver des salles ouvertes, et cette route renvoie les son-noms **et les identifiants de joueur**. Avec l'identifiant de l'hôte, n'importe qui peut se connecter au WebSocket sous son identité et lancer la partie.
- Aucune limitation des requêtes sur `/score`, `/room/create`, `/room/info`, `/custom`, `/deezer`, `/ws`.
- **Le serveur peut être arrêté à distance**. Une seule connexion WebSocket avec un nom mal encodé (`name=%25E0`) lève une exception non rattrapée (`URIError: URI malformed`) et le processus s'arrête. Reproduit en local. Toutes les salles en cours sont perdues.
- Trames WebSocket : aucune taille maximale ; le tampon de réception grandit sans limite. Pas de vérification de l'origine (`Origin`).
- Son-nom côté serveur : `/score` le coupe à 24 caractères, et le WebSocket ne fait **aucun contrôle** (ni longueur, ni caractères). Aucun filtre de son-noms injurieux.
- **Injection HTML (XSS)** dans `renderPstrip` (sonara.js), le bandeau des joueurs pendant la manche. Le son-nom y est inséré **sans échappement** (`<span>'+p.n+'</span>`). Un joueur qui se connecte au WebSocket avec un nom contenant du HTML (par exemple une balise image avec un gestionnaire d'erreur) exécute du code chez tous les autres joueurs de la salle. Par ailleurs, `esc()` (sonara.js) n'échappe pas les guillemets, alors que le résultat est utilisé dans des attributs `data-n`.
- `/deezer` est un proxy ouvert : n'importe qui peut faire chercher le serveur sur Deezer.
- Joueurs déconnectés sans trame de fermeture (onglet fermé sur mobile, réseau coupé) : rien ne traite la fermeture du socket. Le joueur reste dans la salle et la salle vide reste en mémoire jusqu'à 2 h.

## 6. Pages légales : écarts avec le fonctionnement réel

Politique de confidentialité :
- Contact `contact@sonara.com` : adresse à confirmer (le domaine sonara.com n'est pas celui du site).
- « Les liens de partage « Entre proches » ne contiennent que l'univers choisi » : faux. Le lien Entre proches contient le code de salle ; c'est le lien Défi qui ne renvoie qu'à un univers.
- « Identifiant de visite… Il n'est jamais enregistré » : il passe dans l'URL, donc probablement dans les journaux HTTP de Railway.
- Données en multijoueur : la politique ne dit pas que le son-nom et l'identifiant de joueur sont lisibles par toute personne qui connaît le code.
- Classement : la politique ne dit pas que le score est enregistré automatiquement. Il n'existe aucun moyen de refuser l'enregistrement, ni de supprimer ses scores sans écrire.
- « hébergé aux États-Unis » : la région de déploiement réelle n'est pas confirmée (le point d'entrée observé est Miami ; Railway propose une région européenne).
- « Journaux de l'hébergeur : 30 jours au maximum » : à vérifier selon l'offre Railway.
- Le texte parle de liens Défi sans mentionner leur conservation (aujourd'hui illimitée).

Mentions légales : éditeur, SIRET, adresse, téléphone et adresse de l'hébergeur sont présents. Il manque **le téléphone de l'hébergeur** (exigé par la LCEN, article 6). Le contact `contact@sonara.com` est à confirmer.

## 7. Écarts classés

### Bloquant
1. **B1. Injection HTML par le son-nom** dans le bandeau des joueurs (XSS stockée dans la salle) ; `esc()` sans guillemets.
2. **B2. Arrêt du serveur à distance** par un nom mal encodé dans l'URL WebSocket.
3. **B3. Son-noms et identifiants de joueur publics** via `/room/info` sans limitation ; usurpation de l'hôte possible avec l'identifiant.
4. **B4. Aucun moyen d'effacer ses scores** sans écrire à une adresse non vérifiée ; aucun moyen de ne pas apparaître dans le classement public.
5. **B5. Politique de confidentialité inexacte** (liens Entre proches, identifiant de visite, contact).

### Important
1. **I1.** Classement : 200 lignes conservées tous univers confondus, alors que 10 par univers suffisent à l'affichage.
2. **I2.** Son-nom et code de salle dans les URL (WebSocket, `/room/info`) donc dans les journaux HTTP de Railway.
3. **I3.** Aucune limitation des requêtes ; codes de salle à 4 caractères énumérables.
4. **I4.** Aucun en-tête de sécurité (HSTS, CSP, nosniff, Referrer-Policy, Permissions-Policy) ; CORS ouvert à tous.
5. **I5.** Aucun contrôle du son-nom côté serveur (longueur, caractères, injures).
6. **I6.** Joueurs fantômes et salles vides gardés jusqu'à 2 h (socket fermé non traité).
7. **I7.** Trames WebSocket sans taille maximale, origine non vérifiée.

### Amélioration
1. **A1.** Liens Défi jamais purgés (données non personnelles, mais conservation illimitée).
2. **A2.** `/deezer` utilisable comme proxy par des tiers.
3. **A3.** `url.parse()` déprécié (avertissement de sécurité de Node).
4. **A4.** Mentions légales : téléphone de l'hébergeur manquant.

## 8. À vérifier par vous dans le tableau de bord Railway

1. **Région de déploiement** du service (Settings > Deploy > Region). Si c'est une région américaine, passer en région européenne (Amsterdam, `europe-west4`) supprime le transfert hors UE pour les données du jeu.
2. **Conservation des journaux** selon votre offre (Hobby, Pro), et le contenu des **HTTP Logs** : Railway y enregistre, entre autres, l'URL, l'adresse IP du client et le user-agent. Vérifiez la durée exacte et qui a accès au projet (membres de l'équipe).
3. **Volume** : existe-t-il un volume monté, et la variable `DATA_DIR` pointe-t-elle dessus ? Sans volume, le classement repart de zéro à chaque déploiement. C'est plus minimal, mais la politique annonce 12 mois.
4. **Sauvegardes du volume** (si activées) : leur durée de conservation prolonge celle des scores.
5. **DPA Railway** accepté (railway.com/legal/dpa) et liste des sous-traitants ultérieurs de Railway.
6. Membres du projet Railway et double authentification sur le compte.
