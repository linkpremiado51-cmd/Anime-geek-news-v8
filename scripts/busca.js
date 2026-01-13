/* scripts/busca.js */

// Referência aos elementos de busca
const inputBusca = document.getElementById('search-input');
const displayPrincipalBusca = document.getElementById('conteudo_de_destaque');

/**
 * Realiza a busca no Firebase baseada no termo digitado
 * @param {string} termo - O texto para pesquisa
 */
async function realizarBusca(termo) {
    if (!termo || termo.length < 2) {
        // Se apagar a busca, volta para as manchetes
        window.carregarSecao('manchetes');
        return;
    }

    displayPrincipalBusca.innerHTML = '<div style="text-align: center; padding: 100px; color: var(--text-muted);">Pesquisando no arquivo...</div>';

    try {
        // Nota: No Firebase real, usaríamos query() e where() 
        // Aqui simulamos a filtragem da coleção 'artigos'
        const artigosRef = window.db.collection("artigos");
        const snapshot = await artigosRef.where("titulo", ">=", termo).where("titulo", "<=", termo + "\uf8ff").get();

        if (snapshot.empty) {
            displayPrincipalBusca.innerHTML = `
                <div style="text-align: center; padding: 100px; color: var(--text-muted);">
                    Nenhum resultado encontrado para "${termo}".
                </div>`;
            return;
        }

        let resultadosHTML = `<h2 style="margin-bottom: 20px;">Resultados para: ${termo}</h2><div class="news-grid">`;

        snapshot.forEach(doc => {
            const dados = doc.data();
            resultadosHTML += `
                <article class="news-card">
                    <img src="${dados.imagem || 'https://via.placeholder.com/400x250'}" alt="Capa">
                    <div class="news-content">
                        <span class="category-tag">${dados.categoria || 'Geral'}</span>
                        <h3>${dados.titulo}</h3>
                        <p>${dados.resumo || ''}</p>
                    </div>
                </article>
            `;
        });

        resultadosHTML += `</div>`;
        displayPrincipalBusca.innerHTML = resultadosHTML;

    } catch (error) {
        console.error("Erro na busca:", error);
        displayPrincipalBusca.innerHTML = "Erro ao processar pesquisa.";
    }
}

// Evento para detectar quando o usuário digita (Debounce)
let timeoutBusca;
if (inputBusca) {
    inputBusca.addEventListener('input', (e) => {
        clearTimeout(timeoutBusca);
        const valor = e.target.value.trim();
        
        // Aguarda 500ms após o usuário parar de digitar para não sobrecarregar o Firebase
        timeoutBusca = setTimeout(() => {
            realizarBusca(valor);
        }, 500);
    });
}
