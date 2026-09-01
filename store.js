'use strict';
// Petite persistance fichier-JSON (sans dependance).
// Sur Railway : monter un Volume et definir DATA_DIR=/data pour que ça survive
// aux redeploiements. Sans volume, ça marche mais se remet a zero a chaque deploy.
const fs = require('fs');
const path = require('path');

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const FILE = path.join(DATA_DIR, 'store.json');
const DEFAULT = { customLinks: {}, leaderboard: [], stats: { gamesPlayed: 0 } };

let data;
try {
  data = Object.assign({}, JSON.parse(JSON.stringify(DEFAULT)), JSON.parse(fs.readFileSync(FILE, 'utf8')));
} catch (e) {
  data = JSON.parse(JSON.stringify(DEFAULT));
}

let timer = null;
function save() {
  if (timer) return;
  timer = setTimeout(function () {
    timer = null;
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
      fs.writeFileSync(FILE + '.tmp', JSON.stringify(data));
      fs.renameSync(FILE + '.tmp', FILE);
    } catch (e) {
      console.error('[store] echec sauvegarde:', e.message);
    }
  }, 400);
}

module.exports = { data: data, save: save, DATA_DIR: DATA_DIR };
