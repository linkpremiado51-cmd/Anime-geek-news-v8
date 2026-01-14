/* scripts/navegacao.js */

const displayPrincipal = document.getElementById('conteudo_de_destaque');

/**
 * VERSÃO EDITADA: Abre a notícia garantindo que o motor de renderização da seção seja injetado corretamente
 */
async function abrirNoticiaUnica(item) {
    if (!displayPrincipal) return;

    try {
        // 1. Carrega o CSS da seção de origem
        gerenciarCSSDaSecao(item.origem || 'manchetes');

        // 2. Prepara o layout com o botão de Voltar. 
        // IMPORTANTE: O container agora usa o ID 'container-principal' para bater com o que a seção espera
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

        // 3. Busca o HTML da seção silenciosamente
        const response = await fetch(`./secoes/${item.origem || 'manchetes'}.html`);
        if (!response.ok) throw new Error("Falha ao carregar motor de renderização.");
        const htmlBase = await response.text();

        // 4. Extrai os scripts. Como sua seção usa type="module", precisamos forçar
        // a função renderizarNoticias para o window.
        const parser = new DOMParser();
        const docSeçao = parser.parseFromString(htmlBase, 'text/html');
        const scripts = docSeçao.querySelectorAll("script");

        scripts.forEach(oldScript => {
            const newScript = document.createElement("script");
            
            // Se for módulo, mantemos, mas vamos injetar uma "ponte"
            if (oldScript.type === 'module' || !oldScript.type) {
                let conteudo = oldScript.textContent;
                
                // Técnica para expor a função de renderização ao window mesmo sendo module
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

        // 5. Tentativa de renderização com verificação de segurança
        let tentativas = 0;
        const tentarRenderizar = () => {
            if (typeof window.renderizarNoticias === 'function') {
                // Limpa o aviso de carregamento
                const container = document.getElementById('container-principal');
                if (container) container.innerHTML = "";
                
                window.renderizarNoticias([item]);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else if (tentativas < 20) {
                tentativas++;
                setTimeout(tentarRenderizar, 150);
            } else {
                console.error("Motor de renderização não respondeu.");
            }
        };

        tentarRenderizar();

    } catch (err) {
        console.error("Erro na ponte de navegação:", err);
        displayPrincipal.innerHTML = `<div style="padding:100px; text-align:center;">Erro ao carregar conteúdo.</div>`;
    }
}

/**
 * NOVA FUNÇÃO: Vigia de URL para Links Compartilhados (?id=...)
 */
function verificarLinkCompartilhado() {
    const params = new URLSearchParams(window.location.search);
    const idNoticia = params.get('id');

    if (idNoticia) {
        displayPrincipal.innerHTML = '<div style="text-align: center; padding: 99px; color: var(--text-muted);">Sincronizando notícia...</div>';

        const checkData = setInterval(() => {
            if (window.noticiasFirebase && window.noticiasFirebase.length > 0) {
                const item = window.noticiasFirebase.find(n => n.id === idNoticia);
                if (item) {
                    abrirNoticiaUnica(item);
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
 * Função para limpar o ID da URL e restaurar a visualização da seção
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
 * Gerencia o carregamento de CSS específico para cada seção
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
 * Carrega dinamicamente o conteúdo HTML de uma seção
 */
async function carregarSecao(nome) {
    if (!displayPrincipal) return;

    displayPrincipal.innerHTML = '<div style="text-align: center; padding: 99px; color: var(--text-muted);">Sincronizando feed...</div>';
    
    try {
        gerenciarCSSDaSecao(nome);

        const response = await fetch(`./secoes/${nome}.html`);
        if (!response.ok) throw new Error("Arquivo não encontrado.");
        
        const html = await response.text();
        displayPrincipal.innerHTML = html;

        const scripts = displayPrincipal.querySelectorAll("script");
        scripts.forEach(oldScript => {
            const newScript = document.createElement("script");
            newScript.type = oldScript.type || "text/javascript";
            if (oldScript.src) newScript.src = oldScript.src;
            newScript.text = oldScript.text;
            document.body.appendChild(newScript);
        });

        window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (err) {
        displayPrincipal.innerHTML = `<div style="text-align:center; padding:100px;">Erro: ${nome} não carregado.</div>`;
    }
}

// Eventos de clique nas tags
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
