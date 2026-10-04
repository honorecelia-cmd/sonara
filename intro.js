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
  '<svg viewBox="338 452 822 592" preserveAspectRatio="xMidYMid meet" fill="' + C_CREAM + '"><g>' +
  '<path d="M 356.832031 734.109375 L 356.832031 680.25 L 471.863281 680.25 C 476.988281 680.25 481.601562 678.96875 485.707031 676.40625 C 489.808594 673.84375 493.082031 670.511719 495.519531 666.40625 C 497.957031 662.304688 499.175781 657.8125 499.175781 652.9375 C 499.175781 647.8125 497.957031 643.199219 495.519531 639.09375 C 493.082031 634.992188 489.808594 631.65625 485.707031 629.09375 C 481.601562 626.53125 476.988281 625.25 471.863281 625.25 L 430.316406 625.25 C 414.667969 625.25 400.433594 622.171875 387.613281 616.015625 C 374.789062 609.859375 364.589844 600.820312 357.019531 588.890625 C 349.457031 576.964844 345.675781 562.667969 345.675781 546 C 345.675781 529.585938 349.261719 515.351562 356.441406 503.296875 C 363.628906 491.246094 373.378906 481.824219 385.691406 475.03125 C 398.003906 468.230469 411.597656 464.828125 426.472656 464.828125 L 545.332031 464.828125 L 545.332031 518.6875 L 433.769531 518.6875 C 429.152344 518.6875 424.925781 519.84375 421.082031 522.15625 C 417.238281 524.460938 414.289062 527.539062 412.238281 531.390625 C 410.183594 535.234375 409.160156 539.464844 409.160156 544.078125 C 409.160156 548.695312 410.183594 552.859375 412.238281 556.578125 C 414.289062 560.296875 417.238281 563.3125 421.082031 565.625 C 424.925781 567.929688 429.152344 569.078125 433.769531 569.078125 L 477.238281 569.078125 C 494.425781 569.078125 509.363281 572.351562 522.050781 578.890625 C 534.746094 585.433594 544.621094 594.539062 551.675781 606.203125 C 558.726562 617.871094 562.253906 631.527344 562.253906 647.171875 C 562.253906 665.640625 558.597656 681.351562 551.285156 694.296875 C 543.980469 707.246094 534.175781 717.121094 521.863281 723.921875 C 509.558594 730.714844 495.972656 734.109375 481.097656 734.109375 Z M 356.832031 734.109375 "/>' +
  '<path d="M 711.902344 739.109375 C 690.359375 739.109375 670.871094 735.519531 653.433594 728.34375 C 635.996094 721.15625 620.988281 711.152344 608.417969 698.328125 C 595.855469 685.507812 586.171875 670.636719 579.371094 653.71875 C 572.578125 636.792969 569.183594 618.578125 569.183594 599.078125 C 569.183594 579.589844 572.578125 561.382812 579.371094 544.453125 C 586.171875 527.527344 595.792969 512.71875 608.230469 500.03125 C 620.667969 487.335938 635.667969 477.460938 653.230469 470.40625 C 670.800781 463.355469 690.359375 459.828125 711.902344 459.828125 C 733.183594 459.828125 752.605469 463.355469 770.167969 470.40625 C 787.738281 477.460938 802.746094 487.335938 815.183594 500.03125 C 827.628906 512.71875 837.3125 527.59375 844.230469 544.65625 C 851.15625 561.710938 854.621094 579.851562 854.621094 599.078125 C 854.621094 618.578125 851.15625 636.792969 844.230469 653.71875 C 837.3125 670.636719 827.628906 685.507812 815.183594 698.328125 C 802.746094 711.152344 787.738281 721.15625 770.167969 728.34375 C 752.605469 735.519531 733.183594 739.109375 711.902344 739.109375 Z M 711.902344 684.09375 C 723.183594 684.09375 733.628906 681.980469 743.246094 677.75 C 752.871094 673.523438 761.140625 667.5625 768.058594 659.875 C 774.984375 652.179688 780.371094 643.136719 784.214844 632.75 C 788.066406 622.367188 789.996094 611.140625 789.996094 599.078125 C 789.996094 587.027344 788.066406 575.875 784.214844 565.625 C 780.371094 555.367188 774.984375 546.386719 768.058594 538.6875 C 761.140625 530.992188 752.871094 525.027344 743.246094 520.796875 C 733.628906 516.570312 723.183594 514.453125 711.902344 514.453125 C 700.359375 514.453125 689.84375 516.570312 680.355469 520.796875 C 670.863281 525.027344 662.59375 530.992188 655.542969 538.6875 C 648.488281 546.386719 643.105469 555.429688 639.386719 565.8125 C 635.667969 576.199219 633.808594 587.289062 633.808594 599.078125 C 633.808594 611.140625 635.667969 622.367188 639.386719 632.75 C 643.105469 643.136719 648.488281 652.179688 655.542969 659.875 C 662.59375 667.5625 670.863281 673.523438 680.355469 677.75 C 689.84375 681.980469 700.359375 684.09375 711.902344 684.09375 Z M 711.902344 684.09375 "/>' +
  '<path d="M 1061.960938 738.71875 C 1045.804688 738.71875 1031.3125 735.191406 1018.492188 728.140625 C 1005.667969 721.089844 995.539062 711.28125 988.101562 698.71875 C 980.664062 686.15625 976.945312 671.921875 976.945312 656.015625 L 976.945312 538.296875 C 976.945312 534.203125 975.917969 530.492188 973.867188 527.15625 C 971.824219 523.8125 969.132812 521.117188 965.789062 519.0625 C 962.453125 517.011719 958.734375 515.984375 954.632812 515.984375 C 950.539062 515.984375 946.820312 517.011719 943.476562 519.0625 C 940.140625 521.117188 937.511719 523.8125 935.585938 527.15625 C 933.667969 530.492188 932.710938 534.203125 932.710938 538.296875 L 932.710938 734.109375 L 869.617188 734.109375 L 869.617188 542.921875 C 869.617188 526.765625 873.273438 512.53125 880.585938 500.21875 C 887.898438 487.90625 898.027344 478.164062 910.976562 470.984375 C 923.921875 463.808594 938.476562 460.21875 954.632812 460.21875 C 971.046875 460.21875 985.667969 463.808594 998.492188 470.984375 C 1011.3125 478.164062 1021.445312 487.90625 1028.882812 500.21875 C 1036.320312 512.53125 1040.039062 526.765625 1040.039062 542.921875 L 1040.039062 660.640625 C 1040.039062 664.746094 1041.0625 668.527344 1043.117188 671.984375 C 1045.167969 675.445312 1047.796875 678.136719 1051.007812 680.0625 C 1054.214844 681.992188 1057.742188 682.953125 1061.585938 682.953125 C 1065.6875 682.953125 1069.46875 681.992188 1072.929688 680.0625 C 1076.398438 678.136719 1079.152344 675.445312 1081.195312 671.984375 C 1083.246094 668.527344 1084.273438 664.746094 1084.273438 660.640625 L 1084.273438 464.828125 L 1146.976562 464.828125 L 1146.976562 656.015625 C 1146.976562 671.921875 1143.257812 686.15625 1135.820312 698.71875 C 1128.390625 711.28125 1118.265625 721.089844 1105.445312 728.140625 C 1092.621094 735.191406 1078.125 738.71875 1061.960938 738.71875 Z M 1061.960938 738.71875 "/>' +
  '<path d="M 349.144531 1033.878906 L 436.472656 795.753906 C 440.824219 783.964844 448.003906 775.058594 458.003906 769.035156 C 468.011719 763.003906 479.300781 759.988281 491.863281 759.988281 C 504.425781 759.988281 515.707031 762.875 525.707031 768.644531 C 535.714844 774.40625 542.898438 783.316406 547.253906 795.378906 L 634.972656 1033.878906 L 565.332031 1033.878906 L 548.410156 981.941406 L 434.160156 981.941406 L 416.457031 1033.878906 Z M 450.707031 928.472656 L 531.863281 928.472656 L 497.628906 821.144531 C 497.117188 819.605469 496.414062 818.515625 495.519531 817.878906 C 494.621094 817.234375 493.535156 816.910156 492.253906 816.910156 C 490.972656 816.910156 489.878906 817.296875 488.972656 818.066406 C 488.074219 818.839844 487.503906 819.863281 487.253906 821.144531 Z M 450.707031 928.472656 "/>' +
  '<path d="M 641.894531 1033.878906 L 641.894531 764.597656 L 764.988281 764.597656 C 783.195312 764.597656 799.800781 768.574219 814.800781 776.519531 C 829.808594 784.46875 841.738281 795.5 850.582031 809.613281 C 859.433594 823.71875 863.863281 840 863.863281 858.457031 C 863.863281 875.644531 859.757812 891.097656 851.550781 904.816406 C 843.339844 918.535156 832.570312 929.628906 819.238281 938.097656 L 840.769531 974.644531 C 842.050781 976.4375 843.523438 977.847656 845.191406 978.878906 C 846.867188 979.902344 849.113281 980.410156 851.925781 980.410156 L 875.785156 980.410156 L 875.785156 1033.878906 L 838.082031 1033.878906 C 826.539062 1033.878906 816.023438 1031.125 806.535156 1025.613281 C 797.042969 1020.09375 789.605469 1012.847656 784.222656 1003.878906 L 755.378906 952.707031 C 753.574219 952.707031 751.710938 952.707031 749.785156 952.707031 C 747.867188 952.707031 745.882812 952.707031 743.832031 952.707031 L 706.519531 952.707031 L 706.519531 1033.878906 Z M 706.519531 899.238281 L 757.675781 899.238281 C 765.113281 899.238281 772.035156 897.640625 778.441406 894.441406 C 784.855469 891.234375 789.925781 886.613281 793.644531 880.582031 C 797.363281 874.550781 799.222656 867.308594 799.222656 858.847656 C 799.222656 850.378906 797.300781 843.136719 793.457031 837.113281 C 789.613281 831.082031 784.542969 826.46875 778.253906 823.269531 C 771.972656 820.0625 765.113281 818.457031 757.675781 818.457031 L 706.519531 818.457031 Z M 706.519531 899.238281 "/>' +
  '<path d="M 865.011719 1033.878906 L 952.339844 795.753906 C 956.691406 783.964844 963.871094 775.058594 973.871094 769.035156 C 983.878906 763.003906 995.167969 759.988281 1007.730469 759.988281 C 1020.292969 759.988281 1031.574219 762.875 1041.574219 768.644531 C 1051.582031 774.40625 1058.765625 783.316406 1063.121094 795.378906 L 1150.839844 1033.878906 L 1081.199219 1033.878906 L 1064.277344 981.941406 L 950.027344 981.941406 L 932.324219 1033.878906 Z M 966.574219 928.472656 L 1047.730469 928.472656 L 1013.496094 821.144531 C 1012.984375 819.605469 1012.28125 818.515625 1011.386719 817.878906 C 1010.488281 817.234375 1009.402344 816.910156 1008.121094 816.910156 C 1006.839844 816.910156 1005.746094 817.296875 1004.839844 818.066406 C 1003.941406 818.839844 1003.371094 819.863281 1003.121094 821.144531 Z M 966.574219 928.472656 "/>' +
  '</g></svg>';

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
