/* scripts/navegacao.js - Versão Final Blindada com Transição */

const displayPrincipal = document.getElementById('conteudo_de_destaque');

/**
 * Função de Transição Suave:
 * Cria o efeito de fade-out/fade-in ao trocar de aba ou abrir notícia.
 */
function aplicarTransicaoConteudo(callback) {
    if (!displayPrincipal) return callback();

    // 1. Inicia o desaparecimento (Fade Out)
    displayPrincipal.style.transition = 'opacity 0.2s ease-out, transform 0.2s ease-out';
    displayPrincipal.style.opacity = '0';
    displayPrincipal.style.transform = 'translateY(10px)';

    // 2. Aguarda a animação e carrega o conteúdo
    setTimeout(async () => {
        // Executa a lógica de carregar (fetch/render)
        await callback();

        // 3. Faz o conteúdo reaparecer (Fade In)
        setTimeout(() => {
            displayPrincipal.style.opacity = '1';
            displayPrincipal.style.transform = 'translateY(0)';
        }, 50);
    }, 200);
}

/**
 * Abre a notícia em modo "Página Cheia" (Fallback caso o Modal falhe)
 */
async function abrirNoticiaUnica(item) {
    if (!displayPrincipal) return;

    aplicarTransicaoConteudo(async () => {
        try {
            // Carrega CSS e estrutura
            gerenciarCSSDaSecao(item.origem || 'manchetes');

            displayPrincipal.innerHTML = `
                <div class="foco-noticia-wrapper" style="max-width: var(--container-w); margin: 0 auto; padding: 20px;">
                    <div class="barra-ferramentas-foco" style="display: flex; justify-content: flex-start; padding-bottom: 20px; border-bottom: 1px dashed var(--border); margin-bottom: 30px;">
                        <button onclick="window.voltarParaLista()" class="btn-voltar-estilizado" style="background: none; border: 1px solid var(--text-main); color: var(--text-main); padding: 8px 18px; font-size: 10px; font-weight: 800; letter-spacing: 1px; cursor: pointer; display: flex; align-items: center; gap: 12px; transition: 0.3s; text-transform: uppercase;">
                            <i class="fa-solid fa-chevron-left" style="font-size: 14px;"></i> 
                            <span>Voltar para ${item.origem ? item.origem.toUpperCase() : 'Início'}</span>
                        </button>
                    </div>
                    <div id="container-principal">
                        <p style="text-align:center; padding:50px; color:var(--text-muted);">Carregando conteúdo...</p>
                    </div>
                </div>
            `;

            // Busca o motor de renderização da seção
            const response = await fetch(`./secoes/${item.origem || 'manchetes'}.html`);
            if (!response.ok) throw new Error("Falha ao carregar motor.");
            const htmlBase = await response.text();

            // Parser para extrair e executar scripts
            const parser = new DOMParser();
            const docSeçao = parser.parseFromString(htmlBase, 'text/html');
            const scripts = docSeçao.querySelectorAll("script");

            scripts.forEach(oldScript => {
                const newScript = document.createElement("script");
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
                document.head.appendChild(newScript);
            });

            // Tenta renderizar até que o script esteja carregado
            let tentativas = 0;
            const tentarRenderizar = () => {
                if (typeof window.renderizarNoticias === 'function') {
                    const container = document.getElementById('container-principal');
                    if (container) container.innerHTML = "";
                    window.renderizarNoticias([item]);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                } else if (tentativas < 20) {
                    tentativas++;
                    setTimeout(tentarRenderizar, 150);
                }
            };
            tentarRenderizar();

        } catch (err) {
            console.error("Erro na ponte:", err);
            displayPrincipal.innerHTML = `<div style="padding:100px; text-align:center;">Erro ao carregar notícia.</div>`;
        }
    });
}

/**
 * Vigia de URL para Links Compartilhados (?id=...)
 */
function verificarLinkCompartilhado() {
    const params = new URLSearchParams(window.location.search);
    const idNoticia = params.get('id');

    if (idNoticia) {
        if (displayPrincipal) {
            displayPrincipal.innerHTML = '<div style="text-align: center; padding: 120px; color: var(--text-muted); font-family: sans-serif; letter-spacing: 1px;">BUSCANDO NOTÍCIA...</div>';
        }

        const checkData = setInterval(() => {
            if (window.noticiasFirebase && window.noticiasFirebase.length > 0) {
                const item = window.noticiasFirebase.find(n => n.id === idNoticia);
                if (item) {
                    if (typeof window.abrirModalNoticia === 'function') {
                        window.abrirModalNoticia(item);
                        carregarSecao('manchetes'); // Carrega o fundo
                    } else {
                        abrirNoticiaUnica(item);
                    }
                } else {
                    carregarSecao('manchetes');
                }
                clearInterval(checkData);
            }
        }, 100);
        
        setTimeout(() => clearInterval(checkData), 5000); // Timeout de 5s
    }
}

/**
 * Restaura a visualização da lista
 */
window.voltarParaLista = function() {
    const url = new URL(window.location);
    url.searchParams.delete('id');
    window.history.pushState({}, '', url);

    const tagAtiva = document.querySelector('.filter-tag.active');
    const secaoDestino = tagAtiva ? tagAtiva.dataset.section : 'manchetes';
    
    carregarSecao(secaoDestino);
};

/**
 * Gerencia o carregamento de CSS específico
 */
function gerenciarCSSDaSecao(nome) {
    const linkAntigo = document.getElementById('css-secao-dinamica');
    if (linkAntigo) linkAntigo.remove();

    const novoLink = document.createElement('link');
    novoLink.id = 'css-secao-dinamica';
    novoLink.rel = 'stylesheet';
    novoLink.href = `./estilos/secoes/${nome}.css`; // Caminho seguro
    document.head.appendChild(novoLink);
}

/**
 * Carrega dinamicamente o feed de uma seção com transição
 */
async function carregarSecao(nome) {
    if (!displayPrincipal) return;

    aplicarTransicaoConteudo(async () => {
        try {
            gerenciarCSSDaSecao(nome);

            const response = await fetch(`./secoes/${nome}.html`); // Caminho seguro
            if (!response.ok) throw new Error("Arquivo não encontrado.");
            
            const html = await response.text();
            displayPrincipal.innerHTML = html;

            const scripts = displayPrincipal.querySelectorAll("script");
            scripts.forEach(oldScript => {
                const newScript = document.createElement("script");
                newScript.type = oldScript.type || "text/javascript";
                if (oldScript.src) newScript.src = oldScript.src;
                newScript.textContent = oldScript.textContent;
                document.body.appendChild(newScript);
            });

            window.scrollTo({ top: 0, behavior: 'smooth' });

        } catch (err) {
            displayPrincipal.innerHTML = `<div style="text-align:center; padding:100px;">Erro: ${nome} não carregado.</div>`;
        }
    });
}

// Eventos de clique nas categorias
document.querySelectorAll('.filter-tag').forEach(tag => {
    tag.addEventListener('click', () => {
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

window.carregarSecao = carregarSecao;
window.abrirNoticiaUnica = abrirNoticiaUnica;
