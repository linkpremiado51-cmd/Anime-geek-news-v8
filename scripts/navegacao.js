/* scripts/navegacao.js */

const displayPrincipal = document.getElementById('conteudo_de_destaque');

/**
 * Função de Transição: Cria o efeito visual sem interferir na lógica de dados
 */
function aplicarTransicaoConteudo(callback) {
    if (!displayPrincipal) return callback();

    // Inicia o fade out e leve subida
    displayPrincipal.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
    displayPrincipal.style.opacity = '0';
    displayPrincipal.style.transform = 'translateY(8px)';

    setTimeout(async () => {
        await callback();

        // Garante que o conteúdo apareça suavemente após a injeção
        requestAnimationFrame(() => {
            displayPrincipal.style.opacity = '1';
            displayPrincipal.style.transform = 'translateY(0)';
        });
    }, 250);
}

/**
 * Abre a notícia garantindo que o motor de renderização da seção seja injetado corretamente.
 */
async function abrirNoticiaUnica(item) {
    if (!displayPrincipal || !item) return;

    aplicarTransicaoConteudo(async () => {
        try {
            const origem = (item.origem || 'manchetes').toLowerCase().trim();
            gerenciarCSSDaSecao(origem);

            displayPrincipal.innerHTML = `
                <div class="foco-noticia-wrapper" style="animation: fadeIn 0.4s ease; max-width: var(--container-w); margin: 0 auto; padding: 20px;">
                    <div class="barra-ferramentas-foco" style="display: flex; justify-content: flex-start; padding-bottom: 20px; border-bottom: 1px dashed var(--border); margin-bottom: 30px;">
                        <button onclick="window.voltarParaLista()" class="btn-voltar-estilizado" style="background: none; border: 1px solid var(--text-main); color: var(--text-main); padding: 8px 18px; font-size: 10px; font-weight: 800; letter-spacing: 1px; cursor: pointer; display: flex; align-items: center; gap: 12px; transition: 0.3s; text-transform: uppercase;">
                            <i class="fa-solid fa-chevron-left" style="font-size: 14px;"></i> 
                            <span>Voltar para ${origem.toUpperCase()}</span>
                        </button>
                    </div>
                    <div id="container-principal">
                        <p style="text-align:center; padding:50px; color:var(--text-muted);">Carregando conteúdo...</p>
                    </div>
                </div>
            `;

            const response = await fetch(`./secoes/${origem}.html`);
            if (!response.ok) throw new Error("Falha ao carregar motor da seção.");
            const htmlBase = await response.text();

            const parser = new DOMParser();
            const docSeçao = parser.parseFromString(htmlBase, 'text/html');
            const scripts = docSeçao.querySelectorAll("script");

            // Limpeza de scripts antigos da mesma seção para evitar duplicação de funções
            const scriptsAntigos = document.querySelectorAll('.script-dinamico-secao');
            scriptsAntigos.forEach(s => s.remove());

            scripts.forEach(oldScript => {
                const newScript = document.createElement("script");
                newScript.className = 'script-dinamico-secao';
                
                if (oldScript.type === 'module' || !oldScript.type) {
                    let conteudo = oldScript.textContent;
                    if (conteudo.includes('function renderizarNoticias')) {
                        // Garante que a função fique disponível globalmente para a ponte
                        conteudo += `\n window.renderizarNoticias = renderizarNoticias;`;
                    }
                    newScript.type = 'module';
                    newScript.textContent = conteudo;
                } else {
                    if (oldScript.src) newScript.src = oldScript.src;
                    newScript.textContent = oldScript.textContent;
                }
                document.head.appendChild(newScript);
            });

            // Motor de renderização com timeout de segurança
            let tentativas = 0;
            const tentarRenderizar = () => {
                if (typeof window.renderizarNoticias === 'function') {
                    const container = document.getElementById('container-principal');
                    if (container) container.innerHTML = "";
                    window.renderizarNoticias([item]);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                } else if (tentativas < 25) {
                    tentativas++;
                    setTimeout(tentarRenderizar, 100);
                }
            };
            tentarRenderizar();

        } catch (err) {
            console.error("Erro na ponte de navegação:", err);
            displayPrincipal.innerHTML = `<div style="padding:100px; text-align:center;">Erro ao carregar conteúdo da notícia.</div>`;
        }
    });
}

