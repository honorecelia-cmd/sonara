#!/usr/bin/env node
// Garde-fou de deploiement : bloque le build si un fichier front est casse
// (evite le "site blanc"). Lance : npm run check
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
let errors = 0;
const fail = (m) => { console.error('  ✗ ' + m); errors++; };
const ok = (m) => console.log('  ✓ ' + m);

// 1. sonara.html : present, non vide, structure minimale
const htmlPath = path.join(ROOT, 'sonara.html');
let html = '';
try {
  html = fs.readFileSync(htmlPath, 'utf8');
  if (html.length < 500) fail('sonara.html trop court (' + html.length + ' octets)');
  else ok('sonara.html present (' + html.length + ' octets)');
  if (!/<script\s+src=["']sonara\.js["']/.test(html)) fail('sonara.html : <script src="sonara.js"> manquant');
  else ok('sonara.html reference sonara.js');
  if (!/<\/html>\s*$/.test(html)) fail('sonara.html : </html> final manquant (fichier tronque ?)');
  else ok('sonara.html se termine par </html>');
  const openS = (html.match(/<section\b/g) || []).length;
  const closeS = (html.match(/<\/section>/g) || []).length;
  if (openS !== closeS) fail('sonara.html : ' + openS + ' <section> pour ' + closeS + ' </section>');
  else ok('sonara.html : <section> equilibres (' + openS + ')');
} catch (e) { fail('sonara.html illisible : ' + e.message); }

// 2. sonara.css : accolades equilibrees
try {
  const css = fs.readFileSync(path.join(ROOT, 'sonara.css'), 'utf8');
  let depth = 0, line = 1, neg = 0;
  for (const ch of css) {
    if (ch === '\n') line++;
    else if (ch === '{') depth++;
    else if (ch === '}') { depth--; if (depth < 0 && neg === 0) { neg = line; } }
  }
  if (depth !== 0) fail('sonara.css : accolades desequilibrees (solde ' + depth + ')');
  else if (neg) fail('sonara.css : } en trop vers la ligne ' + neg);
  else ok('sonara.css : accolades equilibrees');
} catch (e) { fail('sonara.css illisible : ' + e.message); }

// 3. Images referencees dans le HTML : les fichiers locaux existent
try {
  const refs = new Set();
  const re = /["'(]\/img\/([^"')?#]+)/g;
  let m;
  while ((m = re.exec(html))) refs.add(decodeURIComponent(m[1]));
  let missing = 0;
  refs.forEach((f) => {
    if (!fs.existsSync(path.join(ROOT, 'img', f))) { fail('image manquante : /img/' + f); missing++; }
  });
  if (!missing) ok(refs.size + ' images /img/ referencees, toutes presentes');
} catch (e) { fail('verif images impossible : ' + e.message); }

if (errors) {
  console.error('\nDEPLOIEMENT BLOQUE : ' + errors + ' probleme(s) front a corriger.\n');
  process.exit(1);
}
console.log('\nOK front.\n');
