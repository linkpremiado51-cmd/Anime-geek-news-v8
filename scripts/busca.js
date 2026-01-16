/* scripts/busca.js */

// Seleção dos elementos baseada no seu index.html
const inputBusca = document.getElementById('input-busca-global');
const surface = document.getElementById('search-results-surface');
let timeoutBusca = null;

/**
 * Renderiza os resultados na superfície flutuante
 */
function renderizarSuperficie(lista) {
    if (!surface) return;

    if (lista.length === 0) {
        surface.innerHTML = '<div style="padding:15px; font-size:12px; color:#888; text-align:center;">Nenhum resultado encontrado.</div>';
    } else {
        surface.innerHTML = lista.map(news => {
            // Lógica robusta para encontrar uma imagem válida para o resultado da busca
            let thumb = 'https://anigeeknews.com/default-og.jpg'; // Fallback
            if (news.thumb) thumb = news.thumb;
            else if (news.capa) thumb = news.capa;
            else if (news.relacionados && news.relacionados[0] && news.relacionados[0].thumb) thumb = news.relacionados[0].thumb;
            
            return `
            <div class="result-item-list" onclick="window.focarNoticia('${news.id}')" style="cursor:pointer; display:flex; align-items:center; gap:12px; padding:12px; border-bottom:1px solid rgba(0,0,0,0.06); transition: background 0.2s;">
                <img src="${thumb}" class="result-img" style="width:52px; height:52px; object-fit:cover; border-radius:6px; flex-shrink:0; background:#eee;" loading="lazy">
                <div class="result-info" style="flex:1; overflow:hidden;">
                    <div class="result-cat" style="color: ${news.cor || 'var(--primary)'}; font-size:9px; font-weight:900; text-transform:uppercase; letter-spacing:0.8px; margin-bottom:2px;">${news.categoria || 'Notícia'}</div>
                    <h4 class="result-title" style="margin:0; font-size:13px; font-weight:700; color:var(--text-main); line-height:1.3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${news.titulo}</h4>
                </div>
            </div>`;
        }).join('');
    }
    surface.style.display = 'block';
}

/**
 * Lógica de filtragem otimizada (Debounce)
 */
if (inputBusca) {
    inputBusca.addEventListener('input', (e) => {
        clearTimeout(timeoutBusca);
        const termo = e.target.value.toLowerCase().trim();
        
        if (termo === "") { 
            if (surface) surface.style.display = 'none'; 
            return; 
        }

        // Debounce de 150ms: evita processamento excessivo enquanto o usuário digita rápido
        timeoutBusca = setTimeout(() => {
            // Filtra no array global window.noticiasFirebase alimentado pelo config-firebase.js
            const filtradas = (window.noticiasFirebase || []).filter(n => 
                (n.titulo && n.titulo.toLowerCase().includes(termo)) || 
                (n.categoria && n.categoria.toLowerCase().includes(termo)) ||
                (n.resumo && n.resumo.toLowerCase().includes(termo))
            ).slice(0, 8); // Limite de 8 resultados para manter a UI limpa

            renderizarSuperficie(filtradas);
            console.log(`🔍 [Busca] Filtrado entre ${(window.noticiasFirebase || []).length} itens carregados.`);
        }, 150);
    });

    // Impede que o clique no input feche a superfície imediatamente
    inputBusca.addEventListener('click', (e) => {
        if (inputBusca.value.trim() !== "") {
            surface.style.display = 'block';
        }
    });
}

/**
 * Função chamada ao clicar em um resultado da busca
 */
window.focarNoticia = (id) => {
    // 1. Limpa a interface de busca
    if (surface) surface.style.display = 'none';
    if (inputBusca) inputBusca.value = "";
    
    // 2. Localiza o objeto da notícia no cache global
    const noticia = (window.noticiasFirebase || []).find(n => n.id === id);
    
    if (noticia) {
        // 3. Atualiza a URL com o ID (Permite compartilhar o link após achar na busca)
        const url = new URL(window.location);
        url.searchParams.set('id', id);
        window.history.pushState({ id: id }, '', url);

        // 4. Aciona o Modal Global definido no index.html
        if (typeof window.abrirModalNoticia === 'function') {
            window.abrirModalNoticia(noticia);
        } else {
            console.error("❌ Erro: Função abrirModalNoticia não encontrada no index.html");
        }
    }
};

/**
 * Fecha a superfície se clicar fora da área de busca
 */
document.addEventListener('click', (e) => {
    if (surface && !e.target.closest('.search-bar-wrapper')) {
        surface.style.display = 'none';
    }
});

console.log("🔍 Busca Global: Sincronizada com o Modal Global.");
