/* scripts/navegacao.js */

const displayPrincipal = document.getElementById('conteudo_de_destaque');

/**
 * Cria e gerencia uma tela de carregamento suave (Overlay)
 * Duração total aproximada: 1.3s
 */
function dispararTransicaoSuave() {
    // Remove se já existir uma
    const antiga = document.getElementById('transicao-suave-overlay');
    if (antiga) antiga.remove();

    const overlay = document.createElement('div');
    overlay.id = 'transicao-suave-overlay';
    
    // Estilização direta para garantir que cubra o conteúdo
    Object.assign(overlay.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        backgroundColor: 'var(--bg)', // Usa a cor de fundo do seu tema
        zIndex: '9999',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        transition: 'opacity 0.4s ease',
        opacity: '1'
    });

    overlay.innerHTML = `
        <div style="text-align: center;">
            <div style="width: 40px; height: 40px; border: 2px solid var(--border); border-top: 2px solid var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 15px;"></div>
            <span style="font-size: 10px; letter-spacing: 2px; color: var(--text-muted); text-transform: uppercase; font-weight: 800;">Sincronizando</span>
        </div>
        <style>
            @keyframes spin { to { transform: rotate(360deg); } }
        </style>
    `;

    document.body.appendChild(overlay);

    // Inicia o desaparecimento após 0.9s (totalizando ~1.3s com a transição de 0.4s)
    setTimeout(() => {
        overlay.style.opacity = '0';
        setTimeout(() => overlay.remove(), 400);
    }, 900);
}

/**
 * Abre a notícia garantindo que o motor de renderização da seção seja injetado corretamente.
 */
async function abrirNoticiaUnica(item) {
    if (!displayPrincipal) return;
    
    dispararTransicaoSuave();

    try {
        gerenciarCSSDaSecao(item.origem || 'manchetes');

        displayPrincipal.innerHTML = `
            <div class="foco-noticia-wrapper" style="animation: fadeIn 0.4s ease; max-width: var(--container-w); margin: 0 auto; padding: 20px;">
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

        const response = await fetch(`./secoes/${item.origem || 'manchetes'}.html`);
        if (!response.ok) throw new Error("Falha ao carregar motor de renderização.");
        const htmlBase = await response.text();

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
        console.error("Erro na ponte de navegação:", err);
        displayPrincipal.innerHTML = `<div style="padding:100px; text-align:center;">Erro ao carregar conteúdo.</div>`;
    }
}

/**
 * Vigia de URL para Links Compartilhados
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
    novoLink.href = `./estilos/secoes/${nome}.css`;
    document.head.appendChild(novoLink);
}

/**
 * Carrega dinamicamente o feed de uma seção com efeito de transição suave
 */
async function carregarSecao(nome) {
    if (!displayPrincipal) return;

    // Dispara a animação de cobertura
    dispararTransicaoSuave();
    
    try {
        gerenciarCSSDaSecao(nome);

        const response = await fetch(`./secoes/${nome}.html`);
        if (!response.ok) throw new Error("Arquivo não encontrado.");
        
        const html = await response.text();
        
        // Substitui o conteúdo
        displayPrincipal.innerHTML = html;

        // Re-executa os scripts
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

// Exposição global
window.carregarSecao = carregarSecao;
window.abrirNoticiaUnica = abrirNoticiaUnica;
