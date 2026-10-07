// ═══════════════════════════════════════════════════════════════
// SONARA, ecran de resultats (#s-res) : affichage seulement.
// doResults() (sonara.js) calcule le classement (tri, ex aequo, scores)
// sans changement, puis appelle SonaraResultats.render(sorted).
// Celebration : mosaique des pochettes de la partie devoilee en cascade,
// puis podium qui monte (3e, 2e, 1er) et reste du classement.
// Aucune synchronisation : l'animation part quand l'ecran s'affiche.
// ═══════════════════════════════════════════════════════════════
(function(){
  'use strict';
  var $=function(id){return document.getElementById(id);};
  var STAGGER=90, REVEAL=900, RISE=600, GAP=350;   // ms

  function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
  function initial(n){var m=String(n||'').trim().match(/[\p{L}\p{N}]/u);return m?m[0].toLocaleUpperCase('fr'):'?';}
  function univ(slug){
    var list=window.UNIVERS||[];
    for(var i=0;i<list.length;i++)if(list[i].slug===slug)return list[i];
    return null;
  }
  function plural(n,one,many){return n+' '+(n>1?many:one);}

  // Pochettes des manches, dans l'ordre : la meme image que la revelation en
  // jeu (pochette du morceau, sinon celle de son univers) ; aplat de la
  // couleur de l'univers si aucune image
  function tiles(){
    var theme=typeof themeSlug==='function'?themeSlug():'mix';
    return (G.qs||[]).map(function(q){
      var key=q.u||theme, u=univ(key);
      var src=q.cover||(typeof universeCover==='function'?universeCover(key):null);
      return {src:src, color:u?u.couleur:'var(--accent)'};
    });
  }

  // Bande de pochettes en lignes completes : une pochette qui ne remplit pas
  // sa ligne est masquee (3 colonnes sur mobile, 5 sur ordinateur, voir CSS)
  function renderMosaic(list){
    var full3=Math.floor(list.length/3)*3, full5=Math.floor(list.length/5)*5;
    $('rs-mosaic').innerHTML=list.map(function(t,i){
      var d='--d:'+(i*STAGGER)+'ms';
      var cls='rs-tile'+(i>=full3?' rs-x3':'')+(i>=full5?' rs-x5':'');
      return '<div class="'+cls+'" style="--rs-c:'+t.color+'">'+
        (t.src?'<img src="'+esc(t.src)+'" alt="" style="'+d+'" onerror="this.remove()">':'<span style="'+d+';display:block;width:100%;height:100%"></span>')+
        '</div>';
    }).join('');
  }

  function score(p){return p.me?G.sc:p.s;}

  window.SonaraResultats={
    render:function(sorted){
      var list=tiles();
      renderMosaic(list);
      // Fin de la mosaique : derniere pochette affichee nette (lignes completes)
      var shown=Math.floor(list.length/(window.matchMedia('(max-width: 767px)').matches?3:5))*(window.matchMedia('(max-width: 767px)').matches?3:5);
      var mosaicEnd=shown?(shown-1)*STAGGER+REVEAL:0;
      $('fig-res-theme').textContent='Univers '+(G.theme||'');
      var pod=$('pod'), solo=$('rs-solo'), rest=$('rtbl'), btns=$('rs-btns');
      var end;

      if(sorted.length<2){
        // Solo : score en grand, titres et artistes trouves, mosaique
        var h=G.history||[], titles=0, artists=0;
        h.forEach(function(x){
          if(x.found==='both'||x.found==='title')titles++;
          if(x.found==='both'||x.found==='artist')artists++;
        });
        pod.hidden=true;pod.innerHTML='';rest.innerHTML='';
        solo.hidden=false;
        solo.style.setProperty('--d',Math.max(0,mosaicEnd-RISE)+'ms');
        $('rs-solo-score').textContent=G.sc;
        $('rs-solo-found').textContent=plural(titles,'titre','titres')+' et '+plural(artists,'artiste','artistes')+' trouvés';
        end=Math.max(0,mosaicEnd-RISE)+RISE;
      }else{
        // Podium : 2 ou 3 marches, classement de doResults tel quel
        solo.hidden=true;pod.hidden=false;
        var top=sorted.slice(0,Math.min(3,sorted.length));
        // Le 1er arrive en dernier, apres la fin de la mosaique ; 350 ms entre les marches
        var t1=Math.max(mosaicEnd,(top.length-1)*GAP);
        end=t1+RISE;
        pod.innerHTML=top.map(function(p,i){
          var rank=i+1, d=t1-(rank-1)*GAP;
          return '<li class="rs-step rs-step--'+rank+'" style="--d:'+d+'ms;--d-end:'+end+'ms">'+
            '<b class="rs-rank">'+rank+'</b>'+
            '<span class="sn-avatar'+(rank===1?'':' sn-avatar--d')+'" aria-hidden="true">'+esc(initial(p.n))+'</span>'+
            '<span class="rs-name">'+esc(p.n)+(p.me?' (toi)':'')+'</span>'+
            '<span class="rs-score">'+score(p)+' <small>pts</small></span>'+
          '</li>';
        }).join('');
        // 4e et suivants : en fondu apres l'arrivee du 1er
        rest.style.setProperty('--d',end+'ms');
        rest.innerHTML=sorted.slice(3).map(function(p,i){
          return '<li class="sn-player-row'+(p.me?' is-me':'')+'">'+
            '<span class="sn-player-row__rank">'+(i+4)+'</span>'+
            '<span class="sn-avatar sn-avatar--d" aria-hidden="true">'+esc(initial(p.n))+'</span>'+
            '<span class="sn-player-row__name">'+esc(p.n)+(p.me?' (toi)':'')+'</span>'+
            '<span class="sn-player-row__pts">'+score(p)+' pts</span>'+
          '</li>';
        }).join('');
      }
      btns.style.setProperty('--d',end+'ms');
      $('rs-after').style.setProperty('--d',end+'ms');
    }
  };
})();
