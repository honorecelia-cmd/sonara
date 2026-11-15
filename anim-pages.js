// ═══════════════════════════════════════════════════════════════
// SONARA : animations des pages A propos, Comment jouer et pages legales
// Meme langage que l'accueil : 500 ms (UV_DUREE_TRANSITION, univers.js),
// courbe cubic-bezier(.65,0,.35,1). Styles : landing.css, bloc
// "Animations des pages". Charge dans le <head> (avant le premier rendu,
// pour l'evenement pagereveal des transitions entre documents).
// 1. Transition entre pages : disque de la page d'arrivee ouvert depuis le
//    point clique (View Transitions ; sans prise en charge : rien ne change)
//    - sonara.html : nbPages.go(maj, origine), appele par landing.js
//    - pages legales : @view-transition (landing.css) + pagereveal
// 2. Entree d'une page : libelle, titre ligne par ligne derriere un
//    masque, puis les blocs en decale (80 ms) ; plus bas : a leur arrivee
//    a l'ecran (une seule fois)
// 3. Comment jouer : rebond des numeros d'etapes, chiffres des points
//    qui defilent (rouleaux)
// 4. A propos : mots de la mission reveles un par un
// N'anime que transform, opacity et clip-path. prefers-reduced-motion :
// un simple fondu.
// ═══════════════════════════════════════════════════════════════
(function(){
  'use strict';
  var DUREE=500, EASE='cubic-bezier(.65,0,.35,1)', PAS=80, MONTEE=24;
  var root=document.documentElement;
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
  var canAnim=typeof Element!=='undefined'&&'animate' in Element.prototype;

  // Contenu masque jusqu'a l'entree (evite un affichage puis un masquage).
  // Filet de securite : tout s'affiche apres 2 s quoi qu'il arrive.
  if(canAnim){
    root.classList.add('ap-wait');
    setTimeout(function(){root.classList.remove('ap-wait');},2000);
  }

  // ── 1. Transition : disque ouvert depuis le point clique ──
  function rayon(x,y){
    var w=window.innerWidth,h=window.innerHeight;
    return Math.ceil(Math.hypot(Math.max(x,w-x),Math.max(y,h-y)));
  }
  function ouvre(vt,pt){
    if(reduce.matches)return;   // fondu enchaine par defaut du navigateur
    var x=pt?pt.x:window.innerWidth/2, y=pt?pt.y:window.innerHeight/2;
    vt.ready.then(function(){
      root.animate({clipPath:['circle(0px at '+x+'px '+y+'px)','circle('+rayon(x,y)+'px at '+x+'px '+y+'px)']},
        {duration:DUREE,easing:EASE,pseudoElement:'::view-transition-new(root)'});
    }).catch(function(){});
  }
  // Point d'origine : la souris ou le doigt ; au clavier, le centre de
  // l'element active
  function origine(e){
    if(!e)return null;
    if(e.detail===0||(!e.clientX&&!e.clientY)){
      var el=e.target&&e.target.closest&&e.target.closest('a,button');
      if(!el)return null;
      var r=el.getBoundingClientRect();
      return {x:r.left+r.width/2,y:r.top+r.height/2};
    }
    return {x:e.clientX,y:e.clientY};
  }
  // Meme document (vues de sonara.html) : maj() change la vue affichee
  function go(maj,e){
    if(!document.startViewTransition||document.visibilityState!=='visible'){maj();return;}
    var vt=document.startViewTransition(function(){enCours=true;maj();});
    ouvre(vt,origine(e));
    vt.finished.then(fin,fin);
  }
  var enCours=false;
  function fin(){enCours=false;}
  // Entre documents : le point clique passe par sessionStorage
  var CLE='sn-vt-pt';
  document.addEventListener('click',function(e){
    var pt=origine(e);
    if(!pt)return;
    try{sessionStorage.setItem(CLE,JSON.stringify({x:pt.x/window.innerWidth,y:pt.y/window.innerHeight,t:Date.now()}));}catch(err){}
  },true);
  window.addEventListener('pagereveal',function(e){
    if(!e.viewTransition)return;
    var pt=null;
    try{
      var s=JSON.parse(sessionStorage.getItem(CLE)||'null');
      sessionStorage.removeItem(CLE);
      if(s&&Date.now()-s.t<5000)pt={x:s.x*window.innerWidth,y:s.y*window.innerHeight};
    }catch(err){}
    enCours=true;
    ouvre(e.viewTransition,pt);
    e.viewTransition.finished.then(fin,fin);
  });

  // ── 2. Entree d'une page ──
  var page=null, anims=[], io=null, split=null;
  function anime(el,kf,opts){
    var a=el.animate(kf,{duration:opts.duration||DUREE,delay:opts.delay||0,easing:opts.easing||EASE,fill:opts.fill||'backwards'});
    anims.push(a);
    return a;
  }
  // Titre : chaque ligne dans un masque ; texte d'origine remis a la fin
  // (la coupure des lignes redevient libre au redimensionnement)
  function decoupe(h){
    var txt=h.textContent, mots=txt.split(' '), spans=[];
    h.textContent='';
    mots.forEach(function(m,k){
      var s=document.createElement('span');s.textContent=m;h.appendChild(s);spans.push(s);
      if(k<mots.length-1)h.appendChild(document.createTextNode(' '));
    });
    var lignes=[], top=null;
    spans.forEach(function(s){
      var t=s.offsetTop;
      if(top===null||Math.abs(t-top)>2){lignes.push([]);top=t;}
      lignes[lignes.length-1].push(s.textContent);
    });
    h.textContent='';
    h.classList.add('ap-split');   // apres la mesure des lignes
    var ins=lignes.map(function(l){
      var o=document.createElement('span');o.className='ap-line';
      var i=document.createElement('span');i.className='ap-line-in';i.textContent=l.join(' ');
      o.appendChild(i);h.appendChild(o);
      return i;
    });
    return {h:h,txt:txt,ins:ins};
  }
  function recolle(){if(split){split.h.textContent=split.txt;split.h.classList.remove('ap-split');split=null;}}

  // Blocs de chaque page, dans l'ordre de lecture
  function blocs(p){
    if(p.id==='a-propos')return p.querySelectorAll('.nb-ap-story > *, .nb-ap-mission > h2, .nb-ap-mission .nb-phrase > span, .nb-page-cta');
    if(p.id==='comment-jouer')return p.querySelectorAll('.nb-cj-h, .nb-cj-steps > li, .nb-cj-rules > *, .nb-cj-points > h2, .nb-s04-pts > li, .nb-page-cta');
    return p.querySelectorAll('.lg-update, .lg-main > :not(.nb-page-head)');
  }
  var legal=function(p){return p.classList.contains('lg-main');};

  // Animation propre a chaque bloc ; d : delai en ms
  function joue(el,d){
    el.classList.remove('ap-h');
    if(reduce.matches){anime(el,[{opacity:0},{opacity:1}],{delay:0,duration:400});return;}
    if(legal(page)){anime(el,[{opacity:0},{opacity:1}],{delay:d});return;}
    // Mots de la mission : montent derriere leur masque
    var mot=el.querySelector(':scope > .ap-line-in');
    if(mot){anime(mot,[{transform:'translateY(140%)'},{transform:'none'}],{delay:d,duration:DUREE+100});return;}
    anime(el,[{opacity:0,transform:'translateY('+MONTEE+'px)'},{opacity:1,transform:'none'}],{delay:d});
    // Etapes : petit rebond du numero
    var num=el.parentNode.classList.contains('nb-cj-steps')&&el.querySelector('span');
    if(num)anime(num,[{transform:'scale(.4)'},{transform:'scale(1.18)',offset:.55},{transform:'scale(.94)',offset:.8},{transform:'none'}],{delay:d+180,easing:'ease-out'});
    // Points : rouleaux des chiffres
    [].forEach.call(el.querySelectorAll('.ap-reel'),function(r,k){
      var n=+r.getAttribute('data-n');
      anime(r,[{transform:'translateY(0)'},{transform:'translateY('+(-(10+n)*5)+'%)'}],{delay:d+200+k*90,duration:DUREE*2,fill:'both'});
    });
  }
  // Ecart avant le bloc suivant : les mots de la mission, un par un
  function pas(el){return el.querySelector(':scope > .ap-line-in')?140:PAS;}

  // Preparation unique : masques des mots de la mission, rouleaux des points
  function prepare(p){
    if(p.getAttribute('data-ap-ok'))return;
    p.setAttribute('data-ap-ok','1');
    if(reduce.matches)return;
    [].forEach.call(p.querySelectorAll('.nb-ap-mission .nb-phrase > span'),function(s){
      var i=document.createElement('span');i.className='ap-line-in';i.textContent=s.textContent;
      s.textContent='';s.classList.add('ap-line');s.appendChild(i);
      s.parentNode.classList.add('ap-split');
    });
    // Chaque chiffre : un rouleau 0 a 9 deux fois, arrete sur sa valeur.
    // Largeur fixe (chiffres tabulaires) : aucun decalage du texte.
    [].forEach.call(p.querySelectorAll('.nb-cnt'),function(c){
      var v=c.textContent;
      c.setAttribute('aria-label',v);c.textContent='';
      v.split('').forEach(function(ch){
        if(!/\d/.test(ch)){var t=document.createElement('span');t.setAttribute('aria-hidden','true');t.textContent=ch;c.appendChild(t);return;}
        var cell=document.createElement('span');cell.className='ap-digit';cell.setAttribute('aria-hidden','true');
        var reel=document.createElement('span');reel.className='ap-reel';reel.setAttribute('data-n',ch);
        for(var k=0;k<20;k++){var d=document.createElement('span');d.textContent=k%10;reel.appendChild(d);}
        cell.appendChild(reel);c.appendChild(cell);
      });
    });
  }

  function quitte(){
    anims.forEach(function(a){try{a.cancel();}catch(e){}});
    anims=[];
    if(io){io.disconnect();io=null;}
    recolle();
    if(page)[].forEach.call(page.querySelectorAll('.ap-h'),function(el){el.classList.remove('ap-h');});
    page=null;
  }

  // Entree de la page p. Pendant une transition (et au chargement, ou le
  // disque peut s'ouvrir) : le disque s'ouvre d'abord un peu.
  var auChargement=true;
  function enter(p){
    quitte();
    root.classList.remove('ap-wait');
    if(!p||!canAnim)return;
    page=p;
    prepare(p);
    var t0=(enCours||auChargement)?150:0;
    auChargement=false;
    var label=p.querySelector('.nb-page-head > .nb-label'), h=p.querySelector('.nb-page-t');
    // blocs affiches seulement (l'icone des regles est masquee sur mobile)
    var bs=[].slice.call(blocs(p)).filter(function(el){return el.getClientRects().length;});
    if(reduce.matches){
      [label,h].concat(bs).forEach(function(el){if(el)anime(el,[{opacity:0},{opacity:1}],{delay:t0,duration:400});});
      return;
    }
    // Vinyle d'A propos : apparait en grandissant, jusqu'a son opacite (CSS)
    var vy=p.querySelector('.nb-ap-vy');
    if(vy)anime(vy,[{opacity:0,transform:'scale(.9)'}],{delay:t0,duration:DUREE*2});
    if(label)anime(label,[{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'none'}],{delay:t0});
    var tBlocs=t0+200;
    if(h){
      split=decoupe(h);
      var last=null;
      split.ins.forEach(function(i,k){last=anime(i,[{transform:'translateY(140%)'},{transform:'none'}],{delay:t0+120+k*PAS,duration:DUREE+150});});
      tBlocs=t0+120+(split.ins.length-1)*PAS+350;
      var s=split;
      if(last)last.finished.then(function(){if(split===s)recolle();},function(){});
    }
    // Blocs : masques, puis reveles a leur arrivee a l'ecran. Ceux deja a
    // l'ecran au depart suivent le titre.
    bs.forEach(function(el){el.classList.add('ap-h');});
    var premier=true;
    if(!('IntersectionObserver' in window)){var d=tBlocs;bs.forEach(function(el){joue(el,d);d+=pas(el);});return;}
    io=new IntersectionObserver(function(es){
      var d=premier?tBlocs:0;
      premier=false;
      es.filter(function(e){return e.isIntersecting;})
        .sort(function(a,b){return bs.indexOf(a.target)-bs.indexOf(b.target);})
        .forEach(function(e){io.unobserve(e.target);joue(e.target,d);d+=pas(e.target);});
    },{threshold:0,rootMargin:'0px 0px -40px 0px'});
    bs.forEach(function(el){io.observe(el);});
  }

  // Au chargement : la page affichee (vue de sonara.html ou page legale)
  document.addEventListener('DOMContentLoaded',function(){
    enter(document.querySelector('.nb-page:not([hidden]), .lg-main'));
  });

  window.nbPages={go:go,enter:enter,leave:function(){quitte();root.classList.remove('ap-wait');}};
})();
