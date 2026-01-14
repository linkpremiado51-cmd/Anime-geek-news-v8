/* scripts/busca.js */

const inputBusca = document.getElementById('input-busca-global');
const surface = document.getElementById('search-results-surface');

/**
 * Renderiza os resultados na superfície flutuante
 */
function renderizarSuperficie(lista) {
    if (lista.length === 0) {
        surface.innerHTML = '<div style="padding:15px; font-size:12px; color:#888; text-transform:uppercase; font-weight:700;">Nenhum resultado</div>';
    } else {
        surface.innerHTML = lista.map(item => {
            // Tenta pegar a thumb do primeiro vídeo relacionado ou usa uma padrão
            const thumb = item.relacionados?.[0]?.thumb || item.thumb || 'https://anigeeknews.com/default-og.jpg';
            
            return `
            <div class="result-item-list" onclick="focarNoticia('${item.id}')" style="border-left: 3px solid ${item.cor || 'var(--primary)'}">
                <img src="${thumb}" class="result-img">
                <div class="result-info">
                    <div class="result-cat" style="color: ${item.cor || 'var(--primary)'}">${item.categoria}</div>
                    <h4 class="result-title">${item.titulo}</h4>
                </div>
            </div>
        `}).join('');
    }
    surface.style.display = 'block';
}

/**
 * Escuta a digitação
 */
if (inputBusca) {
    inputBusca.addEventListener('input', (e) => {
        const termo = e.target.value.toLowerCase().trim();
        
        if (termo === "") { 
            surface.style.display = 'none'; 
            return; 
        }

        // Busca em TODAS as notícias carregadas globalmente pelo config-firebase.js
        const todasAsFontes = window.noticiasFirebase || [];
        
        const filtradas = todasAsFontes.filter(n => 
            (n.titulo && n.titulo.toLowerCase().includes(termo)) || 
            (n.categoria && n.categoria.toLowerCase().includes(termo)) ||
            (n.resumo && n.resumo.toLowerCase().includes(termo))
        );

        renderizarSuperficie(filtradas);
    });
}

/**
 * Ação ao clicar no resultado
 */
window.focarNoticia = (id) => {
    surface.style.display = 'none';
    if (inputBusca) inputBusca.value = "";
    
    const itemEncontrado = window.noticiasFirebase.find(n => n.id === id);
    
    if (itemEncontrado) {
        // 1. Se a função de renderizar da página atual existir, usa ela
        if (window.renderizarNoticias) {
            window.renderizarNoticias([itemEncontrado]);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            // 2. Caso o usuário esteja em outra página, você pode redirecionar (opcional)
            console.log("Item selecionado:", itemEncontrado.titulo);
            // window.location.href = `/${itemEncontrado.tipo}.html?id=${id}`;
        }
    }
};

// Fecha ao clicar fora
document.addEventListener('click', (e) => {
    if (surface && !e.target.closest('.search-bar-wrapper')) {
        surface.style.display = 'none';
    }
});
