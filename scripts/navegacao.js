/* scripts/navegacao.js - Versão Ultimate: 2s Delay & Limpeza de DOM */

const displayPrincipal = document.getElementById('conteudo_de_destaque');
let bloqueioDeNavegacao = false; // Trava para impedir cliques frenéticos

/**
 * CONFIGURAÇÃO DE TEMPO
 * Total da transição = 2000ms (2 segundos)
 */
const TEMPO_FADE_OUT = 800; // Tempo sumindo
const TEMPO_ESPERA = 400;   // Tempo "pensando" (tela limpa)
const TEMPO_FADE_IN = 800;  // Tempo aparecendo

/**
 * 1. LIMPEZA PROFUNDA (O Pente Fino)
 * Remove scripts antigos e força o sumiço de notificações intrusas
 */
function limparAmbiente() {
    // a) Remove scripts da seção anterior para não dar conflito
    const scriptsAntigos = document.querySelectorAll('script[data-motor="dinamico"]');
    scriptsAntigos.forEach(s => s.remove());
    
    // b) Mata funções globais antigas
    window.renderizarNoticias = null; 

    // c) Força o sumiço de Toasts/Notificações que estejam na tela
    const toasts = document.querySelectorAll('.ag-toast, #ag-toast-container, .notificacao-flutuante');
    toasts.forEach(t => t.style.display = 'none');
}

/**
 * 2. TRANSIÇÃO SUAVE (2 Segundos)
 */
function aplicarTransicaoConteudo(callback) {
    if (!displayPrincipal || bloqueioDeNavegacao) return; // Se já está trocando, ignora o clique
    bloqueioDeNavegacao = true; // Ativa a trava

    // --- FASE 1: FADE OUT (Desaparecer) ---
    displayPrincipal.style.transition = `opacity ${TEMPO_FADE_OUT}ms ease-in-out, transform ${TEMPO_FADE_OUT}ms ease-in-out`;
    displayPrincipal.style.opacity = '0';
    displayPrincipal.style.transform = 'translateY(15px)';

    setTimeout(async () => {
        // --- FASE 2: LIMPEZA E CARREGAMENTO (Tela Vazia) ---
        displayPrincipal.innerHTML = ''; // Garante que nada (nem notificações antigas) apareça aqui
        limparAmbiente(); // Executa a limpeza dos scripts e notificações
        
        try {
            await callback(); // Busca e injeta o novo HTML
        } catch (e) {
            console.error("Erro no callback", e);
        }

        // Aguarda um pouco para dar a sensação de "processamento premium"
        setTimeout(() => {
            // --- FASE 3: FADE IN (Aparecer) ---
            displayPrincipal.style.opacity = '1';
            displayPrincipal.style.transform = 'translateY(0)';
            
            // Libera a trava apenas quando a animação termina
            setTimeout(() => {
                bloqueioDeNavegacao = false;
            }, TEMPO_FADE_IN);

        }, TEMPO_ESPERA);

    }, TEMPO_FADE_OUT);
}

/**
 * Carrega CSS da Seção
 */
function gerenciarCSSDaSecao(nome) {
    const idCSS = 'css-secao-dinamica';
    const linkAntigo = document.getElementById(idCSS);
    if (linkAntigo) linkAntigo.remove();

    const novoLink = document.createElement('link');
    novoLink.id = idCSS;
    novoLink.rel = 'stylesheet';
    novoLink.href = `./estilos/secoes/${nome}.css`; // Caminho seguro
    document.head.appendChild(novoLink);
}

/**
 * LÓGICA DE ABERTURA DE NOTÍCIA (Página Cheia)
 */
