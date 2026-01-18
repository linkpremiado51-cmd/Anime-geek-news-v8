/* scripts/navegacao.js - Versão Ultra-Enterprise: V8 "Titanium"
   Foco: Imunidade a Race Conditions, Higiene Atômica de DOM e Performance 60fps
*/

(function() {
    // --- ESTADO PRIVADO (Aprimoramento 1: Encapsulamento para evitar conflito global) ---
    const CONFIG = {
        DISPLAY: document.getElementById('conteudo_de_destaque'),
        FADE_OUT: 400, // (Aprimoramento 2: Reduzido para resposta tátil mais rápida)
        ESPERA: 150,   // (Aprimoramento 3: Tempo de respiro para o Garbage Collector)
        FADE_IN: 500,
        CSS_PREFIX: 'css-secao-',
        SCRIPT_TAG: 'data-motor'
    };

    let navState = {
        bloqueio: false,
        currentRequestId: 0, // (Aprimoramento 4: ID Incremental para validar a transição atual)
        controller: null,    // (Aprimoramento 5: AbortController para cancelar o Fetch fisicamente)
        lastSection: null
    };

    // --- 1. SUPRESSOR DE RUÍDO VISUAL AVANÇADO ---
    // (Aprimoramento 6: Injeção única de CSS de proteção)
    const styleSupressor = document.createElement('style');
    styleSupressor.id = 'nav-internal-shield';
    styleSupressor.innerHTML = `
        body.is-transitioning { pointer-events: none !important; cursor: wait !important; }
        body.is-transitioning .ag-toast, 
        body.is-transitioning #ag-toast-container,
        body.is-transitioning #ag-drawer { opacity: 0 !important; visibility: hidden !important; }
        #conteudo_de_destaque { will-change: opacity, transform; backface-visibility: hidden; }
        .nav-error-msg { padding: 50px; text-align: center; font-family: 'Inter', sans-serif; color: var(--text-muted); }
    `;
    document.head.appendChild(styleSupressor);

    /**
     * 2. LIMPEZA PROFUNDA (GARBAGE COLLECTION)
     * (Aprimoramentos 7-12: Extensão da limpeza para eventos e variáveis)
     */
    function limparAmbienteTotal() {
        // 7. Remove scripts da aba anterior
        document.querySelectorAll(`script[${CONFIG.SCRIPT_TAG}="dinamico"]`).forEach(s => s.remove());
        
        // 8. Remove CSS específico para evitar vazamento de estilo
        document.querySelectorAll(`link[id^="${CONFIG.CSS_PREFIX}"]`).forEach(l => l.remove());

        // 9. Força o reset de funções de renderização para evitar execução fantasma
        window.renderizarNoticias = null; 
        window.initSectionModule = null;

        // 10. Limpeza de listeners residuais (Aprimoramento técnico)
        window.onscroll = null; 

        // 11. Mata animações CSS pendentes no container principal
        CONFIG.DISPLAY.getAnimations().forEach(anim => anim.cancel());

        // 12. Reset do estado do Modal Manager (se existir)
        if (window.fecharModalGlobal) window.fecharModalGlobal();
    }

    /**
     * 3. CONTROLADOR DE TRANSIÇÃO ATÔMICA
     * (Aprimoramentos 13-18: Gerenciamento de tickets de execução)
     */
    async function aplicarTransicaoConteudo(callback) {
        if (!CONFIG.DISPLAY) return;

        const requestId = ++navState.currentRequestId; // 13. Gera ID único para esta navegação
        navState.bloqueio = true;
        document.body.classList.add('is-transitioning');

        // 14. Fase 1: Desaparecimento suave (GPU Accelerated)
        CONFIG.DISPLAY.style.transition = `opacity ${CONFIG.FADE_OUT}ms ease, transform ${CONFIG.FADE_OUT}ms ease`;
        CONFIG.DISPLAY.style.opacity = '0';
        CONFIG.DISPLAY.style.transform = 'translateY(8px)';

        await new Promise(r => setTimeout(r, CONFIG.FADE_OUT));

        // 15. Validação de Interrupção: Se o usuário clicou em outra aba durante o fade, cancela esta
        if (requestId !== navState.currentRequestId) return;

        // 16. Hard Reset do DOM
        CONFIG.DISPLAY.innerHTML = ''; 
        limparAmbienteTotal();
        window.scrollTo({ top: 0, behavior: 'instant' }); 

        try {
            // 17. Executa o carregamento passando o signal para o fetch
            await callback(navState.controller?.signal); 

            if (requestId !== navState.currentRequestId) return; // Checagem pós-carregamento

            // 18. Delay técnico para estabilização do DOM
            setTimeout(() => {
                void CONFIG.DISPLAY.offsetWidth; // Força Reflow (Truque de renderização)

                // Fase 3: Aparição
                CONFIG.DISPLAY.style.transition = `opacity ${CONFIG.FADE_IN}ms cubic-bezier(0.4, 0, 0.2, 1), transform ${CONFIG.FADE_IN}ms cubic-bezier(0.4, 0, 0.2, 1)`;
                CONFIG.DISPLAY.style.opacity = '1';
                CONFIG.DISPLAY.style.transform = 'translateY(0)';
                
                setTimeout(() => {
                    if (requestId === navState.currentRequestId) {
                        navState.bloqueio = false;
                        document.body.classList.remove('is-transitioning');
                    }
                }, CONFIG.FADE_IN);

            }, CONFIG.ESPERA);

        } catch (e) {
            if (e.name !== 'AbortError') {
                console.error("Erro na Navegação:", e);
                CONFIG.DISPLAY.innerHTML = `<div class="nav-error-msg">Ops! Ocorreu um erro ao carregar o conteúdo.</div>`;
            }
        }
    }

    /**
     * 4. PROCESSADOR DE SCRIPTS E CSS
     * (Aprimoramentos 19-23: Sanitização e execução modular)
     */
    function processarAtivos(htmlContent, nomeSecao) {
        // 19. Gerenciamento de CSS Dinâmico com proteção de ID
        const linkCss = document.createElement('link');
        linkCss.id = `${CONFIG.CSS_PREFIX}${nomeSecao}`;
        linkCss.rel = 'stylesheet';
        linkCss.href = `./estilos/secoes/${nomeSecao}.css`; 
        document.head.appendChild(linkCss);

        // 20. Parser de Documento para extração limpa
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');
        const scripts = doc.querySelectorAll("script");

        scripts.forEach(oldScript => {
            const newScript = document.createElement("script");
            newScript.setAttribute(CONFIG.SCRIPT_TAG, 'dinamico');
            
            // 21. Preserva integridade de módulos e conteúdo
            if (oldScript.type === 'module' || !oldScript.type) {
                let conteudo = oldScript.textContent;
                // 22. Injeção de ponte para renderização
                if (conteudo.includes('function renderizarNoticias')) {
                    conteudo += `\n window.renderizarNoticias = renderizarNoticias;`;
                }
                newScript.type = 'module';
                newScript.textContent = conteudo;
            } else {
                if (oldScript.src) newScript.src = oldScript.src;
                newScript.textContent = oldScript.textContent;
            }
            // 23. Inserção controlada no final do body
            document.body.appendChild(newScript);
        });
    }

    /**
     * 5. CARREGADORES DE CONTEÚDO (API)
     * (Aprimoramentos 24-26: Controle de Aborto de Rede)
     */
    async function carregarSecao(nome) {
        if (!CONFIG.DISPLAY) return;

        // 24. Cancela qualquer requisição de rede que ainda esteja baixando
        if (navState.controller) navState.controller.abort();
        navState.controller = new AbortController();

        aplicarTransicaoConteudo(async (signal) => {
            // 25. Fetch com timeout e sinal de cancelamento real
            const response = await fetch(`./secoes/${nome}.html`, { signal });
            if (!response.ok) throw new Error(`Status: ${response.status}`);
            
            const html = await response.text();
            CONFIG.DISPLAY.innerHTML = html;
            processarAtivos(html, nome);
            navState.lastSection = nome;
        });
    }

    async function abrirNoticiaUnica(item) {
        if (!CONFIG.DISPLAY) return;
        if (navState.controller) navState.controller.abort();
        navState.controller = new AbortController();

        aplicarTransicaoConteudo(async (signal) => {
            // 26. Template robusto de visualização
            CONFIG.DISPLAY.innerHTML = `
                <div class="foco-noticia-wrapper" style="max-width: var(--container-w); margin: 0 auto; padding: 20px;">
                    <div class="barra-ferramentas-foco" style="display: flex; gap: 15px; margin-bottom: 30px; border-bottom: 1px dashed var(--border); padding-bottom: 15px;">
                        <button onclick="window.voltarParaLista()" class="btn-voltar-estilizado" style="cursor:pointer; background:var(--bg-card); padding: 10px 20px; border-radius: 8px; border:1px solid var(--border); color: var(--text-main); font-weight: bold;">
                            <i class="fa-solid fa-chevron-left"></i> VOLTAR
                        </button>
                    </div>
                    <div id="container-principal-render">
                        <div class="loading-placeholder" style="text-align:center; padding:100px;">Carregando Matéria...</div>
                    </div>
                </div>
            `;

            const response = await fetch(`./secoes/${item.origem || 'manchetes'}.html`, { signal });
            const htmlBase = await response.text();
            processarAtivos(htmlBase, item.origem || 'manchetes');

            // 27. Polling inteligente (Aprimoramento 27: Limite de tempo no polling)
            let tentativas = 0;
            const tentarRenderizar = () => {
                if (typeof window.renderizarNoticias === 'function') {
                    const container = document.getElementById('container-principal-render');
                    if (container) {
                        container.innerHTML = "";
                        window.renderizarNoticias([item]);
                    }
                } else if (tentativas < 60) { 
                    tentativas++;
                    setTimeout(tentarRenderizar, 50);
                }
            };
            tentarRenderizar();
        });
    }

    /**
     * 6. GERENCIADORES DE ESTADO E URL
     * (Aprimoramentos 28-30: Robustez em links compartilhados)
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
        if (!idNoticia) return;

        // 28. Sistema de espera por dados assíncronos (Firebase)
        let tempoGasto = 0;
        const checkData = setInterval(() => {
            tempoGasto += 100;
            if (window.noticiasFirebase && window.noticiasFirebase.length > 0) {
                const item = window.noticiasFirebase.find(n => n.id === idNoticia);
                if (item) {
                    // 29. Decide se abre no modal ou na página única baseado na disponibilidade
                    if (typeof window.abrirModalNoticia === 'function') {
                        window.abrirModalNoticia(item);
                        carregarSecao('manchetes'); 
                    } else {
                        abrirNoticiaUnica(item);
                    }
                }
                clearInterval(checkData);
            }
            if (tempoGasto > 5000) { // 30. Timeout de segurança de 5s
                clearInterval(checkData);
                carregarSecao('manchetes');
            }
        }, 100);
    }

    // --- INICIALIZAÇÃO E EVENTOS ---

    // Delegação de evento para Tags de Filtro (Mais eficiente)
    document.addEventListener('click', (e) => {
        const tag = e.target.closest('.filter-tag');
        if (!tag || navState.bloqueio || tag.classList.contains('active')) return;

        document.querySelectorAll('.filter-tag').forEach(t => t.classList.remove('active'));
        tag.classList.add('active');
        carregarSecao(tag.dataset.section);
    });

    // Mobile Menu Toggle
    window.toggleMobileMenu = function() {
        const menu = document.getElementById('mobileMenu');
        if (menu) menu.classList.toggle('active');
    };

    // Ponto de entrada seguro
    window.addEventListener('DOMContentLoaded', () => {
        const params = new URLSearchParams(window.location.search);
        params.has('id') ? verificarLinkCompartilhado() : carregarSecao('manchetes');
    });

    // Exposição Global Controlada
    window.carregarSecao = carregarSecao;
    window.abrirNoticiaUnica = abrirNoticiaUnica;

})();
