// ═══════════════════════════════════════════════════════════════
// SONARA, kit de design : petites animations de presentation.
// Aucune logique de jeu (ni WebSocket, ni score, ni minuteur) : ces
// fonctions ne font qu'ajouter ou retirer des classes du kit.
// Respecte prefers-reduced-motion (les classes du kit s'y plient).
// ═══════════════════════════════════════════════════════════════
(function(){
  'use strict';
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)');

  // Rejoue une animation CSS sur un element (retire puis remet la classe)
  function replay(el,cls){
    if(!el)return;
    el.classList.remove(cls);void el.offsetWidth;el.classList.add(cls);
  }

  var SonaraKit={
    // Rond de joueur : premiere lettre du son-nom (sans symbole), "?" si vide
    initial:function(name){
      var m=String(name||'').trim().match(/[\p{L}\p{N}]/u);
      return m?m[0].toLocaleUpperCase('fr'):'?';
    },
    // Remplit un .sn-avatar avec l'initiale et le nom complet pour les lecteurs d'ecran
    avatar:function(el,name){
      if(!el)return;
      el.textContent=SonaraKit.initial(name);
      el.setAttribute('aria-hidden','true');
      el.title=String(name||'');
    },
    // Cascade d'apparition : numerote les enfants (--sn-i) d'un conteneur .sn-stagger
    stagger:function(container){
      if(!container)return;
      [].forEach.call(container.children,function(c,i){c.style.setProperty('--sn-i',i);});
      replay(container,'sn-stagger');
    },
    // Bonne reponse : pop du badge de score (couleur succes)
    popScore:function(el,text){
      if(!el)return;
      if(text!=null)el.textContent=text;
      el.classList.add('sn-is-success');replay(el,'sn-anim-pop');
    },
    // Score qui s'envole au-dessus d'un element (cree puis retire)
    flyScore:function(anchor,text){
      if(!anchor)return;
      var b=document.createElement('span');
      b.className='sn-badge sn-badge--score sn-anim-fly';
      b.textContent=text;
      b.style.cssText='position:absolute;left:50%;top:0;pointer-events:none';
      if(getComputedStyle(anchor).position==='static')anchor.style.position='relative';
      anchor.appendChild(b);
      setTimeout(function(){b.remove();},reduce.matches?0:1000);
    },
    // Erreur discrete : petite secousse
    shake:function(el){replay(el,'sn-anim-shake');},
    // Pochette : floue -> devoilee (transition .9 s du kit)
    reveal:function(cover){
      if(!cover)return;
      cover.classList.remove('is-blurred');cover.classList.add('is-revealed');
    },
    hide:function(cover){
      if(!cover)return;
      cover.classList.remove('is-revealed');cover.classList.add('is-blurred');
    },
    // Compte a rebours visuel (3, 2, 1) dans un element ; appelle done a la fin
    countdown:function(el,from,done){
      if(!el)return;
      var n=from||3;
      (function tick(){
        if(n<=0){if(done)done();return;}
        el.textContent=n;replay(el,'sn-anim-countdown');n--;
        setTimeout(tick,900);
      })();
    }
  };
  window.SonaraKit=SonaraKit;
})();
