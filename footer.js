// SONARA : footer, heure locale de la Martinique (calculee dans le navigateur)
(function(){
  'use strict';
  var el=document.getElementById('nb-ft-time');
  if(!el)return;
  var fmt=new Intl.DateTimeFormat('fr-FR',{timeZone:'America/Martinique',hour:'2-digit',minute:'2-digit'});
  function tick(){
    var d=new Date();
    el.textContent=fmt.format(d);
    el.setAttribute('datetime',d.toISOString());
  }
  tick();setInterval(tick,15000);
})();
