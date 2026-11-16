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
  if (!/<script\s+src=["']\/?sonara\.js["']/.test(html)) fail('sonara.html : <script src="sonara.js"> manquant');
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

// 3 bis. Pages : balises de partage et de referencement, page 404
['sonara.html', 'mentions-legales.html', 'politique-confidentialite.html'].forEach((f) => {
  try {
    const h = fs.readFileSync(path.join(ROOT, f), 'utf8');
    const manque = ['name="description"', 'rel="canonical"', 'property="og:title"', 'property="og:description"', 'property="og:image"',
      'property="og:url"', 'property="og:type"', 'property="og:locale"', 'name="twitter:card"'].filter((b) => h.indexOf(b) < 0);
    if (manque.length) fail(f + ' : balise(s) manquante(s) ' + manque.join(', '));
    const img = /property="og:image" content="https:\/\/[^/]+\/img\/([^"]+)"/.exec(h);
    if (img && !fs.existsSync(path.join(ROOT, 'img', img[1]))) fail(f + ' : image de partage absente /img/' + img[1]);
  } catch (e) { fail(f + ' illisible : ' + e.message); }
});
if (!fs.existsSync(path.join(ROOT, '404.html'))) fail('404.html manquant');
ok('balises de partage et page 404 verifiees');

// 4. Pochettes des univers (tableau UNIVERS, univers.js) : WebP et repli JPG
try {
  const uv = fs.readFileSync(path.join(ROOT, 'univers.js'), 'utf8');
  const re = /image:'\/img\/([^']+\.webp)'/g;
  let m, n = 0, missing = 0;
  while ((m = re.exec(uv))) {
    n++;
    const small = m[1].replace(/^pochettes\//, 'pochettes/400/');   // version 400px des vinyles
    [m[1], m[1].replace(/\.webp$/, '.jpg'), small, small.replace(/\.webp$/, '.jpg')].forEach((f) => {
      if (!fs.existsSync(path.join(ROOT, 'img', f))) { fail('pochette manquante : /img/' + f); missing++; }
    });
  }
  if (!n) fail('univers.js : aucune pochette trouvee dans UNIVERS');
  else if (!missing) ok(n + ' pochettes d\'univers, WebP et JPG presents, en 1200 et 400px');
  // Univers sans pochette (image:null, placeholder) : chemin attendu
  // /img/pochettes/<slug>.webp et son .jpg
  const reNull = /slug:'([a-z-]+)'[^\n]*image:null/g;
  while ((m = reNull.exec(uv))) {
    const w = 'pochettes/' + m[1] + '.webp', j = 'pochettes/' + m[1] + '.jpg';
    const hasW = fs.existsSync(path.join(ROOT, 'img', w)), hasJ = fs.existsSync(path.join(ROOT, 'img', j));
    if (hasW && hasJ) console.log('  ! ' + m[1] + ' : pochette deposee, remplacer image:null par image:\'/img/' + w + '\' (univers.js)');
    else if (hasW || hasJ) fail(m[1] + ' : pochette incomplete, il faut /img/' + w + ' et /img/' + j);
    else console.log('  ! ' + m[1] + ' : pochette a venir (placeholder), deposer /img/' + w + ' et /img/' + j);
  }
} catch (e) { fail('verif pochettes impossible : ' + e.message); }

