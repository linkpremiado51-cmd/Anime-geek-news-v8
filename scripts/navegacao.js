/* scripts/navegacao.js */

const displayPrincipal = document.getElementById('conteudo_de_destaque');

/**
 * Carrega dinamicamente o conteúdo HTML de uma seção específica
 * @param {string} nome - O nome do arquivo (ex: 'manchetes', 'analises')
 */
async function carregarSecao(nome) {
    if (!displayPrincipal) return;

    displayPrincipal.innerHTML = '<div style="text-align: center; padding: 100px; color: var(--text-muted);">Carregando conteúdo...</div>';
    
    try {
        // Busca o arquivo na subpasta /secoes/
        const response = await fetch(`./secoes/${nome}.html`);
        if (!response.ok) throw new Error("Erro 404: Arquivo não encontrado.");
        
        const html = await response.text();
        displayPrincipal.innerHTML = html;

        // Ativa scripts do HTML carregado (importante para o Firebase funcionar nas seções)
        const scripts = displayPrincipal.querySelectorAll("script");
        scripts.forEach(oldScript => {
            const newScript = document.createElement("script");
            newScript.type = oldScript.type || "text/javascript";
            if (oldScript.src) newScript.src = oldScript.src;
            newScript.text = oldScript.text;
            document.body.appendChild(newScript);
        });
    } catch (err) {
        displayPrincipal.innerHTML = `
            <div style="text-align: center; padding: 100px; color: var(--accent-news);">
                Erro: ${err.message} <br> 
                Verifique se o arquivo está na pasta /secoes/
            </div>`;
    }
}

// Escuta os cliques nos botões de filtro (Manchetes, Análises, etc.)
document.querySelectorAll('.filter-tag').forEach(tag => {
    tag.addEventListener('click', () => {
        // Remove 'active' de todos e adiciona no clicado
        document.querySelectorAll('.filter-tag').forEach(t => t.classList.remove('active'));
        tag.classList.add('active');
        
        // Carrega a seção baseada no atributo data-section do botão
        carregarSecao(tag.dataset.section);
    });
});

// Função para abrir/fechar o menu mobile
window.toggleMobileMenu = function() {
    const menu = document.getElementById('mobileMenu');
    if (menu) {
        menu.classList.toggle('active');
    }
};

// Inicialização: carrega as manchetes por padrão ao abrir o site
window.addEventListener('DOMContentLoaded', () => {
    carregarSecao('manchetes');
});

// Exporta a função para o escopo global para uso em outros lugares
window.carregarSecao = carregarSecao;
