/* ======================================================
   AniGeekNews – Enterprise Section System v3
   • Sliding panel
   • Modo Fixo / Dinâmico
   • Aprendizado por uso
   • Limite de 12 abas
====================================================== */

(function(){

const MAX = 12;
const KEY_ORDER = 'ag_sections_order';
const KEY_MODE  = 'ag_sections_mode';
const KEY_STATS = 'ag_sections_stats';

/* ===========================
   TODAS AS SEÇÕES
=========================== */
const SECOES = [
  { id:'manchetes', nome:'Manchetes' },
  { id:'analises', nome:'Análises' },
  { id:'entrevistas', nome:'Entrevistas' },
  { id:'lancamentos', nome:'Lançamentos' },
  { id:'podcast', nome:'Podcast' },
  { id:'futebol', nome:'Futebol' },
  { id:'tecnologia', nome:'Tecnologia' },

  { id:'reviews', nome:'Reviews' },
  { id:'trailers', nome:'Trailers' },
  { id:'streaming', nome:'Streaming' },
  { id:'cosplay', nome:'Cosplay' },
  { id:'eventos', nome:'Eventos' },
  { id:'esports', nome:'eSports' },
  { id:'cinema', nome:'Cinema' },
  { id:'tv', nome:'TV & Séries' },
  { id:'comunidade', nome:'Comunidade' },
  { id:'ranking', nome:'Ranking' }
];

/* ===========================
   UTIL
=========================== */
function load(k,d){ try{ return JSON.parse(localStorage.getItem(k)) ?? d }catch(e){ return d } }
function save(k,v){ localStorage.setItem(k,JSON.stringify(v)); }

/* ===========================
   ORDEM & MODE
=========================== */
function getMode(){ return localStorage.getItem(KEY_MODE) || 'dynamic'; }
function setMode(m){ localStorage.setItem(KEY_MODE,m); }

function getOrder(){
  const saved = load(KEY_ORDER,null);
  if(saved) return saved;
  return SECOES.slice(0,7).map(s=>s.id);
}

/* ===========================
   STATS (modo dinâmico)
=========================== */
function getStats(){ return load(KEY_STATS,{}); }

function track(id){
  const stats = getStats();
  stats[id] = (stats[id] || 0) + 1;
  save(KEY_STATS,stats);

  if(getMode()==='dynamic'){
    autoReorder();
  }
}

function autoReorder(){
  const stats = getStats();
  const order = getOrder();

  order.sort((a,b)=>(stats[b]||0)-(stats[a]||0));
  save(KEY_ORDER,order);
}

/* ===========================
   FILTER BAR
=========================== */
function renderBar(){
  const bar = document.getElementById('filterScroller');
  if(!bar) return;

  const order = getOrder();
  bar.innerHTML = '';

  order.forEach(id=>{
    const sec = SECOES.find(s=>s.id===id);
    if(!sec) return;

    const btn = document.createElement('button');
    btn.className='filter-tag';
    btn.textContent=sec.nome;

    btn.onclick=()=>{
      document.querySelectorAll('.filter-tag').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      track(id);
      window.carregarSecao?.(id);
    };

    bar.appendChild(btn);
  });

  const cfg=document.createElement('button');
  cfg.className='filter-tag';
  cfg.innerHTML='⚙';
  cfg.onclick=openPanel;
  bar.appendChild(cfg);

  const first=bar.querySelector('.filter-tag');
  if(first){ first.classList.add('active'); window.carregarSecao?.(order[0]); }
}

/* ===========================
   SLIDING PANEL
=========================== */
function openPanel(){
  if(document.getElementById('ag-panel')) return;

  const panel=document.createElement('div');
  panel.id='ag-panel';
  panel.style.cssText=`
    position:fixed;
    top:0;right:0;
    width:340px;height:100vh;
    background:#111;
    color:#fff;
    z-index:9999;
    padding:20px;
    transform:translateX(100%);
    transition:.4s;
  `;

  panel.innerHTML=`
    <h3 style="margin:0 0 10px">Personalizar Abas</h3>

    <div style="display:flex;gap:10px;margin-bottom:15px">
      <button id="mode-fixed">Fixo</button>
      <button id="mode-dynamic">Dinâmico</button>
    </div>

    <input id="sec-search" placeholder="Buscar…" style="width:100%;padding:10px">

    <div id="sec-list" style="margin-top:15px;max-height:70vh;overflow:auto"></div>
  `;

  document.body.appendChild(panel);
  requestAnimationFrame(()=>panel.style.transform='translateX(0)');

  document.getElementById('mode-fixed').onclick=()=>{ setMode('fixed'); };
  document.getElementById('mode-dynamic').onclick=()=>{ setMode('dynamic'); };

  document.getElementById('sec-search').oninput=renderPanel;
  renderPanel();
}

/* ===========================
   PANEL LIST
=========================== */
function renderPanel(){
  const list=document.getElementById('sec-list');
  const q=document.getElementById('sec-search').value.toLowerCase();
  const order=getOrder();

  list.innerHTML='';

  SECOES.filter(s=>s.nome.toLowerCase().includes(q)).forEach(sec=>{
    const active=order.includes(sec.id);

    const row=document.createElement('div');
    row.style.cssText='display:flex;justify-content:space-between;padding:8px;border-bottom:1px solid #333';

    const btn=document.createElement('button');
    btn.textContent=active?'Remover':'Adicionar';

    btn.onclick=()=>{
      let arr=getOrder();
      if(active) arr=arr.filter(i=>i!==sec.id);
      else if(arr.length<MAX) arr.push(sec.id);
      save(KEY_ORDER,arr);
      renderPanel();
      renderBar();
    };

    row.innerHTML=`<span>${sec.nome}</span>`;
    row.appendChild(btn);
    list.appendChild(row);
  });
}

/* ===========================
   START
=========================== */
document.addEventListener('DOMContentLoaded',renderBar);

})();
