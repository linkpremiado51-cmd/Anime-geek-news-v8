/* scripts/navegacao.js - Versão Enterprise: Higiene de DOM & Animação Persistente */

const displayPrincipal = document.getElementById('conteudo_de_destaque');
let bloqueioDeNavegacao = false; // Trava contra cliques frenéticos
let currentFetchController = null; // Para cancelar requisições antigas

// --- CONFIGURAÇÃO DE TEMPO (Total: 2s) ---
const TEMPO_FADE_OUT = 800; // 0.8s sumindo
const TEMPO_ESPERA = 400;   // 0.4s processando (tela limpa)
const TEMPO_FADE_IN = 800;  // 0.8s aparecendo

/**
 * 1. SUPRESSOR DE RUÍDO VISUAL
 * Cria um estilo temporário que esconde notificações e menus flutuantes
 * vindos de outros scripts durante a transição.
 */
const styleSupressor = document.createElement('style');
styleSupressor.innerHTML = `
    body.is-transitioning .ag-toast,
    body.is-transitioning #ag-toast-container,
    body.is-transitioning .notificacao-flutuante,
    body.is-transitioning #ag-drawer {
        opacity: 0 !important;
        pointer-events: none !important;
        transition: none !important;
    }
`;
document.head.appendChild(styleSupressor);

/**
 * 2. LIMPEZA PROFUNDA (GARBAGE COLLECTION)
 */
function limparAmbiente() {
    // Remove scripts dinâmicos anteriores
    document.querySelectorAll('script[data-motor="dinamico"]').forEach(s => s.remove());
    
    // Reseta funções globais para evitar execução fantasma
    window.renderizarNoticias = null; 

    // Remove CSS de seções anteriores para não conflitar
    const cssAntigo = document.getElementById('css-secao-dinamica');
    if (cssAntigo) cssAntigo.remove();
}

/**
 * 3. CONTROLADOR DE TRANSIÇÃO (CORE)
 */
function aplicarTransicaoConteudo(callback) {
    if (!displayPrincipal) return;
    
    // Evita sobreposição de animações
    if (bloqueioDeNavegacao) return; 
    bloqueioDeNavegacao = true;

    // Marca o body para ativar o CSS Supressor (esconde toasts)
    document.body.classList.add('is-transitioning');

    // --- FASE 1: FADE OUT ---
    displayPrincipal.style.transition = `opacity ${TEMPO_FADE_OUT}ms ease-in-out, transform ${TEMPO_FADE_OUT}ms ease-in-out`;
    displayPrincipal.style.opacity = '0';
    displayPrincipal.style.transform = 'translateY(15px)';

    setTimeout(async () => {
        // --- FASE 2: HARD RESET (Tela Vazia) ---
        displayPrincipal.innerHTML = ''; 
        limparAmbiente();
        window.scrollTo({ top: 0, behavior: 'auto' }); // Reset imediato do scroll

        try {
            await callback(); // Executa o carregamento (fetch)
        } catch (e) {
            console.error("Erro controlado:", e);
            displayPrincipal.innerHTML = '<div style="padding:50px; text-align:center">Erro ao carregar conteúdo.</div>';
        }

        // Delay intencional para sensação "Premium"
        setTimeout(() => {
            // TRUQUE: Força o navegador a recalcular o layout (Reflow)
            // Isso garante que a animação de entrada funcione TODAS as vezes
            void displayPrincipal.offsetWidth;

            // --- FASE 3: FADE IN ---
            displayPrincipal.style.transition = `opacity ${TEMPO_FADE_IN}ms ease-out, transform ${TEMPO_FADE_IN}ms ease-out`;
            displayPrincipal.style.opacity = '1';
            displayPrincipal.style.transform = 'translateY(0)';
            
            // Finalização
            setTimeout(() => {
                bloqueioDeNavegacao = false;
                document.body.classList.remove('is-transitioning'); // Devolve os toasts/menus
            }, TEMPO_FADE_IN);

        }, TEMPO_ESPERA);

    }, TEMPO_FADE_OUT);
}

/**
 * 4. GERENCIADOR DE CSS
 */
function gerenciarCSSDaSecao(nome) {
    // Cria novo link
    const novoLink = document.createElement('link');
    novoLink.id = 'css-secao-dinamica';
    novoLink.rel = 'stylesheet';
    novoLink.href = `./estilos/secoes/${nome}.css`; 
    document.head.appendChild(novoLink);
}

/**
 * 5. PROCESSADOR DE SCRIPTS
 */
function processarScripts(htmlContent) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const scripts = doc.querySelectorAll("script");

    scripts.forEach(oldScript => {
        const newScript = document.createElement("script");
        newScript.setAttribute('data-motor', 'dinamico'); // Tag para limpeza futura
        
        if (oldScript.type === 'module' || !oldScript.type) {
            let conteudo = oldScript.textContent;
            if (conteudo.includes('function renderizarNoticias')) {
                conteudo += `\n window.renderizarNoticias = renderizarNoticias;`;
            }
            newScript.type = 'module';
            newScript.textContent = conteudo;
        } else {
            if (oldScript.src) newScript.src = oldScript.src;
            newScript.textContent = oldScript.textContent;
        }
        document.body.appendChild(newScript);
    });
}