// 5. Univers : chaque univers de UNIVERS (univers.js) a sa liste de morceaux
// dans THEMES (sonara.js), une pastille en solo et en salle (sonara.html)
const uvSrc = (() => { try { return fs.readFileSync(path.join(ROOT, 'univers.js'), 'utf8'); } catch (e) { return ''; } })();
const jsSrc = (() => { try { return fs.readFileSync(path.join(ROOT, 'sonara.js'), 'utf8'); } catch (e) { return ''; } })();
try {
  const slugs = [...uvSrc.matchAll(/slug:'([a-z-]+)'/g)].map((m) => m[1]);
  const themes = [...jsSrc.matchAll(/^ {2}'([a-z-]+)':\s*\{n:/gm)].map((m) => m[1]);
  let bad = 0;
  slugs.forEach((s) => {
    if (!themes.includes(s)) { fail('univers ' + s + ' : absent de THEMES (sonara.js)'); bad++; }
    ['soloTheme', 'multiTheme'].forEach((on) => {
      if (!html.includes('data-on="' + on + '" data-arg="' + s + '"')) { fail('univers ' + s + ' : pastille ' + on + ' absente de sonara.html'); bad++; }
    });
  });
  themes.forEach((t) => { if (!slugs.includes(t)) { fail('THEMES ' + t + ' : absent de UNIVERS (univers.js)'); bad++; } });
  if (!bad) ok(slugs.length + ' univers declares partout (UNIVERS, THEMES, choix solo et salle)');
} catch (e) { fail('verif univers impossible : ' + e.message); }

// 6. Extraits audio : chaque morceau de THEMES a son fichier dans audio/
// (non vide), par univers ; aucun fichier de audio/ hors des listes.
// ORPHELINS_CONNUS : fichiers deja presents hors des listes au moment de
// l'ajout de ce controle (signales, non bloquants). Tout autre orphelin bloque.
const ORPHELINS_CONNUS = [
  'Alex_Catherine-Lona.mp3', 'Arly_Lariviere-Cauchemar.mp3', 'Arly_Lariviere-Is_it_real.mp3',
  'Arly_Lariviere-Why_do_you_say.mp3', 'Bedjine-Tout_va_bien.mp3', 'Blade-Sa_tro_evidan.mp3',
  'Bruce_Little-SKLM.mp3', 'Criminal-Le_Will_Deuspi.mp3', 'Don_Snoop-Superhero.mp3',
  'Evil_Pichon-Dont_like_remix.mp3', 'Evil_Pichon-Evil_anthem.mp3', 'Fanny_J-Laisse_moi_du_temps.mp3',
  'Gambi_G-Sans_commentaire.mp3', 'Gifta-Lock_me_up.mp3', 'Jah_Cure-Never_find.mp3',
  'Joe_Dwet_File-4_kampe.mp3', 'Kalash-Lambis.mp3', 'Kalash-Nefertiti.mp3', 'Kalash-So_coman.mp3',
  'Kalash_ft_Booba-Rouge_et_bleu.mp3', 'Latop-Barillet.mp3', 'Lyrrix_ft_Pon2mik-Zeb_la_i_fo.mp3',
  'Masicka-They_dont_know.mp3', 'Meryl-Beni.mp3', 'Meryl-Coucou.mp3', 'Nu_Look-Confessions.mp3',
  'TKD-Pilule.mp3', 'Tarrus_Riley-Shes_royal.mp3', 'Tiitof-Toujours_dans_le_bloc.mp3',
  'Tkimp_Gee-Manman_di_mwen.mp3', 'Tkimp_Gee-Reussir_ou_mourir.mp3',
  'Tkimp_Gee_ft_Walton-Pa_pe_ban_mwen.mp3', 'Vybz_Kartel-Bend_like_banana.mp3'
];
try {
  const dir = path.join(ROOT, 'audio');
  const files = new Set(fs.readdirSync(dir).filter((f) => !f.startsWith('.')));
  const refs = new Set();
  const re = /^ {2}'([a-z-]+)':\s*\{n:[^\n]*tracks:\[([\s\S]*?)\n {2}\]\}/gm;
  let m;
  while ((m = re.exec(jsSrc))) {
    const list = [...m[2].matchAll(/preview:'\/audio\/([^']+)'/g)].map((x) => x[1]);
    let missing = 0;
    list.forEach((f) => {
      refs.add(f);
      const p = path.join(dir, f);
      if (!fs.existsSync(p)) { fail(m[1] + ' : extrait manquant audio/' + f); missing++; }
      else if (fs.statSync(p).size < 50000) { fail(m[1] + ' : extrait vide ou tronque audio/' + f); missing++; }
    });
    if (!missing) ok(m[1] + ' : ' + list.length + ' extraits presents');
  }
  const orph = [...files].filter((f) => !refs.has(f));
  const nouveaux = orph.filter((f) => !ORPHELINS_CONNUS.includes(f));
  nouveaux.forEach((f) => fail('fichier orphelin (dans aucune liste de THEMES) : audio/' + f));
  const connus = orph.length - nouveaux.length;
  if (connus) console.log('  ! ' + connus + ' orphelins connus dans audio/ (ORPHELINS_CONNUS, non bloquants)');
  if (!nouveaux.length) ok('aucun nouvel orphelin dans audio/');
} catch (e) { fail('verif audio impossible : ' + e.message); }

if (errors) {
  console.error('\nDEPLOIEMENT BLOQUE : ' + errors + ' probleme(s) front a corriger.\n');
  process.exit(1);
}
console.log('\nOK front.\n');
