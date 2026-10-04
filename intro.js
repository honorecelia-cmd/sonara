/* ═══════════════════════════════════════════════════════════════
   SONARA — intro pilotée au défilement
   Mécanique reprise à l'identique du prototype sonara-scroll-intro.html :
   - une seule fonction pure seek(p), p de 0 à 1
   - aucune transition CSS, aucun setTimeout, aucun état entre deux images
   - 54 temps (120 BPM), impulsion exp(-frac*5) a chaque temps
   - meme sequence de scenes, memes keyframes de forme/curseur
   Seul change ici : contenu (9 vrais univers, vrai logo, vraies pochettes,
   copy reelle) et couleurs (tokens SONARA, zero degrade invente, zero
   couleur par univers).
   Chargé uniquement sur la landing (voir sonara.html).
   ═══════════════════════════════════════════════════════════════ */
(function(){
'use strict';

var track = document.getElementById('intro-track');
if(!track) return; // intro absente de cette page -> rien a faire

var BEATS = 54;

// Les 9 univers reels (ordre = grille #s-solo). Le centre du bento (index 4)
// est celui qui s'ouvre en salon -> on y place Dancehall, qui a une vraie
// pochette et sert de demo pour la question/reponse.
var UNIVERS = [
  {k:'kompa',     n:'Kompa',      cover:'/img/cover_kompa.jpg'},
  {k:'zouk',      n:'Zouk',       cover:'/img/cover_zouk.jpg'},
  {k:'reggae',    n:'Reggae',     cover:'/img/cover_reggae.jpg'},
  {k:'soca',      n:'Soca',       cover:'/img/cover_soca.jpg'},
  {k:'dancehall', n:'Dancehall',  cover:'/img/cover_dancehall.jpg'}, // centre
  {k:'rap',       n:'Rap',        cover:'/img/cover_rap.jpg'},
  {k:'mix',       n:'Mix',        cover:null}, // pas encore de pochette (droits)
  {k:'shatta',    n:'Shatta',     cover:null},
  {k:'trap',      n:'Trap',       cover:null}
];
var CENTER_I = 4; // Dancehall
var PLAYERS = ['L','M','C','T']; // initiales neutres, pas de couleur par joueur
var ARTIST = 'Vybz Kartel';
var TITLE = 'God & Time';
var ANSWER = TITLE;

var $ = function(id){ return document.getElementById(id); };
var clamp = function(x,a,b){ a=a===undefined?0:a; b=b===undefined?1:b; return Math.min(b,Math.max(a,x)); };
var win = function(p,a,b){ return clamp((p-a)/(b-a)); };
var lerp = function(a,b,t){ return a+(b-a)*t; };
var eio = function(t){ return t<.5 ? 4*t*t*t : 1-Math.pow(-2*t+2,3)/2; };
var eob = function(t){ var c=1.9,k=c+1; return 1+k*Math.pow(t-1,3)+c*Math.pow(t-1,2); }; // ressort leger (overshoot)
var hex = function(h){ return [1,3,5].map(function(i){ return parseInt(h.slice(i,i+2),16); }); };
var mix = function(a,b,t){
  var A=hex(a), B=hex(b);
  return '#'+A.map(function(v,i){ return Math.round(lerp(v,B[i],t)).toString(16).padStart(2,'0'); }).join('');
};

// Tokens SONARA (doivent rester synchro avec sonara.css :root)
var C_SHAPE = '#140a06';  // --shape-ink
var C_ACCENT = '#C34503'; // --accent
var C_CREAM = '#fdddb8';  // --cream
var C_INK = '#2d1002';    // --ink
// Note : le logo (#i-logo) est blanc #ffffff en dur (fill natif du SVG
// source 5.svg, reutilise verbatim) -- pas C_CREAM. Voir plus bas.

var W,H,U;
function size(){ W=innerWidth; H=innerHeight; U=Math.min(W,H)/100; }
function X(x){ return W/2+(x-50)*U; }
function Y(y){ return H/2+(y-50)*U; }

/* ---------- construction du DOM ---------- */
var logoEl = $('i-logo');
// Logo vectoriel reel (geometrie extraite des masques de lettres du fichier
// source -- voir notes de livraison -- remplissage plein, aucun degrade).
// Integre en dur et de façon SYNCHRONE (pas de fetch) : le repli du
// logotype mesure sa largeur reelle des la toute premiere image (p=0),
// un chargement asynchrone creerait un saut visuel au moment ou le SVG
// arriverait. Geometrie identique a /img/logo_sonara.svg.
// viewBox recadre sur la vraie bbox des 6 lettres (338,452 -> 822x592),
// pas le canvas source 1500x1500 (qui laisse un vide enorme autour) --
// indispensable pour que le bord droit du <img>/svg coincide avec le bord
// droit reel du texte, sinon le point d'ancrage du repli serait decale.
logoEl.innerHTML =
  '<svg viewBox="345.68 459.83 805.16 574.05" preserveAspectRatio="xMidYMid meet">' +
  '<defs><g/><clipPath id="a0a679156e"><rect x="0" width="807" y="0" height="613"/></clipPath></defs><g fill="#ffffff" fill-opacity="1"><g transform="translate(331.831675, 734.109637)"><g><path d="M 25 0 L 25 -53.859375 L 140.03125 -53.859375 C 145.15625 -53.859375 149.769531 -55.140625 153.875 -57.703125 C 157.976562 -60.265625 161.25 -63.597656 163.6875 -67.703125 C 166.125 -71.804688 167.34375 -76.296875 167.34375 -81.171875 C 167.34375 -86.296875 166.125 -90.910156 163.6875 -95.015625 C 161.25 -99.117188 157.976562 -102.453125 153.875 -105.015625 C 149.769531 -107.578125 145.15625 -108.859375 140.03125 -108.859375 L 98.484375 -108.859375 C 82.835938 -108.859375 68.601562 -111.9375 55.78125 -118.09375 C 42.957031 -124.25 32.757812 -133.289062 25.1875 -145.21875 C 17.625 -157.144531 13.84375 -171.441406 13.84375 -188.109375 C 13.84375 -204.523438 17.429688 -218.757812 24.609375 -230.8125 C 31.796875 -242.863281 41.546875 -252.285156 53.859375 -259.078125 C 66.171875 -265.878906 79.765625 -269.28125 94.640625 -269.28125 L 213.5 -269.28125 L 213.5 -215.421875 L 101.9375 -215.421875 C 97.320312 -215.421875 93.09375 -214.265625 89.25 -211.953125 C 85.40625 -209.648438 82.457031 -206.570312 80.40625 -202.71875 C 78.351562 -198.875 77.328125 -194.644531 77.328125 -190.03125 C 77.328125 -185.414062 78.351562 -181.25 80.40625 -177.53125 C 82.457031 -173.8125 85.40625 -170.796875 89.25 -168.484375 C 93.09375 -166.179688 97.320312 -165.03125 101.9375 -165.03125 L 145.40625 -165.03125 C 162.59375 -165.03125 177.53125 -161.757812 190.21875 -155.21875 C 202.914062 -148.675781 212.789062 -139.570312 219.84375 -127.90625 C 226.894531 -116.238281 230.421875 -102.582031 230.421875 -86.9375 C 230.421875 -68.46875 226.765625 -52.757812 219.453125 -39.8125 C 212.148438 -26.863281 202.34375 -16.988281 190.03125 -10.1875 C 177.726562 -3.394531 164.140625 0 149.265625 0 Z M 25 0 "/></g></g></g><g fill="#ffffff" fill-opacity="1"><g transform="translate(558.028663, 734.109637)"><g><path d="M 153.875 5 C 132.332031 5 112.84375 1.410156 95.40625 -5.765625 C 77.96875 -12.953125 62.960938 -22.957031 50.390625 -35.78125 C 37.828125 -48.601562 28.144531 -63.472656 21.34375 -80.390625 C 14.550781 -97.316406 11.15625 -115.53125 11.15625 -135.03125 C 11.15625 -154.519531 14.550781 -172.726562 21.34375 -189.65625 C 28.144531 -206.582031 37.765625 -221.390625 50.203125 -234.078125 C 62.640625 -246.773438 77.640625 -256.648438 95.203125 -263.703125 C 112.773438 -270.753906 132.332031 -274.28125 153.875 -274.28125 C 175.15625 -274.28125 194.578125 -270.753906 212.140625 -263.703125 C 229.710938 -256.648438 244.71875 -246.773438 257.15625 -234.078125 C 269.601562 -221.390625 279.285156 -206.515625 286.203125 -189.453125 C 293.128906 -172.398438 296.59375 -154.257812 296.59375 -135.03125 C 296.59375 -115.53125 293.128906 -97.316406 286.203125 -80.390625 C 279.285156 -63.472656 269.601562 -48.601562 257.15625 -35.78125 C 244.71875 -22.957031 229.710938 -12.953125 212.140625 -5.765625 C 194.578125 1.410156 175.15625 5 153.875 5 Z M 153.875 -50.015625 C 165.15625 -50.015625 175.601562 -52.128906 185.21875 -56.359375 C 194.84375 -60.585938 203.113281 -66.546875 210.03125 -74.234375 C 216.957031 -81.929688 222.34375 -90.972656 226.1875 -101.359375 C 230.039062 -111.742188 231.96875 -122.96875 231.96875 -135.03125 C 231.96875 -147.082031 230.039062 -158.234375 226.1875 -168.484375 C 222.34375 -178.742188 216.957031 -187.722656 210.03125 -195.421875 C 203.113281 -203.117188 194.84375 -209.082031 185.21875 -213.3125 C 175.601562 -217.539062 165.15625 -219.65625 153.875 -219.65625 C 142.332031 -219.65625 131.816406 -217.539062 122.328125 -213.3125 C 112.835938 -209.082031 104.566406 -203.117188 97.515625 -195.421875 C 90.460938 -187.722656 85.078125 -178.679688 81.359375 -168.296875 C 77.640625 -157.910156 75.78125 -146.820312 75.78125 -135.03125 C 75.78125 -122.96875 77.640625 -111.742188 81.359375 -101.359375 C 85.078125 -90.972656 90.460938 -81.929688 97.515625 -74.234375 C 104.566406 -66.546875 112.835938 -60.585938 122.328125 -56.359375 C 131.816406 -52.128906 142.332031 -50.015625 153.875 -50.015625 Z M 153.875 -50.015625 "/></g></g></g><g fill="#ffffff" fill-opacity="1"><g transform="translate(848.853498, 734.109637)"><g><path d="M 213.109375 4.609375 C 196.953125 4.609375 182.460938 1.082031 169.640625 -5.96875 C 156.816406 -13.019531 146.6875 -22.828125 139.25 -35.390625 C 131.8125 -47.953125 128.09375 -62.1875 128.09375 -78.09375 L 128.09375 -195.8125 C 128.09375 -199.90625 127.066406 -203.617188 125.015625 -206.953125 C 122.972656 -210.296875 120.28125 -212.992188 116.9375 -215.046875 C 113.601562 -217.097656 109.882812 -218.125 105.78125 -218.125 C 101.6875 -218.125 97.96875 -217.097656 94.625 -215.046875 C 91.289062 -212.992188 88.660156 -210.296875 86.734375 -206.953125 C 84.816406 -203.617188 83.859375 -199.90625 83.859375 -195.8125 L 83.859375 0 L 20.765625 0 L 20.765625 -191.1875 C 20.765625 -207.34375 24.421875 -221.578125 31.734375 -233.890625 C 39.046875 -246.203125 49.175781 -255.945312 62.125 -263.125 C 75.070312 -270.300781 89.625 -273.890625 105.78125 -273.890625 C 122.195312 -273.890625 136.816406 -270.300781 149.640625 -263.125 C 162.460938 -255.945312 172.59375 -246.203125 180.03125 -233.890625 C 187.46875 -221.578125 191.1875 -207.34375 191.1875 -191.1875 L 191.1875 -73.46875 C 191.1875 -69.363281 192.210938 -65.582031 194.265625 -62.125 C 196.316406 -58.664062 198.945312 -55.972656 202.15625 -54.046875 C 205.363281 -52.117188 208.890625 -51.15625 212.734375 -51.15625 C 216.835938 -51.15625 220.617188 -52.117188 224.078125 -54.046875 C 227.546875 -55.972656 230.300781 -58.664062 232.34375 -62.125 C 234.394531 -65.582031 235.421875 -69.363281 235.421875 -73.46875 L 235.421875 -269.28125 L 298.125 -269.28125 L 298.125 -78.09375 C 298.125 -62.1875 294.40625 -47.953125 286.96875 -35.390625 C 279.539062 -22.828125 269.414062 -13.019531 256.59375 -5.96875 C 243.769531 1.082031 229.273438 4.609375 213.109375 4.609375 Z M 213.109375 4.609375 "/></g></g></g><g transform="matrix(1, 0, 0, 1, 348, 593)"><g clip-path="url(#a0a679156e)"><g fill="#ffffff" fill-opacity="1"><g transform="translate(1.143697, 440.877177)"><g><path d="M 0 0 L 87.328125 -238.125 C 91.679688 -249.914062 98.859375 -258.820312 108.859375 -264.84375 C 118.867188 -270.875 130.15625 -273.890625 142.71875 -273.890625 C 155.28125 -273.890625 166.5625 -271.003906 176.5625 -265.234375 C 186.570312 -259.472656 193.753906 -250.5625 198.109375 -238.5 L 285.828125 0 L 216.1875 0 L 199.265625 -51.9375 L 85.015625 -51.9375 L 67.3125 0 Z M 101.5625 -105.40625 L 182.71875 -105.40625 L 148.484375 -212.734375 C 147.972656 -214.273438 147.269531 -215.363281 146.375 -216 C 145.476562 -216.644531 144.390625 -216.96875 143.109375 -216.96875 C 141.828125 -216.96875 140.734375 -216.582031 139.828125 -215.8125 C 138.929688 -215.039062 138.359375 -214.015625 138.109375 -212.734375 Z M 101.5625 -105.40625 "/></g></g></g><g fill="#ffffff" fill-opacity="1"><g transform="translate(270.425279, 440.877177)"><g><path d="M 23.46875 0 L 23.46875 -269.28125 L 146.5625 -269.28125 C 164.769531 -269.28125 181.375 -265.304688 196.375 -257.359375 C 211.382812 -249.410156 223.3125 -238.378906 232.15625 -224.265625 C 241.007812 -210.160156 245.4375 -193.878906 245.4375 -175.421875 C 245.4375 -158.234375 241.332031 -142.78125 233.125 -129.0625 C 224.914062 -115.34375 214.144531 -104.25 200.8125 -95.78125 L 222.34375 -59.234375 C 223.625 -57.441406 225.097656 -56.03125 226.765625 -55 C 228.441406 -53.976562 230.6875 -53.46875 233.5 -53.46875 L 257.359375 -53.46875 L 257.359375 0 L 219.65625 0 C 208.113281 0 197.597656 -2.753906 188.109375 -8.265625 C 178.617188 -13.785156 171.179688 -21.03125 165.796875 -30 L 136.953125 -81.171875 C 135.148438 -81.171875 133.285156 -81.171875 131.359375 -81.171875 C 129.441406 -81.171875 127.457031 -81.171875 125.40625 -81.171875 L 88.09375 -81.171875 L 88.09375 0 Z M 88.09375 -134.640625 L 139.25 -134.640625 C 146.6875 -134.640625 153.609375 -136.238281 160.015625 -139.4375 C 166.429688 -142.644531 171.5 -147.265625 175.21875 -153.296875 C 178.9375 -159.328125 180.796875 -166.570312 180.796875 -175.03125 C 180.796875 -183.5 178.875 -190.742188 175.03125 -196.765625 C 171.1875 -202.796875 166.117188 -207.410156 159.828125 -210.609375 C 153.546875 -213.816406 146.6875 -215.421875 139.25 -215.421875 L 88.09375 -215.421875 Z M 88.09375 -134.640625 "/></g></g></g><g fill="#ffffff" fill-opacity="1"><g transform="translate(517.010202, 440.877177)"><g><path d="M 0 0 L 87.328125 -238.125 C 91.679688 -249.914062 98.859375 -258.820312 108.859375 -264.84375 C 118.867188 -270.875 130.15625 -273.890625 142.71875 -273.890625 C 155.28125 -273.890625 166.5625 -271.003906 176.5625 -265.234375 C 186.570312 -259.472656 193.753906 -250.5625 198.109375 -238.5 L 285.828125 0 L 216.1875 0 L 199.265625 -51.9375 L 85.015625 -51.9375 L 67.3125 0 Z M 101.5625 -105.40625 L 182.71875 -105.40625 L 148.484375 -212.734375 C 147.972656 -214.273438 147.269531 -215.363281 146.375 -216 C 145.476562 -216.644531 144.390625 -216.96875 143.109375 -216.96875 C 141.828125 -216.96875 140.734375 -216.582031 139.828125 -215.8125 C 138.929688 -215.039062 138.359375 -214.015625 138.109375 -212.734375 Z M 101.5625 -105.40625 "/></g></g></g></g></g>' +
  '</svg>';

var tiles = [];
UNIVERS.forEach(function(u,i){
  var d = document.createElement('div'); d.className = 'i-tile i-c'; d.dataset.i = i;
  if(u.cover){
    var img = document.createElement('img'); img.src = u.cover; img.alt=''; d.appendChild(img);
  } else {
    d.style.background = (i%2===0) ? C_SHAPE : 'rgba(253,221,184,.14)';
  }
  var lbl = document.createElement('div'); lbl.className = 'i-t i-display i-c'; lbl.style.cssText='left:50%;top:50%';
  lbl.textContent = u.n.toUpperCase(); d.appendChild(lbl);
  $('i-tiles').appendChild(d); tiles.push(d);
});

var bars = [];
for(var bi=0; bi<27; bi++){ var bd=document.createElement('div'); bd.className='i-bar i-c'; $('i-bars').appendChild(bd); bars.push(bd); }

var room = $('i-room'); var avs=[];
PLAYERS.forEach(function(c){
  var d=document.createElement('div'); d.className='i-av i-c';
  d.innerHTML='<b>'+c+'</b>'; room.appendChild(d); avs.push(d);
});
var qcard=document.createElement('div'); qcard.className='i-c'; qcard.style.cssText='background:'+C_CREAM+';border-radius:0'; room.appendChild(qcard);
var qtxt=document.createElement('div'); qtxt.className='i-t i-c'; qtxt.style.color=C_INK; qtxt.textContent="Devine l'artiste et le titre"; room.appendChild(qtxt);
var inp=document.createElement('div'); inp.className='i-c'; inp.style.cssText='background:#fff;border-radius:4px;overflow:hidden'; room.appendChild(inp);
var typed=document.createElement('div'); typed.className='i-t i-c'; room.appendChild(typed);
var chkSvg=document.createElementNS('http://www.w3.org/2000/svg','svg'); chkSvg.setAttribute('viewBox','0 0 100 100'); chkSvg.setAttribute('class','i-c');
chkSvg.style.cssText='position:absolute'; chkSvg.innerHTML='<path class="i-chk" d="M22 53 L43 74 L79 28" pathLength="1" stroke-dasharray="1" />'; room.appendChild(chkSvg);
var score=document.createElement('div'); score.className='i-t i-display i-c'; score.textContent='+100'; room.appendChild(score);
var eyebrow=document.createElement('div'); eyebrow.className='i-t i-c'; room.appendChild(eyebrow);

var pod=$('i-podium'); var pbars=[];
[['2',34,16],['1',50,26],['3',66,11]].forEach(function(row){
  var d=document.createElement('div'); d.className='i-pbar';
  d.innerHTML='<div class="i-t i-display i-c" style="left:50%;top:50%;color:'+C_CREAM+'"></div>';
  d.firstChild.textContent=row[0]; d.dataset.x=row[1]; d.dataset.h=row[2];
  pod.appendChild(d); pbars.push(d);
});
var pav=[]; [1,0,2].forEach(function(pi){
  var d=document.createElement('div'); d.className='i-av i-c'; d.innerHTML='<b>'+PLAYERS[pi]+'</b>';
  pod.appendChild(d); pav.push(d);
});

// pochette (iris) : vraie pochette Dancehall, pas de disque vinyle generique
var cover=document.createElement('div'); cover.id='i-cover'; cover.className='i-c'; $('i-shape').appendChild(cover);
cover.style.cssText='position:absolute;inset:0;transform:none;overflow:hidden';
var coverImg=document.createElement('img'); coverImg.src=UNIVERS[CENTER_I].cover; coverImg.alt='';
coverImg.style.cssText='width:100%;height:100%;object-fit:cover;display:block'; cover.appendChild(coverImg);

var shapeLabel=document.createElement('div'); shapeLabel.className='i-t i-display i-c'; shapeLabel.style.cssText='left:50%;top:50%'; $('i-shape').appendChild(shapeLabel);

// bouton lecture (triangle plein, aplat creme, pas de glyphe systeme)
var playIcon=document.createElementNS('http://www.w3.org/2000/svg','svg'); playIcon.setAttribute('viewBox','0 0 100 100');
playIcon.style.cssText='position:absolute;left:50%;top:50%;width:40%;height:40%;transform:translate(-50%,-50%)';
playIcon.innerHTML='<path style="position:static" d="M30 18 L84 50 L30 82Z" fill="'+C_CREAM+'"/>';
$('i-shape').appendChild(playIcon);

/* ---------- keyframes de la forme noire continue ----------
   Structure et temps identiques au prototype. Seules les couleurs
   changent : plus de rainbow (corail/turquoise/jaune/violet), uniquement
   shape-ink (neutre) et accent (signal), conformement a la consigne
   "l'orange reste reserve a ce qui signale une action/l'element actif". */
var dotX = 83; // recalcule selon la largeur reelle du logo
function kf(){
  return [
    [0.00, dotX,50, 3.4,3.4,1.7, C_SHAPE],
    [0.095,dotX,50, 3.4,3.4,1.7, C_SHAPE],
    [0.16, 50,50, 34,10,5, C_SHAPE, eob],      // pilule "Lancer"
    [0.235,50,50, 17,17,8.5, C_SHAPE, eob],    // cercle lecture
    [0.36, 50,50, 17,17,8.5, C_SHAPE],
    [0.372,50,50, 48,48,3, C_ACCENT],          // signal : clic -> accent (cache sous l'iris)
    [0.455,50,50, 48,48,3, C_ACCENT],
    [0.50, 50,50, 18,18,2.5, C_ACCENT, eob],   // tuile active (bento)
    [0.52, 50,50, 18,18,2.5, C_SHAPE],
    [0.58, 50,50, 18,18,2.5, C_SHAPE],
    [0.64, 50,50, 320,320,0, C_SHAPE],         // salon plein cadre
    [0.915,50,50, 320,320,0, C_SHAPE],
    [0.925,50,50, 320,320,0, C_SHAPE],
    [0.945,60,50, 60,60,30, C_SHAPE],
    [0.97, dotX,50, 3.4,3.4,1.7, C_SHAPE],
    [1.00, dotX,50, 3.4,3.4,1.7, C_SHAPE],
  ];
}
function shapeAt(p){
  var K=kf(), i=0;
  while(i<K.length-2 && p>K[i+1][0]) i++;
  var a=K[i], b=K[i+1];
  var t=clamp((p-a[0])/(b[0]-a[0]));
  var e=(b[7]||eio)(t);
  return {
    x:lerp(a[1],b[1],e), y:lerp(a[2],b[2],e),
    w:lerp(a[3],b[3],e), h:lerp(a[4],b[4],e), r:lerp(a[5],b[5],e),
    c: t<.5 ? a[6] : b[6]
  };
}
/* curseur : p, x, y, alpha (identique au prototype) */
var CUR=[[0,80,88,0],[0.06,76,72,1],[0.15,50,50,1],[0.20,50,50,1],[0.27,64,64,1],[0.33,64,64,0],[0.46,60,66,0],[0.50,58,60,1],[0.54,50,50,1],[0.585,50,50,1],[0.60,66,66,0],[0.66,66,62,0],[0.675,52,60,1],[0.70,52,60,1],[0.74,70,74,1],[0.78,70,74,0],[1,80,88,0]];
var CLICKS=[0.17,0.545,0.69];
function curAt(p){
  var i=0; while(i<CUR.length-2 && p>CUR[i+1][0]) i++;
  var a=CUR[i], b=CUR[i+1];
  var t=eio(clamp((p-a[0])/(b[0]-a[0])));
  return {x:lerp(a[1],b[1],t), y:lerp(a[2],b[2],t), a:lerp(a[3],b[3],t)};
}

/* ---------- LA fonction seek(p) ---------- */
function seek(p){
  var beat=p*BEATS, frac=beat-Math.floor(beat);
  var pulse=Math.exp(-frac*5);

  /* logotype : repli horizontal vers le point (le vrai logo n'est pas
     decomposable lettre par lettre sans risque -- cf notes de livraison --
     on applique donc la compression a l'unite entiere, comme prevu en
     filet de securite dans le brief d'origine). */
  var lf = Math.max(1 - eio(win(p,.02,.095)), eio(win(p,.945,1)));
  var fs = U*13; // hauteur de reference (equivaut au font-size du prototype)
  // boite a l'aspect reel du logo (822x592 -> 1.389:1), pas un carre :
  // ainsi offsetWidth correspond exactement au bord visible des lettres,
  // sans marge interne qui decalerait le point d'ancrage du repli.
  logoEl.style.width = (fs*822/592)+'px'; logoEl.style.height = fs+'px';
  logoEl.style.left = X(50-2)+'px'; logoEl.style.top = Y(50)+'px';
  var lw = logoEl.offsetWidth || fs;
  dotX = 50 - 2 + lw/U/2 + 3.2;
  logoEl.style.transform = 'translate(-50%,-50%) scaleX('+Math.max(lf,0.0001)+')';
  logoEl.style.transformOrigin = '100% 50%';
  logoEl.style.left = (X(50-2) + (lw/2)*(1-lf)) + 'px';
  logoEl.style.opacity = lf>0.015 ? 1 : 0;

  /* forme continue */
  var s=shapeAt(p);
  var sh=$('i-shape'); sh.style.left=X(s.x)+'px'; sh.style.top=Y(s.y)+'px';
  sh.style.width=s.w*U+'px'; sh.style.height=s.h*U+'px'; sh.style.borderRadius=s.r*U+'px'; sh.style.background=s.c;
  var inCover = p>0.37 && p<0.50;
  cover.style.display = inCover ? 'block' : 'none';
  var pillLabel = p>.10 && p<.20;
  var showLabel = pillLabel || (p>.50 && p<.60);
  shapeLabel.style.display = showLabel ? 'block' : 'none';
  shapeLabel.textContent = pillLabel ? 'Lancer' : UNIVERS[CENTER_I].n;
  shapeLabel.style.color = C_CREAM;
  shapeLabel.style.fontSize = (pillLabel?3.4:2.4)*U+'px';
  shapeLabel.style.transform = 'translate(-50%,-50%) scale('+(pillLabel?eob(win(p,.12,.17)):eob(win(p,.51,.54)))+')';
  var playOn = p>.215 && p<.36;
  playIcon.style.display = playOn ? 'block' : 'none';
  playIcon.style.transform = 'translate(-48%,-50%) scale('+(eob(win(p,.22,.25))*(1+pulse*.1))+')';

  /* onde audio, dessinee sur les temps */
  bars.forEach(function(b,i){
    var side=i-13, d=Math.abs(side);
    var on = eio(win(p, .245+d*.0045, .27+d*.0045)) * (1-eio(win(p,.335,.36)));
    var amp = (6+(Math.sin(i*1.7+beat*1.3)*.5+.5)*20) * (0.65+pulse*.35);
    var bx = 50+side*3.0;
    var hh = on*amp;
    b.style.display = (side===0||on<.01) ? 'none' : 'block';
    b.style.left=X(bx+(side>0?5.5:-5.5))+'px'; b.style.top=Y(50)+'px';
    b.style.width=1.5*U+'px'; b.style.height=Math.max(hh,.01)*U+'px';
  });

  /* iris a 6 lames : ferme sur la scene, ouvre sur la pochette */
  var close=eio(win(p,.34,.372)), open=eio(win(p,.385,.43));
  var apert = p<.38 ? lerp(70,0,close) : lerp(0,70,open);
  var R=apert*U, cx=W/2, cy=H/2;
  var hexp=''; for(var k=0;k<6;k++){ var a2=Math.PI/180*(60*k+30); hexp+=(k?'L':'M')+(cx+R*Math.cos(a2))+','+(cy+R*Math.sin(a2)); }
  $('i-irisPath').setAttribute('d', 'M0,0H'+W+'V'+H+'H0Z'+(R>.5?hexp+'Z':''));
  $('i-iris').style.display = (p>.335 && p<.435) ? 'block' : 'none';
  $('i-iris').style.transform = 'rotate('+(lerp(0,60,close)+lerp(0,-60,open))+'deg)';
  $('i-iris').style.transformOrigin='50% 50%';

  /* bento 3x3 : deploiement depuis le centre */
  tiles.forEach(function(t,i){
    var col=i%3-1, row=Math.floor(i/3)-1, ring=(col&&row)?2:(col||row)?1:0;
    var isC = i===CENTER_I;
    var on = isC ? 0 : eob(win(p,.495+ring*.018,.53+ring*.018));
    var off = eio(win(p,.575,.62));
    var kk = Math.max(on*(1-off),0);
    t.style.display = (isC||kk<.01) ? 'none' : 'block';
    var gx=50+col*20.5, gy=50+row*20.5;
    t.style.left=X(lerp(50,gx,kk))+'px'; t.style.top=Y(lerp(50,gy,kk))+'px';
    t.style.width=18*U*kk+'px'; t.style.height=18*U*kk+'px';
    t.lastChild.style.fontSize=1.7*U+'px';
  });

  /* salon */
  var rin=eio(win(p,.62,.66)), rout=eio(win(p,.865,.9));
  var rv=rin*(1-rout);
  room.style.display = rv>.01 ? 'block' : 'none';
  eyebrow.textContent = UNIVERS[CENTER_I].n.toUpperCase();
  eyebrow.style.fontSize=1.9*U+'px'; eyebrow.style.letterSpacing='.14em'; eyebrow.style.color=C_CREAM;
  eyebrow.style.left=X(50)+'px'; eyebrow.style.top=Y(14)+'px';
  eyebrow.style.transform='translate(-50%,-50%) scale('+eob(win(p,.63,.66))+')';
  avs.forEach(function(av,i){
    var kk=eob(win(p,.64+i*.012,.675+i*.012));
    av.style.left=X(34+i*10.7)+'px'; av.style.top=Y(27)+'px';
    av.style.width=av.style.height=9*U*kk+'px'; av.firstChild.style.fontSize=3.6*U*kk+'px';
    av.style.transform='translate(-50%,-50%) scale('+(1+(i===0&&p>.74&&p<.78?pulse*.25:0))+')';
  });
  var qk=eob(win(p,.665,.69))*(1-eio(win(p,.79,.82)));
  qcard.style.left=X(50)+'px'; qcard.style.top=Y(54)+'px';
  qcard.style.width=64*U*qk+'px'; qcard.style.height=30*U*qk+'px';
  qtxt.style.fontSize=2.6*U*qk+'px'; qtxt.style.left=X(50)+'px'; qtxt.style.top=Y(46)+'px';
  inp.style.left=X(50)+'px'; inp.style.top=Y(60)+'px';
  inp.style.width=52*U*qk+'px'; inp.style.height=7*U*qk+'px';
  var n=Math.floor(win(p,.695,.745)*ANSWER.length);
  typed.textContent = ANSWER.slice(0,n) + (p>.69&&p<.75&&frac<.5 ? '|' : '');
  typed.style.fontSize=2.6*U*qk+'px'; typed.style.left=X(50)+'px'; typed.style.top=Y(60)+'px';
  var ck=win(p,.75,.775);
  chkSvg.style.left=X(50+25)+'px'; chkSvg.style.top=Y(60)+'px';
  chkSvg.style.width=chkSvg.style.height=(ck>0?9*U*qk:0)+'px';
  chkSvg.style.transform='translate(-50%,-50%)';
  chkSvg.firstChild.setAttribute('stroke-dashoffset', 1-eio(ck));
  inp.style.background = ck>0 ? '#1F9D55' : '#fff'; // vert = succes, reserve a cet usage
  typed.style.color = ck>0 ? C_CREAM : C_INK;
  chkSvg.firstChild.setAttribute('stroke', C_CREAM);
  chkSvg.style.display = ck>0 ? 'block' : 'none';
  score.style.fontSize=3*U+'px'; score.style.left=X(34)+'px'; score.style.top=Y(40)+'px'; score.style.color=C_CREAM;
  score.style.opacity = (qk>.5 && p>.775 && p<.82) ? 1 : 0;
  score.style.transform = 'translate(-50%,-50%) translateY('+(-lerp(0,6,win(p,.775,.82))*U)+'px) scale('+eob(win(p,.775,.795))+')';
  avs.forEach(function(av){ av.style.opacity = p>.82 ? 1-eio(win(p,.82,.835)) : 1; });

  /* podium */
  pod.style.display = (p>.825 && p<.9) ? 'block' : 'none';
  pbars.forEach(function(d,i){
    var kk=eio(win(p,.83+i*.014,.865+i*.014));
    var x=+d.dataset.x, h=+d.dataset.h*kk;
    d.style.left=X(x-7)+'px'; d.style.top=Y(78-h)+'px'; d.style.width=14*U+'px'; d.style.height=h*U+'px';
    d.firstChild.style.fontSize=3.4*U+'px'; d.firstChild.style.opacity = kk>.6?1:0;
    var av=pav[i]; var ak=eob(win(p,.855+i*.012,.885+i*.012));
    av.style.left=X(x)+'px'; av.style.top=Y(78-h-5.5)+'px';
    av.style.width=av.style.height=9*U*ak+'px'; av.firstChild.style.fontSize=3.6*U*ak+'px'; av.style.opacity=1;
  });

  /* flaque : envahit le cadre avant la boucle */
  var f=eio(win(p,.885,.925));
  var fl=$('i-flood'); fl.style.display=(f>.001 && p<.93) ? 'block' : 'none';
  fl.style.left=X(50)+'px'; fl.style.top=Y(70)+'px'; fl.style.width=fl.style.height=lerp(1,340,f)*U+'px';

  /* curseur + clic */
  var c=curAt(p), cu=$('i-cursor');
  var press=0; CLICKS.forEach(function(kk){ var w=win(p,kk-.012,kk+.012); press=Math.max(press,Math.sin(w*Math.PI)); });
  cu.style.left=(X(c.x)-4)+'px'; cu.style.top=(Y(c.y)-2)+'px'; cu.style.opacity=c.a;
  cu.style.transform='scale('+(1-press*.18)+')';
  var rg=0; CLICKS.forEach(function(kk){ rg=Math.max(rg,win(p,kk,kk+.035)); });
  var ring=$('i-ring'); var rr=(rg>0&&rg<1)?1:0;
  ring.style.display=rr?'block':'none'; ring.style.left=X(c.x)+'px'; ring.style.top=Y(c.y)+'px';
  ring.style.width=ring.style.height=lerp(1.5,9,rg)*U+'px'; ring.style.opacity=1-rg;

  $('i-hint').style.opacity = p<.012 ? 1 : 0;
}

/* ---------- hook son (prepare, non implemente) ----------
   Le clic reel de l'utilisateur sur "Lancer" est le seul moment ou l'audio
   peut etre debloque (politique autoplay des navigateurs). */
function onLaunch(){ /* a implementer : gac() + lecture d'un extrait */ }
window.__introOnLaunch = onLaunch;

/* ---------- scroll -> p (avec inertie douce) ---------- */
var target=0, cur=0;
var rm = matchMedia('(prefers-reduced-motion: reduce)').matches;
var done = rm || sessionStorage.getItem('sonaraIntroSeen')==='1';

function collapseTrack(){
  track.style.height='0'; track.style.overflow='hidden';
  track.classList.add('i-reduced');
}
function markSeenAndCollapse(){
  if(done) return;
  done = true;
  try{ sessionStorage.setItem('sonaraIntroSeen','1'); }catch(e){}
  collapseTrack();
}

function onScroll(){
  if(done) return;
  var m = track.scrollHeight - innerHeight;
  target = m>0 ? clamp(scrollY/m) : 0;
  if(target>=1) markSeenAndCollapse();
}
addEventListener('scroll', onScroll, {passive:true});
addEventListener('resize', function(){ size(); seek(cur); });

var skipBtn = $('i-skip');
if(skipBtn){
  skipBtn.addEventListener('click', function(){
    markSeenAndCollapse();
    document.getElementById('landing').scrollIntoView({block:'start'});
  });
}

function loop(){
  cur += (target-cur)*(rm?1:.14);
  if(Math.abs(target-cur)<.00005) cur=target;
  seek(cur);
  requestAnimationFrame(loop);
}
function boot(){
  size();
  if(done){ collapseTrack(); cur=target=1; seek(1); return; }
  onScroll(); seek(0); loop();
}
(document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(boot);

// pour tester une image precise depuis la console/CDP : window.seekTo(0.5)
window.seekTo = function(v){ target=cur=v; seek(v); };
})();
