// ═══════════════════════════════════════════════════════════════
// SONARA — landing (refonte d'apres la maquette Nebula)
// 1. "Jouer" : vers le choix de l'univers (ecrans.js) ; menu : entete.js
// 4 a 6. Animations des anciennes sections et du footer ; 7. Vues
// Spec : nebula-analyse-pour-sonara.md
// ═══════════════════════════════════════════════════════════════
(function(){
  'use strict';
  var landing=document.getElementById('landing');
  if(!landing)return;
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)');

  // ── 1. Parcours : "Jouer" mene au choix de l'univers (ecrans.js) ──
  // Un univers affiche dans la section 03 (a l'ecran) est preselectionne
  function play(opts){
    closeMenus();
    opts=opts||{};
    // Depuis /a-propos ou /comment-jouer : le parcours (et le retour a
    // l'accueil apres la partie) repart de l'adresse de l'accueil
    if(vue!=='accueil'){try{history.replaceState(null,'','/');}catch(e){}setVue('accueil');entre();}
    if(window.uvLanding&&uvLanding.inView())opts.theme=uvLanding.current().slug;
    if(window.SonaraFlow)SonaraFlow.toUnivers(opts);
  }
  landing.addEventListener('click',function(e){
    var t=e.target;
    if(t.closest('[data-nb-play]'))play(null);
    else if(t.closest('[data-nb-proches]'))play({mode:'multi',proches:true});
  });
  // Menu deroulant de l'en-tete (et Echap, clic ailleurs) : entete.js,
  // commun avec les pages legales
  function closeMenus(refocus){if(window.nbCloseMenus)nbCloseMenus(refocus);}

  // ── 4. Satellites : vitesse propre a chacun (0.8x a 1.2x) ──
  var sats=[].slice.call(landing.querySelectorAll('[data-speed]'));
  var fxTicking=false;
  function fx(){
    fxTicking=false;
    if(landing.offsetParent===null)return;
    var vh=window.innerHeight, still=reduce.matches;
    sats.forEach(function(el){
      if(still||!el.offsetParent){el.style.transform='';return;}
      var r=el.parentNode.getBoundingClientRect();
      var d=r.top+r.height/2-vh/2;
      el.style.transform='translate3d(0,'+(d*(parseFloat(el.getAttribute('data-speed'))-1)).toFixed(1)+'px,0)';
    });
  }
  function onFx(){if(!fxTicking){fxTicking=true;requestAnimationFrame(fx);}}

  // ── 5. Revelation : la reponse s'ecrit, puis la pochette se devoile ──
  // Morceau reel : audio/Machel_Montano-Mister_fete.mp3 (univers Soca).
  var rev=document.getElementById('nb-rev');
  if(rev){
    var REV={titre:'Mister fete', artiste:'Machel Montano'};
    var rT=document.getElementById('nb-rev-t'), rBy=document.getElementById('nb-rev-by'),
        rA=document.getElementById('nb-rev-a'), rVeil=document.getElementById('nb-rev-veil'),
        rStatus=document.getElementById('nb-rev-status');
    var revTimers=[], revRunning=false;
    function revLater(fn,ms){revTimers.push(setTimeout(fn,ms));}
    function revFinal(){
      rT.textContent=REV.titre;rBy.textContent=' par ';rA.textContent=REV.artiste;
      rVeil.classList.add('is-open');
    }
    function revCycle(){
      revTimers.forEach(clearTimeout);revTimers=[];
      rT.textContent='';rBy.textContent='';rA.textContent='';rVeil.classList.remove('is-open');
      var t=600, k;
      for(k=0;k<REV.titre.length;k++)(function(ch,d){revLater(function(){rT.textContent+=ch;},d);})(REV.titre[k],t+k*70);
      t+=REV.titre.length*70+250;
      revLater(function(){rBy.textContent=' par ';},t);
      t+=300;
      for(k=0;k<REV.artiste.length;k++)(function(ch,d){revLater(function(){rA.textContent+=ch;},d);})(REV.artiste[k],t+k*70);
      t+=REV.artiste.length*70+700;
      revLater(function(){rVeil.classList.add('is-open');},t);   // fin du temps
      revLater(function(){if(revRunning)revCycle();},t+3200);
    }
    if(reduce.matches)revFinal();
    else new IntersectionObserver(function(es){
      var vis=es[0].isIntersecting;
      if(vis&&!revRunning){revRunning=true;revCycle();}
      else if(!vis&&revRunning){revRunning=false;revTimers.forEach(clearTimeout);revTimers=[];revFinal();}
    },{threshold:.35}).observe(rev);
  }
  window.addEventListener('scroll',onFx,{passive:true});
  window.addEventListener('resize',onFx);
  fx();

  // ── 6. Animations de bas de page ─────────────────────────────
  // Sans animation (prefers-reduced-motion) : rien n'est masque.
  (function(){
    if(reduce.matches)return;
    document.documentElement.classList.add('nb-anim');
    // a. phrase finale : chaque mot s'allume au fil du defilement
    var phrase=document.getElementById('nb-s05-phrase'), cta=document.getElementById('nb-s05-cta');
    var words=[];
    if(phrase){
      [].forEach.call(phrase.children,function(line){
        var parts=line.textContent.split(' ');
        line.textContent='';
        parts.forEach(function(w,k){
          var s=document.createElement('span');s.className='nb-w';s.textContent=w;
          line.appendChild(s);
          if(k<parts.length-1)line.appendChild(document.createTextNode(' '));
          words.push(s);
        });
      });
    }
    var wTick=false;
    function lightWords(){
      wTick=false;
      if(!phrase||landing.offsetParent===null)return;
      var r=phrase.getBoundingClientRect(), vh=window.innerHeight;
      // de "haut de phrase a 85 % de l'ecran" a "bas de phrase a 70 %"
      var t=(vh*.85-r.top)/(vh*.85-vh*.7+r.height);
      t=Math.max(0,Math.min(1,t));
      var n=Math.round(t*words.length);
      words.forEach(function(w,k){w.classList.toggle('is-on',k<n);});
      if(cta)cta.classList.toggle('is-in',n===words.length);
    }
    function onWords(){if(!wTick){wTick=true;requestAnimationFrame(lightWords);}}
    window.addEventListener('scroll',onWords,{passive:true});
    window.addEventListener('resize',onWords);
    lightWords();
    // b. Etapes de "Comment jouer" : a l'entree a l'ecran (des qu'une partie
    // est visible). Le "SONARA" du footer : entete.js, commun aux pages.
    var ins=document.querySelectorAll('.nb-steps:not(.nb-cj-steps)');   // vue Comment jouer : anim-pages.js
    if(!('IntersectionObserver' in window)){[].forEach.call(ins,function(el){el.classList.add('is-in');});return;}
    var io=new IntersectionObserver(function(es){
      es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('is-in');io.unobserve(e.target);}});
    },{threshold:0});
    [].forEach.call(ins,function(el){io.observe(el);});
  })();

  // ── 7. Vues : accueil, /a-propos, /comment-jouer ─────────────
  // Une seule page (header et footer communs) : le contenu affiche suit
  // l'adresse. Les anciennes ancres des sections retirees menent a la vue
  // qui reprend leur contenu. Toute autre adresse (lien de Defi...) : accueil.
  var VUES={'/':'accueil','/a-propos':'a-propos','/comment-jouer':'comment-jouer'};
  var TITRES={'accueil':document.title,'a-propos':'À propos · Sonara','comment-jouer':'Comment jouer · Sonara'};
  var ANCRES={'#comment-jouer':'/comment-jouer','#nb-s04':'/comment-jouer','#la-revelation':'/comment-jouer','#nb-s02':'/comment-jouer','#nb-s01':'/a-propos'};
  var vue='accueil';
  function vueDe(path){return VUES[path.replace(/\/+$/,'')||'/'];}
  function setVue(v){
    vue=v;
    landing.querySelectorAll('[data-vue]').forEach(function(el){el.hidden=el.getAttribute('data-vue')!==v;});
    // Page en cours dans le menu et le footer ("Univers" n'est pas une page)
    landing.querySelectorAll('.nb-hd-link,.nb-menu-list a,.nb-ft-col a').forEach(function(a){
      if(a.pathname!=='/'&&vueDe(a.pathname)===v)a.setAttribute('aria-current','page');
      else a.removeAttribute('aria-current');
    });
    document.title=TITRES[v];
  }
  // Changement de vue : disque ouvert depuis le point clique et entree de
  // la page (anim-pages.js ; sans ce script : changement direct)
  function entre(){if(window.nbPages)nbPages.enter(landing.querySelector('.nb-page:not([hidden])'));}
  function transition(maj,e){if(window.nbPages)nbPages.go(maj,e);else maj();}
  function goTo(path,hash,e){
    closeMenus();
    transition(function(){
      history.pushState(null,'',path+(hash||''));
      if(landing.style.display==='none'&&window.showPage)showPage('landing');
      setVue(vueDe(path));
      var t=hash&&document.getElementById(hash.slice(1));
      if(t&&!t.hidden)t.scrollIntoView();else window.scrollTo(0,0);
      entre();
    },e);
  }
  document.addEventListener('click',function(e){
    var a=e.target.closest&&e.target.closest('a[href]');
    if(!a||e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||a.target)return;
    if(a.origin!==location.origin||!vueDe(a.pathname))return;
    e.preventDefault();
    goTo(a.pathname.replace(/\/+$/,'')||'/',a.hash,e);
  });
  window.addEventListener('popstate',function(){var v=vueDe(location.pathname);if(v&&v!==vue)transition(function(){setVue(v);entre();});});
  (function(){
    var v=vueDe(location.pathname)||'accueil';
    if(v==='accueil'&&location.pathname==='/'&&ANCRES[location.hash]){
      var path=ANCRES[location.hash];
      try{history.replaceState(null,'',path);}catch(e){}
      v=vueDe(path);
    }
    setVue(v);
    // Depuis une page legale : /#jouer et /#entre-proches lancent le parcours
    // (entete.js) une fois tous les ecrans charges
    var DEPART={'#jouer':null,'#entre-proches':{mode:'multi',proches:true}};
    if(location.pathname==='/'&&location.hash in DEPART){
      var opts=DEPART[location.hash];
      try{history.replaceState(null,'','/');}catch(e){}
      document.addEventListener('DOMContentLoaded',function(){play(opts);});
    }
  })();
})();
