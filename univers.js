// ═══════════════════════════════════════════════════════════════
// SONARA — section "Les univers" : carrousel de vinyles (landing)
// Toutes les donnees sont dans UNIVERS ci-dessous : textes, couleurs
// (variables --univers-* de univers.css) et pochettes. C'est la seule
// reference des pochettes du site : carrousel, telephones de la landing
// (le jeu montre le vinyle neutre de l'univers, uvVinyl). Pour changer une pochette,
// remplacer son chemin `image` (WebP, avec un JPG de meme nom a cote pour
// les navigateurs sans WebP) ; `image:null` affiche le placeholder (aplat
// de la couleur + nom en MuseoModerno).
// Transitions : A (changer d'univers), B (ouvrir), C (fermer).
// ═══════════════════════════════════════════════════════════════
// Reglages du carrousel
var UV_DELAI_AUTO = 3000;        // ms entre deux univers en defilement automatique
var UV_DUREE_TRANSITION = 500;   // ms pour passer d'un univers a l'autre (pivot du disque)

var UNIVERS = [
  {nom:'Dancehall', slug:'dancehall', couleur:'var(--univers-dancehall)', image:'/img/pochettes/dancehall.webp',
   origine:'Jamaïque', epoque:'fin des années 1970', signature:'le deejay sur les riddims',
   texte:"Le dancehall tire son nom des salles de danse de Kingston où tournaient les sound systems. Plus rapide et plus brut que le reggae, il met le deejay au centre : il pose sa voix sur des riddims, des instrumentaux partagés par des dizaines d'artistes. En 1985, « Under Me Sleng Teng » de Wayne Smith fait basculer le genre dans l'ère numérique. Aux Antilles, il est devenu la bande-son des soirées et a donné naissance au shatta."},
  {nom:'Soca', slug:'soca', couleur:'var(--univers-soca)', image:'/img/pochettes/soca.webp',
   origine:'Trinidad-et-Tobago', epoque:'années 1970', signature:'la musique des carnavals',
   texte:"Au début des années 70, Lord Shorty veut redonner un souffle au calypso et y mêle des rythmes indo-caribéens : c'est la « soul of calypso », la soca. Tempo rapide, cuivres, refrains à reprendre en chœur, elle est devenue la musique reine des carnavals de toute la Caraïbe, de Port of Spain à Fort-de-France. Impossible de rester immobile."},
  {nom:'Zouk', slug:'zouk', couleur:'var(--univers-zouk)', image:'/img/pochettes/zouk.webp',
   origine:'Guadeloupe et Martinique', epoque:'début des années 1980', signature:'« zouk », c\'est la fête en créole',
   texte:"Formé en 1979, le groupe Kassav' fusionne gwoka, biguine, cadence et kompa avec des synthés et une production moderne. En créole, « zouk » veut dire la fête, et « Zouk la sé sèl médikaman nou ni » devient un hymne. Puis vient le zouk love, plus lent et plus sensuel. Le zouk est la signature musicale des Antilles françaises dans le monde entier."},
  {nom:'Reggae', slug:'reggae', couleur:'var(--univers-reggae)', image:'/img/pochettes/reggae.webp',
   origine:'Jamaïque', epoque:'fin des années 1960', signature:'le contretemps et le message',
   texte:"Issu du ska et du rocksteady, le reggae ralentit le tempo et accentue le contretemps, le fameux « skank ». Porté par le mouvement rastafari, il devient une musique de message, de spiritualité et de résistance. Bob Marley l'emmène sur toute la planète dans les années 70. En 2018, l'UNESCO l'inscrit au patrimoine culturel immatériel de l'humanité."},
  {nom:'Trap', slug:'trap', couleur:'var(--univers-trap)', image:'/img/pochettes/trap.webp',
   origine:'Atlanta, États-Unis', epoque:'début des années 2000', signature:'808, basses lourdes, charlestons en rafale',
   texte:"Le nom vient des « traps », les lieux de deal dont parlent les premiers textes du genre dans le Sud des États-Unis. Sa signature : la boîte à rythmes TR-808, des basses profondes et des charlestons en rafale. Dans les années 2010, la trap devient le son dominant du rap mondial, et les Antilles se l'approprient en la mêlant au dancehall et au créole."},
  {nom:'Rap', slug:'rap', couleur:'var(--univers-rap)', image:'/img/pochettes/rap.webp',
   origine:'le Bronx, New York', epoque:'années 1970', signature:'le flow sur le beat',
   texte:"Dans les block parties du Bronx, DJ Kool Herc, né en Jamaïque, isole les breaks des disques pendant que des MC prennent le micro. Le rap est né, avec un héritage direct du toasting des sound systems jamaïcains. Le genre conquiert le monde et s'installe aux Antilles dans les années 90, où il se fait en créole comme en français, entre conscience et ego trip."},
  {nom:'Mix', slug:'mix', couleur:'var(--univers-mix)', image:'/img/pochettes/mix.webp',
   origine:'Sonara', epoque:'maintenant', signature:'tous les univers en une partie',
   texte:"L'univers qui casse les frontières. Mix réunit tous les univers Sonara dans une même partie : un zouk peut succéder à un classique du reggae, puis à un shatta. C'est le reflet de nos playlists, de nos soirées et de la Caraïbe elle-même, faite de rencontres et de mélanges. Le mode pour ceux qui connaissent tout, ou qui veulent tout découvrir."},
  {nom:'Kompa', slug:'kompa', couleur:'var(--univers-kompa)', image:'/img/pochettes/kompa.webp',
   origine:'Haïti', epoque:'1955', signature:'la danse en couple par excellence',
   texte:"En 1955, le saxophoniste haïtien Nemours Jean-Baptiste crée le « konpa dirèk », un rythme de danse régulier et chaloupé inspiré du méringue. Guitares, cuivres, puis claviers : le kompa voyage avec la diaspora haïtienne et s'installe durablement aux Antilles, où il a nourri la cadence et le zouk. Aujourd'hui encore, c'est la danse en couple par excellence."},
  {nom:'Shatta', slug:'shatta', couleur:'var(--univers-shatta)', image:'/img/pochettes/shatta.webp',
   origine:'Martinique', epoque:'années 2010', signature:'minimaliste, percussif, fait pour le dancefloor',
   texte:"Né en Martinique, le shatta est un enfant du dancehall : plus minimaliste, plus percussif, pensé pour faire bouger le dancefloor, avec des textes crus et beaucoup d'humour. Longtemps réservé aux soirées locales, il explose dans l'Hexagone au début des années 2020, porté notamment par Maureen et Bamby. C'est la touche martiniquaise de Sonara."},
  {nom:'Dennery Segment', slug:'dennery-segment', couleur:'var(--univers-dennery)', image:'/img/pochettes/dennery-segment.webp', geant:'fonce',
   origine:'Sainte-Lucie', epoque:'années 2010', signature:'la soca saint-lucienne, à toute vitesse et en kwéyòl',
   texte:"Le Dennery Segment porte le nom de Dennery, une commune de la côte est de Sainte-Lucie. Héritier de la soca, il en garde l'énergie et la pousse à l'extrême : tempo rapide, percussions martelées, refrains courts répétés en boucle, souvent chantés en kwéyòl, le créole saint-lucien. Il traverse vite le canal jusqu'à la Martinique voisine, où ses riddims enflamment les soirées."}
];

