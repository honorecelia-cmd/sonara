// ═══════════════════════════════════════════════════════════════
// SONARA — landing (refonte d'apres la maquette Nebula)
// 1. Choix du son-nom apres le clic sur "Jouer" (ou un choix du menu)
// 2. Telephone du hero qui monte puis se loge dans le header au defilement
// 3. Trio lecteur : pilote l'apercu de partie du telephone (aucun son)
// Spec : nebula-analyse-pour-sonara.md
// ═══════════════════════════════════════════════════════════════
(function(){
  'use strict';
  var landing=document.getElementById('landing');
  if(!landing)return;
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)');

  // ── 1. Son-nom ──────────────────────────────────────────────
  var dlg=document.getElementById('nb-sonnom');
  var form=document.getElementById('nb-sonnom-form');
  var input=document.getElementById('landing-pseudo');
  var lastFocus=null;
  // Ce qui suit le son-nom : {theme:'zouk'} (menu Univers), {mode:'multi'}
  // (menu Mode) ou null = parcours normal (choix de l'univers)
  var pending=null;
  function openSonnom(next){
    pending=next||null;
    closeMenus();
    lastFocus=document.activeElement;
    dlg.hidden=false;
    setTimeout(function(){input.focus();},30);
  }
  window.nbOpenSonnom=openSonnom;   // utilise par univers.js ("Jouer en ...")
  function closeSonnom(){
    dlg.hidden=true;
    if(lastFocus&&lastFocus.focus)lastFocus.focus();
  }
  landing.addEventListener('click',function(e){
    var t=e.target, b;
    if(t.closest('[data-nb-play]'))openSonnom(null);
    else if(t.closest('[data-nb-close]')||t===dlg)closeSonnom();
    else if((b=t.closest('[data-nb-univ]')))openSonnom({theme:b.getAttribute('data-nb-univ')});
    else if((b=t.closest('[data-nb-mode]')))openSonnom(b.getAttribute('data-nb-mode')==='multi'?{mode:'multi'}:null);
  });
  document.addEventListener('keydown',function(e){
    if(e.key!=='Escape')return;
    if(!dlg.hidden)closeSonnom();
    else closeMenus(true);
  });

  // ── Menus Univers / Mode ──
  var menuBtns=landing.querySelectorAll('.nb-menu-btn');
  function closeMenus(refocus){
    menuBtns.forEach(function(btn){
      if(btn.getAttribute('aria-expanded')!=='true')return;
      btn.setAttribute('aria-expanded','false');
      document.getElementById(btn.getAttribute('aria-controls')).hidden=true;
      if(refocus)btn.focus();
    });
  }
  menuBtns.forEach(function(btn){
    btn.addEventListener('click',function(){
      var open=btn.getAttribute('aria-expanded')==='true';
      closeMenus();
      if(!open){
        btn.setAttribute('aria-expanded','true');
        var list=document.getElementById(btn.getAttribute('aria-controls'));
        list.hidden=false;
        list.querySelector('button').focus();
      }
    });
  });
  document.addEventListener('click',function(e){if(!e.target.closest('.nb-menu'))closeMenus();});

  form.addEventListener('submit',function(e){
    e.preventDefault();
    var v=input.value.trim();
    if(pending&&v){
      G.ps=v;
      if(pending.theme)selectSoloTheme(pending.theme);
      else if(pending.mode==='multi'){
        ['multi-pseudo','join-pseudo'].forEach(function(id){var el=document.getElementById(id);if(el)el.value=v;});
        showPage('s-multi');
      }
    }else startFromLanding();
    // startFromLanding() quitte la landing si le son-nom est valide
    if(window.G&&G.page!=='landing')dlg.hidden=true;
  });
  input.addEventListener('input',function(){input.style.borderColor='';});

  // ── 2. Telephone -> header ──────────────────────────────────
  var hero=document.getElementById('nb-hero');
  var wrap=document.getElementById('nb-phone-wrap');
  var slot=document.getElementById('nb-hd-slot');
  var header=document.getElementById('nb-header');
  var hand=document.getElementById('nb-hand');
  var thumb=document.getElementById('nb-thumb');
  var giant=document.getElementById('nb-giant');
  var nat=null,ticking=false,pS=0,snap=true;

  function measure(){
    wrap.style.transform='';hand.style.transform='';
    // La main et le lettrage geant suivent la position reelle du telephone
    hero.style.setProperty('--hx',wrap.offsetLeft+'px');
    hero.style.setProperty('--hy',wrap.offsetTop+'px');
    snap=true;
    var r=wrap.getBoundingClientRect();
    nat={x:r.left,y:r.top+window.scrollY,w:r.width,h:r.height};
    update();
  }
  function ease(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;}
  function update(){
    ticking=false;
    if(!nat||landing.offsetParent===null)return;
    var y=window.scrollY;
    if(reduce.matches){
      wrap.style.transform='';hand.style.transform='';
      header.classList.toggle('is-on',y>nat.y*.5);
      return;
    }
    // Sortie etalee sur deux fois la distance qui amene le centre du
    // telephone en haut de l'ecran (ou moins si la page est trop courte)
    var maxY=document.documentElement.scrollHeight-window.innerHeight;
    var end=Math.max(1,Math.min((nat.y+nat.h*.5)*2,maxY));
    var target=Math.min(1,Math.max(0,y/end));
    // Lissage : la progression rattrape le defilement en douceur
    if(snap){pS=target;snap=false;}
    else pS+=(target-pS)*.14;
    if(Math.abs(target-pS)<.0005)pS=target;
    else if(!ticking){ticking=true;requestAnimationFrame(update);}
    var p=pS;
    var e=ease(p);
    var s=slot.getBoundingClientRect();
    var cx=nat.x+nat.w/2, cy=nat.y-y+nat.h/2;
    var tx=(s.left+s.width/2-cx)*e;
    var ty=(s.top+s.height/2-cy)*e;
    var k=1+(s.height/nat.h-1)*e;
    var tf='translate3d('+tx.toFixed(2)+'px,'+ty.toFixed(2)+'px,0) scale('+k.toFixed(4)+')';
    wrap.style.transform=tf;
    hand.style.transform=tf;   // la main part avec le telephone (meme centre, voir CSS)
    wrap.classList.toggle('nb-wrap-docked',p>=1);
    header.classList.toggle('is-on',p>.45);
    var fade=Math.max(0,1-p*3);
    hand.style.opacity=fade;
    thumb.style.opacity=fade;
    // Parallaxe : le lettrage geant glisse plus lentement que la page
    if(y<hero.offsetHeight&&giant.offsetParent){
      var par='translate3d(0,'+(y*.25).toFixed(1)+'px,0)';
      giant.style.transform=par;
    }
  }
  function onScroll(){if(!ticking){ticking=true;requestAnimationFrame(update);}}
  window.addEventListener('scroll',onScroll,{passive:true});
  window.addEventListener('resize',measure);
  window.addEventListener('load',measure);
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(measure);
  measure();
  // Telephone loge dans le header : raccourci vers "Jouer"
  wrap.addEventListener('click',function(){if(wrap.classList.contains('nb-wrap-docked'))openSonnom();});
  // Retour sur la landing (showPage) : la page reapparait, on remesure
  new MutationObserver(function(){if(landing.style.display!=='none')measure();})
    .observe(landing,{attributes:true,attributeFilter:['style']});

  // ── 3. Trio lecteur -> apercu de partie ─────────────────────
  var UNIV=[['Zouk','cover_zouk'],['Kompa','cover_kompa'],['Dancehall','cover_dancehall'],
            ['Reggae','cover_reggae'],['Soca','cover_soca'],['Rap','cover_rap']];
  var cover=document.getElementById('nb-scr-cover');
  var manche=document.getElementById('nb-scr-manche');
  var fill=document.getElementById('nb-scr-fill');
  var clock=document.getElementById('nb-scr-t');
  var round=3,u=0,t=12,paused=false,last=0;
  var DUR=30;

  function render(){
    manche.textContent='Manche '+round+'/10';
    cover.style.backgroundImage="url('/img/"+UNIV[u][1]+".jpg')";
  }
  function step(dir){
    round=(round-1+dir+10)%10+1;
    u=(u+dir+UNIV.length)%UNIV.length;
    t=0;render();tickClock();
  }
  function tickClock(){
    fill.style.width=(t/DUR*100).toFixed(2)+'%';
    var sec=Math.floor(t);
    clock.textContent='0:'+(sec<10?'0':'')+sec;
  }
  function loop(now){
    if(last&&!paused&&!reduce.matches&&!document.hidden){
      t+=(now-last)/1000;
      if(t>=DUR){step(1);}
      tickClock();
    }
    last=now;
    requestAnimationFrame(loop);
  }
  landing.querySelectorAll('[data-nb-trio]').forEach(function(b){
    b.addEventListener('click',function(){
      var a=b.getAttribute('data-nb-trio');
      if(a==='prev')step(-1);
      else if(a==='next')step(1);
      else{
        paused=!paused;
        b.setAttribute('aria-pressed',String(paused));
        b.setAttribute('aria-label',paused?'Lecture':'Pause');
      }
    });
  });
  tickClock();
  requestAnimationFrame(loop);

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
    // b. "SONARA" du footer et etapes de "Comment jouer" : a l'entree a l'ecran
    var io=new IntersectionObserver(function(es){
      es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('is-in');io.unobserve(e.target);}});
    },{threshold:.35});
    ['.nb-ft-word','.nb-steps'].forEach(function(s){var el=document.querySelector(s);if(el)io.observe(el);});
  })();
})();
