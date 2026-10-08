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
  var invite=$('jg-invite');
  invite.addEventListener('click',function(){
    var code=$('lobby-code').textContent.trim();
    var txt='Rejoins ma salle Sonara avec le code '+code+' : '+location.origin+'/';
    function done(){invite.textContent='Invitation copiée';setTimeout(function(){invite.textContent='Inviter';},1800);}
    if(navigator.share)navigator.share({text:txt}).catch(function(){});
    else if(navigator.clipboard)navigator.clipboard.writeText(txt).then(done).catch(function(){});
  });

  // ── Mobile : clavier ouvert, le champ et le minuteur restent visibles ──
  var vv=window.visualViewport, ani=$('ani');
  function fit(){
    if(!vv)return;
    var h=Math.round(vv.height);
    game.style.setProperty('--jg-vvh',h+'px');
    var kbd=h<window.innerHeight*0.8&&document.activeElement===ani;
    game.classList.toggle('jg-kbd',kbd);
    if(kbd)window.scrollTo(0,0);   // mise en page compacte : tout tient en haut
  }
  if(vv){vv.addEventListener('resize',fit);vv.addEventListener('scroll',fit);}
  ani.addEventListener('focus',function(){setTimeout(fit,250);});
  ani.addEventListener('blur',function(){game.classList.remove('jg-kbd');});
})();
