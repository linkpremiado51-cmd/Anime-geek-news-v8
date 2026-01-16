// global-error-handler.js
(function() {
    const padroesErro = [
        /NOT_FOUND gru1::/i,
        /404/i,
        /erro/i
    ];

    const modulos = {};
    const errosDetectados = [];

    // ========================
    // Criar painel toggle
    // ========================
    const painel = document.createElement('div');
    painel.id = 'painel-global-erros';
    painel.style.cssText = `
        position:fixed; bottom:10px; right:10px;
        width:350px; max-height:400px; overflow-y:auto;
        background-color:rgba(0,0,0,0.85); color:#fff;
        font-size:12px; font-family:monospace; padding:10px;
        border-radius:8px; z-index:999999; box-shadow:0 0 10px rgba(0,0,0,0.5);
        cursor:pointer; display:none;
    `;
    painel.title = 'Clique para mostrar/esconder painel de erros';
    document.body.appendChild(painel);

    let painelVisivel = true;
    painel.addEventListener('click', () => {
        painelVisivel = !painelVisivel;
        painel.style.display = painelVisivel ? 'block' : 'none';
    });

    // ========================
    // Atualizar painel
    // ========================
    function atualizarPainel() {
        let html = '<b>Módulos Registrados:</b><br>';
        for (let id in modulos) html += `- [${id}] ${modulos[id]}<br>`;
        html += '<hr><b>Erros Detectados:</b><br>';
        if (!errosDetectados.length) html += 'Nenhum erro detectado';
        else errosDetectados.slice(-20).forEach(e => {
            const data = new Date(e.timestamp).toLocaleTimeString();
            html += `<div style="margin-bottom:6px;">
                        <b>${e.modulo}</b> [${e.tipo}] ${data}: ${e.texto.slice(0,100)}...
                     </div>`;
        });
        painel.innerHTML = html;
        painel.style.display = 'block';
    }

    // ========================
    // Registro de módulos
    // ========================
    window.registerModule = function(id, nome) {
        modulos[id] = nome || id;
        atualizarPainel();
        console.log(`Módulo registrado: [${id}] ${nome || ''}`);
    };

    // ========================
    // Captura erros JS e Promises rejeitadas
    // ========================
    window.addEventListener('error', function(event) {
        try {
            const modulo = event.filename || 'desconhecido';
            errosDetectados.push({
                texto: event.message,
                modulo,
                timestamp: Date.now(),
                tipo: 'JS Error'
            });
            atualizarPainel();
        } catch (e) { console.warn(e); }
    });

    window.addEventListener('unhandledrejection', function(event) {
        try {
            const modulo = 'Promise Rejection';
            errosDetectados.push({
                texto: event.reason?.message || String(event.reason),
                modulo,
                timestamp: Date.now(),
                tipo: 'Promise Rejection'
            });
            atualizarPainel();
        } catch (e) { console.warn(e); }
    });

    // ========================
    // Observer DOM
    // ========================
    function verificarElemento(el) {
        if (!el || !el.innerText) return;
        padroesErro.forEach(padrao => {
            if (padrao.test(el.innerText)) {
                const modulo = el.dataset.modulo || 'desconhecido';
                errosDetectados.push({
                    texto: el.innerText,
                    modulo,
                    timestamp: Date.now(),
                    tipo: 'DOM'
                });
                atualizarPainel();
            }
        });
    }

    function varrerDOMAsync() {
        const elementos = document.body.getElementsByTagName('*');
        let i = 0;
        function processarBloco() {
            const bloco = 50;
            for (let j = 0; j < bloco && i < elementos.length; j++, i++) {
                verificarElemento(elementos[i]);
            }
            if (i < elementos.length) requestIdleCallback(processarBloco);
        }
        requestIdleCallback(processarBloco);
    }

    // ========================
    // Início imediato
    // ========================
    varrerDOMAsync(); // varrer o DOM mesmo antes do DOMContentLoaded

    const observer = new MutationObserver(mutations => {
        for (let mutation of mutations) {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1) {
                    verificarElemento(node);
                    node.querySelectorAll('*').forEach(verificarElemento);
                }
            });
        }
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });

    console.log('Global Error Handler ativo desde o início, painel toggle criado.');
})();
