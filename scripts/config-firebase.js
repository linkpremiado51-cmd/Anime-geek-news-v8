/* scripts/config-firebase.js */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBC_ad4X9OwCHKvcG_pNQkKEl76Zw2tu6o",
    authDomain: "anigeeknews.firebaseapp.com",
    projectId: "anigeeknews",
    storageBucket: "anigeeknews.firebasestorage.app",
    messagingSenderId: "769322939926",
    appId: "1:769322939926:web:6eb91a96a3f74670882737",
    measurementId: "G-G5T8CCRGZT"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

window.noticiasFirebase = [];
let linkProcessado = false;

/**
 * Normaliza os dados extraindo a imagem (thumb) e formatando o vídeo.
 */
function normalizarNoticia(doc, nomeColecao) {
    const data = doc.data();
    
    // 1. Lógica de extração da Imagem (Thumb)
    // Prioridade: Raiz > Primeiro item de Relacionados > Fallback
    const imagemExtraida = data.thumb || 
                          (data.relacionados && data.relacionados.length > 0 ? data.relacionados[0].thumb : null) || 
                          'https://anigeeknews.com/default-og.jpg';

    // 2. Lógica de formatação do Vídeo Principal
    let videoUrl = data.videoPrincipal || "";
    if (videoUrl.includes("watch?v=")) {
        videoUrl = videoUrl.replace("watch?v=", "embed/") + "?autoplay=1&mute=1&modestbranding=1";
    } else if (videoUrl.includes("youtu.be/")) {
        videoUrl = videoUrl.replace("youtu.be/", "youtube.com/embed/") + "?autoplay=1&mute=1&modestbranding=1";
    }

    return {
        id: doc.id,
        origem: nomeColecao,
        ...data,
        thumb: imagemExtraida,
        videoPrincipal: videoUrl
    };
}

window.verificarGatilhoDeLink = function() {
    const urlParams = new URLSearchParams(window.location.search);
    const idDesejado = urlParams.get('id');

    if (idDesejado && window.noticiasFirebase.length > 0) {
        const noticiaEncontrada = window.noticiasFirebase.find(n => n.id === idDesejado);
        
        if (noticiaEncontrada && typeof window.abrirModalNoticia === 'function') {
            window.abrirModalNoticia(noticiaEncontrada);
            linkProcessado = true; 
        }
    }
};

function sincronizarComBusca(nomeColecao) {
    onSnapshot(collection(db, nomeColecao), (snapshot) => {
        // Remove dados antigos daquela coleção específica para evitar duplicatas
        window.noticiasFirebase = window.noticiasFirebase.filter(item => item.origem !== nomeColecao);
        
        // Mapeia e normaliza os novos dados
        const novosDados = snapshot.docs.map(doc => normalizarNoticia(doc, nomeColecao));
        
        window.noticiasFirebase.push(...novosDados);
        
        // Reordena por data
        window.noticiasFirebase.sort((a, b) => (b.data || 0) - (a.data || 0));

        if (!linkProcessado) window.verificarGatilhoDeLink();
        
    }, (error) => console.error(`Erro ao sincronizar ${nomeColecao}:`, error));
}

const colecoesParaMonitorar = ["noticias", "lancamentos", "analises", "entrevistas", "podcast", "futebol"];
colecoesParaMonitorar.forEach(nome => sincronizarComBusca(nome));

window.addEventListener('popstate', window.verificarGatilhoDeLink);

console.log("🔥 Firebase Config: Sincronização inteligente com suporte a sub-propriedades ativado.");
