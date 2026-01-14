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

// --- UNIFICAÇÃO GLOBAL PARA A BUsCA ---
// Lista única que centraliza todos os documentos do site
window.noticiasFirebase = [];

/**
 * Sincronização inteligente multisseção
 * @param {string} nomeColecao - Nome da coleção no Firestore
 */
function sincronizarComBusca(nomeColecao) {
    try {
        onSnapshot(collection(db, nomeColecao), (snapshot) => {
            // 1. Limpa os dados antigos apenas desta coleção específica no array global
            window.noticiasFirebase = window.noticiasFirebase.filter(item => item.origem !== nomeColecao);
            
            // 2. Mapeia e injeta os novos dados, marcando a origem para a busca
            const novosDados = snapshot.docs.map(doc => ({ 
                id: doc.id, 
                origem: nomeColecao, 
                ...doc.data() 
            }));
            
            window.noticiasFirebase.push(...novosDados);
            
            // 3. Ordena globalmente por data (se o campo 'timestamp' ou 'data' existir)
            window.noticiasFirebase.sort((a, b) => (b.data || 0) - (a.data || 0));
            
            console.log(`✅ [Firebase] Coleção sincronizada: ${nomeColecao} | Itens: ${snapshot.size}`);
        }, (error) => {
            console.error(`❌ Erro ao sincronizar ${nomeColecao}:`, error);
        });
    } catch (err) {
        console.error(`⚠️ Falha ao inicializar coleção ${nomeColecao}:`, err);
    }
}

// Expõe ferramentas essenciais para os scripts de cada seção (.html)
window.db = db;
window.collection = collection;
window.onSnapshot = onSnapshot;

/**
 * --- INICIALIZAÇÃO UNIVERSAL ---
 * Adicione aqui qualquer nova coleção criada no Firebase para que a busca a encontre.
 */
const colecoesParaMonitorar = ["noticias", "lancamentos", "analises", "entrevistas", "podcast"];

colecoesParaMonitorar.forEach(nome => sincronizarComBusca(nome));

console.log("🔥 Motor AniGeekNews v2: Sincronização global ativada.");
