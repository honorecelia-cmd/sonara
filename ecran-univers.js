// ═══════════════════════════════════════════════════════════════
// SONARA, parcours avant la partie (#s-parcours), etape 1 : "Choisis ton
// univers". Reutilise le composant de la section 03 de la landing
// (uvCarrousel, univers.js) avec ses options propres au jeu.
// Porte aussi l'etat du parcours avant la partie (window.SonaraFlow),
// complete par ecran-sonnom.js. Charge apres sonara.js et univers.js.
// ═══════════════════════════════════════════════════════════════
(function(){
  'use strict';
  var scr=document.getElementById('s-parcours');
  if(!scr||typeof uvCarrousel==='undefined')return;
  var $=function(id){return document.getElementById(id);};
  var N=UNIVERS.length;
  var MODES={solo:'Solo',multi:'Multijoueur',entre:'Entre proches'};

  // Etat du parcours en cours
  // theme : slug de l'univers ; mode : solo, multi ou entre ;
  // preset : mode deja choisi ailleurs (menu Mode de la landing) ;
  // shared : univers impose par un lien "Entre proches" recu
  var flow={theme:null, mode:'solo', preset:null, shared:false};

  function idxOf(slug){for(var k=0;k<N;k++)if(UNIVERS[k].slug===slug)return k;return 0;}
  function onScreen(id){return !!(window.G&&G.page===id);}

  // ═══════════════════ 1. CHOISIS TON UNIVERS ═══════════════════
  // Composant de la section 03 de la landing, sans defilement automatique
  // ni panneau : c'est le joueur qui choisit.
  var car=uvCarrousel($('pc-uv'),{
    auto:false, panel:false,
    cta:'Choisir cet univers', ctaLabel:'Choisir l\'univers ', centerLabel:'Choisir l\'univers ',
    onCenter:pick, onCta:pick,
    onSide:function(u,dir){car.go(dir);},
    active:function(){return onScreen('s-parcours')&&scr.getAttribute('data-step')==='1';}
  });
  $('pc-home').addEventListener('click',function(){showPage('landing');});

  function pick(u){
    flow.theme=u.slug;
    flow.shared=false;
    if(SonaraFlow.showSonnom)SonaraFlow.showSonnom();
  }

  // Etape 1 du parcours, sur l'univers du parcours en cours ou le premier
  function showUnivers(){
    car.setIndex(flow.theme?idxOf(flow.theme):0);
    scr.setAttribute('data-step','1');
    if(!onScreen('s-parcours'))showPage('s-parcours');
    $('pc-t1').focus({preventScroll:true});
  }

  // ═══════════════════ ENTREES DU PARCOURS ═══════════════════
  var SonaraFlow=window.SonaraFlow={
    state:flow,
    modes:MODES,
    indexOf:idxOf,
    showUnivers:showUnivers,
    showSonnom:null,                 // fourni par ecran-sonnom.js
    // Tous les "Jouer" de la landing. opts.mode : mode choisi dans le menu
    // Mode ; opts.theme : univers affiche dans la section 03 (preselection).
    toUnivers:function(opts){
      flow.preset=opts&&MODES[opts.mode]?opts.mode:null;
      flow.mode=flow.preset||'solo';
      // Lien "Entre proches" recu : l'univers est deja choisi
      if(window.G&&G._sharedTheme&&THEMES[G._sharedTheme]&&SonaraFlow.showSonnom){
        flow.theme=G._sharedTheme;flow.shared=true;
        SonaraFlow.showSonnom();
        return;
      }
      flow.theme=opts&&opts.theme&&THEMES[opts.theme]?opts.theme:null;
      flow.shared=false;
      showUnivers();
    },
    // Clic sur un vinyle de la landing : univers preselectionne
    toSonnom:function(slug){
      flow.preset=null;flow.mode='solo';flow.shared=false;
      flow.theme=slug;
      if(SonaraFlow.showSonnom)SonaraFlow.showSonnom();
      else showUnivers();
    }
  };
})();
