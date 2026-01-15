export async function inicializarMegaMenu() {
    // Carrega CSS
    if (!document.getElementById('menu-css')) {
        const link = document.createElement('link');
        link.id = 'menu-css';
        link.rel = 'stylesheet';
        link.href = 'menu/menu.css';
        document.head.appendChild(link);
    }

    // Container no index.html
    const container = document.getElementById('megaMenuContainer');
    if (!container) return;

    // Carrega HTML
    const response = await fetch('menu/menu.html');
    container.innerHTML = await response.text();

    const overlay = document.getElementById('megaOverlay');
    const btnFechar = document.getElementById('btnFecharMega');

    window.abrirMegaMenu = () => {
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    btnFechar.onclick = () => {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    };

    overlay.onclick = (e) => {
        if (e.target === overlay) {
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    };
}
