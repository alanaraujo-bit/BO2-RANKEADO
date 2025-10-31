(function(window){
    // Evita múltiplos loads
    if (window.__BO2_MAIN_LOADED__) return;
    window.__BO2_MAIN_LOADED__ = true;

    // Placeholder global
    window.RankedData = {};

    // Função de inicialização
    async function initApp() {
        // Inicialização mínima
        console.log("main.js carregado corretamente");
    }

    // Executa inicialização
    initApp();

})(window);
        const profileUsername = document.getElementById('profileUsername');
        const profileRankBadge = document.getElementById('profileRankBadge');
    window.RankedData = {};
        // main.js restaurado para estrutura mínima funcional
        (function(window){
            if (window.__BO2_MAIN_LOADED__) return;
            window.__BO2_MAIN_LOADED__ = true;
            window.RankedData = {};
            async function initApp() {
                console.log("main.js carregado corretamente");
            }
            initApp();
        })(window);