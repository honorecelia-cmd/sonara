// ═══════════════════════════════════════════════════════════════
// SONARA, affichage des ecrans du coeur du jeu (jeu.css)
// Salle d'attente, manche, revelation. Ce fichier ne fait que LIRE l'etat
// du jeu (G, G_MULTI) pour l'afficher : aucune logique de jeu ici (pas de
// WebSocket, de points, de minuteur ni de classement).
// Charge apres sonara.js et univers.js.
// ═══════════════════════════════════════════════════════════════
(function(){
  'use strict';
  var $=function(id){return document.getElementById(id);};
  var game=$('s-game'), lobby=$('s-lobby');
  if(!game||!lobby)return;
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)');

  function univ(slug){
    var list=window.UNIVERS||[];
    for(var i=0;i<list.length;i++)if(list[i].slug===slug)return list[i];
    return null;
  }
  function onClass(el,cls,fn){
    var was=el.classList.contains(cls);
    new MutationObserver(function(){
      var is=el.classList.contains(cls);
      if(is&&!was)fn();
      was=is;
    }).observe(el,{attributes:true,attributeFilter:['class']});
  }
  function mmss(s){s=Math.max(0,Math.floor(s));return Math.floor(s/60)+':'+(s%60<10?'0':'')+(s%60);}

  // ── Minuteur : temps ecoule (0:12 / 0:30) et multiplicateur en direct ──
  // Memes paliers que calcPts (sonara.js) : x3 avant 5 s, x2 avant 10 s.
  var mult=$('jg-mult'), tEl=$('jg-t');
  window.SonaraJeu={
    tick:function(t,tot){
      var elapsed=tot-t;
      if(tEl)tEl.textContent=mmss(elapsed);
      var m=elapsed<5?3:elapsed<10?2:1;
      mult.classList.toggle('is-on',m>1);
      mult.textContent=m>1?'×'+m:'';
      mult.setAttribute('aria-label',m>1?'Points multipliés par '+m:'');
    }
  };

  // ── Chargement, compte a rebours et pause : un seul decor ──
  // Chargement (#s-load) : vinyle de l'univers qui tourne lentement, anneau vide.
  // Compte a rebours : le MEME mouvement continue (angle et vitesse repris),
  // le vinyle accelere jusqu'a la pleine vitesse et l'anneau se remplit.
  // Memes durees que doCD (3 x 900 ms + 600 ms) et doBreak (5 s) dans sonara.js :
  // ici on ne fait qu'afficher, le passage a la manche reste a sonara.js.
  var CD_MS=3300, BRK_MS=5000;
  var SLOW=360/9000, TOP=360/600;   // degres par ms : un tour en 9 s, puis en 600 ms
  var load=$('s-load');
  function themeKey(){   // univers de la partie (Mix reste Mix), pas celui de l'extrait
    if(typeof THEMES==='undefined')return null;
    return Object.keys(THEMES).find(function(k){return THEMES[k].n===G.theme;})||null;
  }
  function paintVinyl(box){
    var disc=box.querySelector('.jg-cd-disc');
    var u=univ(themeKey())||{nom:'Sonara',couleur:'var(--accent)',image:null};
    if(window.uvVinyl)disc.innerHTML=uvVinyl(u,false,true);
    return disc.querySelector('.vy-spin');
  }
  // Rotation image par image : angle(t) = a0 + v0.t + (v1 - v0).t^2 / 2T, puis v1
  var spinner={el:null,raf:0,angle:0,speed:0};
  function spin(el,a0,v0,v1,T){
    cancelAnimationFrame(spinner.raf);
    spinner.el=el;spinner.angle=a0;spinner.speed=v0;
    if(!el||reduce.matches){if(el)el.style.transform='';return;}
    var t0=performance.now();
    (function f(now){
      var t=now-t0, a;
      if(T&&t<T){a=a0+v0*t+(v1-v0)*t*t/(2*T);spinner.speed=v0+(v1-v0)*t/T;}
      else{var tt=T||0;a=a0+v0*tt+(v1-v0)*tt/2+v1*(t-tt);spinner.speed=v1;}
      spinner.angle=a%360;el.style.transform='rotate('+spinner.angle+'deg)';
      spinner.raf=requestAnimationFrame(f);
    })(t0);
  }
  function ringFill(box,ms){
    var ring=box.querySelector('.jg-cd-ring-fill');
    ring.getAnimations().forEach(function(a){a.cancel();});
    if(ms)ring.animate([{strokeDashoffset:100},{strokeDashoffset:0}],{duration:ms,easing:'linear',fill:'forwards'});
  }
  // Chargement : decor pose immediatement (aucune image vide), rotation lente
  var fromLoad=false;
  new MutationObserver(function(){
    if(load.classList.contains('on')){
      $('ld-step').textContent='Univers '+(G.theme||'')+' · Manche 1/'+(G.nq||10);
      var box=load.querySelector('.jg-cd');
      box.getAnimations({subtree:true}).forEach(function(a){a.cancel();});
      ringFill(box,0);
      spin(paintVinyl(box),0,SLOW,SLOW,0);
      fromLoad=true;
    }
  }).observe(load,{attributes:true,attributeFilter:['class']});
  function runCd(box,ms){
    var continued=fromLoad&&box.id==='cds';fromLoad=false;
    var a0=continued?spinner.angle:0, v0=continued?spinner.speed:0;
    box.getAnimations({subtree:true}).forEach(function(a){a.cancel();});
    var el=paintVinyl(box);
    if(el&&!reduce.matches)el.style.transform='rotate('+a0+'deg)';   // meme angle des la 1re image
    ringFill(box,ms);
    if(reduce.matches){spin(null);return;}   // mouvement reduit : vinyle fixe, seul l'anneau se remplit
    // Depuis le chargement : aucun fondu, le vinyle continue et accelere
    if(!continued){
      box.animate([{opacity:0},{opacity:1}],{duration:300,easing:'ease-out'});
      box.querySelector('.jg-cd-disc').animate([{transform:'scale(.82)',opacity:0},{transform:'none',opacity:1}],{duration:500,easing:'cubic-bezier(.2,.8,.2,1)'});
    }
    spin(el,a0,v0,TOP,ms);
    // Fin : fondu vers la manche (le fond se retire en fondu quand l'ecran change)
    box.animate([{opacity:1},{opacity:0}],{duration:300,delay:ms-300,easing:'ease-in',fill:'forwards'});
  }
  // hideG() retire "on" puis doCD() le remet aussitot : on regarde l'ancienne valeur
  [[$('cds'),CD_MS],[$('brksc'),BRK_MS]].forEach(function(x){
    var el=x[0];
    new MutationObserver(function(recs){
      if(!el.classList.contains('on'))return;
      var off=recs.some(function(r){return !/(^|\s)on(\s|$)/.test(r.oldValue||'');});
      if(off)runCd(el,x[1]);
    }).observe(el,{attributes:true,attributeFilter:['class'],attributeOldValue:true});
  });
  // Plus de compte a rebours ni de pause a l'ecran : on arrete la rotation
  new MutationObserver(function(){
    if(!document.querySelector('#cds.on,#brksc.on,#s-load.on'))spin(null);
  }).observe(document.body,{attributes:true,subtree:true,attributeFilter:['class']});

  // ── Debut de manche : pochette de l'univers (floutee), puces, points ──
  var qsc=$('qsc'), rvsc=$('rvsc'), roundStart=0;
  var coverBox=$('jg-cover'), coverImg=$('jg-cover-img');
  function currentKey(){
    var q=G.qs&&G.qs[G.cq];
    return (q&&q.u)||(typeof themeSlug==='function'?themeSlug():'mix');
  }
  onClass(qsc,'on',function(){
    roundStart=G.sc;
    game.classList.toggle('jg-multi',(G.pl||[]).length>1);   // classement : multijoueur seulement
    var key=currentKey(), u=univ(key);
    var src=(G.qs[G.cq]&&G.qs[G.cq].cover)||(typeof universeCover==='function'?universeCover(key):null);
    coverBox.style.background=u?u.couleur:'';
    game.style.setProperty('--jg-u',u?u.couleur:'var(--accent)');   // halo de la pochette
    if(src){coverImg.hidden=false;if(coverImg.getAttribute('src')!==src)coverImg.src=src;}
    else coverImg.hidden=true;
    // Puces "Artiste ?" / "Titre ?" (sonara.js les passe a "trouve")
    var ft=$('found-tags');
    if(ft&&!ft.querySelector('[data-k]')){
      ft.innerHTML='<span class="jg-chip" data-k="artist">Artiste ?</span><span class="jg-chip" data-k="title">Titre ?</span>';
    }
    if(tEl)tEl.textContent='0:00';
  });

  // ── Revelation : points de la manche, classement qui se reordonne ──
  var lastOrder={};
  onClass(rvsc,'on',function(){
    var pts=G.sc-roundStart;
    $('jg-rv-pts').textContent=pts>0?'+'+pts+' pts cette manche':'0 point cette manche';
  });
  var rnkm=$('rnkm');
  new MutationObserver(function(){
    var rows=[].slice.call(rnkm.querySelectorAll('.rnkr'));
    if(!rows.length)return;
    var order={};
    rows.forEach(function(r,i){order[r.getAttribute('data-n')]=i;});
    if(!reduce.matches&&rows.length>1){
      var step=rows[1].getBoundingClientRect().top-rows[0].getBoundingClientRect().top;
      rows.forEach(function(r,i){
        var before=lastOrder[r.getAttribute('data-n')];
        if(before==null||before===i)return;
        r.animate([{transform:'translateY('+((before-i)*step)+'px)'},{transform:'none'}],
          {duration:600,easing:'cubic-bezier(.65,0,.35,1)'});
      });
    }
    lastOrder=order;
  }).observe(rnkm,{childList:true});

  // ── Salle d'attente : pastille de l'univers, joueurs en fondu, inviter ──
  var seen={}, lastCode='';
  onClass(lobby,'on',function(){
    var u=univ(window.G_MULTI&&G_MULTI.theme), chip=$('jg-lobby-univ');
    chip.textContent=u?u.nom:'';
    chip.style.setProperty('--jg-u',u?u.couleur:'');
    lobby.style.setProperty('--jg-u',u?u.couleur:'var(--accent)');   // halo derriere le code
    var code=$('lobby-code').textContent.trim();
    if(code!==lastCode){seen={};lastCode=code;}
  });
  new MutationObserver(function(){
    [].forEach.call($('lobby-players').children,function(li){
      var id=li.getAttribute('data-id');
      if(!seen[id]){seen[id]=1;li.classList.add('is-new');}
    });
  }).observe($('lobby-players'),{childList:true});
  if(window.uvVinyl)$('lobby-wait-vy').innerHTML=uvVinyl({nom:'Sonara',couleur:'var(--accent)',image:null},true,true);
  var invite=$('jg-invite');
  // Lien qui fait entrer directement dans la salle (/?salle=CODE)
  invite.addEventListener('click',function(){
    var code=$('lobby-code').textContent.trim();
    var link=location.origin+'/?salle='+code;
    function done(){invite.textContent='Lien copié';setTimeout(function(){invite.textContent='Inviter';},1800);}
    function copy(){if(navigator.clipboard)navigator.clipboard.writeText(link).then(done).catch(function(){});}
    // Lien complet dans text ET dans url : WhatsApp sur iPhone ne garde que l'un des deux
    if(navigator.share)navigator.share({title:'Sonara',text:'Rejoins ma partie Sonara : '+link,url:link}).catch(function(e){if(e&&e.name!=='AbortError')copy();});
    else copy();
  });

  // ── Mobile : clavier ouvert, zone de reponse collee au-dessus du clavier ──
  // iOS (et Chrome Android recent) : le clavier ne reduit pas la page, seulement
  // window.visualViewport ; Safari decale la zone visible (offsetTop). Pendant la
  // saisie, minuteur + puces + champ passent en position fixe, en bas de la zone
  // visible ; la page ne defile plus ; pochette et question se reduisent.
  var vv=window.visualViewport, ani=$('ani'), dock=$('jg-dock'), root=document.documentElement;
  var typing=false, raf=0;
  function keyboardOpen(){   // zone visible nettement plus basse que la page : clavier ouvert
    return !!vv&&vv.height<root.clientHeight-120;
  }
  function place(){
    raf=0;
    var on=document.activeElement===ani&&!ani.disabled&&$('qsc').classList.contains('on')&&keyboardOpen();
    if(on!==typing){
      typing=on;
      game.classList.toggle('jg-typing',on);
      root.classList.toggle('jg-lock',on);
    }
    if(!on){dock.style.top='';return;}
    // Bas du dock = bas de la zone visible (au-dessus du clavier)
    dock.style.top=Math.round(vv.offsetTop+vv.height-dock.offsetHeight)+'px';
  }
  function later(){if(!raf)raf=requestAnimationFrame(place);}
  if(vv){vv.addEventListener('resize',later);vv.addEventListener('scroll',later);}
  window.addEventListener('scroll',later);
  ani.addEventListener('focus',function(){later();setTimeout(place,300);setTimeout(place,700);});
  ani.addEventListener('blur',function(){setTimeout(place,0);});
  new MutationObserver(later).observe($('qsc'),{attributes:true,attributeFilter:['class']});
  // Manche finie pour ce joueur (champ desactive) : le clavier se ferme
  new MutationObserver(function(){if(ani.disabled&&document.activeElement===ani)ani.blur();later();}).observe(ani,{attributes:true,attributeFilter:['disabled']});
  // Defilement bloque pendant la saisie (iOS ignore overflow:hidden au doigt)
  document.addEventListener('touchmove',function(e){if(typing&&!dock.contains(e.target))e.preventDefault();},{passive:false});
})();
