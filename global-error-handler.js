// global-error-handler.js
(function() {
    // ========================
    // Configurações iniciais
    // ========================
    const padroesErro = [
        /NOT_FOUND gru1::/i,
        /404/i,
        /erro/i
    ];

    const modulos = {}; // módulos registrados
    const errosDetectados = []; // histórico de erros

    // ========================
    // Registro de módulos
    // ========================
    window.registerModule = function(id, nome) {
        modulos[id] = nome || id;
        atualizarPainel(); // atualiza painel assim que registra
        console.log(`Módulo registrado: [${id}] ${nome || ''}`);
    };

    // ========================
    // Função para verificar e esconder elementos de erro
    // ========================
    function verificarElemento(el) {
        if (!el || !el.innerText) return;

        for (let padrao of padroesErro) {
            if (padrao.test(el.innerText)) {
                el.style.display = 'none'; // esconde
                console.warn('Erro escondido detectado em elemento:', el);

                // tenta associar a um módulo pelo ID do elemento
                let moduloAssociado = el.dataset.modulo || 'desconhecido';

                errosDetectados.push({
                    texto: el.innerText,
                    elemento: el,
                    modulo: moduloAssociado,
                    timestamp: Date.now()
                });

                atualizarPainel();
                break;
            }
        }
    }

    function varrerDOM() {
        const todosElementos = document.body.getElementsByTagName('*');
        for (let el of todosElementos) verificarElemento(el);
    }

    // ========================
    // Observer para DOM
    // ========================
    const observer = new MutationObserver((mutations) => {
        for (let mutation of mutations) {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1) {
                    verificarElemento(node);
                    node.querySelectorAll('*').forEach(verificarElemento);
                }
            });
        }
    });

    // ========================
    // Painel visual
    // ========================
    const painel = document.createElement('div');
    painel.id = 'painel-global-erros';
    painel.style.position = 'fixed';
    painel.style.bottom = '10px';
    painel.style.right = '10px';
    painel.style.width = '300px';
    painel.style.maxHeight = '400px';
    painel.style.overflowY = 'auto';
    painel.style.backgroundColor = 'rgba(0,0,0,0.85)';
    painel.style.color = '#fff';
    painel.style.fontSize = '12px';
    painel.style.fontFamily = 'monospace';
    painel.style.padding = '10px';
    painel.style.borderRadius = '8px';
    painel.style.zIndex = '999999';
    painel.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
    painel.style.display = 'none'; // começa escondido
    painel.style.cursor = 'pointer';
    painel.title = 'Clique para alternar visibilidade';
    document.body.appendChild(painel);

    painel.addEventListener('click', () => {
        painel.style.height = painel.style.height === 'auto' ? '400px' : 'auto';
    });

    function atualizarPainel() {
        if (!painel) return;

        let html = '<b>Módulos Registrados:</b><br>';
        for (let id in modulos) {
            html += `- [${id}] ${modulos[id]}<br>`;
        }

        html += '<hr><b>Erros Detectados:</b><br>';
        if (errosDetectados.length === 0) {
            html += 'Nenhum erro detectado';
        } else {
            errosDetectados.slice(-20).forEach(e => {
                html += `<div style="margin-bottom:4px;"><b>${e.modulo}</b>: ${e.texto.slice(0, 50)}...</div>`;
            });
        }

        painel.innerHTML = html;
        painel.style.display = 'block';
    }

    // ========================
    // Inicialização
    // ========================
    document.addEventListener('DOMContentLoaded', () => {
        varrerDOM();
        observer.observe(document.body, { childList: true, subtree: true });
        console.log('Global Error Handler com painel iniciado.');
    });

    setTimeout(() => observer.disconnect(), 15000);

})();
