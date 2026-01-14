(function() {
    // === 1. GESTÃO DE ESTADO E MONITORAMENTO ===
    let isTabActive = true;
    document.addEventListener("visibilitychange", () => isTabActive = !document.hidden);

    // === 2. CONTAINER MESTRE (ROOT) ===
    const adsRoot = document.createElement('div');
    adsRoot.id = 'industrial-ads-system';
    document.body.appendChild(adsRoot);

    // === 3. ESTILIZAÇÃO INDUSTRIAL DARK (ZERO ROUND / FULL BLACK) ===
    const style = document.createElement('style');
    style.textContent = `
        #industrial-ads-system {
            font-family: 'Helvetica', 'Arial', sans-serif;
            pointer-events: none;
            -webkit-font-smoothing: antialiased;
        }

        #industrial-ads-system * { pointer-events: auto; box-sizing: border-box; }

        /* Shimmer Dark Mode */
        .ind-shimmer {
            background: #111 linear-gradient(90deg, #111 0%, #222 50%, #111 100%);
            background-size: 200% 100%;
            animation: ind-shimmer-anim 1.5s infinite linear;
        }
        @keyframes ind-shimmer-anim { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

        /* Estruturas Principais - FULL WIDTH & BLACK BORDERS */
        .ind-banner {
            position: fixed; left: 0; width: 100%;
            z-index: 2147483646; background: #ffffff;
            border-top: 3px solid #000; border-bottom: 3px solid #000;
            box-shadow: 0 0 30px rgba(0,0,0,0.2);
            transition: all 0.7s cubic-bezier(0.19, 1, 0.22, 1);
        }
        .ind-bottom { bottom: -600px; padding-bottom: 10px; }
        .ind-top { top: -600px; }

        .ind-container { width: 100%; max-width: 1200px; margin: 0 auto; padding: 15px; }

        /* Cabeçalhos e Labels */
        .ind-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
        .ind-label { font-size: 11px; font-weight: 900; color: #000; text-transform: uppercase; letter-spacing: 2.5px; }
        
        /* BOTÃO DE FECHAR PADRONIZADO (OUSADO) */
        .ind-close-btn { 
            font-size: 11px; font-weight: 900; background: #000; color: #fff; 
            border: none; padding: 6px 18px; cursor: pointer; text-transform: uppercase;
            transition: background 0.2s;
        }
        .ind-close-btn:hover { background: #333; }

        /* SLOT CLICKADILLA 300x250 (INFERIOR) */
        .ind-slot-300x250 { 
            width: 300px; height: 250px; margin: 0 auto; 
            border: 1px solid #ddd; display: block;
        }
        
        /* SLOT BANNER TOP */
        .ind-slot-top { width: 100%; height: 90px; border: 1px solid #eee; }

        /* Bloco 2 - Interstitial Industrial Full */
        .ind-overlay {
            position: fixed; inset: 0; background: rgba(0, 0, 0, 0.9);
            backdrop-filter: grayscale(100%); z-index: 2147483647;
            display: none; align-items: center; justify-content: center;
            opacity: 0; transition: opacity 0.4s ease;
        }
        .ind-modal {
            background: #fff; width: 100%; max-width: 480px;
            padding: 40px; border-radius: 0; 
            border-top: 10px solid #000;
            box-shadow: 0 40px 100px rgba(0,0,0,0.8);
            transform: translateY(20px); transition: transform 0.4s ease;
        }

        .ind-slot-hero { width: 100%; height: 300px; margin-bottom: 25px; }

        /* UI de Controle Interstitial */
        .ind-btn-skip {
            background: #f0f0f0; border: 1px solid #ddd; padding: 12px 30px;
            font-size: 12px; font-weight: 800; color: #888; cursor: not-allowed;
            text-transform: uppercase; border-radius: 0;
        }
        .ind-btn-skip.ready { background: #000; color: #fff; border-color: #000; cursor: pointer; }

        .ind-progress-bg { width: 100%; height: 4px; background: #eee; border-radius: 0; margin-bottom: 20px; }
        .ind-progress-fill { width: 0%; height: 100%; background: #000; transition: width 0.1s linear; }

        .ind-footer { display: flex; justify-content: space-between; align-items: center; }
        .ind-cta {
            background: #000; color: #fff; text-decoration: none; padding: 14px 35px;
            font-size: 13px; font-weight: 800; text-transform: uppercase;
            border: 2px solid #000; transition: all 0.3s;
        }
        .ind-cta:hover { background: #fff; color: #000; }

        /* Ousadia: Animação de pulso para o banner de 300x250 */
        .pulse-ad { animation: ad-pulse 4s infinite ease-in-out; }
        @keyframes ad-pulse { 0% { opacity: 1; } 50% { opacity: 0.95; } 100% { opacity: 1; } }
    `;
    document.head.appendChild(style);

    // === 4. ESTRUTURA DOS BLOCOS (HTML) ===
    adsRoot.innerHTML = `
        <div id="ind-block-1" class="ind-banner ind-bottom">
            <div class="ind-container">
                <div class="ind-header">
                    <span class="ind-label">Oferta Patrocinada</span>
                    <button id="ind-close-1" class="ind-close-btn">Fechar</button>
                </div>
                <div class="ind-slot-300x250 ind-shimmer pulse-ad"></div>
            </div>
        </div>

        <div id="ind-block-2-overlay" class="ind-overlay">
            <div class="ind-modal">
                <div class="ind-header">
                    <span class="ind-label">Publicidade</span>
                    <button id="ind-close-2" class="ind-btn-skip" disabled>Aguarde</button>
                </div>
                <div class="ind-slot-hero ind-shimmer"></div>
                <div class="ind-progress-bg"><div id="ind-prog-2" class="ind-progress-fill"></div></div>
                <div class="ind-footer">
                    <span id="ind-timer-txt" style="font-size:11px; font-weight:900; color:#000;">AGUARDE...</span>
                    <a href="#" target="_blank" class="ind-cta">Visitar Site</a>
                </div>
            </div>
        </div>

        <div id="ind-block-3" class="ind-banner ind-top">
            <div class="ind-container">
                <div class="ind-header">
                    <span class="ind-label">Destaque Informativo</span>
                    <button id="ind-close-3" class="ind-close-btn">Fechar</button>
                </div>
                <div class="ind-slot-top ind-shimmer"></div>
            </div>
        </div>
    `;

    // === 5. LÓGICA DE EXECUÇÃO (ENGINE) ===
    const b1 = document.getElementById('ind-block-1');
    const b2Overlay = document.getElementById('ind-block-2-overlay');
    const b2Modal = b2Overlay.querySelector('.ind-modal');
    const b3 = document.getElementById('ind-block-3');

    const openB1 = () => { b1.style.bottom = '0px'; };
    const openB3 = () => { b3.style.top = '0px'; };

    // Lógica Bloco 1 (Inferior) - Reaparece em 80s (20s originais + 60s)
    document.getElementById('ind-close-1').onclick = () => {
        b1.style.bottom = '-600px';
        setTimeout(openB1, 80000);
    };

    // Lógica Bloco 3 (Superior) - Reaparece em 85s (25s originais + 60s)
    document.getElementById('ind-close-3').onclick = () => {
        b3.style.top = '-600px';
        setTimeout(openB3, 60);
    };

    // Motor do Interstitial (Bloco 2)
    function startInterstitial() {
        // Primeira exibição ocorre em 70s (10s originais + 60s)
        setTimeout(() => {
            b2Overlay.style.display = 'flex';
            setTimeout(() => {
                b2Overlay.style.opacity = '1';
                b2Modal.style.transform = 'translateY(0)';
            }, 50);

            let timeLeft = 70; // 10s originais + 60s
            const totalDuration = 70;
            const btn = document.getElementById('ind-close-2');
            const prog = document.getElementById('ind-prog-2');
            const txt = document.getElementById('ind-timer-txt');

            const countdown = setInterval(() => {
                if (isTabActive) {
                    if (timeLeft > 0) {
                        timeLeft--;
                        txt.innerText = `ACESSO EM ${timeLeft}S`;
                        prog.style.width = `${((totalDuration - timeLeft) / totalDuration) * 100}%`;
                    } else {
                        clearInterval(countdown);
                        txt.innerText = "PRONTO PARA ACESSAR";
                        btn.innerText = "PULAR ANÚNCIO";
                        btn.disabled = false;
                        btn.classList.add('ready');
                    }
                } else {
                    txt.innerText = "CRONÔMETRO PAUSADO";
                }
            }, 1000);

            btn.onclick = () => {
                b2Overlay.style.opacity = '0';
                b2Modal.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    b2Overlay.style.display = 'none';
                    // Reinicia após 180 segundos (120s originais + 60s)
                    setTimeout(startInterstitial, 180000);
                }, 500);
                
                // Reset imediato para próximo ciclo
                timeLeft = 70;
                btn.disabled = true;
                btn.classList.remove('ready');
                btn.innerText = "Aguarde";
                prog.style.width = "0%";
            };
        }, 70000);
    }

    // Inicialização do Sistema com +60s nos delays iniciais
    setTimeout(openB1, 62000); // 2s original + 60s
    setTimeout(openB3, 64000); // 4s original + 60s
    startInterstitial();

})();
