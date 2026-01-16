/* scripts/modal-manager.js */
import { getFirestore, doc, getDoc, collection, query, where, limit, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const db = getFirestore();
let playlistNoticias = []; // Cache das notícias para navegação
let indiceAtual = 0;

// Injeta a estrutura HTML (Player Topo + Ficha Grid + Botão Dinâmico)
const estruturaHTML = `
<div id="modal-noticia-global">
    <div class="modal-content">
        <div class="video-header">
            <button class="close-modal-btn" onclick="window.fecharModalGlobal()">×</button>
            <iframe id="m-video" src="" allow="autoplay; fullscreen"></iframe>
        </div>
        
        <div class="modal-body">
            <div id="m-categoria"></div>
            <h2 id="m-titulo"></h2>
            
            <div id="m-ficha"></div>

            <p id="m-resumo"></p>
        </div>

        <div class="modal-nav-footer">
            <button class="btn-nav" onclick="window.navegarNoticia(-1)"><i class="fa-solid fa-chevron-left"></i> Anterior</button>
            <a id="m-link" href="#" target="_blank" class="btn-ver-artigo-modal">LER ARTIGO COMPLETO</a>
            <button class="btn-nav" onclick="window.navegarNoticia(1)">Próxima <i class="fa-solid fa-chevron-right"></i></button>
        </div>
    </div>
</div>

<style>
    .close-modal-btn { position: absolute; top: 15px; right: 15px; z-index: 10; background: rgba(0,0,0,0.6); color: #fff; border: none; width: 35px; height: 35px; border-radius: 50%; cursor: pointer; font-size: 20px; }
    .modal-nav-footer { display: flex; gap: 10px; padding: 20px; background: #fff; border-top: 1px solid #eee; align-items: center; }
    .btn-nav { flex: 1; padding: 12px; border: 1px solid #eee; background: #f9f9f9; border-radius: 8px; font-weight: 700; cursor: pointer; font-size: 11px; text-transform: uppercase; transition: 0.2s; }
    .btn-nav:hover { background: #eee; }
</style>
`;

document.body.insertAdjacentHTML('beforeend', estruturaHTML);

// Função para preencher os dados visualmente
const preencherModal = (noticia) => {
    const cor = noticia.cor || "#ff0000";
    const modal = document.getElementById('modal-noticia-global');
    modal.style.setProperty('--tema-cor', cor);

    document.getElementById('m-categoria').innerText = noticia.categoria || "GEEK";
    document.getElementById('m-titulo').innerText = noticia.titulo;
    document.getElementById('m-resumo').innerText = noticia.resumo || "";
    document.getElementById('m-link').href = noticia.linkArtigo || "#";

    // Vídeo Embed
    let vUrl = noticia.videoPrincipal || "";
    if(vUrl.includes("watch?v=")) vUrl = vUrl.replace("watch?v=", "embed/") + "?autoplay=1&mute=1";
    document.getElementById('m-video').src = vUrl;

    // Ficha Técnica (Layout Grid)
    const fichaContainer = document.getElementById('m-ficha');
    if (noticia.ficha && noticia.ficha.length > 0) {
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
};

// Abre o modal e busca a coleção no Firebase para permitir navegação
window.abrirModalNoticia = async (noticiaOriginal) => {
    preencherModal(noticiaOriginal);
    document.getElementById('modal-noticia-global').style.display = 'block';
    document.body.style.overflow = 'hidden';

    // Busca outras notícias da mesma categoria para a "Playlist"
    try {
        const q = query(
            collection(db, "noticias"), 
            where("categoria", "==", noticiaOriginal.categoria), 
            limit(10)
        );
        const querySnapshot = await getDocs(q);
        playlistNoticias = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Encontra a posição da notícia atual na lista
        indiceAtual = playlistNoticias.findIndex(n => n.titulo === noticiaOriginal.titulo);
    } catch (e) {
        console.error("Erro ao carregar playlist:", e);
    }
};

window.navegarNoticia = (direcao) => {
    let novoIndice = indiceAtual + direcao;
    if (novoIndice >= 0 && novoIndice < playlistNoticias.length) {
        indiceAtual = novoIndice;
        preencherModal(playlistNoticias[indiceAtual]);
    }
};

window.fecharModalGlobal = () => {
    document.getElementById('modal-noticia-global').style.display = 'none';
    document.getElementById('m-video').src = "";
    document.body.style.overflow = 'auto';
};

window.onclick = (e) => {
    const modal = document.getElementById('modal-noticia-global');
    if (e.target == modal) window.fecharModalGlobal();
};
