'use strict';
// Son-noms : forme autorisee et filtre des termes injurieux, haineux ou sexuels
// (francais, creole, anglais). Tolere les variantes d'ecriture : accents,
// majuscules, chiffres a la place des lettres (s4l0pe), separateurs (s.a.l.o.p.e),
// lettres repetees (saaalope).
// Deux listes : PARTOUT (termes assez longs et sans sens innocent, cherches dans
// tout le son-nom, separateurs retires) et MOT (termes courts ou ambigus, refuses
// seulement comme mot entier : « con » refuse, « Konpa » ou « Conga » acceptes).

const MIN = 2, MAX = 16;
// Lettres de toutes les langues, chiffres, espace, apostrophes, tiret, point, souligne
const FORME = /^[\p{L}\p{M}\p{N} '’\-._]+$/u;

const PARTOUT = [
  // francais
  'connard', 'connasse', 'conasse', 'salope', 'salaud', 'encule', 'enfoire', 'batard',
  'putain', 'petasse', 'pouffiasse', 'poufiasse', 'filsdepute', 'niquetamere', 'tagueule',
  'merde', 'couille', 'branleur', 'branlette', 'suceuse', 'suceur', 'tapette', 'tarlouze',
  'gouine', 'negre', 'negresse', 'bougnoule', 'youpin', 'violeur', 'pedophile', 'pedophilie',
  'porno', 'nichon', 'ducon', 'trouduc', 'bamboula',
  // creole (Martinique, Guadeloupe, Haiti)
  'makoume', 'masisi', 'bouzen', 'bouzin', 'koukoun', 'kolanget', 'langetmanman',
  'kouyonmanman', 'tjoumanman', 'tchoumanman',
  // anglais
  'fuck', 'motherfuck', 'shit', 'bitch', 'whore', 'slut', 'pussy', 'asshole', 'bastard',
  'nigger', 'nigga', 'faggot', 'rapist', 'porn', 'dildo', 'blowjob', 'handjob', 'hitler',
  'pedophile'
];
const MOT = [
  // francais
  'con', 'conne', 'cons', 'pute', 'putes', 'pd', 'pede', 'pedo', 'fdp', 'ntm', 'tg', 'nique',
  'niquer', 'chier', 'bite', 'cul', 'chatte', 'suce', 'sucer', 'foutre', 'teub', 'zob',
  'chibre', 'viol', 'violer', 'sexe', 'nazi', 'nazis', 'retard',
  // creole
  'zozo', 'tjou', 'tchou', 'kaka', 'langet',
  // anglais
  'cunt', 'dick', 'cock', 'fag', 'fags', 'rape', 'sex', 'tits', 'cum', 'penis', 'vagina',
  'boobs', 'kkk', 'nsfw', 'xxx'
];

const LEET = { '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't', '8': 'b', '@': 'a', '$': 's', '€': 'e', '!': 'i', '|': 'i' };
function sansAccents(s) { return s.normalize('NFD').replace(/[̀-ͯ]/g, ''); }
function leet(s) { return s.replace(/[0134578@$€!|]/g, function (c) { return LEET[c]; }); }
function serre(s) { return s.replace(/(.)\1+/g, '$1'); }   // saaalope -> salope
// Forme comparable : minuscules sans accents, chiffres-lettres convertis, a-z seulement
function plat(s) { return leet(sansAccents(String(s).toLowerCase())).replace(/[^a-z]/g, ''); }

const PARTOUT_S = PARTOUT.map(plat).concat(PARTOUT.map(function (t) { return serre(plat(t)); }));
const MOT_SET = new Set(MOT.map(plat).concat(MOT.map(function (t) { return serre(plat(t)); })));

// Espaces en trop, caracteres de controle retires (meme regle que le navigateur)
function nettoie(v) {
  return String(v == null ? '' : v).normalize('NFC').replace(/[\u0000-\u001F\u007F-\u009F]/g, '').replace(/\s+/g, ' ').trim();
}

function injurieux(nom) {
  const tout = plat(nom), formes = [tout, serre(tout)];
  if (formes.some(function (f) { return PARTOUT_S.some(function (t) { return f.indexOf(t) >= 0; }); })) return true;
  // Mots entiers (separateurs internes retires : « p.d » -> « pd »), et le son-nom entier
  const mots = sansAccents(String(nom).toLowerCase()).split(/[\s\-_]+/).map(function (m) { return plat(m); }).filter(Boolean);
  mots.push(tout);
  return mots.some(function (m) { return MOT_SET.has(m) || MOT_SET.has(serre(m)); });
}

// { ok, nom } ou { ok:false, raison:'longueur'|'caracteres'|'refuse' }
function verifie(v) {
  const nom = nettoie(v), n = Array.from(nom).length;
  if (n < MIN || n > MAX) return { ok: false, raison: 'longueur' };
  if (!FORME.test(nom)) return { ok: false, raison: 'caracteres' };
  if (injurieux(nom)) return { ok: false, raison: 'refuse' };
  return { ok: true, nom: nom };
}

module.exports = { verifie: verifie, nettoie: nettoie, injurieux: injurieux, MIN: MIN, MAX: MAX };
