// ═══════════════════════════════════════════════════════════════
// SONARA, parcours avant la partie (#s-parcours), etape 2 : "Choisis ton
// son-nom". Meme aplat et meme nom geant que l'etape 1 : seule la carte
// change (data-step="2").
// La partie n'est pas touchee : le bouton principal passe la main aux
// fonctions existantes de sonara.js (selectSoloTheme, createRoom,
// showEntreProches) avec les memes donnees qu'avant (G.ps, univers).
// Charge apres ecran-univers.js.
// ═══════════════════════════════════════════════════════════════
(function(){
  'use strict';
  var scr=document.getElementById('s-parcours'), F=window.SonaraFlow;
  if(!scr||!F)return;
  var $=function(id){return document.getElementById(id);};
  var flow=F.state, MODES=F.modes, idxOf=F.indexOf;
  var MODE_HELP={
    solo:'Dix extraits rien que pour toi, à ton rythme.',
    multi:'Tout le monde joue en même temps, avec un code de salle.',
    entre:'Un lien à envoyer : chacun joue quand il veut.'
  };
  var MODE_CTA={solo:'Jouer', multi:'Créer la salle', entre:'Générer le lien'};
  // Exemples de son-nom (placeholder) : neutres, lies a l'univers, jamais un
  // nom d'artiste ou de groupe reel
  var EXEMPLES={
    dancehall:['Riddim Radar','Riddim Boussole','Dancehall Pilote'],
    soca:['Soca Tempo','Road March Radar','Jouvert Pilote'],
    zouk:['Zouk Boussole','Zouk Tempo','Lanmou Radar'],
    reggae:['Skank Radar','Reggae Boussole','Roots Tempo'],
    trap:['808 Pilote','Trap Radar','Basse Boussole'],
    rap:['Flow Radar','Rime Pilote','Punchline Tempo'],
    mix:['Mix Boussole','Playlist Pilote','Caraïbe Radar'],
    kompa:['Kompa Tempo','Konpa Radar','Kompa Boussole'],
    shatta:['Shatta Radar','Shatta Pilote','Shatta Tempo']
  };

  var form=$('sn-form'), inp=$('sn-name'), hint=$('sn-hint'), count=$('sn-count'), play=$('sn-play');
  var chipVy=$('sn-uchip-vy'), chipName=$('sn-uchip-name'), chip=$('sn-uchip');
  var uNote=$('sn-unote'), mNote=$('sn-mnote'), modeHelp=$('sn-mode-help'), join=$('sn-join');
  var modeBtns=[].slice.call(scr.querySelectorAll('[data-sn-mode]'));
  var STORE='sonara-son-nom', MAX=16;
  var PREFIXES=['Mister','Miss','Reine du','Roi du','DJ'];
  var stored='', showError=false;

  // Espaces en trop supprimes, caracteres de controle retires
  function clean(v){return String(v||'').replace(/[\u0000-\u001F\u007F]/g,'').replace(/\s+/g,' ').trim();}
  function size(v){return Array.from(v).length;}
  function valid(v){var n=size(v);return n>=2&&n<=MAX;}
  function load(){try{return clean(window.localStorage.getItem(STORE));}catch(e){return '';}}
  function save(v){try{window.localStorage.setItem(STORE,v);}catch(e){}}

  // Compteur discret ; message seulement en cas d'erreur (ou pour dire que
  // le champ est prerempli avec le dernier son-nom de l'appareil)
  function check(){
    var v=clean(inp.value), n=size(v), ok=valid(v);
    if(ok)showError=false;
    play.disabled=!ok;
    count.textContent=n+'/'+MAX;
    inp.setAttribute('aria-invalid',String(showError));
    hint.classList.toggle('is-error',showError);
    if(showError)hint.textContent='2 caractères minimum.';
    else if(stored&&v===stored)hint.textContent='Ton dernier son-nom';
    else hint.textContent='';
  }
  inp.addEventListener('input',check);
  inp.addEventListener('blur',function(){
    var v=clean(inp.value);
    if(v!==inp.value)inp.value=v;
    showError=size(v)>0&&!valid(v);
    check();
  });

  // Au hasard : un prefixe + l'univers choisi (jamais un nom d'artiste)
  $('sn-random').addEventListener('click',function(){
    var u=UNIVERS[idxOf(flow.theme)].nom, cur=clean(inp.value);
    var all=PREFIXES.map(function(p){return p+' '+u;}).filter(function(s){return size(s)<=MAX&&s!==cur;});
    inp.value=all[Math.floor(Math.random()*all.length)];
    showError=false;
    check();
  });

  // Mode : groupe de boutons radio (clic, fleches du clavier). La description
  // et le lien "code de salle" ont une hauteur reservee : rien ne saute.
  function setMode(m,fromUser){
    flow.mode=MODES[m]?m:'solo';
    modeBtns.forEach(function(b){
      var on=b.getAttribute('data-sn-mode')===flow.mode;
      b.setAttribute('aria-checked',String(on));
      b.tabIndex=on?0:-1;
    });
    modeHelp.textContent=MODE_HELP[flow.mode];
    play.textContent=MODE_CTA[flow.mode];
    var multi=flow.mode==='multi';
    join.setAttribute('aria-hidden',String(!multi));
    join.tabIndex=multi?0:-1;
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

  // Seul retour vers le carrousel : la pastille "Changer"
  chip.addEventListener('click',function(){F.showUnivers();});

  F.showSonnom=function(){
    var u=UNIVERS[idxOf(flow.theme)];
    chipVy.innerHTML=uvVinyl(u,false);
    chipName.textContent=u.nom;
    chip.setAttribute('aria-label','Univers choisi : '+u.nom+'. Changer d\'univers');
    // Univers impose par un lien de defi recu
    uNote.hidden=!flow.shared;
    if(flow.shared)uNote.textContent='Univers du défi reçu : '+u.nom+'. Tu peux en changer.';
    // Mode deja choisi ailleurs (menu Mode de la landing) : signale et preselectionne
    setMode(flow.mode,false);
    mNote.hidden=!flow.preset;
    if(flow.preset)mNote.textContent='Mode '+MODES[flow.preset]+' choisi depuis le menu. Tu peux encore le changer.';
    // Valeur preremplie : dernier son-nom de l'appareil ; sinon le champ est
    // vide et affiche un exemple (placeholder)
    stored=load();
    if(!clean(inp.value))inp.value=stored;
    var ex=EXEMPLES[u.slug]||EXEMPLES.mix;
    inp.placeholder='Ex. '+ex[Math.floor(Math.random()*ex.length)];
    showError=false;
    check();
    // L'aplat et le nom geant restent : on ne change que l'etape
    F.setIndexFor(flow.theme);
    scr.setAttribute('data-step','2');
    if(!(window.G&&G.page==='s-parcours'))showPage('s-parcours');
    $('pc-t2').focus({preventScroll:true});
  };

  form.addEventListener('submit',function(e){
    e.preventDefault();
    var v=clean(inp.value);
    inp.value=v;
    if(!valid(v)){
      showError=true;check();
      if(window.SonaraKit)SonaraKit.shake(inp.parentNode);
      inp.focus();
      return;
    }
    save(v);
    launch(v);
  });

  // "J'ai un code de salle" : ecran Rejoindre existant, son-nom deja rempli
  join.addEventListener('click',function(){
    var v=clean(inp.value);
    if(valid(v)){save(v);G.ps=v;}
    var el=$('join-pseudo');
    if(el){el.value=v;el.style.borderColor='';}
    showPage('s-join');
  });

  // Passe la main aux fonctions existantes (memes donnees qu'avant)
  function launch(name){
    var key=THEMES[flow.theme]?flow.theme:'mix';
    G.ps=name;
    if(flow.mode==='multi'){
      // Salle creee directement avec cet univers et ce son-nom
      ['multi-pseudo','join-pseudo'].forEach(function(id){var el=$(id);if(el){el.value=name;el.style.borderColor='';}});
      var card=document.querySelector('#create-theme-grid .t-'+key);
      if(card)selectMultiTheme(key,card);
      createRoom();
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
