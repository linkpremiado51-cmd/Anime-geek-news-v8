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

// --- CACHE DE DADOS ---
// Tenta carregar do LocalStorage para início imediato, ou começa vazio
const cacheSalvo = localStorage.getItem('cache_noticias_global');
window.noticiasFirebase = cacheSalvo ? JSON.parse(cacheSalvo) : [];

/**
 * Verifica se há um ID na URL e abre o modal
 */
function verificarGatilhoDeLink() {
    const urlParams = new URLSearchParams(window.location.search);
    const idDesejado = urlParams.get('id');

    if (idDesejado && window.noticiasFirebase.length > 0) {
        const noticiaEncontrada = window.noticiasFirebase.find(n => n.id === idDesejado);
        
        if (noticiaEncontrada && typeof window.abrirModalNoticia === 'function') {
            window.abrirModalNoticia(noticiaEncontrada);
        }
    }
}

/**
 * Sincronização inteligente com cache
 */
function sincronizarComBusca(nomeColecao) {
    try {
        onSnapshot(collection(db, nomeColecao), (snapshot) => {
            // Se o snapshot veio do cache do Firebase e já temos dados, ignoramos para poupar CPU
            if (snapshot.metadata.fromCache && window.noticiasFirebase.length > 0) return;

            // 1. Filtramos o array global removendo apenas os itens da coleção que está chegando
            const listaFiltrada = window.noticiasFirebase.filter(item => item.origem !== nomeColecao);
            
            // 2. Mapeamos os novos dados
            const novosDados = snapshot.docs.map(doc => ({ 
                id: doc.id, 
                origem: nomeColecao, 
                ...doc.data() 
            }));
            
            // 3. Atualizamos o array global
            window.noticiasFirebase = [...listaFiltrada, ...novosDados];
            
            // 4. Ordenação global (apenas se houver campo de data)
            window.noticiasFirebase.sort((a, b) => (b.data || 0) - (a.data || 0));

            // 5. SALVAR NO CACHE: Guarda os dados estruturados no navegador do usuário
            localStorage.setItem('cache_noticias_global', JSON.stringify(window.noticiasFirebase));
            
            console.log(`✅ [Firebase Cache] ${nomeColecao} atualizado.`);

            // 6. Notifica o sistema de busca ou seções se necessário
            if (typeof window.renderizarNoticias === 'function') {
                // Se a seção atual tiver uma função de renderização, chamamos para atualizar a tela
                // Mas apenas se os dados forem dessa coleção ou se for a primeira carga
                window.renderizarNoticias(window.noticiasFirebase.filter(n => n.origem === nomeColecao));
            }

            verificarGatilhoDeLink();

        }, (error) => {
            console.error(`❌ Erro Firebase ${nomeColecao}:`, error);
        });
    } catch (err) {
        console.error(`⚠️ Falha ao inicializar ${nomeColecao}:`, err);
    }
}

// Expõe ferramentas
window.db = db;
window.collection = collection;
window.onSnapshot = onSnapshot;

// Inicializa o monitoramento
const colecoesParaMonitorar = ["noticias", "lancamentos", "analises", "entrevistas", "podcast"];
colecoesParaMonitorar.forEach(nome => sincronizarComBusca(nome));

// Executa gatilho inicial caso o cache já contenha a notícia da URL
if (window.noticiasFirebase.length > 0) {
    verificarGatilhoDeLink();
}

console.log("🔥 Motor AniGeekNews v2: Cache de dados ativado.");
