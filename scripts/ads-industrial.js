(function() {
    // === 1. CONFIGURAÇÃO E ESTADO ===
    let isTabActive = true;
    let interstitialCycle = 0;
    document.addEventListener("visibilitychange", () => isTabActive = !document.hidden);

    const adsRoot = document.createElement('div');
    adsRoot.id = 'premium-ads-system';
    document.body.appendChild(adsRoot);

    // === 2. ESTILIZAÇÃO IMPECÁVEL ===
    const style = document.createElement('style');
    style.textContent = `
        #premium-ads-system { 
            font-family: 'Inter', 'Helvetica', sans-serif; 
            -webkit-font-smoothing: antialiased;
        }
        .premium-banner { 
            position: fixed; 
            left: 0; 
            width: 100%; 
            z-index: 2147483646; 
            background: #ffffff; 
            box-shadow: 0 -5px 25px rgba(0,0,0,0.08); 
            transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
            border-top: 1px solid #eaeaea;
        }
        .premium-bottom { bottom: -100%; }
        .premium-top { top: -100%; border-top: none; border-bottom: 1px solid #eaeaea; }
        .premium-container { max-width: 1100px; margin: 0 auto; padding: 12px 25px; }
        .ad-meta-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        .ad-label { font-size: 10px; font-weight: 800; color: #888; text-transform: uppercase; letter-spacing: 1.5px; }
        .ad-close-x { background: #f5f5f5; border: none; width: 24px; height: 24px; border-radius: 50%; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center; color: #121212; transition: background 0.2s; }
        .ad-close-x:hover { background: #eee; }
        .ad-slot-placeholder { background: #fafafa; border: 1px solid #f0f0f0; display: flex; align-items: center; justify-content: center; color: #ccc; font-size: 11px; font-weight: 600; margin: 0 auto; }
        .slot-300x250 { width: 300px; height: 250px; }
        .slot-leaderboard { width: 100%; height: 90px; }
        .premium-overlay { position: fixed; inset: 0; background: rgba(255, 255, 255, 0.98); backdrop-filter: blur(8px); z-index: 2147483647; display: none; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.4s ease; }
        .premium-modal { background: #fff; width: 95%; max-width: 550px; padding: 40px; border-radius: 12px; box-shadow: 0 20px 60px rgba(0,0,0,0.1); text-align: center; transform: translateY(20px); transition: transform 0.4s ease; }
        .interstitial-title { font-size: 28px; font-weight: 800; letter-spacing: -0.5px; margin-bottom: 10px; color: #121212; }
        .premium-prog-bg { width: 100%; height: 4px; background: #f0f0f0; margin: 25px 0; border-radius: 2px; overflow: hidden; }
        .premium-prog-fill { width: 0%; height: 100%; background: #121212; transition: width 0.1s linear; }
        .btn-premium-skip { background: #f0f0f0; border: none; padding: 16px 32px; font-size: 12px; font-weight: 800; color: #aaa; cursor: not-allowed; text-transform: uppercase; border-radius: 6px; width: 100%; transition: all 0.3s; }
        .btn-premium-skip.ready { background: #121212; color: #fff; cursor: pointer; }
        .ad-footer-info { margin-top: 20px; font-size: 11px; color: #888; display: flex; justify-content: space-between; align-items: center; }
    `;
    document.head.appendChild(style);

    // === 3. ESTRUTURA HTML ===
    adsRoot.innerHTML = `
        <div id="p-block-1" class="premium-banner premium-bottom">
            <div class="premium-container">
                <div class="ad-meta-header">
                    <span class="ad-label">Anúncio Recomendado</span>
                    <button id="p-close-1" class="ad-close-x">×</button>
                </div>
                <div id="p-slot-1" class="ad-slot-placeholder slot-300x250">ANÚNCIO PUBLICITÁRIO</div>
            </div>
        </div>

        <div id="p-block-2-overlay" class="premium-overlay">
            <div class="premium-modal">
                <span class="ad-label" style="display:block; margin-bottom:15px;">Publicidade Patrocinada</span>
                <h2 class="interstitial-title">Conteúdo Carregando</h2>
                <p style="color:#666; font-size:14px;">Aguarde alguns instantes para continuar sua leitura.</p>
                <div class="ad-slot-placeholder" style="width:100%; height:250px; margin: 20px 0;">ESPAÇO PARA PUBLICIDADE</div>
                <div class="premium-prog-bg"><div id="p-prog-2" class="premium-prog-fill"></div></div>
                <button id="p-close-2" class="btn-premium-skip" disabled>Aguarde</button>
                <div class="ad-footer-info">
                    <span id="p-timer-txt">SINCRONIZANDO...</span>
                    <span style="font-weight:700; color:#121212; cursor:pointer;">Privacidade</span>
                </div>
            </div>
        </div>

        <div id="p-block-3" class="premium-banner premium-top">
            <div class="premium-container">
                <div class="ad-meta-header">
                    <span class="ad-label">Destaque Parceiro</span>
                    <button id="p-close-3" class="ad-close-x">×</button>
                </div>
                <div class="ad-slot-placeholder slot-leaderboard">728 x 90 LEADERBOARD</div>
            </div>
        </div>
    `;

    const b1 = document.getElementById('p-block-1');
    const s1 = document.getElementById('p-slot-1');
    const b2Overlay = document.getElementById('p-block-2-overlay');
    const b2Modal = b2Overlay.querySelector('.premium-modal');
    const b3 = document.getElementById('p-block-3');

    // === 4. LÓGICA DE EXIBIÇÃO (TEMPOS AJUSTADOS) ===

    // Banner Inferior
    const openB1 = () => {
        b1.style.bottom = '0px';
        setTimeout(() => {
            b1.style.bottom = '-100%';
            setTimeout(() => {
                s1.className = 'ad-slot-placeholder slot-leaderboard';
                b1.style.bottom = '0px';
            }, 800);
        }, 20000); // Fica visível por 20s
    };

    document.getElementById('p-close-1').onclick = () => {
        b1.style.bottom = '-100%';
        setTimeout(openB1, 180000); // 3 minutos para reaparecer
    };

    // Banner Superior
    const openB3 = () => { b3.style.top = '0px'; };
    document.getElementById('p-close-3').onclick = () => {
        b3.style.top = '-100%';
        setTimeout(openB3, 240000); // 4 minutos para reaparecer
    };

    // Interstitial (O mais invasivo)
    function startInterstitial() {
        setTimeout(() => {
            b2Overlay.style.display = 'flex';
            setTimeout(() => {
                b2Overlay.style.opacity = '1';
                b2Modal.style.transform = 'translateY(0)';
            }, 50);

            let timeLeft = 8; // Tempo fixo mais curto e menos frustrante
            const totalDuration = timeLeft;
            
            const btn = document.getElementById('p-close-2');
            const prog = document.getElementById('p-prog-2');
            const txt = document.getElementById('p-timer-txt');

            const countdown = setInterval(() => {
                if (isTabActive) {
                    if (timeLeft > 0) {
                        timeLeft--;
                        txt.innerText = `PROSSEGUIR EM ${timeLeft}S`;
                        prog.style.width = `${((totalDuration - timeLeft) / totalDuration) * 100}%`;
                    } else {
                        clearInterval(countdown);
                        txt.innerText = "PRONTO";
                        btn.innerText = "PULAR PUBLICIDADE";
                        btn.disabled = false;
                        btn.classList.add('ready');
                    }
                }
            }, 1000);

            btn.onclick = () => {
                b2Overlay.style.opacity = '0';
                b2Modal.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    b2Overlay.style.display = 'none';
                    // Reinicia o progresso para o próximo ciclo
                    prog.style.width = '0%';
                    btn.disabled = true;
                    btn.classList.remove('ready');
                    btn.innerText = "Aguarde";
                    setTimeout(startInterstitial, 300000); // 5 minutos entre as janelas
                }, 500);
            };
        }, 120000); // Primeira aparição após 2 minutos
    }

    // === 5. START (DELAY INICIAL) ===
    setTimeout(openB1, 15000); // 15 segundos após abrir a página
    setTimeout(openB3, 10000); // 10 segundos após abrir a página
    startInterstitial();

})();
