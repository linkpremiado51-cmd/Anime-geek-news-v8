(function() {
    // === 1. GESTÃO DE ESTADO E MONITORAMENTO ===
    let isTabActive = true;
    let interstitialCycle = 0; // Para controlar o ciclo de 15s, 5s, 10s
    document.addEventListener("visibilitychange", () => isTabActive = !document.hidden);

    // === 2. CONTAINER MESTRE (ROOT) ===
    const adsRoot = document.createElement('div');
    adsRoot.id = 'industrial-ads-system';
    document.body.appendChild(adsRoot);

    // === 3. ESTILIZAÇÃO (Editada para animações mais evidentes) ===
    const style = document.createElement('style');
    style.textContent = `
        #industrial-ads-system { font-family: 'Helvetica', 'Arial', sans-serif; pointer-events: none; -webkit-font-smoothing: antialiased; }
        #industrial-ads-system * { pointer-events: auto; box-sizing: border-box; }
        
        /* Shimmer mais intenso */
        .ind-shimmer { 
            background: #111 linear-gradient(90deg, #050505 0%, #444 50%, #050505 100%); 
            background-size: 200% 100%; 
            animation: ind-shimmer-anim 1s infinite linear; 
        }
        @keyframes ind-shimmer-anim { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

        .ind-banner { position: fixed; left: 0; width: 100%; z-index: 2147483646; background: #ffffff; border-top: 4px solid #000; border-bottom: 4px solid #000; box-shadow: 0 0 40px rgba(0,0,0,0.4); transition: all 0.8s cubic-bezier(0.19, 1, 0.22, 1); }
        .ind-bottom { bottom: -700px; padding-bottom: 10px; }
        .ind-top { top: -700px; }
        .ind-container { width: 100%; max-width: 1200px; margin: 0 auto; padding: 15px; overflow: hidden; }

        .ind-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
        .ind-label { font-size: 12px; font-weight: 900; color: #000; text-transform: uppercase; letter-spacing: 2.5px; }
        .ind-close-btn { font-size: 11px; font-weight: 900; background: #000; color: #fff; border: none; padding: 6px 18px; cursor: pointer; text-transform: uppercase; }

        /* Slots dinâmicos Bloco 1 */
        .ind-slot-300x250 { width: 300px; height: 250px; margin: 0 auto; border: 2px solid #000; display: block; transition: all 0.5s ease; }
        .ind-slot-top { width: 100%; height: 90px; border: 2px solid #000; }

        /* Interstitial */
        .ind-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.95); backdrop-filter: blur(10px) grayscale(100%); z-index: 2147483647; display: none; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.4s ease; }
        .ind-modal { background: #fff; width: 90%; max-width: 500px; padding: 30px; border-top: 15px solid #000; box-shadow: 0 40px 100px rgba(0,0,0,1); transform: translateY(30px); transition: transform 0.4s ease; }
        .ind-slot-hero { width: 100%; height: 300px; margin-bottom: 25px; border: 1px solid #000; }

        .ind-btn-skip { background: #e0e0e0; border: 2px solid #ccc; padding: 14px 30px; font-size: 13px; font-weight: 900; color: #666; cursor: not-allowed; text-transform: uppercase; width: 100%; }
        .ind-btn-skip.ready { background: #000; color: #fff; border-color: #000; cursor: pointer; animation: pulse-border 1.5s infinite; }

        .ind-progress-bg { width: 100%; height: 8px; background: #eee; margin-bottom: 20px; }
        .ind-progress-fill { width: 0%; height: 100%; background: #000; transition: width 0.1s linear; }

        .ind-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 10px; }
        .ind-cta { background: #000; color: #fff; text-decoration: none; padding: 14px 35px; font-size: 13px; font-weight: 800; text-transform: uppercase; border: 3px solid #000; transition: all 0.3s; }
        .ind-cta:hover { background: #fff; color: #000; }

        /* Pulsação mais evidente */
        .pulse-ad { animation: ad-pulse-strong 2s infinite ease-in-out; }
        @keyframes ad-pulse-strong { 
            0% { opacity: 1; transform: scale(1); } 
            50% { opacity: 0.7; transform: scale(0.97); } 
            100% { opacity: 1; transform: scale(1); } 
        }
        @keyframes pulse-border {
            0% { box-shadow: 0 0 0 0 rgba(0,0,0,0.7); }
            70% { box-shadow: 0 0 0 15px rgba(0,0,0,0); }
            100% { box-shadow: 0 0 0 0 rgba(0,0,0,0); }
        }
    `;
    document.head.appendChild(style);

    // === 4. ESTRUTURA DOS BLOCOS ===
    adsRoot.innerHTML = `
        <div id="ind-block-1" class="ind-banner ind-bottom">
            <div class="ind-container">
                <div class="ind-header">
                    <span id="ind-label-1" class="ind-label">Oferta Patrocinada</span>
                    <button id="ind-close-1" class="ind-close-btn">Fechar</button>
                </div>
                <div id="ind-slot-1" class="ind-slot-300x250 ind-shimmer pulse-ad"></div>
            </div>
        </div>

        <div id="ind-block-2-overlay" class="ind-overlay">
            <div class="ind-modal">
                <div class="ind-header">
                    <span class="ind-label">Publicidade Premium</span>
                    <button id="ind-close-2" class="ind-btn-skip" disabled>Aguarde</button>
                </div>
                <div class="ind-slot-hero ind-shimmer pulse-ad"></div>
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
                <div class="ind-slot-top ind-shimmer pulse-ad"></div>
            </div>
        </div>
    `;

    const b1 = document.getElementById('ind-block-1');
    const s1 = document.getElementById('ind-slot-1');
    const b2Overlay = document.getElementById('ind-block-2-overlay');
    const b2Modal = b2Overlay.querySelector('.ind-modal');
    const b3 = document.getElementById('ind-block-3');

    // === 5. LÓGICA BLOCO 1 (Mutação Horizontal) ===
    let b1Timer;
    let b1MutationTimer;

    const openB1 = () => {
        b1.style.bottom = '0px';
        s1.className = 'ind-slot-300x250 ind-shimmer pulse-ad';
        document.getElementById('ind-label-1').innerText = "Oferta Patrocinada";
        
        // Timer de 20 segundos para deslizar e trocar para horizontal
        b1MutationTimer = setTimeout(() => {
            b1.style.bottom = '-700px'; // Desliza para baixo
            setTimeout(() => {
                s1.className = 'ind-slot-top ind-shimmer pulse-ad'; // Muda para horizontal
                document.getElementById('ind-label-1').innerText = "Troca de Propaganda";
                b1.style.bottom = '0px'; // Sobe novamente
                
                // Em 60 segundos retorna ao estado 300x250
                setTimeout(() => {
                    b1.style.bottom = '-700px';
                    setTimeout(openB1, 1000);
                }, 60000);
            }, 800);
        }, 20000);
    };

    document.getElementById('ind-close-1').onclick = () => {
        clearTimeout(b1MutationTimer);
        b1.style.bottom = '-700px';
        setTimeout(openB1, 80000);
    };

    // === 6. LÓGICA BLOCO 3 (Superior) ===
    const openB3 = () => { b3.style.top = '0px'; };
    document.getElementById('ind-close-3').onclick = () => {
        b3.style.top = '-700px';
        setTimeout(openB3, 40000);
    };

    // === 7. LÓGICA BLOCO 2 (Interstitial com Ciclo 15-5-10) ===
    function startInterstitial() {
        setTimeout(() => {
            b2Overlay.style.display = 'flex';
            setTimeout(() => {
                b2Overlay.style.opacity = '1';
                b2Modal.style.transform = 'translateY(0)';
            }, 50);

            // Definição do tempo baseado no ciclo
            const cycleTimes = [15, 5, 10];
            let timeLeft = cycleTimes[interstitialCycle % 3];
            const totalDuration = timeLeft;
            
            const btn = document.getElementById('ind-close-2');
            const prog = document.getElementById('ind-prog-2');
            const txt = document.getElementById('ind-timer-txt');
            
            btn.disabled = true;
            btn.classList.remove('ready');
            btn.innerText = "Aguarde";

            const countdown = setInterval(() => {
                if (isTabActive) {
                    if (timeLeft > 0) {
                        timeLeft--;
                        txt.innerText = `ACESSO LIBERADO EM ${timeLeft}S`;
                        prog.style.width = `${((totalDuration - timeLeft) / totalDuration) * 100}%`;
                    } else {
                        clearInterval(countdown);
                        txt.innerText = "ACESSO DISPONÍVEL";
                        btn.innerText = "PULAR ANÚNCIO";
                        btn.disabled = false;
                        btn.classList.add('ready');
                    }
                } else {
                    txt.innerText = "CONTAGEM PAUSADA";
                }
            }, 1000);

            btn.onclick = () => {
                interstitialCycle++; // Incrementa o ciclo para a próxima exibição
                b2Overlay.style.opacity = '0';
                b2Modal.style.transform = 'translateY(30px)';
                setTimeout(() => {
                    b2Overlay.style.display = 'none';
                    setTimeout(startInterstitial, 130000); // Reaparece em 130s
                }, 500);
                prog.style.width = "0%";
            };
        }, 40000); // Delay inicial de 40 segundos
    }

    // === 8. INICIALIZAÇÃO GERAL ===
    setTimeout(openB1, 10000); // Bloco 1: 10s
    setTimeout(openB3, 7000);  // Bloco 3: 7s
    startInterstitial();       // Bloco 2: 40s (dentro da função)

})();