// ── Pochettes : tout passe par le tableau UNIVERS ───────────────
// Chemin de la pochette d'un univers (null si inconnu)
function uvCover(slug){
  for(var k=0;k<UNIVERS.length;k++)if(UNIVERS[k].slug===slug)return UNIVERS[k].image||null;
  return null;
}
function uvJpg(src){return String(src).replace(/\.webp$/,'.jpg');}
// Pochette en fond d'un element : JPG d'abord, remplace par le WebP si le
// navigateur comprend image-set (sinon la declaration est ignoree)
function uvSetBg(el,src){
  if(!src)return;
  el.style.backgroundImage='url("'+uvJpg(src)+'")';
  el.style.backgroundImage='image-set(url("'+src+'") type("image/webp"), url("'+uvJpg(src)+'") type("image/jpeg"))';
}
// <img> en WebP illisible : repli sur le JPG (avant tout autre ecouteur)
document.addEventListener('error',function(e){
  var im=e.target;
  if(!im||im.tagName!=='IMG'||!/\/img\/pochettes\/[\w-]+\.webp$/.test(im.getAttribute('src')||''))return;
  e.stopPropagation();
  im.src=uvJpg(im.getAttribute('src'));
},true);
// Elements marques data-uv-cover="slug" (telephones de la landing, kit) :
// fond, ou source pour une <img>
[].forEach.call(document.querySelectorAll('[data-uv-cover]'),function(el){
  var src=uvCover(el.getAttribute('data-uv-cover'));
  if(!src)return;
  if(el.tagName==='IMG')el.src=src;else uvSetBg(el,src);
});

// Vinyle d'un univers (aussi utilise par l'ecran Choix de l'univers, ecrans.js)
function uvEsc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
// neutral : etiquette neutre (couleur de l'univers + logo Sonara), aucune pochette
function uvVinyl(u,spin,neutral,named){
  var disc='color-mix(in srgb, '+u.couleur+' 70%, #000)';
  // named : etiquette neutre avec le nom de l'univers sous le logo (revelation)
  var label=neutral&&named?'<span class="vy-label-named"><span class="jg-vy-logo" role="img" aria-label="Sonara"></span><span class="vy-label-nom">'+uvEsc(u.nom)+'</span></span>'
    :neutral?'<span class="jg-vy-logo" role="img" aria-label="Sonara"></span>':u.image
    ? '<img src="'+u.image+'" alt="" data-ph="'+uvEsc(u.nom)+'">'
    : '<span class="vy-label-txt">'+uvEsc(u.nom)+'</span>';
  return '<span class="vy'+(spin?' vy--spin':'')+'" style="--vy-color:'+disc+';--vy-label:'+u.couleur+'">'+
    '<span class="vy-spin"><span class="vy-disc"></span><span class="vy-label">'+label+'</span><span class="vy-hole"></span></span>'+
    '<span class="vy-sheen"></span></span>';
}

