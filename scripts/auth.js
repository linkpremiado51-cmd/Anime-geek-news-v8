/* scripts/auth.js */

import {
    getAuth,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

/**
 * Usa o app já inicializado no config-firebase.js
 */
const auth = getAuth();

/**
 * Aguarda o DOM para garantir que o elemento exista
 */
document.addEventListener('DOMContentLoaded', () => {
    const areaUsuario = document.getElementById('area-usuario');

    if (!areaUsuario) return;

    /**
     * Renderiza interface para usuário DESLOGADO
     */
    function renderUsuarioDeslogado() {
        areaUsuario.innerHTML = `
            <a href="acesso.html" class="link-login">
                Entrar / Criar conta
            </a>
        `;
    }

    /**
     * Renderiza interface para usuário LOGADO
     */
    function renderUsuarioLogado(user) {
        const nome =
            user.displayName ||
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
            btnLogout.addEventListener('click', logoutUsuario);
        }
    }

    /**
     * Observador GLOBAL de autenticação
     */
    onAuthStateChanged(auth, (user) => {
        if (user) {
            console.log("✅ Usuário logado:", user.email);
            renderUsuarioLogado(user);
        } else {
            console.log("🔒 Usuário deslogado");
            renderUsuarioDeslogado();
        }
    });
});

/**
 * Logout
 */
async function logoutUsuario() {
    try {
        await signOut(auth);
        console.log("👋 Logout realizado");
    } catch (error) {
        console.error("❌ Erro ao sair:", error);
    }
}

/**
 * Exposição controlada (para uso futuro)
 */
window.auth = auth;
