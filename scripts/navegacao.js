/* scripts/navegacao.js - Versão Ultra-Enterprise: Anti-Race Condition & DOM Hijacking */

/**
 * CONFIGURAÇÃO E ESTADO GLOBAL (SINGLETON)
 */
const NAV_STATE = {
    isTransitioning: false,
    currentTransitionId: 0,
    fetchController: null,
    display: document.getElementById('conteudo_de_destaque'),
    config: {
        FADE_OUT: 400, // Reduzido para maior responsividade
        ESPERA: 200,
        FADE_IN: 500
    }
};

/**
 * 1. SUPRESSOR DE INTERFERÊNCIA EXTERNA
 */
const injectGlobalResetCSS = () => {
    if (document.getElementById('nav-reset-styles')) return;
    const style = document.createElement('style');
    style.id = 'nav-reset-styles';
    style.innerHTML = `
        body.nav-loading * { pointer-events: none !important; }
        body.nav-loading .ag-toast, body.nav-loading #ag-drawer { 
            display: none !important; opacity: 0 !important; 
        }
        .section-fade-container {
            transition: opacity ${NAV_STATE.config.FADE_IN}ms ease, transform ${NAV_STATE.config.FADE_IN}ms ease;
        }
    `;
    document.head.appendChild(style);
};
injectGlobalResetCSS();

/**
 * 2. LIMPEZA PROFUNDA E PREVENÇÃO DE "GHOST SCRIPTS"
 */
function deepCleanDOM() {
    // Remove scripts de sessões anteriores
    document.querySelectorAll('script[data-motor="dinamico"]').forEach(s => s.remove());
    
    // Remove estilos específicos de seção para evitar conflitos de cores/layout
    document.querySelectorAll('link[id="css-secao-dinamica"]').forEach(l => l.remove());

    // Limpa referências globais de renderização para evitar conflito de dados
    window.renderizarNoticias = null;
    
    // Mata qualquer animação pendente no container
    if (NAV_STATE.display) {
        NAV_STATE.display.innerHTML = '';
        NAV_STATE.display.getAnimations().forEach(anim => anim.cancel());
    }
}

/**
 * 3. CONTROLADOR DE FLUXO SEGURO (O Coração do Script)
 */
async function flowManager(sectionId, task) {
    // Incrementa ID de transição para invalidar processos anteriores
    const transitionId = ++NAV_STATE.currentTransitionId;
    
    // Cancela qualquer fetch em andamento imediatamente
    if (NAV_STATE.fetchController) NAV_STATE.fetchController.abort();
    NAV_STATE.fetchController = new AbortController();

    NAV_STATE.isTransitioning = true;
    document.body.classList.add('nav-loading');

    // --- FASE 1: Fade Out ---
    NAV_STATE.display.style.opacity = '0';
    NAV_STATE.display.style.transform = 'translateY(10px)';

    await new Promise(r => setTimeout(r, NAV_STATE.config.FADE_OUT));

    // Se o usuário já clicou em outra coisa, aborta ESTA execução aqui
    if (transitionId !== NAV_STATE.currentTransitionId) return;

    deepCleanDOM();
    window.scrollTo({ top: 0, behavior: 'instant' });

    try {
        await task(NAV_STATE.fetchController.signal);
        
        // Verifica novamente se ainda somos a transição ativa após o await (Network delay)
        if (transitionId !== NAV_STATE.currentTransitionId) return;

        // --- FASE 2: Recalcular e Fade In ---
        setTimeout(() => {
            void NAV_STATE.display.offsetWidth; // Force Reflow
            NAV_STATE.display.style.opacity = '1';
            NAV_STATE.display.style.transform = 'translateY(0)';
            
            document.body.classList.remove('nav-loading');
            NAV_STATE.isTransitioning = false;
        }, NAV_STATE.config.ESPERA);

    } catch (err) {
        if (err.name === 'AbortError') return; // Silencia erro de cancelamento proposital
        console.error("Erro na Navegação:", err);
        NAV_STATE.display.innerHTML = `<div class="error-msg">Falha ao carregar conteúdo.</div>`;
        document.body.classList.remove('nav-loading');
        NAV_STATE.isTransitioning = false;
    }
}

/**
 * 4. CARREGADOR DE CONTEÚDO
 */
