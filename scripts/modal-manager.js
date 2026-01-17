/* scripts/modal-manager.js */

let noticiasDaSessao = []; 
let indiceAtual = 0;

const estruturaHTML = `
<div id="modal-noticia-global" style="display:none;">
    <div class="modal-content">
        <div class="video-header">
            <div id="video-placeholder" style="display:none; width:100%; height:100%; background:#000; align-items:center; justify-content:center; color:#555;">
                <i class="fa-solid fa-play-circle" style="font-size:40px;"></i>
            </div>
            <iframe id="m-video" src="" allow="autoplay; fullscreen" frameborder="0"></iframe>
            <button class="close-modal-btn" onclick="window.fecharModalGlobal()">×</button>
        </div>
        <div class="modal-body">
            <div id="m-categoria"></div>
            <h2 id="m-titulo"></h2>
            <div id="m-ficha"></div>
            <p id="m-resumo"></p>
        </div>
        <div class="modal-nav-footer">
            <button class="btn-nav" id="btn-prev" onclick="window.navegarNoticia(-1)">
                <i class="fa-solid fa-chevron-left"></i> Anterior
            </button>
            <a id="m-link" target="_blank" class="btn-ver-artigo-modal">ABRIR MATÉRIA</a>
            <button class="btn-nav" id="btn-next" onclick="window.navegarNoticia(1)">
                Próxima <i class="fa-solid fa-chevron-right"></i>
            </button>
        </div>
    </div>
</div>`;

// Injeção segura do HTML
if (!document.getElementById('modal-noticia-global')) {
    document.body.insertAdjacentHTML('beforeend', estruturaHTML);
}

/**
 * Atualiza as Meta Tags para SEO dinâmico
 */
const atualizarSEO = (noticia) => {
    if(!noticia) return;
    document.title = `${noticia.titulo} | AniGeekNews`;

    const setMeta = (property, content) => {
        if(!content) return;
        let el = document.querySelector(`meta[property="${property}"]`) || 
                 document.querySelector(`meta[name="${property}"]`);
        if (!el) {
            el = document.createElement('meta');
            // Algumas tags usam 'property' (OG), outras 'name' (Twitter/Meta)
            el.setAttribute(property.includes('og:') ? 'property' : 'name', property);
            document.head.appendChild(el);
        }
        el.setAttribute('content', content);
    };

    setMeta('og:title', noticia.titulo);
    setMeta('og:description', noticia.resumo ? noticia.resumo.substring(0, 160) : "");
    setMeta('og:image', noticia.thumb);
    setMeta('og:url', window.location.href);
    setMeta('twitter:card', 'summary_large_image');
};

/**
 * Renderiza os dados no Modal com tratamento de erros
 */
const renderizarDadosNoModal = (noticia) => {
    if (!noticia) return;

    const modal = document.getElementById('modal-noticia-global');
    const iframe = document.getElementById('m-video');
    const placeholder = document.getElementById('video-placeholder');
    
    modal.style.setProperty('--tema-cor', noticia.cor || "#ff0000");

    document.getElementById('m-categoria').innerText = noticia.categoria || "GEEK";
    document.getElementById('m-titulo').innerText = noticia.titulo;
    document.getElementById('m-resumo').innerText = noticia.resumo || "";
    document.getElementById('m-link').href = noticia.linkArtigo || "#";

    // Lógica de Vídeo: Se não houver vídeo, esconde o iframe e mostra um placeholder ou fundo preto
    if (noticia.videoPrincipal && noticia.videoPrincipal !== "") {
        iframe.style.display = 'block';
        placeholder.style.display = 'none';
        iframe.src = noticia.videoPrincipal;
    } else {
        iframe.style.display = 'none';
        placeholder.style.display = 'flex';
        iframe.src = "";
    }

    const fichaContainer = document.getElementById('m-ficha');
    if (noticia.ficha && Array.isArray(noticia.ficha) && noticia.ficha.length > 0) {
        fichaContainer.style.display = 'grid';
        fichaContainer.innerHTML = noticia.ficha.map(item => `
            <div class="info-item">
                <span class="info-label">${item.label}</span>
                <span class="info-valor">${item.valor}</span>
            </div>
        `).join('');
    } else {
        fichaContainer.style.display = 'none';
    }
    
    // Atualiza Navegação (Desativa botões se não houver mais notícias)
    document.getElementById('btn-prev').style.opacity = indiceAtual === 0 ? "0.3" : "1";
    document.getElementById('btn-next').style.opacity = indiceAtual === noticiasDaSessao.length - 1 ? "0.3" : "1";

    atualizarSEO(noticia);
};

window.abrirModalNoticia = (noticia) => {
    if (!noticia) return;
    const modal = document.getElementById('modal-noticia-global');
    
    // Busca notícias da mesma origem para o carrossel
    const bancoGlobal = window.noticiasFirebase || [];
    noticiasDaSessao = bancoGlobal.filter(n => n.origem === noticia.origem);
    
    // Se não achar nada na mesma origem, usa o banco global como fallback
    if(noticiasDaSessao.length === 0) noticiasDaSessao = bancoGlobal;

    indiceAtual = noticiasDaSessao.findIndex(n => n.id === noticia.id);
    if(indiceAtual === -1) indiceAtual = 0;

    renderizarDadosNoModal(noticia);
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';

    // Atualiza URL sem recarregar a página
    const url = new URL(window.location);
    url.searchParams.set('id', noticia.id);
    window.history.pushState({ modalOpen: true }, '', url);
};

window.navegarNoticia = (direcao) => {
    const novoIndice = indiceAtual + direcao;
    if (novoIndice >= 0 && novoIndice < noticiasDaSessao.length) {
        indiceAtual = novoIndice;
        renderizarDadosNoModal(noticiasDaSessao[indiceAtual]);
        
        // Atualiza a URL para a nova notícia navegada
        const url = new URL(window.location);
        url.searchParams.set('id', noticiasDaSessao[indiceAtual].id);
        window.history.replaceState({ modalOpen: true }, '', url);
    }
};

window.fecharModalGlobal = () => {
    const modal = document.getElementById('modal-noticia-global');
    if(!modal) return;

    modal.style.display = 'none';
    document.getElementById('m-video').src = "";
    document.body.style.overflow = 'auto';

    document.title = "AniGeekNews | Jornalismo Geek";

    const url = new URL(window.location);
    if (url.searchParams.has('id')) {
        url.searchParams.delete('id');
        window.history.pushState({}, '', url);
    }
};

// BUG FIX: Fecha o modal se o usuário clicar no botão "Voltar" do celular/navegador
window.addEventListener('popstate', (event) => {
    const modal = document.getElementById('modal-noticia-global');
    if (modal && modal.style.display === 'block') {
        window.fecharModalGlobal();
    }
});
