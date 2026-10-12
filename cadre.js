// ═══════════════════════════════════════════════════════════════
// SONARA, couleur de la barre du navigateur (meta theme-color) assortie
// au haut de l'ecran affiche. Affichage seulement. Voir cadre.css.
// ═══════════════════════════════════════════════════════════════
(function(){
  'use strict';
  var meta=document.querySelector('meta[name="theme-color"]');
  if(!meta)return;
  var SOMBRE='#120706', DEGRADE='#860100', LANDING='#200000';
  function couleur(){
    var on=document.querySelector('.page.on')||document.getElementById('landing');
    if(!on||on.id==='landing')return LANDING;
    if(on.id==='s-game'){
      var cd=document.querySelector('#cds.on,#brksc.on');
      return cd?DEGRADE:SOMBRE;
    }
    if(on.id==='s-lobby')return SOMBRE;
    return DEGRADE;   // parcours, preparation, resultats : degrade du hero
  }
  function maj(){var c=couleur();if(meta.content!==c)meta.content=c;}
  var obs=new MutationObserver(maj);
  [].forEach.call(document.querySelectorAll('.page,#cds,#brksc'),function(el){
    obs.observe(el,{attributes:true,attributeFilter:['class']});
  });
  maj();
})();
