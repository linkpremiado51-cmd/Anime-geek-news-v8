import {
    getAuth,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

/* =========================
   AUTH GLOBAL
========================= */
const auth = getAuth();

/* Estado global do usuário */
window.AniGeekUser = null;

/* Observador de login */
onAuthStateChanged(auth, (user) => {
    if (user) {
        window.AniGeekUser = {
            uid: user.uid,
            nome: user.displayName,
            email: user.email
        };

        console.log("👤 Usuário logado:", window.AniGeekUser);

        document.dispatchEvent(
            new CustomEvent("user:login", { detail: window.AniGeekUser })
        );
    } else {
        window.AniGeekUser = null;

        console.log("🚪 Usuário deslogado");

        document.dispatchEvent(
            new Event("user:logout")
        );
    }
});

/* Logout global */
window.logoutAniGeek = async function () {
    await signOut(auth);
    console.log("👋 Logout efetuado");
    window.location.href = "acesso.html";
};
