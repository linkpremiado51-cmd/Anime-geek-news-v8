/* scripts/navegacao.js */

const displayPrincipal = document.getElementById('conteudo_de_destaque');

/**
 * Cria uma tela de carregamento suave APENAS dentro do container de conteúdo
 */
function dispararTransicaoSuave() {
    if (!displayPrincipal) return;

    // Garante que o container pai tenha posição relativa para o overlay se ajustar a ele
    displayPrincipal.style.position = 'relative';
    displayPrincipal.style.minHeight = '300px';

    const antiga = document.getElementById('transicao-suave-overlay');
    if (antiga) antiga.remove();

    const overlay = document.createElement('div');
    overlay.id = 'transicao-suave-overlay';
    
    // Estilização para cobrir apenas a área de conteúdo
    Object.assign(overlay.style, {
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        backgroundColor: 'var(--bg)',
        zIndex: '10',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        transition: 'opacity 0.4s ease',
        opacity: '1'
    });

    overlay.innerHTML = `
        <div style="text-align: center;">
            <div style="width: 30px; height: 30px; border: 2px solid var(--border); border-top: 2px solid var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 10px;"></div>
            <span style="font-size: 9px; letter-spacing: 1.5px; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Atualizando Feed</span>
        </div>
        <style>
            @keyframes spin { to { transform: rotate(360deg); } }
        </style>
    `;

    displayPrincipal.appendChild(overlay);

    // Duração total de ~1.3s (900ms espera + 400ms fade)
    setTimeout(() => {
        overlay.style.opacity = '0';
        setTimeout(() => {
            if (overlay.parentNode) overlay.remove();
        }, 400);
    }, 900);
}

/**
 * Abre a notícia única
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
            } else if (tentativas < 20) {
                tentativas++;
                setTimeout(tentarRenderizar, 150);
            }
        };
        tentarRenderizar();

    } catch (err) {
        console.error(err);
    }
}

/**
 * Carrega dinamicamente o feed de uma seção
 */
async function carregarSecao(nome) {
    if (!displayPrincipal) return;

    dispararTransicaoSuave();
    
    try {
        gerenciarCSSDaSecao(nome);

        const response = await fetch(`./secoes/${nome}.html`);
        if (!response.ok) throw new Error("Falha");
        
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
        displayPrincipal.innerHTML = `<div style="padding:50px; text-align:center;">Erro ao carregar.</div>`;
    }
}

// Funções auxiliares mantidas conforme original
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
