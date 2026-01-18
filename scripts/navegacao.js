/* scripts/navegacao.js - Versão Anti-Bug com Limpeza de Cache */

const displayPrincipal = document.getElementById('conteudo_de_destaque');
let carregandoSecaoAtiva = false; // Trava para evitar cliques duplos bugados

/**
 * Função de Transição Suave:
 */
function aplicarTransicaoConteudo(callback) {
    if (!displayPrincipal || carregandoSecaoAtiva) return callback();
    carregandoSecaoAtiva = true;

    displayPrincipal.style.transition = 'opacity 0.2s ease-out, transform 0.2s ease-out';
    displayPrincipal.style.opacity = '0';
    displayPrincipal.style.transform = 'translateY(10px)';

    setTimeout(async () => {
        await callback();
        
        setTimeout(() => {
            displayPrincipal.style.opacity = '1';
            displayPrincipal.style.transform = 'translateY(0)';
            carregandoSecaoAtiva = false;
        }, 50);
    }, 200);
}

/**
 * LIMPEZA CRÍTICA: Remove scripts de seções anteriores para evitar conflitos
 */
function limparScriptsDeSecao() {
    const scriptsAntigos = document.querySelectorAll('script[data-motor="dinamico"]');
    scriptsAntigos.forEach(s => s.remove());
    // Reseta a função de renderização global para garantir que o novo motor assuma
    window.renderizarNoticias = null; 
}

async function abrirNoticiaUnica(item) {
    if (!displayPrincipal) return;

    aplicarTransicaoConteudo(async () => {
        try {
            limparScriptsDeSecao(); // Limpa antes de carregar o novo
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
                        <p style="text-align:center; padding:50px; color:var(--text-muted);">Carregando...</p>
                    </div>
                </div>
            `;

            const response = await fetch(`./secoes/${item.origem || 'manchetes'}.html`);
            const htmlBase = await response.text();

            const parser = new DOMParser();
            const docSeçao = parser.parseFromString(htmlBase, 'text/html');
            const scripts = docSeçao.querySelectorAll("script");

            scripts.forEach(oldScript => {
                const newScript = document.createElement("script");
                newScript.setAttribute('data-motor', 'dinamico'); // Marca para limpeza
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
                } else if (tentativas < 15) {
                    tentativas++;
                    setTimeout(tentarRenderizar, 100);
                }
            };
            tentarRenderizar();

        } catch (err) {
            displayPrincipal.innerHTML = `<div style="padding:100px; text-align:center;">Erro ao carregar notícia.</div>`;
            carregandoSecaoAtiva = false;
        }
    });
}

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

function gerenciarCSSDaSecao(nome) {
    const linkAntigo = document.getElementById('css-secao-dinamica');
    if (linkAntigo) linkAntigo.remove();
    const novoLink = document.createElement('link');
    novoLink.id = 'css-secao-dinamica';
    novoLink.rel = 'stylesheet';
    novoLink.href = `./estilos/secoes/${nome}.css`;
    document.head.appendChild(novoLink);
}

async function carregarSecao(nome) {
    if (!displayPrincipal) return;

    aplicarTransicaoConteudo(async () => {
        try {
            limparScriptsDeSecao();
            gerenciarCSSDaSecao(nome);

            const response = await fetch(`./secoes/${nome}.html`);
            if (!response.ok) throw new Error();
            
            const html = await response.text();
            displayPrincipal.innerHTML = html;

            const scripts = displayPrincipal.querySelectorAll("script");
            scripts.forEach(oldScript => {
                const newScript = document.createElement("script");
                newScript.setAttribute('data-motor', 'dinamico');
                newScript.type = oldScript.type || "text/javascript";
                if (oldScript.src) newScript.src = oldScript.src;
                newScript.textContent = oldScript.textContent;
                document.body.appendChild(newScript);
            });

            window.scrollTo({ top: 0, behavior: 'smooth' });

        } catch (err) {
            displayPrincipal.innerHTML = `<div style="text-align:center; padding:100px;">Erro ao carregar seção.</div>`;
            carregandoSecaoAtiva = false;
        }
    });
}

document.querySelectorAll('.filter-tag').forEach(tag => {
    tag.addEventListener('click', () => {
        if (carregandoSecaoAtiva) return; // Bloqueia spam de cliques
        document.querySelectorAll('.filter-tag').forEach(t => t.classList.remove('active'));
        tag.classList.add('active');
        carregarSecao(tag.dataset.section);
    });
});

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