async function carregarSecao(nome) {
    if (!nome) return;

    await flowManager(nome, async (signal) => {
        // Carrega CSS
        const link = document.createElement('link');
        link.id = 'css-secao-dinamica';
        link.rel = 'stylesheet';
        link.href = `./estilos/secoes/${nome}.css`;
        document.head.appendChild(link);

        // Carrega HTML
        const response = await fetch(`./secoes/${nome}.html`, { signal });
        if (!response.ok) throw new Error("Falha HTTP");
        
        const html = await response.text();
        
        // Sanitização rápida antes de injetar
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        
        // Move scripts para execução manual
        const scripts = tempDiv.querySelectorAll('script');
        NAV_STATE.display.innerHTML = tempDiv.innerHTML;
        
        scripts.forEach(oldScript => {
            const newScript = document.createElement('script');
            newScript.setAttribute('data-motor', 'dinamico');
            if (oldScript.src) {
                newScript.src = oldScript.src;
            } else {
                newScript.textContent = oldScript.textContent;
                // Garante exposição global se necessário
                if (newScript.textContent.includes('renderizarNoticias')) {
                    newScript.textContent += `\nwindow.renderizarNoticias = renderizarNoticias;`;
                }
            }
            newScript.type = oldScript.type || 'module';
            document.body.appendChild(newScript);
        });
    });
}

/**
 * 5. HANDLER DE NOTÍCIA ÚNICA (PREVENÇÃO DE OVERLAY)
 */
async function abrirNoticiaUnica(item) {
    if (!item || !item.id) return;

    await flowManager(`noticia-${item.id}`, async (signal) => {
        NAV_STATE.display.innerHTML = `
            <div class="foco-noticia-wrapper section-fade-container">
                <button onclick="window.voltarParaLista()" class="btn-voltar">
                   <i class="fas fa-arrow-left"></i> VOLTAR
                </button>
                <div id="container-render-news">Carregando...</div>
            </div>`;

        const response = await fetch(`./secoes/${item.origem || 'manchetes'}.html`, { signal });
        const html = await response.text();
        
        // Injeta scripts da seção pai para ter as funções de renderização
        const temp = document.createElement('div');
        temp.innerHTML = html;
        temp.querySelectorAll('script').forEach(s => {
            const ns = document.createElement('script');
            ns.setAttribute('data-motor', 'dinamico');
            ns.textContent = s.textContent;
            ns.type = 'module';
            document.body.appendChild(ns);
        });

        // Polling de renderização com limite de segurança
        let attempts = 0;
        const checkRender = setInterval(() => {
            if (typeof window.renderizarNoticias === 'function') {
                const target = document.getElementById('container-render-news');
                if (target) {
                    target.innerHTML = '';
                    window.renderizarNoticias([item]);
                }
                clearInterval(checkRender);
            }
            if (++attempts > 50) clearInterval(checkRender);
        }, 50);
    });
}

/**
 * 6. INICIALIZAÇÃO E EVENTOS
 */
window.voltarParaLista = () => {
    const url = new URL(window.location);
    url.searchParams.delete('id');
    window.history.pushState({}, '', url);
    const ativa = document.querySelector('.filter-tag.active')?.dataset.section || 'manchetes';
    carregarSecao(ativa);
};

// Intercepta cliques nas tags de filtro (Aprimorado)
document.addEventListener('click', (e) => {
    const tag = e.target.closest('.filter-tag');
    if (!tag || tag.classList.contains('cfg-btn')) return;

    const section = tag.dataset.section || tag.textContent.trim().toLowerCase();
    
    // Se clicar na mesma aba, não faz nada
    if (tag.classList.contains('active') && !new URLSearchParams(window.location.search).has('id')) return;

    document.querySelectorAll('.filter-tag').forEach(t => t.classList.remove('active'));
    tag.classList.add('active');
    
    carregarSecao(section);
});

// Suporte ao botão "Voltar" do Navegador
window.addEventListener('popstate', () => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('id')) {
        location.reload(); // Simplificado para garantir integridade no back button
    } else {
        carregarSecao('manchetes');
    }
});

// Init
document.addEventListener('DOMContentLoaded', () => {
    const id = new URLSearchParams(window.location.search).get('id');
    if (!id) carregarSecao('manchetes');
});

// Exportação Global
window.carregarSecao = carregarSecao;
window.abrirNoticiaUnica = abrirNoticiaUnica;