/**
 * 6. CARREGADOR DE SEÇÃO (Network)
 */
async function carregarSecao(nome) {
    if (!displayPrincipal) return;

    // Cancela requisição anterior se houver (economia de dados)
    if (currentFetchController) currentFetchController.abort();
    currentFetchController = new AbortController();
    const signal = currentFetchController.signal;

    aplicarTransicaoConteudo(async () => {
        gerenciarCSSDaSecao(nome);

        // Fetch com timeout e sinal de cancelamento
        const response = await fetch(`./secoes/${nome}.html`, { signal });
        if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
        
        const html = await response.text();
        displayPrincipal.innerHTML = html;
        processarScripts(html);
    });
}

/**
 * 7. VISUALIZADOR DE NOTÍCIA (Full Page)
 */
async function abrirNoticiaUnica(item) {
    if (!displayPrincipal) return;
    
    if (currentFetchController) currentFetchController.abort();

    aplicarTransicaoConteudo(async () => {
        gerenciarCSSDaSecao(item.origem || 'manchetes');

        displayPrincipal.innerHTML = `
            <div class="foco-noticia-wrapper" style="max-width: var(--container-w); margin: 0 auto; padding: 20px;">
                <div class="barra-ferramentas-foco" style="display: flex; justify-content: flex-start; padding-bottom: 20px; border-bottom: 1px dashed var(--border); margin-bottom: 30px;">
                    <button onclick="window.voltarParaLista()" class="btn-voltar-estilizado" style="cursor: pointer; background: none; border: none; font-weight: 800; display: flex; align-items: center; gap: 10px; color: var(--text-main);">
                        <i class="fa-solid fa-chevron-left"></i> 
                        <span>VOLTAR PARA ${item.origem ? item.origem.toUpperCase() : 'INÍCIO'}</span>
                    </button>
                </div>
                <div id="container-principal">
                    <p style="text-align:center; padding:50px; opacity:0.5;">Carregando...</p>
                </div>
            </div>
        `;

        const response = await fetch(`./secoes/${item.origem || 'manchetes'}.html`);
        const htmlBase = await response.text();
        processarScripts(htmlBase);

        // Polling inteligente para renderização
        let tentativas = 0;
        const tentarRenderizar = () => {
            if (typeof window.renderizarNoticias === 'function') {
                const container = document.getElementById('container-principal');
                if (container) {
                    container.innerHTML = "";
                    window.renderizarNoticias([item]);
                }
            } else if (tentativas < 40) { // Aumentei tentativas
                tentativas++;
                setTimeout(tentarRenderizar, 50);
            }
        };
        tentarRenderizar();
    });
}

/**
 * 8. GERENCIADOR DE ESTADO (URL & Back)
 */
window.voltarParaLista = function() {
    const url = new URL(window.location);
    url.searchParams.delete('id');
    window.history.pushState({}, '', url);
    
    const tagAtiva = document.querySelector('.filter-tag.active');
    carregarSecao(tagAtiva ? tagAtiva.dataset.section : 'manchetes');
};

function verificarLinkCompartilhado() {
    const params = new URLSearchParams(window.location.search);
    const idNoticia = params.get('id');

    if (idNoticia) {
        // Intervalo de verificação do Firebase
        const checkData = setInterval(() => {
            if (window.noticiasFirebase && window.noticiasFirebase.length > 0) {
                const item = window.noticiasFirebase.find(n => n.id === idNoticia);
                if (item) {
                    if (typeof window.abrirModalNoticia === 'function') {
                        window.abrirModalNoticia(item);
                        carregarSecao('manchetes'); // Carrega fundo
                    } else {
                        abrirNoticiaUnica(item);
                    }
                } else {
                    carregarSecao('manchetes'); // Fallback
                }
                clearInterval(checkData);
            }
        }, 100);
        setTimeout(() => clearInterval(checkData), 8000); // 8s timeout
    }
}

// Eventos de Clique (Filtros)
document.querySelectorAll('.filter-tag').forEach(tag => {
    tag.addEventListener('click', () => {
        if (bloqueioDeNavegacao) return; // Respeita a transição
        if (tag.classList.contains('active')) return; // Não recarrega a mesma aba

        document.querySelectorAll('.filter-tag').forEach(t => t.classList.remove('active'));
        tag.classList.add('active');
        carregarSecao(tag.dataset.section);
    });
});

window.toggleMobileMenu = function() {
    const menu = document.getElementById('mobileMenu');
    if (menu) menu.classList.toggle('active');
};

// Inicialização Segura
window.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('id')) {
        verificarLinkCompartilhado();
    } else {
        carregarSecao('manchetes');
    }
});

// Exposição Global
window.carregarSecao = carregarSecao;
window.abrirNoticiaUnica = abrirNoticiaUnica;