// ── Composant carrousel des univers ─────────────────────────────
// Utilise par la section 03 de la landing et par l'ecran "Choisis ton
// univers" du parcours (ecran-univers.js). Construit lui-meme sa scene
// (aplat, nom geant, vinyles) et son interface (fleches, compteur,
// bouton, pastilles) dans `sec` ; le reste du balisage (titre, panneau
// "Decouvrir") vient de la page.
// Options :
//   auto     defilement automatique + bouton pause (landing)
//   panel    panneau "Decouvrir" present dans `sec` (landing)
//   cta      libelle du bouton sous le vinyle ("Découvrir", "Choisir cet univers")
//   play     bouton principal "Jouer en [univers]" (creme) a cote du bouton
//            cta, qui passe en secondaire (contour) ; clic : onCenter (accueil)
//   fit      accroche, vinyle et boutons tiennent dans la hauteur de la
//            section : diametre et position du vinyle calcules (accueil)
//   onCta(u)         clic sur ce bouton (defaut : ouvrir le panneau)
//   onCenter(u)      clic sur le vinyle central
//   onSide(u,dir)    clic sur un vinyle voisin (dir -1 ou 1)
//   active()         le clavier pilote-t-il ce carrousel ? (defaut : section a l'ecran)
//   centerLabel, ctaLabel : debut des aria-label du vinyle et du bouton
//   neutral  etiquettes neutres (logo Sonara) au lieu des pochettes
// Retourne {current, index, setIndex, inView, go}.
function uvSkeleton(o){
  var n=UNIVERS.length, total=(n<10?'0':'')+n;
  var chev=function(d){return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="'+d+'"/></svg>';};
  return {
    back:'<div class="uv-bg"></div><p class="uv-giant" aria-hidden="true"></p>',
    front:
      '<div class="uv-stage">'+
        '<div class="uv-side uv-side--prev" aria-hidden="true"></div>'+
        '<div class="uv-side uv-side--next" aria-hidden="true"></div>'+
        '<button class="uv-center" type="button"><span class="uv-flip"></span></button>'+
        '<div class="uv-sleeve" aria-hidden="true"></div>'+
      '</div>'+
      '<div class="uv-ui">'+
        '<button class="uv-arrow uv-arrow--prev" type="button" aria-label="Univers précédent">'+chev('M15 5l-7 7 7 7')+'</button>'+
        '<button class="uv-arrow uv-arrow--next" type="button" aria-label="Univers suivant">'+chev('M9 5l7 7-7 7')+'</button>'+
        '<div class="uv-countbar">'+
          '<p class="uv-count" aria-live="off"><b>01</b><span>/ '+total+'</span></p>'+
          (o.auto?'<button class="uv-auto" type="button" aria-pressed="false" aria-label="Mettre en pause le défilement automatique">'+
            '<svg class="uv-ic-pause" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6v12M15 6v12"/></svg>'+
            '<svg class="uv-ic-play" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5l11 7-11 7z"/></svg></button>':'')+
        '</div>'+
        (o.play?'<div class="uv-ctas"><button class="nb-pill uv-playnow" type="button"></button>':'')+
        '<button class="nb-pill uv-discover" type="button">'+uvEsc(o.cta||'Découvrir')+'</button>'+
        (o.play?'</div>':'')+
        '<nav class="uv-tabs" aria-label="Choisir un univers"></nav>'+
      '</div>'
  };
}
function uvCarrousel(sec,o){
  'use strict';
  o=o||{};
  var N=UNIVERS.length;
  var sk=uvSkeleton(o), panelEl=sec.querySelector('.uv-panel');
  sec.insertAdjacentHTML('afterbegin',sk.back);
  if(panelEl)panelEl.insertAdjacentHTML('beforebegin',sk.front);
  else sec.insertAdjacentHTML('beforeend',sk.front);
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
  var mobile=window.matchMedia('(max-width: 767px)');
  // Nom geant au-dessus du vinyle seulement sur les ecrans etroits ; a partir
  // de 600px, il passe sur toute la largeur, derriere le vinyle
  var stack=window.matchMedia('(max-width: 599px)');
  var EASE='cubic-bezier(.65,0,.35,1)';
  var q=function(s){return sec.querySelector(s);};
  var bg=q('.uv-bg'), giant=q('.uv-giant'), center=q('.uv-center'), flip=q('.uv-flip');
  var prevVy=q('.uv-side--prev'), nextVy=q('.uv-side--next'), sleeve=q('.uv-sleeve'), ui=q('.uv-ui');
  var num=q('.uv-count b'), discover=q('.uv-discover'), panel=o.panel?panelEl:null;
  var pTitle=q('.uv-p-title'), pMeta=q('.uv-p-meta'), pText=q('.uv-p-text'), pInfos=q('.uv-p-infos');
  var pPlay=q('.uv-play'), pBack=q('.uv-back'), playNow=q('.uv-playnow');
  var idx=0, busy=false, open=false, timers=[], held=[];
  var pending=null;   // univers demande pendant une transition (pastille)
  var countEl=q('.uv-count'), autoBtn=q('.uv-auto'), inView=false;

  // Precharge des pochettes
  UNIVERS.forEach(function(u){if(u.image){var im=new Image();im.src=u.image;}});

  var esc=uvEsc, vinyl=function(u,spin){return uvVinyl(u,spin,o.neutral);};
  // Image absente ou en erreur : placeholder propre
  sec.addEventListener('error',function(e){
    var im=e.target;
    if(im.tagName!=='IMG'||!im.dataset.ph)return;
    var ph=document.createElement('span');
    ph.className=im.closest('.uv-sleeve')?'uv-sleeve-ph':'vy-label-txt';
    ph.textContent=im.dataset.ph;
    im.replaceWith(ph);
  },true);
  function at(k){return UNIVERS[(k+N)%N];}
  function pad(n){return (n<10?'0':'')+n;}

  function paintColor(){sec.style.setProperty('--uv-c',at(idx).couleur);}

  // ── Couleur du nom geant : lisible sur toutes les couleurs ──
  // Fond sombre : version plus claire du fond ; fond clair : plus foncee.
  // Luminosite cherchee pour un contraste de 3 avec le fond.
  var UV_GIANT_CONTRASTE=3;
  function rgbOf(css){
    var el=document.createElement('span');el.style.color=css;el.style.display='none';
    sec.appendChild(el);var m=getComputedStyle(el).color.match(/[\d.]+/g);el.remove();
    return m?[+m[0],+m[1],+m[2]]:null;
  }
  function lum(c){
    var f=function(v){v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4);};
    return .2126*f(c[0])+.7152*f(c[1])+.0722*f(c[2]);
  }
  function contrast(a,b){var x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
  var giantColors={};
  function giantColor(u){
    if(giantColors[u.slug])return giantColors[u.slug];
    var c=rgbOf(u.couleur);if(!c)return '';
    // ton clair sur fond sombre, fonce sur fond clair ; un univers peut imposer
    // le sien (UNIVERS : geant:'fonce' ou 'clair')
    var dark=u.geant==='fonce'?false:u.geant==='clair'?true:lum(c)<.179;   // .179 : blanc et noir contrastent autant
    // meme teinte et meme saturation que le fond, seule la luminosite change
    // (TSL) : peche sur l'orange, brun fonce sur la terre de Sienne...
    var r=c[0]/255,g=c[1]/255,b=c[2]/255,mx=Math.max(r,g,b),mn=Math.min(r,g,b),L=(mx+mn)/2,d=mx-mn,H=0,S=0;
    if(d){S=d/(1-Math.abs(2*L-1));H=mx===r?((g-b)/d)%6:mx===g?(b-r)/d+2:(r-g)/d+4;H*=60;if(H<0)H+=360;}
    var hsl=function(l){var C=(1-Math.abs(2*l-1))*S,X=C*(1-Math.abs((H/60)%2-1)),m=l-C/2,k=Math.floor(H/60)%6;
      var t=[[C,X,0],[X,C,0],[0,C,X],[0,X,C],[X,0,C],[C,0,X]][k];
      return t.map(function(v){return Math.round((v+m)*255);});};
    var lo=dark?L:0,hi=dark?1:L;
    for(var k=0;k<24;k++){var m=(lo+hi)/2,ok=contrast(c,hsl(m))>=UV_GIANT_CONTRASTE;
      if(dark){if(ok)hi=m;else lo=m;}else{if(ok)lo=m;else hi=m;}}
    var out=hsl(dark?hi:lo);
    return (giantColors[u.slug]='rgb('+out.join(',')+')');
  }

  // Largeur du nom a 100px, mesuree sur un canvas (l'ecran peut etre
  // encore cache), espacement -.02em compris
  function giantW100(nom){
    var ctx=(paintGiant.cv||(paintGiant.cv=document.createElement('canvas'))).getContext('2d');
    ctx.font="800 100px 'MuseoModerno',sans-serif";   // meme graisse que .uv-giant
    return Math.max(1,ctx.measureText(nom).width-2*nom.length);
  }
  function paintGiant(){
    var u=at(idx);
    giant.textContent=u.nom;
    giant.style.color=giantColor(u);
    var W=sec.clientWidth||window.innerWidth, w=giantW100(u.nom);
    giant.style.removeProperty('--uv-gy');   // decalage du CSS, sauf accueil >= 600px
    // Accueil, sous 600px : nom au-dessus du vinyle, taille plafonnee par la
    // hauteur reservee (fitBox.cap) et par la largeur libre (fitBox.maxW)
    if(o.fit&&fitBox&&stack.matches&&fitBox.cap){
      giant.style.setProperty('--uv-fs',Math.min(fitBox.cap,fitBox.maxW*100/w).toFixed(1)+'px');
      return;
    }
    if(!stack.matches){
      if(!o.fit){giant.style.setProperty('--uv-fs',Math.min(24,150/u.nom.length).toFixed(2)+'vw');return;}
      // Accueil, a partir de 600px : nom derriere le vinyle central, qui en
      // cache le milieu ; il deborde nettement du vinyle (au moins 1,75 fois
      // son diametre) mais tient entre les vinyles voisins (fitBox.maxW,
      // calcule par layout) : aucune lettre cachee par eux. Hauteur des
      // lettres bornee par le vinyle (noms courts : Rap, Mix, Zouk).
      var D=fitBox&&fitBox.D||center.offsetWidth||W*.3;
      var fit=(fitBox&&fitBox.maxW||W-48)*100/w, fs=Math.min(W*.24,D*.95,fit);
      fs=Math.max(fs,Math.min(fit,D*1.75*100/w));
      giant.style.setProperty('--uv-fs',fs.toFixed(1)+'px');
      // centre vertical des lettres (et non de la boite de texte) sur le
      // centre du vinyle : Rap ou Kompa n'ont pas de jambage, Segment si
      var ctx=paintGiant.cv.getContext('2d');ctx.font="800 "+fs+"px 'MuseoModerno',sans-serif";
      var mt=ctx.measureText(u.nom), A=mt.fontBoundingBoxAscent, Ds=mt.fontBoundingBoxDescent;
      if(A){
        var off=(fs*.85-(A+Ds))/2+A+(mt.actualBoundingBoxDescent-mt.actualBoundingBoxAscent)/2;
        giant.style.setProperty('--uv-gy',(-off).toFixed(1)+'px');
      }
      return;
    }
    // Sous 600px : au-dessus du vinyle, dans la largeur (marges de 16px)
    var cap=Math.min(W*.22,window.innerHeight*.11);
    giant.style.setProperty('--uv-fs',Math.min(cap,(W-32)*100/w).toFixed(1)+'px');
  }
  // Mobile : la taille depend de la police chargee et de la largeur
  // (accueil : la mise en page aussi, l'accroche change de hauteur)
  function relayout(){layout();paintGiant();}
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(relayout);
  [mobile,stack].forEach(function(mq){if(mq.addEventListener)mq.addEventListener('change',relayout);});
  window.addEventListener('resize',function(){if(stack.matches)paintGiant();});

  // ── Accueil : tout le premier ecran ─────────────────────────
  // Entre le bas de l'accroche et le haut de la rangee des univers : (mobile)
  // le nom geant au-dessus du vinyle, le vinyle, puis les boutons. Le vinyle
  // prend la place disponible, sans depasser sa taille habituelle.
  var hook=sec.querySelector('.nb-hook');
  // Accueil sous 600px : bloc nom + vinyle + boutons, centre verticalement
  // entre l'accroche et la rangee des univers. Le nom est au-dessus du vinyle
  // (jamais derriere) : zone de hauteur fixe (cap), nom cale en bas de la
  // zone, a GAP du vinyle (place des jambages, ex. « g » de Segment).
  // A partir de 600px : nom derriere le vinyle central.
  var fitBox=null;
  function layout(){
    if(!o.fit||open)return;
    var H=sec.clientHeight, W=sec.clientWidth;
    if(!H||!W)return;
    var mob=mobile.matches, rect=sec.getBoundingClientRect();
    var rel=function(el){return el.getBoundingClientRect().top-rect.top;};
    var top=(hook?rel(hook)+hook.offsetHeight:0)+(mob?12:Math.max(16,H*.025));
    // haut de la rangee des univers et du compteur (masque sur ordinateur)
    var bar=[tabs,countEl.parentNode].filter(function(el){return el.getClientRects().length;}).map(rel);
    var bottom=(bar.length?Math.min.apply(null,bar):H)-(mob?14:Math.max(16,H*.03));
    var ctas=q('.uv-ctas')||discover, ctaGap=mob?14:24;
    var avail=bottom-top-ctaGap-ctas.offsetHeight;
    if(!stack.matches){
      // a partir de 600px : vinyle a sa taille habituelle, nom geant derriere,
      // centre sur le vinyle (CSS : top = --uv-cy, decalage -50 %)
      var Dd=Math.max(mob?140:200,Math.min(Math.min(W,H)*.45,avail));
      var cyd=top+Dd/2+Math.max(0,avail-Dd)/2;
      // largeur libre entre les vinyles voisins (univers.css .uv-side),
      // moins 20px de chaque cote, et dans l'ecran (marges de 24px)
      var dsd=Dd*(mob?.55:.62), libre=mob?W-2*dsd*.18:W-dsd;
      fitBox={D:Dd,maxW:Math.min(libre-2*20,W-48)};
      sec.style.setProperty('--uv-d',Dd.toFixed(1)+'px');
      sec.style.setProperty('--uv-cy',cyd.toFixed(1)+'px');
      sec.style.removeProperty('--uv-gb');
      return;
    }
    // taille maximale du nom : proportionnelle a la largeur et a la place
    var cap=mob?Math.min(W*.22,avail*.14):Math.min(W*.1,avail*.2,150);
    var gap=function(c){return Math.max(14,c*.32);};
    var zone=function(c){return c*.85+gap(c);};   // hauteur du nom + ecart
    var max=mob?W*.8:Math.min(W*.5,H*.52), min=mob?140:200;
    var D=Math.min(max,avail-zone(cap));
    if(D<min){   // ecran bas : le nom retrecit avant le vinyle
      D=Math.max(min,Math.min(max,avail*.75));
      cap=Math.max(24,Math.min(cap,(avail-D)/1.17));
    }
    var Z=zone(cap), extra=Math.max(0,avail-Z-D);
    var cy=top+extra/2+Z+D/2;
    // largeur libre : entre les vinyles voisins (moins une marge de chaque
    // cote), et dans l'ecran (marges de 16px mobile, 24px ordinateur)
    var ds=D*(mob?.55:.62), inner=mob?W-2*ds*.18:W-ds;
    var maxW=Math.min(inner-(mob?2*12:2*32),W-(mob?32:48));
    fitBox={cap:cap,maxW:maxW};
    sec.style.setProperty('--uv-d',D.toFixed(1)+'px');
    sec.style.setProperty('--uv-cy',cy.toFixed(1)+'px');
    sec.style.setProperty('--uv-gb',(cy-D/2-gap(cap)).toFixed(1)+'px');
  }
  // Section affichee (vue accueil), redimensionnee, ou accroche qui change
  // de hauteur (message d'un lien de Defi) : nouvelle mise en page
  if(o.fit&&window.ResizeObserver){
    var roTick=0;
    var ro=new ResizeObserver(function(){cancelAnimationFrame(roTick);roTick=requestAnimationFrame(relayout);});
    ro.observe(sec);if(hook)ro.observe(hook);
  }
  function paintCenter(){
    var u=at(idx);
    flip.innerHTML=vinyl(u,true);
    center.setAttribute('aria-label',(o.centerLabel||'Jouer en ')+u.nom);
    discover.setAttribute('aria-label',(o.ctaLabel||'Découvrir l\'univers ')+u.nom);
    if(playNow)playNow.textContent='Jouer en '+u.nom;
  }
  function paintSides(){prevVy.innerHTML=vinyl(at(idx-1),false);nextVy.innerHTML=vinyl(at(idx+1),false);}
  // Rangee des 9 univers : l'actif est mis en evidence
  var tabs=q('.uv-tabs');
  tabs.innerHTML=UNIVERS.map(function(u,k){return '<button type="button" class="uv-tab" data-k="'+k+'">'+esc(u.nom)+'</button>';}).join('');
  tabs.addEventListener('click',function(e){
    var b=e.target.closest('.uv-tab');if(!b)return;
    var k=+b.getAttribute('data-k');
    // transition en cours : le dernier univers demande est retenu (flushPending)
    if(busy&&!open){pending=k;holdAuto();return;}
    go(k>idx?1:-1,false,k);
  });
  // Fin d'une transition : univers demande entre-temps
  function flushPending(){
    if(pending==null||open)return;
    var k=pending;pending=null;
    if(k!==idx)go(k>idx?1:-1,false,k);
  }
  // Rangee plus large que la place : elle defile, fondu sur le bord
  // droit tant qu'il reste des univers a voir
  function tabsEdge(){
    var over=tabs.scrollWidth>tabs.clientWidth+1;
    tabs.classList.toggle('is-scroll',over);
    tabs.classList.toggle('is-more',over&&tabs.scrollLeft+tabs.clientWidth<tabs.scrollWidth-2);
  }
  tabs.addEventListener('scroll',tabsEdge,{passive:true});
  window.addEventListener('resize',tabsEdge);
  function paintTabs(){
    [].forEach.call(tabs.children,function(b,k){
      var on=k===idx;b.classList.toggle('is-on',on);
      if(on)b.setAttribute('aria-current','true');else b.removeAttribute('aria-current');
    });
    // rangee defilante : l'univers actif reste visible, sans bouger la page
    tabsEdge();
    var on=tabs.children[idx];
    if(on&&tabs.scrollWidth>tabs.clientWidth)tabs.scrollTo({left:on.offsetLeft-(tabs.clientWidth-on.offsetWidth)/2,behavior:reduce.matches?'auto':'smooth'});
  }
  function paintCount(){num.textContent=pad(idx+1);paintTabs();}
  function paintAll(){paintColor();paintCenter();paintSides();paintCount();paintGiant();layout();paintGiant();}

  function anim(el,frames,opt){return el.animate(frames,Object.assign({duration:400,easing:EASE,fill:'forwards'},opt||{}));}
  function later(fn,ms){timers.push(setTimeout(fn,ms));}
  function clearTimers(){timers.forEach(clearTimeout);timers=[];}

  // ── Transition A : changer d'univers ─────────────────────────
  function go(dir,auto,target){
    if(busy||open)return;
    if(target===idx)return;
    busy=true;
    countEl.setAttribute('aria-live',auto?'off':'polite');
    if(!auto)holdAuto();
    idx=target!=null?target:(idx+dir+N)%N;
    paintColor();                      // le fond change en meme temps (0,6 s)
    if(reduce.matches){
      anim(flip,[{opacity:1},{opacity:0}],{duration:200,easing:'linear'}).finished.then(function(){
        paintCenter();paintSides();paintGiant();paintCount();
        anim(flip,[{opacity:0},{opacity:1}],{duration:200,easing:'linear'}).finished.then(function(){
          flip.getAnimations().forEach(function(a){a.cancel();});busy=false;flushPending();
        });
      });
      return;
    }
    var out=anim(flip,[{transform:'rotateY(0deg)'},{transform:'rotateY('+(90*dir)+'deg)'}],{duration:UV_DUREE_TRANSITION/2,easing:'cubic-bezier(.65,0,1,1)'});
    // decalage vertical du nom (--uv-gy : CSS, ou px sur l'accueil a partir de 600px)
    var gy=getComputedStyle(giant).getPropertyValue('--uv-gy').trim()||'-50%';
    [giant].forEach(function(el){
      anim(el,[{opacity:1,transform:'translate(0,'+gy+')'},{opacity:0,transform:'translate('+(-6*dir)+'vw,'+gy+')'}],{duration:UV_DUREE_TRANSITION/2}).finished.then(function(){
        paintGiant();
        var gy2=getComputedStyle(giant).getPropertyValue('--uv-gy').trim()||'-50%';   // nouveau nom
        anim(el,[{opacity:0,transform:'translate('+(6*dir)+'vw,'+gy2+')'},{opacity:1,transform:'translate(0,'+gy2+')'}],{duration:UV_DUREE_TRANSITION/2,fill:'none'});
      });
    });
    [prevVy,nextVy].forEach(function(el){
      anim(el,[{opacity:1,transform:'none'},{opacity:0,transform:'translateX('+(-40*dir)+'px)'}],{duration:UV_DUREE_TRANSITION/2}).finished.then(function(){
        paintSides();
        anim(el,[{opacity:0,transform:'translateX('+(40*dir)+'px)'},{opacity:1,transform:'none'}],{duration:UV_DUREE_TRANSITION/2,fill:'none'});
      });
    });
    out.finished.then(function(){
      paintCenter();paintCount();
      var back=anim(flip,[{transform:'rotateY('+(-90*dir)+'deg)'},{transform:'rotateY(0deg)'}],{duration:UV_DUREE_TRANSITION/2,easing:'cubic-bezier(0,0,.35,1)',fill:'none'});
      out.cancel();
      back.finished.then(function(){
        [giant,prevVy,nextVy].forEach(function(el){el.getAnimations().forEach(function(a){a.cancel();});});
        busy=false;flushPending();
      });
    });
  }

  // ── Transition B : ouvrir un univers ────────────────────────
  function geometry(){
    var D=center.offsetWidth, W=sec.clientWidth, H=sec.clientHeight;
    // centre du vinyle dans la section (accueil : pas forcement au milieu)
    var cy=center.getBoundingClientRect().top-sec.getBoundingClientRect().top+D/2;
    if(mobile.matches){
      var s=.55;
      return {s:s,tx:W*.62-W/2,ty:-cy+D*s/2+84,D:D,cy:cy};
    }
    return {s:1,tx:W*.33-W/2,ty:o.fit?H/2-cy:0,D:D,cy:cy};
  }
  function fillPanel(u){
    pTitle.setAttribute('aria-label',u.nom);
    pTitle.textContent='';
    pMeta.textContent=u.origine+' · '+u.epoque;
    pText.innerHTML='';
    u.texte.split(/(?<=[.!?])\s+/).forEach(function(line){
      var sp=document.createElement('span');sp.textContent=line+' ';pText.appendChild(sp);
    });
    pInfos.innerHTML=
      '<div><dt>Origine</dt><dd>'+esc(u.origine)+'</dd></div>'+
      '<div><dt>Époque</dt><dd>'+esc(u.epoque)+'</dd></div>'+
      '<div><dt>Signature</dt><dd>'+esc(u.signature)+'</dd></div>';
    pPlay.textContent='Jouer en '+u.nom;
    sleeve.innerHTML=u.image?'<img src="'+u.image+'" alt="" data-ph="'+esc(u.nom)+'">':'<span class="uv-sleeve-ph">'+esc(u.nom)+'</span>';
  }
  function typeTitle(name,delay){
    var step=reduce.matches?0:30;
    if(!step){pTitle.textContent=name;return;}
    name.split('').forEach(function(ch,k){later(function(){pTitle.textContent+=ch;},delay+k*step);});
  }
  function openUniverse(){
    if(busy||open)return;
    busy=true;open=true;
    var u=at(idx), g=geometry();
    fillPanel(u);
    panel.hidden=false;
    sec.classList.add('is-open');
    var lines=[].slice.call(pText.children), extra=[pMeta,pInfos,pPlay.parentNode];
    lines.concat(extra).forEach(function(el){el.style.opacity=0;});
    var sleeveTo='translate('+(g.tx-g.D*g.s/2)+'px,'+g.ty+'px) scale('+g.s+')';
    var vinylTo='translate('+g.tx+'px,'+g.ty+'px) scale('+g.s+')';
    held.push(anim(ui,[{opacity:1},{opacity:0}],{duration:300}));
    held.push(anim(giant,[{opacity:1},{opacity:0}],{duration:300}));
    held.push(anim(prevVy,[{opacity:1},{opacity:0}],{duration:300}));
    held.push(anim(nextVy,[{opacity:1},{opacity:0}],{duration:300}));
    ui.style.visibility='hidden';
    if(reduce.matches){
      held.push(anim(bg,[{opacity:1},{opacity:0}],{duration:300}));
      held.push(anim(center,[{opacity:0,transform:vinylTo},{opacity:1,transform:vinylTo}],{duration:300,delay:300}));
      held.push(anim(sleeve,[{opacity:0,transform:sleeveTo},{opacity:1,transform:sleeveTo}],{duration:300,delay:300}));
      held.push(anim(panel,[{opacity:0},{opacity:1}],{duration:300,delay:300}));
      typeTitle(u.nom,0);
      lines.concat(extra).forEach(function(el){el.style.opacity=1;});
      later(done,650);
      return;
    }
    // 1. l'aplat se retracte en cercle vers le vinyle
    held.push(anim(bg,[{clipPath:'circle(150% at 50% '+g.cy+'px)'},{clipPath:'circle('+(g.D/2)+'px at 50% '+g.cy+'px)'}],{duration:500}));
    later(function(){bg.style.opacity=0;},500);
    // 2. le vinyle glisse vers la gauche en continuant de tourner
    held.push(anim(center,[{transform:'none'},{transform:vinylTo}],{duration:550,delay:450}));
    // 3. le panneau de texte apparait a droite
    held.push(anim(panel,[{opacity:0,transform:panelFrom(24)},{opacity:1,transform:panelFrom(0)}],{duration:350,delay:750}));
    typeTitle(u.nom,800);
    lines.forEach(function(el,k){later(function(){anim(el,[{opacity:0},{opacity:1}],{duration:300,easing:'ease',fill:'none'});el.style.opacity=1;},900+k*110);});
    extra.forEach(function(el,k){later(function(){anim(el,[{opacity:0},{opacity:1}],{duration:300,easing:'ease',fill:'none'});el.style.opacity=1;},900+k*90);});
    // 4. la pochette glisse depuis la gauche devant le vinyle
    held.push(anim(sleeve,[{opacity:0,transform:'translate('+(g.tx-g.D*g.s/2-sec.clientWidth*.5)+'px,'+g.ty+'px) scale('+g.s+')'},{opacity:1,transform:sleeveTo}],{duration:500,delay:900}));
    later(done,1400);
    function done(){busy=false;pTitle.focus({preventScroll:true});}
  }
  function panelFrom(px){return mobile.matches?'translateY('+px+'px)':'translate('+px+'px,-50%)';}

  // ── Transition C : fermer ────────────────────────────────────
  function closeUniverse(){
    if(busy||!open)return;
    busy=true;
    clearTimers();
    var g=geometry();
    var t1=reduce.matches?0:300, t2=reduce.matches?0:450;
    anim(panel,[{opacity:1,transform:panelFrom(0)},{opacity:0,transform:panelFrom(24)}],{duration:300});
    anim(sleeve,[{opacity:1},{opacity:0,transform:'translate('+(g.tx-g.D*g.s/2-sec.clientWidth*.5)+'px,'+g.ty+'px) scale('+g.s+')'}],{duration:300});
    later(function(){
      anim(center,[{transform:'none'}],{duration:t2||1});
      later(function(){
        bg.style.opacity=1;
        var grow=reduce.matches
          ? anim(bg,[{opacity:0,clipPath:'circle(150% at 50% 50%)'},{opacity:1,clipPath:'circle(150% at 50% 50%)'}],{duration:300})
          : anim(bg,[{clipPath:'circle('+(g.D/2)+'px at 50% '+g.cy+'px)'},{clipPath:'circle(150% at 50% '+g.cy+'px)'}],{duration:600});
        grow.finished.then(function(){
          ui.style.visibility='';
          [ui,giant,prevVy,nextVy].forEach(function(el){
            el.getAnimations().forEach(function(a){a.cancel();});
            el.animate([{opacity:0},{opacity:1}],{duration:300,easing:'ease'});
          });
          [bg,center,panel,sleeve].forEach(function(el){el.getAnimations().forEach(function(a){a.cancel();});});
          held=[];
          panel.hidden=true;sleeve.innerHTML='';
          sec.classList.remove('is-open');
          open=false;busy=false;holdAuto();
          center.focus({preventScroll:true});
        });
      },t2);
    },t1);
  }

  // ── Defilement automatique ───────────────────────────────────
  // Univers suivant toutes les 5 s, seulement quand la section est a
  // l'ecran. En pause : survol du vinyle central ou du panneau, toucher, focus clavier, univers ouvert,
  // bouton pause ; reprise apres quelques secondes d'inactivite.
  // Desactive avec prefers-reduced-motion.
  var AUTO=UV_DELAI_AUTO, RESUME=4000;
  var userPaused=false, hovering=false, kbFocus=false, holdUntil=0, lastTurn=performance.now();
  function holdAuto(){holdUntil=performance.now()+RESUME;}
  if(o.auto)setInterval(function(){
    var now=performance.now();
    if(reduce.matches||userPaused||open||!inView||document.hidden||hovering||kbFocus||now<holdUntil){lastTurn=now;return;}
    if(busy)return;   // transition en cours : le delai continue de courir
    if(now-lastTurn>=AUTO){lastTurn=now;go(1,true);}
  },100);
  // Survol : seulement le panneau ouvert (la section
  // occupe tout l'ecran, la souris y est presque toujours)
  // Survol : seulement le panneau ouvert (le vinyle central est au centre
  // de l'ecran, la souris y est souvent posee)
  if(panel){
    panel.addEventListener('mouseenter',function(){hovering=true;});
    panel.addEventListener('mouseleave',function(){hovering=false;holdAuto();});
  }
  sec.addEventListener('touchstart',holdAuto,{passive:true});
  sec.addEventListener('focusin',function(e){if(e.target.matches(':focus-visible'))kbFocus=true;});
  sec.addEventListener('focusout',function(e){if(!sec.contains(e.relatedTarget)){kbFocus=false;holdAuto();}});
  if(autoBtn)autoBtn.addEventListener('click',function(){
    userPaused=!userPaused;
    autoBtn.setAttribute('aria-pressed',String(userPaused));
    autoBtn.setAttribute('aria-label',userPaused?'Reprendre le défilement automatique':'Mettre en pause le défilement automatique');
  });

  // ── Interactions ─────────────────────────────────────────────
  sec.querySelector('.uv-arrow--prev').addEventListener('click',function(){go(-1);});
  sec.querySelector('.uv-arrow--next').addEventListener('click',function(){go(1);});
  // Clics sur les vinyles et le bouton : comportement fourni par la page
  center.addEventListener('click',function(){if(!open&&!busy&&o.onCenter)o.onCenter(at(idx));});
  prevVy.addEventListener('click',function(){if(!open&&!busy&&o.onSide)o.onSide(at(idx-1),-1);});
  nextVy.addEventListener('click',function(){if(!open&&!busy&&o.onSide)o.onSide(at(idx+1),1);});
  discover.addEventListener('click',function(){if(o.onCta){if(!busy)o.onCta(at(idx));}else openUniverse();});
  if(playNow)playNow.addEventListener('click',function(){if(!open&&!busy&&o.onCenter)o.onCenter(at(idx));});
  if(panel){
    pBack.addEventListener('click',closeUniverse);
    pPlay.addEventListener('click',function(){if(o.onCenter)o.onCenter(at(idx));});
    // Clic hors panneau (ni pochette, ni vinyle) : fermer
    sec.addEventListener('click',function(e){
      if(!open||busy)return;
      if(panel.contains(e.target)||sleeve.contains(e.target)||center.contains(e.target))return;
      closeUniverse();
    });
  }
  // Clavier : fleches quand la section est a l'ecran, Echap pour fermer
  new IntersectionObserver(function(es){inView=es[0].intersectionRatio>=.5;},{threshold:[0,.5,1]}).observe(sec);
  document.addEventListener('keydown',function(e){
    if(e.key==='Escape'&&open){closeUniverse();return;}
    if(!(o.active?o.active():inView)||open)return;
    var tag=(document.activeElement&&document.activeElement.tagName)||'';
    if(tag==='INPUT'||tag==='TEXTAREA')return;
    if(e.key==='ArrowLeft'){e.preventDefault();go(-1);}
    else if(e.key==='ArrowRight'){e.preventDefault();go(1);}
  });
  // Swipe horizontal (mobile)
  var sx=0,sy=0,tracking=false;
  sec.addEventListener('touchstart',function(e){if(open||(o.active&&!o.active()))return;tracking=true;sx=e.touches[0].clientX;sy=e.touches[0].clientY;},{passive:true});
  sec.addEventListener('touchend',function(e){
    if(!tracking)return;tracking=false;
    var dx=e.changedTouches[0].clientX-sx, dy=e.changedTouches[0].clientY-sy;
    if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)*1.3)go(dx<0?1:-1);
  },{passive:true});

  bg.style.transitionDuration=UV_DUREE_TRANSITION+'ms';
  paintAll();
  return {
    current:function(){return at(idx);},
    index:function(){return idx;},
    // Place le carrousel sur un univers, sans animation
    setIndex:function(k){
      if(open)return;
      [flip,giant,prevVy,nextVy].forEach(function(el){el.getAnimations().forEach(function(a){a.cancel();});});
      busy=false;pending=null;idx=(k+N)%N;paintAll();
    },
    inView:function(){return inView;},
    go:function(dir){go(dir);}
  };
}

// ── Section 03 de la landing ─────────────────────────────────────
(function(){
  var sec=document.getElementById('univers');
  if(!sec)return;
  // Clic sur un vinyle (ou "Jouer en ..." du panneau) : parcours, ecran
  // Son-nom avec cet univers preselectionne
  function playIn(u){if(window.SonaraFlow)SonaraFlow.toSonnom(u.slug);}
  window.uvLanding=uvCarrousel(sec,{auto:true,panel:true,fit:true,play:true,cta:'Découvrir',onCenter:playIn,onSide:playIn});
})();