/**
 * Vigia de URL para Links Compartilhados: Integrado ao Modal Global
 */
function verificarLinkCompartilhado() {
    const params = new URLSearchParams(window.location.search);
    const idNoticia = params.get('id');

    if (idNoticia) {
        if (displayPrincipal) {
            displayPrincipal.innerHTML = '<div style="text-align: center; padding: 120px; color: var(--text-muted); letter-spacing: 1px;">AUTENTICANDO CONTEÚDO...</div>';
        }

        const checkData = setInterval(() => {
            if (window.noticiasFirebase && window.noticiasFirebase.length > 0) {
                const item = window.noticiasFirebase.find(n => n.id === idNoticia);
                if (item) {
                    // Prioriza o Modal se a função estiver disponível no modal-manager.js
                    if (typeof window.abrirModalNoticia === 'function') {
                        window.abrirModalNoticia(item);
                        // Carrega a seção de fundo para o usuário não ver página vazia ao fechar o modal
                        carregarSecao(item.origem || 'manchetes');
                    } else {
                        abrirNoticiaUnica(item);
                    }
                } else {
                    carregarSecao('manchetes');
                }
                clearInterval(checkData);
            }
        }, 200);
        
        setTimeout(() => clearInterval(checkData), 6000);
    }
}

/**
 * Restaura a visualização da lista baseada na aba ativa
 */
window.voltarParaLista = function() {
    const url = new URL(window.location);
    url.searchParams.delete('id');
    window.history.pushState({}, '', url);

    const tagAtiva = document.querySelector('.filter-tag.active');
    // Busca o ID do dataset configurado no sistema de abas v7
    const secaoDestino = tagAtiva ? (tagAtiva.dataset.section || tagAtiva.textContent.toLowerCase().trim()) : 'manchetes';
    
    carregarSecao(secaoDestino);
};

/**
 * Gerencia o carregamento de CSS específico da seção
 */
function gerenciarCSSDaSecao(nome) {
    const linkAntigo = document.getElementById('css-secao-dinamica');
    if (linkAntigo) linkAntigo.remove();

    const novoLink = document.createElement('link');
    novoLink.id = 'css-secao-dinamica';
    novoLink.rel = 'stylesheet';
    novoLink.href = `./estilos/secoes/${nome}.css`;
    
    novoLink.onerror = () => {
        console.warn(`CSS para ${nome} não encontrado. Usando estilos globais.`);
        novoLink.remove();
    };
    document.head.appendChild(novoLink);
}

/**
 * Carrega dinamicamente o feed de uma seção
 */
async function carregarSecao(nome) {
    if (!displayPrincipal) return;

    const nomeLimpo = nome.toLowerCase().trim();

    aplicarTransicaoConteudo(async () => {
        try {
            gerenciarCSSDaSecao(nomeLimpo);

            const response = await fetch(`./secoes/${nomeLimpo}.html`);
            if (!response.ok) throw new Error("Seção não encontrada.");
            
            const html = await response.text();
            displayPrincipal.innerHTML = html;

            const scripts = displayPrincipal.querySelectorAll("script");
            scripts.forEach(oldScript => {
                const newScript = document.createElement("script");
                newScript.className = 'script-dinamico-secao';
                newScript.type = oldScript.type || "text/javascript";
                if (oldScript.src) newScript.src = oldScript.src;
                newScript.textContent = oldScript.textContent;
                document.body.appendChild(newScript);
            });

            window.scrollTo({ top: 0, behavior: 'smooth' });

        } catch (err) {
            displayPrincipal.innerHTML = `<div style="text-align:center; padding:100px;">A categoria <b>${nomeLimpo}</b> está sendo atualizada.</div>`;
        }
    });
}

/**
 * Controle do Menu Mobile
 */
window.toggleMobileMenu = function() {
    const menu = document.getElementById('mobileMenu');
    if (menu) menu.classList.toggle('active');
};

/**
 * Inicialização
 */
window.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('id')) {
        verificarLinkCompartilhado();
    } else {
        carregarSecao('manchetes');
    }
});

// Exportações Globais
window.carregarSecao = carregarSecao;
window.abrirNoticiaUnica = abrirNoticiaUnica;
