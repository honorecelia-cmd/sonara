// ═══════════════════════════════════════════════════════════════
// SONARA, ecran "Choisis ton son-nom" (#s-sonnom, refait avec le kit)
// Son-nom, mode, puis "Jouer". La partie n'est pas touchee : "Jouer"
// passe la main aux fonctions existantes de sonara.js (selectSoloTheme,
// selectMultiTheme, showEntreProches) avec les memes donnees qu'avant
// (G.ps, univers). Charge apres ecran-univers.js.
// ═══════════════════════════════════════════════════════════════
(function(){
  'use strict';
  var scrS=document.getElementById('s-sonnom'), F=window.SonaraFlow;
  if(!scrS||!F)return;
  var $=function(id){return document.getElementById(id);};
  var flow=F.state, MODES=F.modes, idxOf=F.indexOf;
  var MODE_HELP={
    solo:'Dix extraits rien que pour toi, à ton rythme.',
    multi:'Crée une salle avec cet univers, ou rejoins celle d\'un proche avec son code.',
    entre:'Tu reçois un lien à partager : tes proches jouent sur le même univers.'
  };

  var form=$('sn-form'), inp=$('sn-name'), help=$('sn-help'), play=$('sn-play');
  var chip=$('sn-uchip'), chipVy=$('sn-uchip-vy'), chipName=$('sn-uchip-name');
  var uNote=$('sn-unote'), mNote=$('sn-mnote'), modeHelp=$('sn-mode-help');
  var modeBtns=[].slice.call(scrS.querySelectorAll('[data-sn-mode]'));
  var STORE='sonara-son-nom';
  var HELP='De 2 à 16 caractères.';
  var PREFIXES=['Mister','Miss','Reine du','Roi du','DJ'];

  // Espaces en trop supprimes, caracteres de controle retires
  function clean(v){return String(v||'').replace(/[\u0000-\u001F\u007F]/g,'').replace(/\s+/g,' ').trim();}
  function size(v){return Array.from(v).length;}
  function valid(v){var n=size(v);return n>=2&&n<=16;}
  function load(){try{return clean(window.localStorage.getItem(STORE));}catch(e){return '';}}
  function save(v){try{window.localStorage.setItem(STORE,v);}catch(e){}}

  function check(){
    var v=clean(inp.value), ok=valid(v), n=size(v);
    play.disabled=!ok;
    inp.setAttribute('aria-invalid',String(!ok&&n>0));
    help.classList.toggle('is-warn',n===1);
    help.textContent=n===1?'Encore un caractère : 2 au minimum.':HELP;
  }
  inp.addEventListener('input',check);
  inp.addEventListener('blur',function(){var v=clean(inp.value);if(v!==inp.value)inp.value=v;check();});

  // Au hasard : un prefixe + l'univers choisi (jamais un nom d'artiste)
  $('sn-random').addEventListener('click',function(){
    var u=UNIVERS[idxOf(flow.theme)].nom, cur=clean(inp.value);
    var all=PREFIXES.map(function(p){return p+' '+u;}).filter(function(s){return size(s)<=16&&s!==cur;});
    inp.value=all[Math.floor(Math.random()*all.length)];
    check();
  });

  // Mode : groupe de boutons radio (clic, fleches du clavier)
  function setMode(m,fromUser){
    flow.mode=MODES[m]?m:'solo';
    modeBtns.forEach(function(b){
      var on=b.getAttribute('data-sn-mode')===flow.mode;
      b.setAttribute('aria-checked',String(on));
      b.tabIndex=on?0:-1;
    });
    modeHelp.textContent=MODE_HELP[flow.mode];
    if(fromUser&&flow.preset&&flow.preset!==flow.mode)mNote.hidden=true;
  }
  modeBtns.forEach(function(b,k){
    b.addEventListener('click',function(){setMode(b.getAttribute('data-sn-mode'),true);});
    b.addEventListener('keydown',function(e){
      var d=e.key==='ArrowRight'||e.key==='ArrowDown'?1:e.key==='ArrowLeft'||e.key==='ArrowUp'?-1:0;
      if(!d)return;
      e.preventDefault();
      var nb=modeBtns[(k+d+modeBtns.length)%modeBtns.length];
      setMode(nb.getAttribute('data-sn-mode'),true);nb.focus();
    });
  });

  chip.addEventListener('click',function(){F.showUnivers(false);});
  $('sn-back').addEventListener('click',function(){F.showUnivers(false);});

  F.showSonnom=function(){
    var u=UNIVERS[idxOf(flow.theme)];
    chipVy.innerHTML=uvVinyl(u,false);
    chipName.textContent=u.nom;
    chip.setAttribute('aria-label','Univers choisi : '+u.nom+'. Changer d\'univers');
    // Univers impose par un lien "Entre proches" recu
    uNote.hidden=!flow.shared;
    if(flow.shared)uNote.textContent='Univers choisi par ton proche : '+u.nom+'. Tu peux en changer.';
    // Mode deja choisi ailleurs (menu Mode) : on le signale et on le preselectionne
    setMode(flow.mode,false);
    mNote.hidden=!flow.preset;
    if(flow.preset)mNote.textContent='Mode '+MODES[flow.preset]+' choisi depuis le menu. Tu peux encore le changer.';
    // Son-nom : dernier utilise sur cet appareil
    if(!clean(inp.value))inp.value=load();
    check();
    showPage('s-sonnom');
    $('sn-t').focus({preventScroll:true});
  };

  form.addEventListener('submit',function(e){
    e.preventDefault();
    var v=clean(inp.value);
    inp.value=v;
    if(!valid(v)){
      check();
      if(window.SonaraKit)SonaraKit.shake(inp.parentNode);
      inp.focus();
      return;
    }
    save(v);
    launch(v);
  });

  // Passe la main aux fonctions existantes (memes donnees qu'avant)
  function launch(name){
    var key=THEMES[flow.theme]?flow.theme:'mix';
    G.ps=name;
    if(flow.mode==='multi'){
      // Comme le menu Mode de la landing : son-nom recopie, puis Creer ou Rejoindre.
      // L'univers est preselectionne pour "Creer une salle".
      ['multi-pseudo','join-pseudo'].forEach(function(id){var el=$(id);if(el){el.value=name;el.style.borderColor='';}});
      var card=document.querySelector('#create-theme-grid .t-'+key);
      if(card)selectMultiTheme(key,card);
      showPage('s-multi');
    }else if(flow.mode==='entre'){
      // Le lien partage porte l'univers de G.theme (voir themeSlug)
      if(G.theme!==THEMES[key].n)G._entreCode=null;
      G.theme=THEMES[key].n;
      showEntreProches();
    }else{
      selectSoloTheme(key);
    }
  }

})();
