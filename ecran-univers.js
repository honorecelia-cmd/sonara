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
  var MODES={solo:'Solo',multi:'Entre proches',defi:'Défi'};

  // Etat du parcours en cours
  // theme : slug de l'univers ; mode : solo, multi ou defi ;
  // preset : mode deja choisi ailleurs (menu Mode de la landing) ;
  // shared : univers impose par un lien de Defi recu
  var flow={theme:null, mode:'solo', preset:null, shared:false};

  function idxOf(slug){for(var k=0;k<N;k++)if(UNIVERS[k].slug===slug)return k;return 0;}
  function onScreen(id){return !!(window.G&&G.page===id);}

  // ═══════════════════ 1. CHOISIS TON UNIVERS ═══════════════════
  // Composant de la section 03 de la landing, sans defilement automatique
  // ni panneau : c'est le joueur qui choisit.
  var car=uvCarrousel($('pc-uv'),{
    auto:false, panel:false, neutral:true,
    cta:'Choisir cet univers', ctaLabel:'Choisir l\'univers ', centerLabel:'Choisir l\'univers ',
    onCenter:pick, onCta:pick,
    onSide:function(u,dir){car.go(dir);},
    active:function(){return onScreen('s-parcours')&&scr.getAttribute('data-step')==='1';}
  });
  $('pc-home').addEventListener('click',function(){
    // Choix pour le groupe abandonne : retour aux resultats
    if(flow.group){var g=flow.group;endGroup();g.cancel();return;}
    showPage('landing');
  });
  var step1=document.querySelector('.pc-head--1 .pc-step'), STEP1=step1?step1.textContent:'';
  function endGroup(){flow.group=null;if(step1)step1.textContent=STEP1;$('pc-home').lastChild.textContent='Accueil';}

  $('pc-code').addEventListener('click',function(){showPage('s-join');});
  function pick(u){
    if(flow.group){var g=flow.group;endGroup();g.pick(u.slug);return;}
    flow.theme=u.slug;
    flow.shared=false;
    if(SonaraFlow.showSonnom)SonaraFlow.showSonnom();
  }

  // Etape 1 du parcours, sur l'univers du parcours en cours ou le premier
  function showUnivers(){
    car.setIndex(flow.theme?idxOf(flow.theme):0);
    // Entre proches : "J'ai un code" sans passer par le choix d'univers
    $('pc-code').hidden=flow.mode!=='multi'||!!flow.group;
    // Entre proches : le nom du mode remplace le compteur d'etapes (le
    // parcours par code n'a pas le meme nombre d'ecrans)
    if(!flow.group&&step1)step1.textContent=flow.proches?'Entre proches':STEP1;
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
    // Aplat et nom geant de l'univers choisi (etape 2)
    setIndexFor:function(slug){car.setIndex(idxOf(slug));},
    showSonnom:null,                 // fourni par ecran-sonnom.js
    // Fin de partie en groupe : l'hote choisit l'univers de la partie suivante
    chooseForGroup:function(slug,onPick,onCancel){
      flow.invite=null;flow.proches=false;flow.theme=THEMES[slug]?slug:flow.theme;
      flow.group={pick:onPick,cancel:onCancel};
      if(step1)step1.textContent='Prochaine partie du groupe';
      $('pc-home').lastChild.textContent='Retour';
      showUnivers();
    },
    // Lien d'invitation : univers de la salle, son-nom, puis la salle
    toInvite:function(code,slug,info){
      endGroup();
      flow.invite=code;flow.theme=slug;flow.mode='multi';flow.preset=null;flow.shared=false;flow.proches=false;
      flow.inviteInfo=info||null;   // son-nom de l'hote et joueurs deja dans la salle
      if(SonaraFlow.showSonnom)SonaraFlow.showSonnom();
    },
    // Tous les "Jouer" de la landing. opts.mode : mode choisi dans le menu
    // Mode ; opts.theme : univers affiche dans la section 03 (preselection).
    toUnivers:function(opts){
      flow.invite=null;endGroup();
      if(opts&&opts.mode==='entre')opts.mode='defi';   // ancien nom interne du Defi
      flow.preset=opts&&MODES[opts.mode]?opts.mode:null;
      flow.mode=flow.preset||'solo';
      flow.proches=!!(opts&&opts.proches);   // "Jouer avec mes proches" : mode deja dit par le bouton
      // Lien de Defi recu : l'univers est deja choisi
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
      flow.invite=null;endGroup();
      flow.preset=null;flow.mode='solo';flow.shared=false;flow.proches=false;
      flow.theme=slug;
      if(SonaraFlow.showSonnom)SonaraFlow.showSonnom();
      else showUnivers();
    }
  };
})();
