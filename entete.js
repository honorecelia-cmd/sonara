// ═══════════════════════════════════════════════════════════════
// SONARA : en-tete et footer communs (accueil et vues A propos / Comment
// jouer de sonara.html, pages legales). Memes balises partout, styles dans
// landing.css.
// 1. Menu deroulant de l'en-tete (mobile)
// 2. Hors de l'accueil : "Jouer" et "Entre proches" menent au jeu
// 3. "SONARA" du footer : monte lettre par lettre a son arrivee a l'ecran
// Sur l'accueil, landing.js gere "Jouer" (parcours) et ferme le menu via
// window.nbCloseMenus.
// ═══════════════════════════════════════════════════════════════
(function(){
  'use strict';
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)');

  // ── 1. Menu deroulant ──
  var menuBtns=document.querySelectorAll('.nb-menu-btn');
  function closeMenus(refocus){
    menuBtns.forEach(function(btn){
      if(btn.getAttribute('aria-expanded')!=='true')return;
      btn.setAttribute('aria-expanded','false');
      document.getElementById(btn.getAttribute('aria-controls')).hidden=true;
      if(refocus)btn.focus();
    });
  }
  window.nbCloseMenus=closeMenus;
  menuBtns.forEach(function(btn){
    btn.addEventListener('click',function(){
      var open=btn.getAttribute('aria-expanded')==='true';
      closeMenus();
      if(!open){
        btn.setAttribute('aria-expanded','true');
        var list=document.getElementById(btn.getAttribute('aria-controls'));
        list.hidden=false;
        list.querySelector('button,a').focus();
      }
    });
  });
  document.addEventListener('click',function(e){if(!e.target.closest('.nb-menu'))closeMenus();});
  document.addEventListener('keydown',function(e){if(e.key==='Escape')closeMenus(true);});

  // ── 2. Pages hors accueil : le parcours demarre sur l'accueil ──
  // (landing.js lit /#jouer et /#entre-proches au chargement)
  if(!document.getElementById('landing')){
    document.addEventListener('click',function(e){
      var b=e.target.closest('[data-nb-play],[data-nb-proches]');
      if(!b)return;
      location.href=b.hasAttribute('data-nb-play')?'/#jouer':'/#entre-proches';
    });
  }

  // ── 3. "SONARA" du footer ──
  // Sans animation (prefers-reduced-motion) : le mot reste affiche. Declenche
  // des qu'une partie est visible : un seuil en proportion n'est pas toujours
  // atteint (bas du mot coupe par la carte, mot petit sur mobile).
  if(reduce.matches)return;
  document.documentElement.classList.add('nb-anim');
  var words=document.querySelectorAll('.nb-ft-word');
  if(!('IntersectionObserver' in window)){[].forEach.call(words,function(el){el.classList.add('is-in');});return;}
  var io=new IntersectionObserver(function(es){
    es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('is-in');io.unobserve(e.target);}});
  },{threshold:0});
  [].forEach.call(words,function(el){io.observe(el);});
})();
