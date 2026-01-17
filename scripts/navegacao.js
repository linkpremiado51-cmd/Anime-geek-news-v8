/* scripts/navegacao.js */

const displayPrincipal = document.getElementById('conteudo_de_destaque');

/**
 * Aplica o efeito de transição visual suave no container
 */
function aplicarTransicaoConteudo(callback) {
    if (!displayPrincipal) return;

    // 1. Faz o conteúdo atual sumir suavemente
    displayPrincipal.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    displayPrincipal.style.opacity = '0';
    displayPrincipal.style.transform = 'translateY(10px)';

    setTimeout(async () => {
        // 2. Executa a troca de conteúdo (o fetch e a injeção)
        await callback();

        // 3. Faz o conteúdo novo aparecer deslizando para cima
        setTimeout(() => {
            displayPrincipal.style.opacity = '1';
            displayPrincipal.style.transform = 'translateY(0)';
        }, 100); // Pequeno fôlego para o navegador processar a injeção
    }, 300);
}

/**
 * Carrega dinamicamente o feed de uma seção com Cross-Fade
 */
async function carregarSecao(nome) {
    if (!displayPrincipal) return;

    aplicarTransicaoConteudo(async () => {
        try {
            gerenciarCSSDaSecao(nome);

            const response = await fetch(`./secoes/${nome}.html`);
            if (!response.ok) throw new Error("Falha");
            
            const html = await response.text();
            displayPrincipal.innerHTML = html;

            // Re-executa os scripts do Firebase
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
            displayPrincipal.innerHTML = `<div style="padding:100px; text-align:center;">Erro ao carregar seção.</div>`;
        }
    });
}

/**
 * Abre a notícia única com a mesma suavidade
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
                            <i class="fa-solid fa-chevron-left" style="font-size: 14px;"></i> 
                            <span>Voltar</span>
                        </button>
                    </div>
                    <div id="container-principal"></div>
                </div>
            `;

            const response = await fetch(`./secoes/${item.origem || 'manchetes'}.html`);
            const htmlBase = await response.text();

            const parser = new DOMParser();
            const docSeçao = parser.parseFromString(htmlBase, 'text/html');
            const scripts = docSeçao.querySelectorAll("script");

            scripts.forEach(oldScript => {
                const newScript = document.createElement("script");
                newScript.type = 'module';
                newScript.textContent = oldScript.textContent.includes('renderizarNoticias') 
                    ? oldScript.textContent + `\n window.renderizarNoticias = renderizarNoticias;` 
                    : oldScript.textContent;
                document.head.appendChild(newScript);
            });

            let tentativas = 0;
            const tentarRenderizar = () => {
                if (typeof window.renderizarNoticias === 'function') {
                    window.renderizarNoticias([item]);
                } else if (tentativas < 20) {
                    tentativas++;
                    setTimeout(tentarRenderizar, 150);
                }
            };
            tentarRenderizar();

        } catch (err) {
            console.error(err);
        }
    });
}

// --- Funções Auxiliares ---

function gerenciarCSSDaSecao(nome) {
    const linkAntigo = document.getElementById('css-secao-dinamica');
    if (linkAntigo) linkAntigo.remove();
    const novoLink = document.createElement('link');
    novoLink.id = 'css-secao-dinamica'; novoLink.rel = 'stylesheet';
    novoLink.href = `./estilos/secoes/${nome}.css`;
    document.head.appendChild(novoLink);
}

window.voltarParaLista = function() {
    const url = new URL(window.location);
    url.searchParams.delete('id');
    window.history.pushState({}, '', url);
    const tagAtiva = document.querySelector('.filter-tag.active');
    carregarSecao(tagAtiva ? tagAtiva.dataset.section : 'manchetes');
};

document.querySelectorAll('.filter-tag').forEach(tag => {
    tag.addEventListener('click', () => {
        document.querySelectorAll('.filter-tag').forEach(t => t.classList.remove('active'));
        tag.classList.add('active');
        carregarSecao(tag.dataset.section);
    });
});

window.addEventListener('DOMContentLoaded', () => carregarSecao('manchetes'));
window.carregarSecao = carregarSecao;
window.abrirNoticiaUnica = abrirNoticiaUnica;
