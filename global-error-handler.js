// global-error-handler.js
(function() {
    const modulos = {};
    const errosDetectados = [];

    // ========================
    // Registro de módulos
    // ========================
    window.registerModule = function(id, nome) {
        modulos[id] = nome || id;
        console.log(`Módulo registrado: [${id}] ${nome || ''}`);
    };

    // ========================
    // Captura de erros globais
    // ========================
    window.addEventListener('error', event => {
        try {
            errosDetectados.push({
                texto: event.message,
                modulo: event.filename || 'desconhecido',
                tipo: 'JS Error',
                timestamp: Date.now()
            });
        } catch(e) { console.warn(e); }
    });

    window.addEventListener('unhandledrejection', event => {
        try {
            errosDetectados.push({
                texto: event.reason?.message || String(event.reason),
                modulo: 'Promise Rejection',
                tipo: 'Promise Rejection',
                timestamp: Date.now()
            });
        } catch(e) { console.warn(e); }
    });

    // ========================
    // Painel de erros pós-carregamento
    // ========================
    function criarPainel() {
        const painel = document.createElement('div');
        painel.id = 'painel-global-erros';
        painel.style.cssText = `
            position:fixed; bottom:10px; right:10px;
            width:400px; max-height:500px; overflow-y:auto;
            background-color:rgba(0,0,0,0.9); color:#fff;
            font-size:12px; font-family:monospace; padding:10px;
            border-radius:8px; z-index:999999; box-shadow:0 0 10px rgba(0,0,0,0.5);
            cursor:pointer;
        `;
        painel.title = 'Clique para mostrar/esconder painel de erros';
        document.body.appendChild(painel);

        let visivel = true;
        painel.addEventListener('click', () => {
            visivel = !visivel;
            painel.style.display = visivel ? 'block' : 'none';
        });

        atualizarPainel(painel);
    }

    // ========================
    // Atualiza o painel com erros
    // ========================
    function atualizarPainel(painel) {
        if (!painel) return;
        let html = '<b>Módulos Registrados:</b><br>';
        for (let id in modulos) html += `- [${id}] ${modulos[id]}<br>`;
        html += '<hr><b>Erros Detectados:</b><br>';
        if (!errosDetectados.length) html += 'Nenhum erro detectado';
        else errosDetectados.slice(-50).forEach(e => {
            const tempo = new Date(e.timestamp).toLocaleTimeString();
            html += `<div style="margin-bottom:5px;">
                        <b>${e.modulo}</b> [${e.tipo}] (${tempo}): ${e.texto.slice(0,200)}
                     </div>`;
        });
        painel.innerHTML = html;
    }

    // ========================
    // Inicialização após página 100% carregada
    // ========================
    window.addEventListener('load', () => {
        criarPainel();
        console.log('Global Error Handler ativo: site carregou 100%, erros capturados até agora.');
    });

})();
