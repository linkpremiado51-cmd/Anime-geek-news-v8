import { getFirestore, doc, getDoc, collection, query, limit, getDocs, where } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const db = getFirestore();
let noticiasDaSessao = []; // Array para armazenar a "playlist" de notícias
let indiceAtual = 0;

const estruturaHTML = `
<div id="modal-noticia-global">
    <div class="modal-content">
        <div class="video-header">
            <iframe id="m-video" src="" allow="autoplay"></iframe>
        </div>
        <div class="modal-body">
            <div id="m-categoria"></div>
            <h2 id="m-titulo"></h2>
            <div id="m-ficha"></div>
            <p id="m-resumo"></p>
        </div>
        <div class="modal-nav-footer">
            <button class="btn-nav" onclick="window.navegarNoticia(-1)">Anterior</button>
            <a id="m-link" target="_blank" class="btn-ver-artigo-modal">LER TUDO</a>
            <button class="btn-nav" onclick="window.navegarNoticia(1)">Próxima</button>
        </div>
        <button onclick="window.fecharModalGlobal()" style="position:absolute; top:10px; right:10px; background:rgba(0,0,0,0.5); color:#fff; border:none; border-radius:50%; width:30px; height:30px;">×</button>
    </div>
</div>`;

document.body.insertAdjacentHTML('beforeend', estruturaHTML);

// Função para renderizar os dados no Modal
const renderizarDados = (noticia) => {
    const cor = noticia.cor || "#ff0000";
    const modal = document.getElementById('modal-noticia-global');
    modal.style.setProperty('--tema-cor', cor);

    document.getElementById('m-categoria').innerText = noticia.categoria || "GEEK";
    document.getElementById('m-titulo').innerText = noticia.titulo;
    document.getElementById('m-resumo').innerText = noticia.resumo || "";
    document.getElementById('m-link').href = noticia.linkArtigo || "#";

    let vUrl = noticia.videoPrincipal || "";
    if(vUrl.includes("watch?v=")) vUrl = vUrl.replace("watch?v=", "embed/") + "?autoplay=1&mute=1";
    document.getElementById('m-video').src = vUrl;

    const fichaContainer = document.getElementById('m-ficha');
    fichaContainer.innerHTML = (noticia.ficha || []).map(item => `
        <div class="info-item">
            <span class="info-label">${item.label}</span>
            <span class="info-valor">${item.valor}</span>
        </div>
    `).join('');
};

// Função principal disparada pela busca
window.abrirModalNoticia = async (idNoticia, nomeColecao = "noticias") => {
    // 1. Busca a notícia específica no Firebase
    const docRef = doc(db, nomeColecao, idNoticia);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        renderizarDados(data);
        
        // 2. Opcional: Busca as próximas 5 notícias da mesma categoria para a "playlist"
        const q = query(collection(db, nomeColecao), where("categoria", "==", data.categoria), limit(6));
        const querySnapshot = await getDocs(q);
        noticiasDaSessao = querySnapshot.docs.map(d => d.data());
        indiceAtual = noticiasDaSessao.findIndex(n => n.titulo === data.titulo);

        document.getElementById('modal-noticia-global').style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
};

// Navegação interna do Modal
window.navegarNoticia = (direcao) => {
    let novoIndice = indiceAtual + direcao;
    if (novoIndice >= 0 && novoIndice < noticiasDaSessao.length) {
        indiceAtual = novoIndice;
        renderizarDados(noticiasDaSessao[indiceAtual]);
    }
};

window.fecharModalGlobal = () => {
    document.getElementById('modal-noticia-global').style.display = 'none';
    document.getElementById('m-video').src = "";
    document.body.style.overflow = 'auto';
};
