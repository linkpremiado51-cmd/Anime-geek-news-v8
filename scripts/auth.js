/* scripts/auth.js */
/* UI GLOBAL — SEM Firebase */

(function () {

    function renderUsuarioDeslogado() {
        const areaUsuario = document.getElementById('area-usuario');
        if (!areaUsuario) return;

        areaUsuario.innerHTML = `
            <a href="acesso.html" class="link-login">
                Entrar / Criar conta
            </a>
        `;
    }

    function renderUsuarioLogado(user) {
        const areaUsuario = document.getElementById('area-usuario');
        if (!areaUsuario) return;

        const nome =
            user.nome ||
            user.email?.split('@')[0] ||
            'Usuário';

        areaUsuario.innerHTML = `
            <div class="usuario-logado">
                <span class="usuario-nome">${nome}</span>
                <button class="logout-btn" id="btnLogout" title="Sair">
                    <i class="fa-solid fa-right-from-bracket"></i>
                </button>
            </div>
        `;

        const btnLogout = document.getElementById('btnLogout');
        if (btnLogout) {
            btnLogout.addEventListener('click', () => {
                if (window.AniGeekLogout) {
                    window.AniGeekLogout();
                }
            });
        }
    }

    function aplicarEstadoInicial() {
        if (window.AniGeekUser) {
            renderUsuarioLogado(window.AniGeekUser);
        } else {
            renderUsuarioDeslogado();
        }
    }

    document.addEventListener('user:login', (e) => {
        renderUsuarioLogado(e.detail);
    });

    document.addEventListener('user:logout', () => {
        renderUsuarioDeslogado();
    });

    document.addEventListener('DOMContentLoaded', aplicarEstadoInicial);

})();