async function abrirNoticiaUnica(item) {
    if (!displayPrincipal) return;

    aplicarTransicaoConteudo(async () => {
        try {
            gerenciarCSSDaSecao(item.origem || 'manchetes');

            displayPrincipal.innerHTML = `
                <div class="foco-noticia-wrapper" style="max-width: var(--container-w); margin: 0 auto; padding: 20px;">
                    <div class="barra-ferramentas-foco" style="display: flex; justify-content: flex-start; padding-bottom: 20px; border-bottom: 1px dashed var(--border); margin-bottom: 30px;">
                        <button onclick="window.voltarParaLista()" class="btn-voltar-estilizado" style="background: none; border: 1px solid var(--text-main); color: var(--text-main); padding: 8px 18px; font-size: 10px; font-weight: 800; letter-spacing: 1px; cursor: pointer; display: flex; align-items: center; gap: 12px; transition: 0.3s; text-transform: uppercase;">
                            <i class="fa-solid fa-chevron-left"></i> 
                            <span>Voltar para ${item.origem ? item.origem.toUpperCase() : 'Início'}</span>
                        </button>
                    </div>
                    <div id="container-principal">
                        <p style="text-align:center; padding:50px; color:var(--text-muted);">Carregando conteúdo...</p>
                    </div>
                </div>
            `;

            // Processamento de Scripts
            const response = await fetch(`./secoes/${item.origem || 'manchetes'}.html`);
            const htmlBase = await response.text();
            processarScripts(htmlBase);

            // Renderização
            let tentativas = 0;
            const tentarRenderizar = () => {
                if (typeof window.renderizarNoticias === 'function') {
                    const container = document.getElementById('container-principal');
                    if (container) container.innerHTML = "";
                    window.renderizarNoticias([item]);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                } else if (tentativas < 30) {
                    tentativas++;
                    setTimeout(tentarRenderizar, 100);
                }
            };
            tentarRenderizar();

        } catch (err) {
            displayPrincipal.innerHTML = `<div style="padding:100px; text-align:center;">Erro ao carregar notícia.</div>`;
        }
    });
}

/**
 * LÓGICA DE CARREGAMENTO DE SEÇÃO (Abas)
 */
async function carregarSecao(nome) {
    if (!displayPrincipal) return;

    aplicarTransicaoConteudo(async () => {
        try {
            gerenciarCSSDaSecao(nome);

            const response = await fetch(`./secoes/${nome}.html`);
            if (!response.ok) throw new Error("Erro 404");
            
            const html = await response.text();
            displayPrincipal.innerHTML = html;

            processarScripts(html); // Função auxiliar criada abaixo para limpar código repetido

            window.scrollTo({ top: 0, behavior: 'smooth' });

        } catch (err) {
            displayPrincipal.innerHTML = `<div style="text-align:center; padding:100px;">Erro: Não foi possível carregar ${nome}.</div>`;
        }
    });
}

/**
 * Auxiliar: Processa e executa scripts do HTML injetado
 */
function processarScripts(htmlContent) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const scripts = doc.querySelectorAll("script");

    scripts.forEach(oldScript => {
        const newScript = document.createElement("script");
        newScript.setAttribute('data-motor', 'dinamico'); // Marca para ser deletado na próxima troca
        
        if (oldScript.type === 'module' || !oldScript.type) {
            let conteudo = oldScript.textContent;
            // Garante que a função de renderização fique acessível globalmente
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
 * SISTEMA DE DEEP LINKING (Links Compartilhados)
 */
function verificarLinkCompartilhado() {
    const params = new URLSearchParams(window.location.search);
    const idNoticia = params.get('id');

    if (idNoticia) {
        const checkData = setInterval(() => {
            if (window.noticiasFirebase && window.noticiasFirebase.length > 0) {
                const item = window.noticiasFirebase.find(n => n.id === idNoticia);
                if (item) {
                    if (typeof window.abrirModalNoticia === 'function') {
                        window.abrirModalNoticia(item);
                        carregarSecao('manchetes');
                    } else {
                        abrirNoticiaUnica(item);
                    }
                } else {
                    carregarSecao('manchetes');
                }
                clearInterval(checkData);
            }
        }, 100);
        setTimeout(() => clearInterval(checkData), 5000);
    }
}

window.voltarParaLista = function() {
    const url = new URL(window.location);
    url.searchParams.delete('id');
    window.history.pushState({}, '', url);
    
    const tagAtiva = document.querySelector('.filter-tag.active');
    carregarSecao(tagAtiva ? tagAtiva.dataset.section : 'manchetes');
};

// Eventos de Filtros (Abas)
document.querySelectorAll('.filter-tag').forEach(tag => {
    tag.addEventListener('click', () => {
        // Se já estiver bloqueado (transição ocorrendo), não faz nada
        if (bloqueioDeNavegacao) return;

        document.querySelectorAll('.filter-tag').forEach(t => t.classList.remove('active'));
        tag.classList.add('active');
        carregarSecao(tag.dataset.section);
    });
});

window.toggleMobileMenu = function() {
    const menu = document.getElementById('mobileMenu');
    if (menu) menu.classList.toggle('active');
};

// Inicialização
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
