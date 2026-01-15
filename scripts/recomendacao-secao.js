/**
 * AniGeekNews – Enterprise Section System
 * • Abas com prioridade
 * • Busca dentro do modal
 * • Limite máximo de 12 seções
 * • Ordem personalizada
 */

(function () {

const MAX_SECOES = 12;
const STORAGE_KEY = 'anigeek_secoes_order';

/* ===========================
   TODAS AS SEÇÕES DISPONÍVEIS
=========================== */
const SECOES = [
  { id: 'manchetes', nome: 'Manchetes' },
  { id: 'analises', nome: 'Análises' },
  { id: 'entrevistas', nome: 'Entrevistas' },
  { id: 'lancamentos', nome: 'Lançamentos' },
  { id: 'podcast', nome: 'Podcast' },
  { id: 'futebol', nome: 'Futebol' },
  { id: 'tecnologia', nome: 'Tecnologia' },

  /* NOVAS 10 */
  { id: 'reviews', nome: 'Reviews' },
  { id: 'trailers', nome: 'Trailers' },
  { id: 'streaming', nome: 'Streaming' },
  { id: 'cosplay', nome: 'Cosplay' },
  { id: 'eventos', nome: 'Eventos' },
  { id: 'esports', nome: 'eSports' },
  { id: 'cinema', nome: 'Cinema' },
  { id: 'tv', nome: 'TV & Séries' },
  { id: 'comunidade', nome: 'Comunidade' },
  { id: 'ranking', nome: 'Ranking' }
];

/* ===========================
   CARREGAMENTO
=========================== */
function getOrder(){
  const s = localStorage.getItem(STORAGE_KEY);
  if(s){
    try{
      const arr = JSON.parse(s);
      if(Array.isArray(arr)) return arr;
    }catch(e){}
  }
  return SECOES.slice(0,7).map(s=>s.id);
}

function saveOrder(arr){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
}

/* ===========================
   RENDERIZA FILTER BAR
=========================== */
function renderBar(){
  const wrap = document.getElementById('filterScroller');
  if(!wrap) return;

  const order = getOrder();
  wrap.innerHTML = '';

  order.forEach(id=>{
    const sec = SECOES.find(s=>s.id===id);
    if(!sec) return;

    const btn = document.createElement('button');
    btn.className = 'filter-tag';
    btn.textContent = sec.nome;
    btn.onclick = ()=>{
      document.querySelectorAll('.filter-tag').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      window.carregarSecao?.(sec.id);
    };
    wrap.appendChild(btn);
  });

  const cfg = document.createElement('button');
  cfg.className = 'filter-tag';
  cfg.innerHTML = '⚙';
  cfg.onclick = openModal;
  wrap.appendChild(cfg);

  const first = wrap.querySelector('.filter-tag');
  if(first){ first.classList.add('active'); window.carregarSecao?.(order[0]); }
}

/* ===========================
   MODAL
=========================== */
function openModal(){
  if(document.getElementById('sec-modal')) return;

  const modal = document.createElement('div');
  modal.id = 'sec-modal';
  modal.style.cssText = `position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:9999;display:flex;align-items:center;justify-content:center`;

  modal.innerHTML = `
  <div style="width:90%;max-width:520px;background:#fff;padding:20px;">
    <input id="sec-search" placeholder="Buscar seção..." style="width:100%;padding:10px;border:1px solid #ccc;margin-bottom:10px;">
    <div id="sec-list" style="max-height:50vh;overflow:auto;"></div>
    <div style="display:flex;gap:10px;margin-top:15px">
      <button id="sec-save" style="flex:1;background:#c00;color:#fff;padding:10px">Salvar</button>
      <button id="sec-close" style="flex:1">Cancelar</button>
    </div>
  </div>
  `;

  document.body.appendChild(modal);

  document.getElementById('sec-close').onclick = ()=>modal.remove();
  document.getElementById('sec-save').onclick = saveModal;
  document.getElementById('sec-search').oninput = renderModal;

  renderModal();
}

/* ===========================
   MODAL LIST
=========================== */
function renderModal(){
  const list = document.getElementById('sec-list');
  const search = document.getElementById('sec-search').value.toLowerCase();
  const order = getOrder();

  list.innerHTML = '';

  SECOES.filter(s=>s.nome.toLowerCase().includes(search)).forEach(sec=>{
    const active = order.includes(sec.id);

    const row = document.createElement('div');
    row.style.cssText = `display:flex;justify-content:space-between;padding:8px;border-bottom:1px solid #ddd`;

    const btn = document.createElement('button');
    btn.textContent = active?'Remover':'Adicionar';
    btn.onclick = ()=>{
      let arr = getOrder();
      if(active) arr = arr.filter(i=>i!==sec.id);
      else if(arr.length<MAX_SECOES) arr.push(sec.id);
      saveOrder(arr);
      renderModal();
    };

    row.innerHTML = `<b>${sec.nome}</b>`;
    row.appendChild(btn);
    list.appendChild(row);
  });
}

/* ===========================
   SALVAR
=========================== */
function saveModal(){
  document.getElementById('sec-modal').remove();
  renderBar();
}

/* ===========================
   START
=========================== */
document.addEventListener('DOMContentLoaded', renderBar);

})();
