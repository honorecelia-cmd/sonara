// ═══════════════════════════════════════════════════════════════
// SONARA, donnees personnelles cote navigateur
// - Case « Apparaitre dans le classement » (memorisee sur l'appareil) ;
//   decochee : aucun score n'est envoye au serveur.
// - Codes d'effacement : un code aleatoire par score enregistre, garde
//   uniquement ici (localStorage) ; le serveur n'en garde qu'une empreinte.
// - « Supprimer mes scores » : efface sur le serveur les scores de cet appareil.
// - Verification du son-nom par le serveur (forme et termes refuses).
// Charge par sonara.html (apres sonara.js) et par la politique de confidentialite.
// ═══════════════════════════════════════════════════════════════
(function(){
  'use strict';
  var OPT='sonara-classement', KEYS='sonara-effacement', MAXKEYS=500;
  function get(k){try{return window.localStorage.getItem(k);}catch(e){return null;}}
  function set(k,v){try{if(v==null)window.localStorage.removeItem(k);else window.localStorage.setItem(k,v);}catch(e){}}
  function post(url,body){
    return fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  }

  // ── Classement : participation (cochee par defaut) ──
  function optIn(){return get(OPT)!=='0';}
  function setOptIn(on){
    set(OPT,on?'1':'0');
    [].forEach.call(document.querySelectorAll('.sn-rgpd-cb'),function(cb){cb.checked=on;});
  }

  // ── Codes d'effacement ──
  function keys(){
    try{var a=JSON.parse(get(KEYS)||'[]');return Array.isArray(a)?a.filter(function(k){return /^[a-f0-9]{32,64}$/.test(k);}):[];}catch(e){return [];}
  }
  function newKey(){
    var b=new Uint8Array(16);crypto.getRandomValues(b);
    var k=Array.prototype.map.call(b,function(x){return ('0'+x.toString(16)).slice(-2);}).join('');
    var a=keys();a.push(k);if(a.length>MAXKEYS)a=a.slice(-MAXKEYS);
    set(KEYS,JSON.stringify(a));
    return k;
  }
  function dropKey(k){set(KEYS,JSON.stringify(keys().filter(function(x){return x!==k;})));}
  function deleteScores(){
    var a=keys();
    if(!a.length)return Promise.resolve(0);
    return post('/score/delete',{keys:a}).then(function(r){
      if(!r.ok)throw new Error('refus');
      return r.json();
    }).then(function(d){set(KEYS,null);return d.deleted||0;});
  }

  // ── Son-nom : verification par le serveur, resultat garde par valeur ──
  var cache={};
  var MSG={
    longueur:'2 à 16 caractères.',
    caracteres:'Lettres, chiffres, espaces et - \' . _ seulement.',
    refuse:'Ce son-nom n\'est pas accepté. Choisis-en un autre.'
  };
  function checkName(name){
    name=String(name||'');
    if(cache[name])return Promise.resolve(cache[name]);
    return post('/name/check',{name:name}).then(function(r){return r.ok?r.json():null;}).then(function(d){
      if(!d)return {ok:true,name:name};   // serveur indisponible : il verifiera a l'entree en salle et au score
      var res=d.ok?{ok:true,name:d.name}:{ok:false,reason:d.reason,message:MSG[d.reason]||MSG.refuse};
      cache[name]=res;return res;
    }).catch(function(){return {ok:true,name:name};});
  }
  function cached(name){return cache[String(name||'')]||null;}

  // ── Mention et case sous un champ son-nom ──
  var NOTE='Ton son-nom peut apparaître dans le classement public. Évite d\'utiliser ton vrai nom.';
  var uid=0;
  function mount(after){
    if(!after||!after.parentNode)return;
    var id='sn-rgpd-'+(++uid);
    var box=document.createElement('div');
    box.className='sn-rgpd';
    box.innerHTML='<p class="sn-rgpd-note" id="'+id+'-n">'+NOTE+'</p>'+
      '<label class="sn-rgpd-opt"><input type="checkbox" class="sn-rgpd-cb" aria-describedby="'+id+'-n">'+
      '<span>Apparaître dans le classement</span></label>';
    var cb=box.querySelector('input');
    cb.checked=optIn();
    cb.addEventListener('change',function(){setOptIn(cb.checked);});
    after.parentNode.insertBefore(box,after.nextSibling);
  }

  // ── « Supprimer mes scores » avec confirmation ──
  function eraser(host,onDone){
    if(!host)return;
    host.innerHTML='<button type="button" class="sn-erase-btn">Supprimer mes scores</button>'+
      '<div class="sn-erase-ask" hidden><p>Supprimer du classement tous les scores enregistrés depuis cet appareil ?</p>'+
      '<div class="sn-erase-row"><button type="button" class="sn-erase-yes">Supprimer</button>'+
      '<button type="button" class="sn-erase-no">Annuler</button></div></div>'+
      '<p class="sn-erase-msg" aria-live="polite"></p>';
    var btn=host.querySelector('.sn-erase-btn'),ask=host.querySelector('.sn-erase-ask'),
        yes=host.querySelector('.sn-erase-yes'),no=host.querySelector('.sn-erase-no'),msg=host.querySelector('.sn-erase-msg');
    btn.addEventListener('click',function(){
      msg.textContent='';
      if(!keys().length){msg.textContent='Aucun score enregistré depuis cet appareil.';return;}
      btn.hidden=true;ask.hidden=false;yes.focus();
    });
    no.addEventListener('click',function(){ask.hidden=true;btn.hidden=false;btn.focus();});
    yes.addEventListener('click',function(){
      yes.disabled=true;
      deleteScores().then(function(n){
        ask.hidden=true;btn.hidden=false;yes.disabled=false;
        msg.textContent=n>1?n+' scores supprimés.':n===1?'1 score supprimé.':'Aucun de tes scores n\'était encore au classement.';
        if(onDone)onDone(n);
      }).catch(function(){
        yes.disabled=false;
        msg.textContent='La suppression n\'a pas abouti. Réessaie dans une minute.';
      });
    });
  }

  window.SonaraRgpd={optIn:optIn,setOptIn:setOptIn,keys:keys,newKey:newKey,dropKey:dropKey,
    deleteScores:deleteScores,checkName:checkName,cached:cached,message:function(r){return MSG[r]||MSG.refuse;},
    mount:mount,eraser:eraser};

  // Page de politique de confidentialite : bouton seul
  var page=document.getElementById('rgpd-erase');
  if(page)eraser(page);
})();
