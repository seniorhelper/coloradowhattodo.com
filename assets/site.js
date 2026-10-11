(function(){
  "use strict";
  var RM = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $  = function(s,c){ return (c||document).querySelector(s); };
  var $$ = function(s,c){ return Array.prototype.slice.call((c||document).querySelectorAll(s)); };

  var hdr = $('#hdr');
  function measureHeader(){
    if(!hdr) return;
    var h = hdr.offsetHeight || 88;
    document.documentElement.style.setProperty('--hdr-h', h + 'px');
    $$('section[id]').forEach(function(el){ el.style.scrollMarginTop = (h + 14) + 'px'; });
  }
  measureHeader();
  window.addEventListener('load', measureHeader);
  window.addEventListener('resize', measureHeader);
  window.addEventListener('orientationchange', function(){ setTimeout(measureHeader, 220); });

  var burger = $('#burger'), nav = $('#nav');
  if(burger && nav){
    burger.addEventListener('click', function(){
      var open = nav.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      document.body.style.overflow = open ? 'hidden' : '';
      if(open){ var f = nav.querySelector('a'); if(f) f.focus(); }
    });
    nav.addEventListener('click', function(e){
      if(e.target.tagName === 'A' && nav.classList.contains('open')){
        nav.classList.remove('open');
        burger.setAttribute('aria-expanded','false');
        document.body.style.overflow = '';
      }
    });
    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape' && nav.classList.contains('open')){
        nav.classList.remove('open');
        burger.setAttribute('aria-expanded','false');
        document.body.style.overflow = '';
        burger.focus();
      }
    });
  }

  var rvs = $$('.rv');
  if(!RM){
    var rvList = rvs.slice(), rvTick = false;
    function rvCheck(){ rvTick = false; var line = window.innerHeight * 0.92, atEnd = (window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 4;
      rvList = rvList.filter(function(el){ if(atEnd || el.getBoundingClientRect().top < line){ el.classList.add('in'); return false; } return true; });
      if(!rvList.length){ window.removeEventListener('scroll', rvOnScroll); window.removeEventListener('resize', rvOnScroll); } }
    function rvOnScroll(){ if(!rvTick){ rvTick = true; requestAnimationFrame(rvCheck); } }
    if(rvList.length){ window.addEventListener('scroll', rvOnScroll, {passive:true}); window.addEventListener('resize', rvOnScroll); rvCheck(); }
  } else { rvs.forEach(function(el){ el.classList.add('in'); }); }

  /* ---------- card filters ---------- */
  var cards = $$('.card[data-q]');
  var chips = $$('.chip[data-group]');
  var countEl = $('#cardCount');
  var emptyEl = $('#cardEmpty');
  var search = $('#cardSearch');
  var state = {};
  chips.forEach(function(c){ state[c.getAttribute('data-group')] = []; });
  var query = '';

  function matches(el){
    if(query && (el.getAttribute('data-q') || '').indexOf(query) === -1) return false;
    for(var g in state){
      var picked = state[g];
      if(!picked.length) continue;
      var vals = (el.getAttribute('data-' + g) || '').split(' ');
      if(!picked.some(function(p){ return vals.indexOf(p) !== -1; })) return false;
    }
    return true;
  }
  function apply(){
    if(!cards.length) return;
    var shown = 0;
    cards.forEach(function(el){
      if(matches(el)){ el.hidden = false; shown++; } else { el.hidden = true; }
    });
    if(countEl){
      countEl.textContent = shown === cards.length
        ? ('Showing all ' + cards.length)
        : (shown === 0 ? 'Nothing matches those filters' : ('Showing ' + shown + ' of ' + cards.length));
    }
    if(emptyEl) emptyEl.hidden = shown !== 0;
  }
  chips.forEach(function(chip){
    chip.addEventListener('click', function(){
      var g = chip.getAttribute('data-group'), v = chip.getAttribute('data-value');
      if(chip.getAttribute('aria-pressed') === 'true'){
        chip.setAttribute('aria-pressed','false');
        state[g] = state[g].filter(function(x){ return x !== v; });
      } else {
        chip.setAttribute('aria-pressed','true');
        state[g].push(v);
      }
      apply();
    });
  });
  if(search) search.addEventListener('input', function(){ query = search.value.trim().toLowerCase(); apply(); });
  var reset = $('#cardReset');
  if(reset) reset.addEventListener('click', function(){
    chips.forEach(function(c){ c.setAttribute('aria-pressed','false'); });
    for(var g in state) state[g] = [];
    if(search) search.value = '';
    query = '';
    apply();
  });
  apply();

/* ---------- lead form: see handler before </body> ---------- */
  var yr = $('#yr');
  if(yr) yr.textContent = new Date().getFullYear();
})();
