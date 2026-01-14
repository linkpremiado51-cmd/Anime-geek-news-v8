/* scripts/navegacao.js */

const displayPrincipal = document.getElementById('conteudo_de_destaque');

/**
 * NOVA FUNÇÃO: Renderiza apenas uma notícia na tela (Janela de foco)
 * Limpa o conteúdo atual para exibir o item vindo da busca ou link direto.
 */
function abrirNoticiaUnica(item) {
    if (!displayPrincipal) return;

    // 1. Carrega o CSS da seção de origem (ex: lancamentos.css)
    gerenciarCSSDaSecao(item.origem || 'manchetes');

    // 2. Prepara a estrutura de visualização com o botão de Voltar/Fechar
    displayPrincipal.innerHTML = `
        <div class="foco-noticia-wrapper" style="animation: fadeIn 0.4s ease; max-width: var(--container-w); margin: 0 auto; padding: 20px;">
            <div style="display: flex; justify-content: flex-start; padding-bottom: 20px; border-bottom: 1px solid var(--border); margin-bottom: 30px;">
                <button onclick="window.voltarParaLista()" style="background: var(--text-main); color: var(--bg); border: none; padding: 10px 20px; font-size: 11px; font-weight: 800; letter-spacing: 1px; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: 0.3s;">
                    <i class="fa-solid fa-xmark"></i> FECHAR E VOLTAR
                </button>
            </div>
            <div id="container-render-unico"></div>
        </div>
    `;

    // 3. Função recursiva interna para garantir que o script de renderização carregou
    const tentarRenderizar = () => {
        if (typeof window.renderizarNoticias === 'function') {
            window.renderizarNoticias([item]);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            // Se a função de renderizar ainda não existe no escopo, tentamos de novo em 200ms
            setTimeout(tentarRenderizar, 200);
        }
    };

    tentarRenderizar();
}

/**
 * NOVA FUNÇÃO: Vigia de URL para Links Compartilhados (?id=...)
 */
function verificarLinkCompartilhado() {
    const params = new URLSearchParams(window.location.search);
    const idNoticia = params.get('id');

    if (idNoticia) {
        // Aguarda o Firebase alimentar o array global antes de procurar
        const checkData = setInterval(() => {
            if (window.noticiasFirebase && window.noticiasFirebase.length > 0) {
                const item = window.noticiasFirebase.find(n => n.id === idNoticia);
                if (item) {
                    abrirNoticiaUnica(item);
                } else {
                    // Se não achar o ID, volta para manchetes
                    carregarSecao('manchetes');
                }
                clearInterval(checkData);
            }
        }, 100);
        
        // Timeout de segurança (5 segundos)
        setTimeout(() => clearInterval(checkData), 5000);
    }
}

/**
 * Função para limpar o ID da URL e voltar para a navegação normal
 */
window.voltarParaLista = function() {
    // Remove o parâmetro ID da URL sem recarregar
    const url = new URL(window.location);
    url.searchParams.delete('id');
    window.history.pushState({}, '', url);

    // Identifica qual seção estava ativa ou carrega manchetes
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

        // Ativa scripts do HTML carregado (suporte a módulos para Firebase)
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

// Escuta os cliques nas tags de filtro
document.querySelectorAll('.filter-tag').forEach(tag => {
    tag.addEventListener('click', () => {
        document.querySelectorAll('.filter-tag').forEach(t => t.classList.remove('active'));
        tag.classList.add('active');
        carregarSecao(tag.dataset.section);
    });
});

// Menu Mobile
window.toggleMobileMenu = function() {
    const menu = document.getElementById('mobileMenu');
    if (menu) menu.classList.toggle('active');
};

/**
 * INICIALIZAÇÃO INTELIGENTE
 */
window.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    
    if (params.has('id')) {
        // Se entrar por link direto, usa o vigia
        verificarLinkCompartilhado();
    } else {
        // Se entrar normal, carrega manchetes
        carregarSecao('manchetes');
    }
});

// Exportação global de funções essenciais
window.carregarSecao = carregarSecao;
window.abrirNoticiaUnica = abrirNoticiaUnica;
