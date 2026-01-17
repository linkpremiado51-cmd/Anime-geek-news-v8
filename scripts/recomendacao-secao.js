/* ======================================================
   AniGeekNews – Enterprise Section System v7 (REVISADO)
   • Títulos de Sessão Clicáveis (Categorias Pai)
   • Notificações Toast Silenciadas (Lógica Interna)
   • Controle de Foco Otimizado
   • Integração Total com navegacao.js
====================================================== */

(function(){

const CONFIG = {
  MAX_TABS: 12,
  KEYS: {
    ORDER: 'ag_v7_order',
    MODE:  'ag_v7_mode', // 'dynamic' ou 'fixed'
    STATS: 'ag_v7_stats'
  }
};

/* ===========================
   BANCO DE DADOS (CATÁLOGO OFICIAL)
=========================== */
const CATALOGO = [
  {
    sessao: "MANCHETES",
    id: 'manchetes', 
    cor: "#FF4500", 
    itens: [
      { id: 'destaques', label: 'Destaques do Dia' },
      { id: 'ultimas', label: 'Últimas Notícias' },
      { id: 'trending', label: 'Trending / Em Alta' },
      { id: 'exclusivos', label: 'Exclusivos' },
      { id: 'urgente', label: 'Urgente' },
      { id: 'maislidas', label: 'Mais Lidas' },
      { id: 'editorpick', label: 'Editor’s Pick' }
    ]
  },
  {
    sessao: "ANÁLISES",
    id: 'analises',
    cor: "#8A2BE2",
    itens: [
      { id: 'opiniao', label: 'Opinião' },
      { id: 'critica', label: 'Crítica Técnica' },
      { id: 'analisemercado', label: 'Análise de Mercado' },
      { id: 'comparativos', label: 'Comparativos' },
      { id: 'teorias', label: 'Teorias' },
      { id: 'explicacoes', label: 'Explicações' },
      { id: 'impacto', label: 'Impacto na Indústria' }
    ]
  },
  {
    sessao: "ENTREVISTAS",
    id: 'entrevistas',
    cor: "#20B2AA",
    itens: [
      { id: 'devs', label: 'Desenvolvedores' },
      { id: 'criadores', label: 'Criadores de Conteúdo' },
      { id: 'atores', label: 'Atores / Dubladores' },
      { id: 'influencers', label: 'Influencers' },
      { id: 'pro_industria', label: 'Profissionais' },
      { id: 'comunidade_ent', label: 'Comunidade' }
    ]
  },
  {
    sessao: "LANÇAMENTOS",
    id: 'lancamentos',
    cor: "#32CD32",
    itens: [
      { id: 'lanc_jogos', label: 'Jogos' },
      { id: 'lanc_animes', label: 'Animes' },
      { id: 'lanc_filmes', label: 'Filmes' },
      { id: 'lanc_series', label: 'Séries' },
      { id: 'lanc_tech', label: 'Tecnologia' },
      { id: 'lanc_mangas', label: 'Mangás / HQs' },
      { id: 'datas', label: 'Datas Confirmadas' },
      { id: 'rumores', label: 'Rumores' }
    ]
  },
  {
    sessao: "REVIEWS",
    id: 'reviews',
    cor: "#FFD700",
    itens: [
      { id: 'rev_jogos', label: 'Jogos' },
      { id: 'rev_animes', label: 'Animes' },
      { id: 'rev_filmes', label: 'Filmes' },
      { id: 'rev_series', label: 'Séries' },
      { id: 'rev_tech', label: 'Tecnologia' },
      { id: 'rev_geek', label: 'Produtos Geek' },
      { id: 'rev_eventos', label: 'Eventos' },
      { id: 'rev_stream', label: 'Streaming' }
    ]
  },
  {
    sessao: "TRAILERS",
    id: 'trailers',
    cor: "#DC143C",
    itens: [
      { id: 'tr_jogos', label: 'Jogos' },
      { id: 'tr_animes', label: 'Animes' },
      { id: 'tr_filmes', label: 'Filmes' },
      { id: 'tr_series', label: 'Séries' },
      { id: 'tr_teasers', label: 'Teasers' },
      { id: 'tr_oficiais', label: 'Trailers Oficiais' },
      { id: 'tr_gameplay', label: 'Gameplay Reveal' }
    ]
  },
  {
    sessao: "STREAMING",
    id: 'streaming',
    cor: "#00BFFF",
    itens: [
      { id: 'st_netflix', label: 'Netflix' },
      { id: 'st_prime', label: 'Prime Video' },
      { id: 'st_disney', label: 'Disney+' },
      { id: 'st_hbo', label: 'HBO Max' },
      { id: 'st_crunchy', label: 'Crunchyroll' },
      { id: 'st_star', label: 'Star+' },
      { id: 'st_apple', label: 'Apple TV+' },
      { id: 'st_semana', label: 'Lançamentos da Semana' }
    ]
  },
  {
    sessao: "PODCAST",
    id: 'podcast',
    cor: "#9370DB",
    itens: [
      { id: 'pod_recentes', label: 'Episódios Recentes' },
      { id: 'pod_geek', label: 'Temas Geek' },
      { id: 'pod_games', label: 'Games' },
      { id: 'pod_tech', label: 'Tecnologia' },
      { id: 'pod_pop', label: 'Cultura Pop' },
      { id: 'pod_ent', label: 'Entrevistas' },
      { id: 'pod_back', label: 'Bastidores' }
    ]
  },
  {
    sessao: "FUTEBOL",
    id: 'futebol',
    cor: "#2E8B57",
    itens: [
      { id: 'fut_news', label: 'Notícias' },
      { id: 'fut_analise', label: 'Análises' },
      { id: 'fut_mercado', label: 'Mercado da Bola' },
      { id: 'fut_opiniao', label: 'Opinião' },
      { id: 'fut_estat', label: 'Estatísticas' },
      { id: 'fut_inter', label: 'Futebol Internacional' },
      { id: 'fut_nacional', label: 'Futebol Nacional' }
    ]
  },
  {
    sessao: "TECNOLOGIA",
    id: 'tecnologia',
    cor: "#4682B4",
    itens: [
      { id: 'smartphones', label: 'Smartphones' },
      { id: 'tech_hard', label: 'Hardware' },
      { id: 'tech_soft', label: 'Software' },
      { id: 'tech_ai', label: 'Inteligência Artificial' },
      { id: 'tech_gamestech', label: 'Games Tech' },
      { id: 'tech_sec', label: 'Segurança Digital' },
      { id: 'tech_inov', label: 'Inovação' },
      { id: 'tech_start', label: 'Startups' }
    ]
  },
  {
    sessao: "COSPLAY",
    id: 'cosplay',
    cor: "#FF69B4",
    itens: [
      { id: 'cosp_dest', label: 'Destaques' },
      { id: 'cosp_event', label: 'Eventos' },
      { id: 'cosp_ent', label: 'Entrevistas' },
      { id: 'cosp_guias', label: 'Guias' },
      { id: 'cosp_com', label: 'Comunidade' },
      { id: 'cosp_fotos', label: 'Fotos' }
    ]
  },
  {
    sessao: "EVENTOS",
    id: 'eventos',
    cor: "#FF8C00",
    itens: [
      { id: 'evt_feiras', label: 'Feiras Geek' },
      { id: 'evt_camp', label: 'Campeonatos' },
      { id: 'evt_conv', label: 'Convenções' },
      { id: 'evt_lanc', label: 'Lançamentos Presenciais' },
      { id: 'evt_cal', label: 'Calendário' },
      { id: 'evt_live', label: 'Cobertura Ao Vivo' }
    ]
  },
  {
    sessao: "ESPORTS",
    id: 'esports',
    cor: "#00008B",
    itens: [
      { id: 'esp_camp', label: 'Campeonatos' },
      { id: 'esp_times', label: 'Times' },
      { id: 'esp_jog', label: 'Jogadores' },
      { id: 'esp_res', label: 'Resultados' },
      { id: 'esp_ana', label: 'Análises' },
      { id: 'esp_agd', label: 'Agenda' }
    ]
  },
  {
    sessao: "CINEMA",
    id: 'cinema',
    cor: "#8B0000",
    itens: [
      { id: 'cine_news', label: 'Notícias' },
      { id: 'cine_lanc', label: 'Lançamentos' },
      { id: 'cine_rev', label: 'Reviews' },
      { id: 'cine_bilh', label: 'Bilheteria' },
      { id: 'cine_bast', label: 'Bastidores' },
      { id: 'cine_prem', label: 'Premiações' }
    ]
  },
  {
    sessao: "TV & SÉRIES",
    id: 'tv',
    cor: "#483D8B",
    itens: [
      { id: 'tv_news', label: 'Notícias' },
      { id: 'tv_lanc', label: 'Lançamentos' },
      { id: 'tv_rev', label: 'Reviews' },
      { id: 'tv_renov', label: 'Renovadas / Canceladas' },
      { id: 'tv_eps', label: 'Episódios' },
      { id: 'tv_bast', label: 'Bastidores' }
    ]
  },
  {
    sessao: "COMUNIDADE",
    id: 'comunidade',
    cor: "#2F4F4F",
    itens: [
      { id: 'com_op', label: 'Opinião do Leitor' },
      { id: 'com_enq', label: 'Enquetes' },
      { id: 'com_dest', label: 'Comentários em Destaque' },
      { id: 'com_fan', label: 'Fanarts' },
      { id: 'com_teo', label: 'Teorias da Comunidade' }
    ]
  },
  {
    sessao: "RANKING",
    id: 'ranking',
    cor: "#B8860B",
    itens: [
      { id: 'rank_jogos', label: 'Melhores Jogos' },
      { id: 'rank_animes', label: 'Melhores Animes' },
      { id: 'rank_filmes', label: 'Melhores Filmes' },
      { id: 'rank_series', label: 'Top Séries' },
      { id: 'rank_ano', label: 'Rankings do Ano' },
      { id: 'rank_voto', label: 'Votação do Público' }
    ]
  }
];

/* ===========================
   CSS INJETADO (ESTILOS FIXOS)
=========================== */
const styles = `
  #ag-drawer {
    background: #ffffff;
    border-bottom: 1px solid #e0e0e0;
    overflow: hidden;
    max-height: 0;
    transition: all 0.5s cubic-bezier(0.25, 1, 0.5, 1);
    opacity: 0;
    width: 100%;
    position: absolute;
    left: 0;
    z-index: 1000;
  }
  body.dark-mode #ag-drawer { background: #141414; border-color: #333; }
  #ag-drawer.open { max-height: 85vh; opacity: 1; }
  .ag-drawer-scroll { max-height: 85vh; overflow-y: auto; padding: 30px 20px; }
  
  .ag-drawer-header {
    display: flex; justify-content: space-between; align-items: center; gap: 20px; flex-wrap: wrap;
    max-width: 1200px; position: sticky; top: -30px; z-index: 100; margin: -30px auto 30px auto; padding: 25px 0;
    background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(12px);
  }
  body.dark-mode .ag-drawer-header { background: rgba(20, 20, 20, 0.9); }

  .ag-search-wrapper { position: relative; flex: 1; min-width: 280px; }
  .ag-search-input { 
    width: 100%; padding: 11px 15px 11px 45px; border-radius: 10px; border: 1px solid rgba(0,0,0,0.1);
    background: rgba(0,0,0,0.04); font-size: 14px; outline: none; 
  }
  body.dark-mode .ag-search-input { background: rgba(255,255,255,0.05); color: #fff; }

  .ag-mode-group { background: rgba(0,0,0,0.05); padding: 4px; border-radius: 10px; display: flex; }
  .ag-mode-btn { padding: 8px 16px; border: none; background: transparent; border-radius: 7px; font-size: 11px; font-weight: 800; cursor: pointer; text-transform: uppercase; color: #888; }
  .ag-mode-btn.active { background: #fff; color: #000; }
  body.dark-mode .ag-mode-btn.active { background: #333; color: #fff; }

  .ag-section-block { margin-bottom: 35px; max-width: 1200px; margin: 0 auto 35px auto; }
  .ag-section-header-btn { display: flex; align-items: center; gap: 10px; background: none; border: none; cursor: pointer; padding: 5px 0; }
  .ag-section-text { font-size: 14px; font-weight: 900; text-transform: uppercase; color: #333; }
  body.dark-mode .ag-section-text { color: #fff; }
  .ag-section-header-btn.is-active .ag-section-text { color: #e50914; text-decoration: underline; }

  .ag-grid-container { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 10px; }
  .ag-card { 
    background: #f9f9f9; border-radius: 6px; padding: 12px; font-size: 13px; text-align: center; cursor: pointer;
    position: relative; transition: 0.2s; border: 1px solid transparent;
  }
  body.dark-mode .ag-card { background: #1e1e1e; color: #ccc; }
  .ag-card.is-selected { border-color: #e50914; color: #e50914; font-weight: 700; }

  #filterScroller { display: flex; align-items: center; gap: 8px; overflow-x: auto; scrollbar-width: none; }
  .filter-tag.cfg-btn { 
    position: sticky; right: 0; z-index: 99; background: rgba(255, 255, 255, 0.95);
    min-width: 48px; height: 34px; border: none; cursor: pointer; font-size: 18px; 
  }
  body.dark-mode .filter-tag.cfg-btn { background: rgba(20, 20, 20, 0.95); color: #fff; }
`;

const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

/* ===========================
   SISTEMA DE DADOS (LOCALSTORAGE)
=========================== */
function load(k,d){ try{ return JSON.parse(localStorage.getItem(k)) ?? d }catch(e){ return d } }
function save(k,v){ localStorage.setItem(k,JSON.stringify(v)); }

const getMode = () => load(CONFIG.KEYS.MODE, 'dynamic');
const setMode = (m) => { save(CONFIG.KEYS.MODE, m); renderDrawer(); };

function getOrder(){
  let order = load(CONFIG.KEYS.ORDER, ['manchetes', 'destaques', 'ultimas']);
  // Limpeza de IDs inválidos que possam ter ficado no storage
  return order.filter(id => findItem(id) !== null);
}

function findItem(id){
  for(let sec of CATALOGO){
    if(sec.id === id) return { id: sec.id, label: sec.sessao };
    const item = sec.itens.find(i => i.id === id);
    if(item) return item;
  }
  return null;
}

function track(id){
  if(getMode() !== 'dynamic') return;
  const stats = load(CONFIG.KEYS.STATS, {});
  stats[id] = (stats[id] || 0) + 1;
  save(CONFIG.KEYS.STATS, stats);
  
  const order = getOrder();
  // Ordena os itens existentes por popularidade
  order.sort((a,b) => (stats[b]||0) - (stats[a]||0));
  save(CONFIG.KEYS.ORDER, order);
}

/* ===========================
   RENDERIZAÇÃO DA BARRA DE ABAS
=========================== */
function renderBar(){
  const bar = document.getElementById('filterScroller');
  if(!bar) return;

  let drawer = document.getElementById('ag-drawer');
  if(!drawer) {
    drawer = document.createElement('div');
    drawer.id = 'ag-drawer';
    bar.parentNode.insertBefore(drawer, bar.nextSibling);
  }

  const order = getOrder();
  bar.innerHTML = '';

  order.forEach(id => {
    const item = findItem(id);
    if(!item) return;

    const btn = document.createElement('button');
    btn.className = 'filter-tag';
    btn.textContent = item.label;
    
    // Verifica se esta aba é a que deve estar ativa (pela URL ou padrão)
    const params = new URLSearchParams(window.location.search);
    if(!params.has('id') && id === 'manchetes') btn.classList.add('active');

    btn.onclick = () => {
      document.querySelectorAll('#filterScroller .filter-tag').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      track(id);
      document.getElementById('ag-drawer').classList.remove('open');
      
      if(window.carregarSecao) {
          window.carregarSecao(id);
      } else {
          console.error("Navegação não carregada.");
      }
    };
    bar.appendChild(btn);
  });

  const cfg = document.createElement('button');
  cfg.className = 'filter-tag cfg-btn';
  cfg.innerHTML = '⚙'; 
  cfg.onclick = toggleDrawer;
  bar.appendChild(cfg);
}

/* ===========================
   CONTROLE DA GAVETA
=========================== */
function toggleDrawer(){
  const drawer = document.getElementById('ag-drawer');
  if(!drawer) return;
  
  if(drawer.classList.contains('open')){
    drawer.classList.remove('open');
  } else {
    renderDrawer();
    drawer.classList.add('open');
  }
}

function renderDrawer(filterText = ""){
  const drawer = document.getElementById('ag-drawer');
  const currentOrder = getOrder();
  const currentMode = getMode();

  drawer.innerHTML = `
    <div class="ag-drawer-scroll">
      <div class="ag-drawer-header">
        <div class="ag-search-wrapper">
          <input type="text" class="ag-search-input" id="ag-search-input" placeholder="Pesquisar categoria..." value="${filterText}">
        </div>
        <div class="ag-mode-group">
          <button id="btn-fixo" class="ag-mode-btn ${currentMode==='fixed'?'active':''}">Fixo</button>
          <button id="btn-dinamico" class="ag-mode-btn ${currentMode==='dynamic'?'active':''}">Auto</button>
        </div>
      </div>
      <div id="ag-catalog-container"></div>
    </div>
  `;

  const container = document.getElementById('ag-catalog-container');
  const term = filterText.toLowerCase();

  CATALOGO.forEach(sec => {
    const itensFiltrados = sec.itens.filter(i => i.label.toLowerCase().includes(term));
    const sessaoMatch = sec.sessao.toLowerCase().includes(term);

    if(term !== "" && !sessaoMatch && itensFiltrados.length === 0) return;
    const itensParaMostrar = sessaoMatch ? sec.itens : itensFiltrados;

    const sectionDiv = document.createElement('div');
    sectionDiv.className = 'ag-section-block';

    const isCatSelected = currentOrder.includes(sec.id);
    
    sectionDiv.innerHTML = `
      <button class="ag-section-header-btn ${isCatSelected ? 'is-active' : ''}" data-cat-id="${sec.id}">
        <div style="width:10px; height:10px; border-radius:2px; background:${sec.cor}"></div>
        <span class="ag-section-text">${sec.sessao}</span>
      </button>
      <div class="ag-grid-container"></div>
    `;
    
    sectionDiv.querySelector('.ag-section-header-btn').onclick = () => {
        if(isCatSelected && currentMode === 'fixed') {
             handleAction(sec.id, sec.sessao);
        } else {
             toggleItem(sec.id, sec.sessao);
        }
    };

    const grid = sectionDiv.querySelector('.ag-grid-container');
    itensParaMostrar.forEach(item => {
      const isSelected = currentOrder.includes(item.id);
      const card = document.createElement('div');
      card.className = `ag-card ${isSelected ? 'is-selected' : ''}`;
      card.innerHTML = `${item.label} ${isSelected ? '<span style="float:right; opacity:0.5">✕</span>' : ''}`;

      card.onclick = (e) => {
        if(isSelected) {
            handleAction(item.id, item.label);
        } else {
            toggleItem(item.id, item.label);
        }
      };
      grid.appendChild(card);
    });

    container.appendChild(sectionDiv);
  });

  document.getElementById('ag-search-input').oninput = (e) => renderDrawer(e.target.value);
  document.getElementById('btn-fixo').onclick = () => setMode('fixed');
  document.getElementById('btn-dinamico').onclick = () => setMode('dynamic');
}

/* ===========================
   LÓGICA DE ADICIONAR/REMOVER
=========================== */
function toggleItem(id, label){
  let order = getOrder();
  
  if(order.includes(id)){
    order = order.filter(x => x !== id);
  } else {
    if(order.length >= CONFIG.MAX_TABS) return;
    order.push(id);
  }
  
  save(CONFIG.KEYS.ORDER, order);
  renderBar();
  renderDrawer(document.getElementById('ag-search-input')?.value || "");
}

function handleAction(id, label){
  const mode = getMode();
  let order = getOrder();

  if(mode === 'dynamic') {
    order = order.filter(x => x !== id);
    save(CONFIG.KEYS.ORDER, order);
    renderBar();
    renderDrawer(document.getElementById('ag-search-input')?.value || "");
  } else {
    const currentIndex = order.indexOf(id);
    const newPos = prompt(`Mover "${label}" para qual posição? (1-${order.length})`, currentIndex + 1);
    
    if(newPos !== null){
      const targetIndex = parseInt(newPos) - 1;
      if(!isNaN(targetIndex) && targetIndex >= 0 && targetIndex < order.length) {
        order.splice(currentIndex, 1);
        order.splice(targetIndex, 0, id);
        save(CONFIG.KEYS.ORDER, order);
        renderBar();
        renderDrawer(document.getElementById('ag-search-input')?.value || "");
      }
    }
  }
}

// Inicialização segura
if(document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderBar);
} else {
    renderBar();
}

})();
