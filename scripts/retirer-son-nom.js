#!/usr/bin/env node
'use strict';
// Administration du classement, en ligne de commande seulement (aucune route publique).
//
//   node scripts/retirer-son-nom.js --lister           liste le classement (son-nom, score, univers, date)
//   node scripts/retirer-son-nom.js "Son-nom"          retire ce son-nom (majuscules et espaces ignores)
//
// Sur Railway : `railway ssh` dans le service, puis la commande ci-dessus.
// Le retrait est depose dans DATA_DIR/retraits.json ; le serveur l'applique dans
// les 5 secondes (ou a son prochain demarrage), enregistre, puis supprime le fichier.
const fs = require('fs');
const path = require('path');
const moderation = require('../moderation');

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
const STORE = path.join(DATA_DIR, 'store.json');
const RETRAITS = path.join(DATA_DIR, 'retraits.json');
const norm = function (n) { return moderation.nettoie(n).toLocaleLowerCase('fr'); };

function lire() {
  try { return JSON.parse(fs.readFileSync(STORE, 'utf8')).leaderboard || []; } catch (e) { return []; }
}

const arg = process.argv.slice(2).join(' ').trim();
if (!arg) {
  console.log('Usage : node scripts/retirer-son-nom.js --lister | "Son-nom"');
  process.exit(1);
}
if (arg === '--lister') {
  const list = lire();
  if (!list.length) { console.log('Classement vide (' + STORE + ').'); process.exit(0); }
  list.slice().sort(function (a, b) { return a.theme.localeCompare(b.theme) || b.score - a.score; }).forEach(function (e) {
    console.log([e.theme, e.score, e.name, new Date(e.at).toISOString().slice(0, 10)].join('\t'));
  });
  process.exit(0);
}

const cible = norm(arg);
const trouves = lire().filter(function (e) { return norm(e.name) === cible; });
let file = [];
try { file = JSON.parse(fs.readFileSync(RETRAITS, 'utf8')); } catch (e) {}
if (!Array.isArray(file)) file = [];
if (file.map(norm).indexOf(cible) < 0) file.push(arg);
fs.mkdirSync(DATA_DIR, { recursive: true });
fs.writeFileSync(RETRAITS + '.tmp', JSON.stringify(file));
fs.renameSync(RETRAITS + '.tmp', RETRAITS);
console.log(trouves.length + ' score(s) au nom de « ' + moderation.nettoie(arg) + ' » dans le dernier enregistrement.');
console.log('Retrait transmis au serveur : il sera applique dans les 5 secondes (ou au prochain demarrage).');
