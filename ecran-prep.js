// ═══════════════════════════════════════════════════════════════
// SONARA, affichage des ecrans de preparation et de chargement (prep.css)
// Jouer en direct, creer une salle, rejoindre une salle, defi a partager,
// chargement. Ce fichier ne fait que de l'affichage : il ne cree ni ne
// rejoint aucune salle et ne valide aucun code (createRoom, joinRoom et
// leurs verifications restent dans sonara.js, inchanges). Il prerempli
// seulement les champs son-nom que ces fonctions lisent.
// Charge apres sonara.js et univers.js.
// ═══════════════════════════════════════════════════════════════
(function(){
  'use strict';
  var $=function(id){return document.getElementById(id);};
  var STORE='sonara-son-nom';

  function univ(slug){
    var list=window.UNIVERS||[];
    for(var i=0;i<list.length;i++)if(list[i].slug===slug)return list[i];
    return null;
  }
  function keyOfTheme(){   // univers de la partie a partir de son nom (G.theme)
    if(typeof THEMES==='undefined')return null;
    var k=Object.keys(THEMES).find(function(x){return THEMES[x].n===G.theme;});
    return k||null;
  }
  function storedName(){try{return (window.localStorage.getItem(STORE)||'').trim();}catch(e){return '';}}
  function onShow(el,fn){
    if(!el)return;
    var was=el.classList.contains('on');
    new MutationObserver(function(){
      var is=el.classList.contains('on');
      if(is&&!was)fn();
      was=is;
    }).observe(el,{attributes:true,attributeFilter:['class']});
  }
  // Vinyle de l'univers, etiquette neutre (couleur + logo Sonara, aucune pochette)
  function vinyl(box,u){
    if(!box||!window.uvVinyl)return;
    box.innerHTML=uvVinyl(u||{nom:'Sonara',couleur:'var(--accent)',image:null},true,true);
  }
  function prefill(input){
    if(input&&!input.value.trim())input.value=(window.G&&G.ps)||storedName();
  }

  // ── Jouer en direct (#s-multi) ──
  onShow($('s-multi'),function(){vinyl($('pp-multi-deco'),null);});

  // ── Creer une salle (#s-create) ──
  // Le son-nom et l'univers viennent du parcours (son-nom, etape Univers).
  // Seul chemin sans son-nom : "J'ai un code de salle" avec un champ vide,
  // puis Retour, puis Creer. Le champ ou les pilules ne s'affichent que
  // pour l'element manquant.
  var create=$('s-create');
  function flowState(){return (window.SonaraFlow&&SonaraFlow.state)||{};}
  function createKey(){   // univers choisi dans le parcours, sinon celui de la derniere salle
    var k=flowState().theme||(window.G_MULTI&&G_MULTI.theme);
    return k&&typeof THEMES!=='undefined'&&THEMES[k]?k:null;
  }
  function paintCreate(){
    var key=createKey(), u=univ(key);
    // Univers connu : selectionne via la fonction existante (bouton actif)
    var card=key?document.querySelector('#create-theme-grid .t-'+key):null;
    if(card)selectMultiTheme(key,card);
    $('pp-create-uni').hidden=!card;$('pp-create-pills').hidden=!!card;
    if(u){$('pp-create-uni-name').textContent=u.nom;$('pp-create-uni').style.setProperty('--pp-u',u.couleur);}
    vinyl($('pp-create-deco'),univ(G_MULTI.theme));
    // Son-nom : rappel s'il est connu, sinon le champ
    var inp=$('multi-pseudo');prefill(inp);
    var v=inp.value.trim();
    $('pp-create-me').hidden=!v;$('pp-create-name').hidden=!!v;
    if(v)$('pp-create-me-name').textContent=v;
  }
  onShow(create,function(){$('pp-create-msg').textContent='';paintCreate();});
  if(create){
    $('create-theme-grid').addEventListener('click',function(){setTimeout(function(){vinyl($('pp-create-deco'),univ(G_MULTI.theme));},0);});
    // Son-nom vide : createRoom ne fait rien ; on dit pourquoi
    $('btn-create-room').addEventListener('click',function(){
      if(!$('multi-pseudo').value.trim())$('pp-create-msg').textContent='Choisis un son-nom pour créer la salle.';
    });
    $('multi-pseudo').addEventListener('input',function(){$('pp-create-msg').textContent='';});
    // "Changer" : retour aux etapes du parcours, en mode En direct
    function toFlow(){
      var f=flowState(), k=createKey();
      if(k)f.theme=k;
      f.mode='multi';f.preset=null;f.shared=false;
      return window.SonaraFlow;
    }
    $('pp-create-change-name').addEventListener('click',function(){var F=toFlow();if(F&&F.showSonnom)F.showSonnom();});
    $('pp-create-change-uni').addEventListener('click',function(){var F=toFlow();if(F)F.showUnivers();});
  }

  // ── Rejoindre une salle (#s-join) ──
  var join=$('s-join'), code=$('join-code'), jbtn=join&&join.querySelector('.bgo'), err=$('join-error');
  var codeBox=join&&join.querySelector('.pp-code');
  // Caracteres des codes de salle (server.js, genCode) ; on ne garde qu'eux
  function clean(v){return String(v||'').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,4);}
  // Code dans un texte colle : "... le code K7MZ ..." ou un mot de 4 caracteres
  function extract(txt){
    var up=String(txt||'').toUpperCase();
    var m=up.match(/CODE\s*:?\s*([A-Z0-9]{4})(?![A-Z0-9])/)||up.match(/(?:^|[^A-Z0-9])([A-Z0-9]{4})(?![A-Z0-9])/);
    return m?m[1]:clean(up);
  }
  function syncJoin(){if(jbtn&&!jbtn.textContent.match(/rification/))jbtn.disabled=code.value.length!==4;}
  function showMe(){
    var v=$('join-pseudo').value.trim();
    $('pp-join-me').hidden=!v;$('pp-join-name').hidden=!!v;
    if(v)$('pp-join-me-name').textContent=v;
  }
  onShow(join,function(){
    if(!codeBox)return;
    prefill($('join-pseudo'));showMe();
    code.value=clean(code.value);syncJoin();
    vinyl($('pp-join-deco'),null);
  });
  if(join&&codeBox){
    code.addEventListener('input',function(){
      var c=clean(code.value);if(c!==code.value)code.value=c;
      if(err.style.display!=='none')err.style.display='none';
      syncJoin();
    });
    code.addEventListener('paste',function(e){
      var t=(e.clipboardData||window.clipboardData).getData('text');
      e.preventDefault();code.value=extract(t);
      code.dispatchEvent(new Event('input'));
    });
    code.addEventListener('keydown',function(e){if(e.key==='Enter'&&!jbtn.disabled)jbtn.click();});
    $('pp-join-change').addEventListener('click',function(){$('pp-join-me').hidden=true;$('pp-join-name').hidden=false;$('join-pseudo').focus();});
    // Erreur affichee par joinRoom : petite secousse du champ, sans rouge
    new MutationObserver(function(){
      if(err.style.display==='block'&&codeBox){codeBox.classList.remove('is-error');void codeBox.offsetWidth;codeBox.classList.add('is-error');}
      syncJoin();
    }).observe(err,{attributes:true,attributeFilter:['style']});
    new MutationObserver(syncJoin).observe(jbtn,{childList:true,characterData:true,subtree:true});
    // Mobile : clavier ouvert, le champ du code et le bouton restent visibles
    if(window.visualViewport)visualViewport.addEventListener('resize',function(){
      if(document.activeElement===code&&visualViewport.height<window.innerHeight*0.8)window.scrollTo(0,0);
    });
  }

  // ── Defi a partager (#s-entre) ──
  onShow($('s-entre'),function(){vinyl($('pp-entre-deco'),univ(keyOfTheme()));});

  // ── Chargement (#s-load) : halo de la couleur de l'univers ──
  onShow($('s-load'),function(){
    var u=univ(keyOfTheme());
    $('s-load').style.setProperty('--pp-u',u?u.couleur:'var(--accent)');
  });
})();
