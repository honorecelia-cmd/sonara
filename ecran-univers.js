// ═══════════════════════════════════════════════════════════════
// SONARA, ecran "Choix de l'univers" (#s-univers, refait avec le kit)
// Carrousel de vinyles comme la landing : memes donnees UNIVERS, meme
// vinyle (uvVinyl) et memes reglages UV_* (univers.js).
// Porte aussi l'etat du parcours avant la partie (window.SonaraFlow),
// complete par ecran-sonnom.js. Charge apres sonara.js et univers.js.
// ═══════════════════════════════════════════════════════════════
(function(){
  'use strict';
  var scrU=document.getElementById('s-univers');
  if(!scrU||typeof UNIVERS==='undefined')return;
  var $=function(id){return document.getElementById(id);};
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
  var EASE='cubic-bezier(.65,0,.35,1)';
  var N=UNIVERS.length;
  var MODES={solo:'Solo',multi:'Multijoueur',entre:'Entre proches'};

  // Etat du parcours en cours
  // theme : slug de l'univers ; mode : solo, multi ou entre ;
  // preset : mode deja choisi ailleurs (menu Mode de la landing) ;
  // shared : univers impose par un lien "Entre proches" recu
  var flow={theme:null, mode:'solo', preset:null, shared:false};

  function idxOf(slug){for(var k=0;k<N;k++)if(UNIVERS[k].slug===slug)return k;return 0;}
  function onScreen(id){return !!(window.G&&G.page===id);}

  // ═══════════════════ 1. CHOIX DE L'UNIVERS ═══════════════════
  var stage=$('cu-stage'), center=$('cu-center'), flip=$('cu-flip');
  var prevVy=$('cu-prev-vy'), nextVy=$('cu-next-vy'), nameEl=$('cu-name');
  var idx=0, busy=false, autoOn=false, lastTurn=0;

  function at(k){return UNIVERS[(k+N)%N];}
  function paintCenter(){
    var u=at(idx);
    flip.innerHTML=uvVinyl(u,true);
    center.setAttribute('aria-label','Choisir l\'univers '+u.nom);
  }
  function paintSides(){
    prevVy.innerHTML=uvVinyl(at(idx-1),false);
    nextVy.innerHTML=uvVinyl(at(idx+1),false);
    prevVy.setAttribute('aria-label','Univers précédent : '+at(idx-1).nom);
    nextVy.setAttribute('aria-label','Univers suivant : '+at(idx+1).nom);
  }
  function paintName(){nameEl.textContent=at(idx).nom;}
  function paintAll(){paintCenter();paintSides();paintName();}
  function anim(el,frames,opt){return el.animate(frames,Object.assign({duration:400,easing:EASE,fill:'forwards'},opt||{}));}

  // Changer d'univers : meme pivot du disque que sur la landing
  function go(dir){
    if(busy)return;
    busy=true;
    idx=(idx+dir+N)%N;
    var half=UV_DUREE_TRANSITION/2;
    if(reduce.matches){
      anim(flip,[{opacity:1},{opacity:0}],{duration:150,easing:'linear'}).finished.then(function(){
        paintAll();
        anim(flip,[{opacity:0},{opacity:1}],{duration:150,easing:'linear'}).finished.then(function(){
          flip.getAnimations().forEach(function(a){a.cancel();});busy=false;
        });
      });
      return;
    }
    var out=anim(flip,[{transform:'rotateY(0deg)'},{transform:'rotateY('+(90*dir)+'deg)'}],{duration:half,easing:'cubic-bezier(.65,0,1,1)'});
    anim(nameEl,[{opacity:1},{opacity:0}],{duration:half}).finished.then(function(){
      paintName();
      anim(nameEl,[{opacity:0},{opacity:1}],{duration:half,fill:'none'});
    });
    [prevVy,nextVy].forEach(function(el){
      anim(el,[{opacity:1,transform:'none'},{opacity:0,transform:'translateX('+(-40*dir)+'px)'}],{duration:half}).finished.then(function(){
        paintSides();
        anim(el,[{opacity:0,transform:'translateX('+(40*dir)+'px)'},{opacity:1,transform:'none'}],{duration:half,fill:'none'});
      });
    });
    out.finished.then(function(){
      paintCenter();
      var back=anim(flip,[{transform:'rotateY('+(-90*dir)+'deg)'},{transform:'rotateY(0deg)'}],{duration:half,easing:'cubic-bezier(0,0,.35,1)',fill:'none'});
      out.cancel();
      back.finished.then(function(){
        [nameEl,prevVy,nextVy].forEach(function(el){el.getAnimations().forEach(function(a){a.cancel();});});
        busy=false;
      });
    });
  }

  // Defilement automatique : un univers toutes les UV_DELAI_AUTO ms, arrete
  // pour de bon des que l'utilisateur touche, survole, clique ou utilise
  // les fleches. Desactive avec prefers-reduced-motion.
  function stopAuto(){autoOn=false;}
  setInterval(function(){
    var now=performance.now();
    if(!autoOn||busy||!onScreen('s-univers')||document.hidden||reduce.matches){lastTurn=now;return;}
    if(now-lastTurn>=UV_DELAI_AUTO){lastTurn=now;go(1);}
  },100);
  scrU.addEventListener('pointerdown',stopAuto);
  scrU.addEventListener('touchstart',stopAuto,{passive:true});
  // Survol : un vrai mouvement de souris sur le carrousel ou le bouton (le
  // survol "fantome" d'un curseur immobile au changement d'ecran ne compte pas)
  var moved=0;
  function hover(e){
    if(e.pointerType!=='mouse')return;
    moved+=Math.abs(e.movementX||0)+Math.abs(e.movementY||0);
    if(moved>6)stopAuto();
  }
  stage.addEventListener('pointermove',hover);
  $('cu-choose').addEventListener('pointermove',hover);

  // Interactions : fleches, clic sur un voisin, clic sur le vinyle centre, bouton
  scrU.querySelector('.cu-arrow--prev').addEventListener('click',function(){stopAuto();go(-1);});
  scrU.querySelector('.cu-arrow--next').addEventListener('click',function(){stopAuto();go(1);});
  prevVy.addEventListener('click',function(){stopAuto();go(-1);});
  nextVy.addEventListener('click',function(){stopAuto();go(1);});
  center.addEventListener('click',pick);
  $('cu-choose').addEventListener('click',pick);
  $('cu-home').addEventListener('click',function(){stopAuto();showPage('landing');});
  // Clavier : fleches gauche et droite sur l'ecran
  document.addEventListener('keydown',function(e){
    if(!onScreen('s-univers'))return;
    var tag=(document.activeElement&&document.activeElement.tagName)||'';
    if(tag==='INPUT'||tag==='TEXTAREA')return;
    if(e.key==='ArrowLeft'){e.preventDefault();stopAuto();go(-1);}
    else if(e.key==='ArrowRight'){e.preventDefault();stopAuto();go(1);}
  });
  // Swipe horizontal
  var sx=0,sy=0,tracking=false;
  stage.addEventListener('touchstart',function(e){tracking=true;sx=e.touches[0].clientX;sy=e.touches[0].clientY;},{passive:true});
  stage.addEventListener('touchend',function(e){
    if(!tracking)return;tracking=false;
    var dx=e.changedTouches[0].clientX-sx, dy=e.changedTouches[0].clientY-sy;
    if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)*1.3)go(dx<0?1:-1);
  },{passive:true});

  function pick(){
    if(busy)return;
    stopAuto();
    flow.theme=at(idx).slug;
    flow.shared=false;
    if(SonaraFlow.showSonnom)SonaraFlow.showSonnom();
  }

  // fresh : arrivee depuis la landing (defilement automatique relance)
  function showUnivers(fresh){
    if(flow.theme)idx=idxOf(flow.theme);
    else if(fresh)idx=0;
    flip.getAnimations().forEach(function(a){a.cancel();});
    busy=false;
    paintAll();
    showPage('s-univers');
    autoOn=!!fresh&&!reduce.matches;
    moved=0;
    lastTurn=performance.now();
    $('cu-t').focus({preventScroll:true});
  }

  // ═══════════════════ ENTREES DU PARCOURS ═══════════════════
  var SonaraFlow=window.SonaraFlow={
    state:flow,
    modes:MODES,
    indexOf:idxOf,
    showUnivers:showUnivers,
    showSonnom:null,                 // fourni par ecran-sonnom.js
    // Tous les "Jouer" de la landing. opts.mode : mode choisi dans le menu Mode.
    toUnivers:function(opts){
      flow.preset=opts&&MODES[opts.mode]?opts.mode:null;
      flow.mode=flow.preset||'solo';
      // Lien "Entre proches" recu : l'univers est deja choisi
      if(window.G&&G._sharedTheme&&THEMES[G._sharedTheme]&&SonaraFlow.showSonnom){
        flow.theme=G._sharedTheme;flow.shared=true;
        SonaraFlow.showSonnom();
        return;
      }
      flow.theme=null;flow.shared=false;
      showUnivers(true);
    },
    // Clic sur un vinyle de la landing : univers preselectionne
    toSonnom:function(slug){
      flow.preset=null;flow.mode='solo';flow.shared=false;
      flow.theme=slug;
      if(SonaraFlow.showSonnom)SonaraFlow.showSonnom();
      else showUnivers(false);
    }
  };
})();
