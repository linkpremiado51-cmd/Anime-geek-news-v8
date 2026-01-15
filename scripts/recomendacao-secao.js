/**
 * AniGeekNews – Enterprise Section Manager
 * * @version 2.0.0
 * @description Sistema inteligente de gerenciamento de seções com UI executiva.
 * @features Persistência segura, UI reativa, Controle de limites, Busca em tempo real.
 */

(function () {
    'use strict';

    // Configurações do Sistema
    const CONFIG = {
        maxSections: 12,
        storageKey: 'agn_enterprise_sections_v2',
        dom: {
            containerId: 'filterScroller',
            modalId: 'agn-enterprise-modal'
        }
    };

    // Dados Mestre (Base de Dados)
    const MASTER_DATA = [
        { id: 'manchetes', nome: 'Manchetes', category: 'Geral' },
        { id: 'analises', nome: 'Análises', category: 'Editorial' },
        { id: 'entrevistas', nome: 'Entrevistas', category: 'Editorial' },
        { id: 'lancamentos', nome: 'Lançamentos', category: 'Novidades' },
        { id: 'podcast', nome: 'Podcast', category: 'Mídia' },
        { id: 'futebol', nome: 'Futebol', category: 'Esportes' },
        { id: 'tecnologia', nome: 'Tecnologia', category: 'Tech' },
        { id: 'reviews', nome: 'Reviews', category: 'Editorial' },
        { id: 'trailers', nome: 'Trailers', category: 'Mídia' },
        { id: 'streaming', nome: 'Streaming', category: 'Serviços' },
        { id: 'cosplay', nome: 'Cosplay', category: 'Comunidade' },
        { id: 'eventos', nome: 'Eventos', category: 'Comunidade' },
        { id: 'esports', nome: 'eSports', category: 'Esportes' },
        { id: 'cinema', nome: 'Cinema', category: 'Entretenimento' },
        { id: 'tv', nome: 'TV & Séries', category: 'Entretenimento' },
        { id: 'comunidade', nome: 'Comunidade', category: 'Social' },
        { id: 'ranking', nome: 'Ranking', category: 'Dados' }
    ];

    /**
     * Injeta estilos CSS modernos dinamicamente
     */
    function injectStyles() {
        const styleId = 'agn-enterprise-styles';
        if (document.getElementById(styleId)) return;

        const css = `
            :root {
                --agn-primary: #2563eb;
                --agn-primary-dark: #1e40af;
                --agn-bg: #f8fafc;
                --agn-surface: #ffffff;
                --agn-text: #1e293b;
                --agn-text-muted: #64748b;
                --agn-border: #e2e8f0;
                --agn-radius: 8px;
                --agn-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            }

            /* --- Barra de Filtros --- */
            #filterScroller {
                display: flex;
                gap: 8px;
                overflow-x: auto;
                padding: 12px 0;
                scrollbar-width: none; /* Firefox */
                -ms-overflow-style: none; /* IE */
                align-items: center;
            }
            #filterScroller::-webkit-scrollbar { display: none; }
            
            .agn-tag {
                background: var(--agn-surface);
                border: 1px solid var(--agn-border);
                color: var(--agn-text-muted);
                padding: 8px 16px;
                border-radius: 50px;
                font-size: 14px;
                font-weight: 500;
                white-space: nowrap;
                cursor: pointer;
                transition: all 0.2s ease;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            }
            .agn-tag:hover { border-color: var(--agn-primary); color: var(--agn-primary); }
            .agn-tag.active {
                background: var(--agn-primary);
                color: white;
                border-color: var(--agn-primary);
                box-shadow: 0 2px 4px rgba(37, 99, 235, 0.3);
            }
            .agn-config-btn {
                width: 36px; height: 36px;
                border-radius: 50%;
                display: flex; align-items: center; justify-content: center;
                border: 1px dashed var(--agn-border);
                color: var(--agn-text-muted);
                flex-shrink: 0;
                background: transparent;
                cursor: pointer;
            }
            .agn-config-btn:hover { background: var(--agn-border); color: var(--agn-text); }

            /* --- Modal Executivo --- */
            .agn-modal-overlay {
                position: fixed; inset: 0;
                background: rgba(15, 23, 42, 0.6);
                backdrop-filter: blur(4px);
                z-index: 9999;
                display: flex; align-items: center; justify-content: center;
                opacity: 0; animation: agnFadeIn 0.2s forwards;
            }
            
            .agn-modal-card {
                background: var(--agn-surface);
                width: 100%; max-width: 500px;
                max-height: 85vh;
                border-radius: 12px;
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
                display: flex; flex-direction: column;
                overflow: hidden;
                transform: scale(0.95); animation: agnScaleUp 0.2s forwards;
                font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            }

            .agn-modal-header {
                padding: 20px;
                border-bottom: 1px solid var(--agn-border);
                display: flex; justify-content: space-between; align-items: center;
            }
            .agn-modal-title { font-size: 18px; font-weight: 700; color: var(--agn-text); margin: 0; }
            .agn-limit-badge { font-size: 12px; padding: 4px 8px; background: var(--agn-bg); border-radius: 4px; color: var(--agn-text-muted); }
            .agn-limit-badge.full { color: #dc2626; background: #fef2f2; }

            .agn-search-wrap { padding: 16px 20px 0; }
            .agn-input {
                width: 100%; padding: 12px;
                border: 1px solid var(--agn-border);
                border-radius: 8px;
                font-size: 14px;
                outline: none;
                transition: border 0.2s;
                box-sizing: border-box; 
            }
            .agn-input:focus { border-color: var(--agn-primary); box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1); }

            .agn-list {
                flex: 1; overflow-y: auto;
                padding: 10px 20px;
            }
            .agn-list-item {
                display: flex; justify-content: space-between; align-items: center;
                padding: 12px 0;
                border-bottom: 1px solid var(--agn-bg);
            }
            .agn-item-label { font-size: 15px; font-weight: 500; color: var(--agn-text); }
            .agn-item-cat { font-size: 12px; color: var(--agn-text-muted); display: block; margin-top: 2px; }

            /* Switch Toggle Style */
            .agn-switch {
                position: relative; display: inline-block; width: 44px; height: 24px;
            }
            .agn-switch input { opacity: 0; width: 0; height: 0; }
            .agn-slider {
                position: absolute; cursor: pointer; inset: 0;
                background-color: #cbd5e1;
                transition: .3s; border-radius: 34px;
            }
            .agn-slider:before {
                position: absolute; content: "";
                height: 18px; width: 18px;
                left: 3px; bottom: 3px;
                background-color: white;
                transition: .3s; border-radius: 50%;
                box-shadow: 0 1px 2px rgba(0,0,0,0.2);
            }
            input:checked + .agn-slider { background-color: var(--agn-primary); }
            input:checked + .agn-slider:before { transform: translateX(20px); }
            input:disabled + .agn-slider { opacity: 0.5; cursor: not-allowed; }

            .agn-modal-footer {
                padding: 16px 20px;
                background: var(--agn-bg);
                border-top: 1px solid var(--agn-border);
                display: flex; justify-content: flex-end; gap: 10px;
            }
            .agn-btn {
                padding: 10px 20px; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer; border: none;
            }
            .agn-btn-ghost { background: transparent; color: var(--agn-text-muted); }
            .agn-btn-ghost:hover { background: rgba(0,0,0,0.05); color: var(--agn-text); }
            .agn-btn-primary { background: var(--agn-primary); color: white; }
            .agn-btn-primary:hover { background: var(--agn-primary-dark); }

            @keyframes agnFadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes agnScaleUp { from { transform: scale(0.95); } to { transform: scale(1); } }
        `;

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = css;
        document.head.appendChild(style);
    }

    /**
     * Classe Gerenciadora (Core Logic)
     */
    class SectionManager {
        constructor() {
            this.currentOrder = [];
            this.tempOrder = []; // Usado dentro do modal antes de salvar
            this.init();
        }

        init() {
            injectStyles();
            this.loadOrder();
            
            // Aguarda o DOM estar pronto caso o script rode no head
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.renderBar());
            } else {
                this.renderBar();
            }
        }

        /**
         * Carrega e valida a ordem do LocalStorage
         */
        loadOrder() {
            try {
                const stored = localStorage.getItem(CONFIG.storageKey);
                if (stored) {
                    const parsed = JSON.parse(stored);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        this.currentOrder = parsed;
                        return;
                    }
                }
            } catch (e) {
                console.warn('AniGeek: Erro ao ler storage', e);
            }
            // Fallback padrão
            this.currentOrder = MASTER_DATA.slice(0, 7).map(s => s.id);
        }

        saveOrder(newOrder) {
            this.currentOrder = newOrder;
            localStorage.setItem(CONFIG.storageKey, JSON.stringify(newOrder));
            this.renderBar();
        }

        /**
         * Renderiza a barra horizontal principal
         */
        renderBar() {
            const wrapper = document.getElementById(CONFIG.dom.containerId);
            if (!wrapper) return;

            wrapper.innerHTML = '';
            const frag = document.createDocumentFragment();

            this.currentOrder.forEach((id, index) => {
                const section = MASTER_DATA.find(s => s.id === id);
                if (!section) return;

                const btn = document.createElement('button');
                btn.className = `agn-tag ${index === 0 ? 'active' : ''}`;
                btn.textContent = section.nome;
                btn.onclick = (e) => this.handleSectionClick(e, section.id);
                frag.appendChild(btn);
            });

            // Botão de Configuração
            const configBtn = document.createElement('button');
            configBtn.className = 'agn-config-btn';
            configBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"></path><path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"></path><path d="M12 2v2"></path><path d="M12 22v-2"></path><path d="M2 12h2"></path><path d="M22 12h-2"></path></svg>';
            configBtn.title = "Personalizar Seções";
            configBtn.onclick = () => this.openModal();
            frag.appendChild(configBtn);

            wrapper.appendChild(frag);

            // Trigger inicial
            if (this.currentOrder.length > 0) {
                this.triggerExternalLoad(this.currentOrder[0]);
            }
        }

        handleSectionClick(e, id) {
            document.querySelectorAll('.agn-tag').forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            this.triggerExternalLoad(id);
        }

        triggerExternalLoad(id) {
            // Integração segura com o sistema legado
            if (window.carregarSecao && typeof window.carregarSecao === 'function') {
                window.carregarSecao(id);
            }
        }

        /**
         * Lógica do Modal
         */
        openModal() {
            if (document.getElementById(CONFIG.dom.modalId)) return;

            // Clona o estado atual para edição temporária
            this.tempOrder = [...this.currentOrder];

            const modalOverlay = document.createElement('div');
            modalOverlay.id = CONFIG.dom.modalId;
            modalOverlay.className = 'agn-modal-overlay';
            
            modalOverlay.innerHTML = `
                <div class="agn-modal-card">
                    <div class="agn-modal-header">
                        <h3 class="agn-modal-title">Personalizar Feed</h3>
                        <span id="agn-counter" class="agn-limit-badge">
                            ${this.tempOrder.length}/${CONFIG.maxSections} Selecionados
                        </span>
                    </div>
                    <div class="agn-search-wrap">
                        <input type="text" id="agn-search" class="agn-input" placeholder="Buscar seções (ex: tecnologia, séries)...">
                    </div>
                    <div class="agn-list" id="agn-list-container"></div>
                    <div class="agn-modal-footer">
                        <button class="agn-btn agn-btn-ghost" id="agn-btn-cancel">Cancelar</button>
                        <button class="agn-btn agn-btn-primary" id="agn-btn-save">Salvar Alterações</button>
                    </div>
                </div>
            `;

            document.body.appendChild(modalOverlay);

            // Bind Events
            document.getElementById('agn-btn-cancel').onclick = () => this.closeModal();
            document.getElementById('agn-btn-save').onclick = () => {
                this.saveOrder(this.tempOrder);
                this.closeModal();
            };
            
            const searchInput = document.getElementById('agn-search');
            searchInput.oninput = (e) => this.renderModalList(e.target.value);
            
            // Focar no input
            searchInput.focus();

            this.renderModalList();
        }

        renderModalList(filterText = '') {
            const container = document.getElementById('agn-list-container');
            const counter = document.getElementById('agn-counter');
            if (!container) return;

            // Atualiza contador
            const count = this.tempOrder.length;
            counter.textContent = `${count}/${CONFIG.maxSections} Selecionados`;
            counter.classList.toggle('full', count >= CONFIG.maxSections);

            container.innerHTML = '';
            const search = filterText.toLowerCase();

            MASTER_DATA.forEach(sec => {
                if (!sec.nome.toLowerCase().includes(search) && !sec.category.toLowerCase().includes(search)) return;

                const isActive = this.tempOrder.includes(sec.id);
                const isLimitReached = count >= CONFIG.maxSections;
                const isDisabled = !isActive && isLimitReached;

                const row = document.createElement('div');
                row.className = 'agn-list-item';
                
                // Toggle Switch HTML
                const switchHtml = `
                    <label class="agn-switch">
                        <input type="checkbox" 
                            ${isActive ? 'checked' : ''} 
                            ${isDisabled ? 'disabled' : ''}>
                        <span class="agn-slider"></span>
                    </label>
                `;

                row.innerHTML = `
                    <div>
                        <div class="agn-item-label" style="opacity: ${isDisabled ? 0.5 : 1}">${sec.nome}</div>
                        <span class="agn-item-cat">${sec.category}</span>
                    </div>
                    ${switchHtml}
                `;

                // Evento do Toggle
                const checkbox = row.querySelector('input');
                checkbox.onchange = () => {
                    if (checkbox.checked) {
                        if (this.tempOrder.length < CONFIG.maxSections) {
                            this.tempOrder.push(sec.id);
                        }
                    } else {
                        this.tempOrder = this.tempOrder.filter(id => id !== sec.id);
                    }
                    this.renderModalList(filterText); // Re-render para atualizar estados disabled
                };

                container.appendChild(row);
            });
        }

        closeModal() {
            const el = document.getElementById(CONFIG.dom.modalId);
            if (el) el.remove();
        }
    }

    // Inicialização
    new SectionManager();

})();
