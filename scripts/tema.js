/* scripts/tema.js */

// Seleção dos elementos de alternância de tema
const themeToggle = document.getElementById('mobileThemeToggle');
const mobileThemeLabel = document.getElementById('mobileThemeLabel');

// Função para aplicar o tema e salvar a preferência
function alternarTema() {
    document.body.classList.toggle('dark-mode');
    
    // Salva a escolha do usuário no navegador
    const modoAtivo = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
    localStorage.setItem('pref-theme', modoAtivo);
    
    console.log(`Tema alterado para: ${modoAtivo}`);
}

// Escuta o clique no interruptor (toggle)
if (themeToggle) {
    themeToggle.addEventListener('change', alternarTema);
}

// Verifica se o usuário já tinha uma preferência salva ao carregar a página
function carregarTemaPreferido() {
    const temaSalvo = localStorage.getItem('pref-theme');
    
    if (temaSalvo === 'dark') {
        document.body.classList.add('dark-mode');
        if (themeToggle) themeToggle.checked = true;
    }
}

// Lógica da Barra de Progresso no topo (Scrolled)
window.onscroll = function() {
    let winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    let height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    let scrolled = (winScroll / height) * 100;
    const progressBar = document.getElementById("progress-bar");
    if (progressBar) {
        progressBar.style.width = scrolled + "%";
    }
};

// Lógica do botão de voltar ao topo
window.scrollToTop = function() {
    window.scrollTo({top: 0, behavior: 'smooth'});
};

// Inicializa o tema assim que o script carrega
carregarTemaPreferido();
