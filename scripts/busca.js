/* scripts/busca.js */

const inputBusca = document.getElementById('input-busca-global');
const surface = document.getElementById('search-results-surface');
let timeoutBusca = null;

function renderizarSuperficie(lista) {
    if (!surface) return;

    if (lista.length === 0) {
        surface.innerHTML = '<div style="padding:15px; font-size:12px; color:#888; text-align:center;">Nenhum resultado encontrado.</div>';
    } else {
        surface.innerHTML = lista.map(news => {
            // Usa o thumb normalizado pelo config-firebase.js
            const imagemUrl = news.thumb || 'https://anigeeknews.com/default-og.jpg';
            
            return `
            <div class="result-item-list" onclick="window.focarNoticia('${news.id}')" style="cursor:pointer; display:flex; align-items:center; gap:12px; padding:12px; border-bottom:1px solid rgba(0,0,0,0.06);">
                <img src="${imagemUrl}" style="width:52px; height:52px; object-fit:cover; border-radius:6px; flex-shrink:0; background:#eee;" onerror="this.src='https://anigeeknews.com/default-og.jpg'">
                <div class="result-info" style="flex:1; overflow:hidden;">
                    <div class="result-cat" style="color: ${news.cor || '#ff0000'}; font-size:9px; font-weight:900; text-transform:uppercase;">${news.categoria || 'NOTÍCIA'}</div>
                    <h4 class="result-title" style="margin:0; font-size:13px; font-weight:700; color:#333; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${news.titulo}</h4>
                </div>
            </div>`;
        }).join('');
    }
    surface.style.display = 'block';
}

if (inputBusca) {
    inputBusca.addEventListener('input', (e) => {
        clearTimeout(timeoutBusca);
        const termo = e.target.value.toLowerCase().trim();
        
        if (termo === "") { 
            surface.style.display = 'none'; 
            return; 
        }

        timeoutBusca = setTimeout(() => {
            // IMPORTANTE: Verifica se o array existe e tem dados
            const bancoDeDados = window.noticiasFirebase || [];
            
            console.log(`🔍 Buscando por "${termo}" em ${bancoDeDados.length} notícias.`);

            const filtradas = bancoDeDados.filter(n => {
                const titulo = (n.titulo || "").toLowerCase();
                const categoria = (n.categoria || "").toLowerCase();
                const resumo = (n.resumo || "").toLowerCase();
                
                return titulo.includes(termo) || categoria.includes(termo) || resumo.includes(termo);
            }).slice(0, 8);

            renderizarSuperficie(filtradas);
        }, 200); // Aumentei um pouco o tempo para estabilidade
    });
}

window.focarNoticia = (id) => {
    surface.style.display = 'none';
    inputBusca.value = "";
    const noticia = (window.noticiasFirebase || []).find(n => n.id === id);
    if (noticia) window.abrirModalNoticia(noticia);
};
