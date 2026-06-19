// main.js

// Usamos MutationObserver para detectar cambios en el DOM de forma reactiva.
// Es la forma más óptima para Single Page Applications (SPA) y evita parpadeos.
const observer = new MutationObserver(() => {
    // config está disponible globalmente porque se inicializa en shared.js
    if (config.enableSpyReport || config.enableDownloadSpyReport) {
        if (typeof injectSpyBtns === 'function') {
            injectSpyBtns();
        }
    }
    if (config.enableBattleReport || config.enableCopyBattleReport) {
        if (typeof injectBattleBtns === 'function') {
            injectBattleBtns();
        }
    }
    if (config.enableNinjutsuReportPng || config.enableDownloadNinjutsuReportPng
        || config.enableNinjutsuReportHtm || config.enableDownloadNinjutsuReportHtm) {
        if (typeof injectNinjutsuBtns === 'function') {
            injectNinjutsuBtns();
        }
    }
});

// Observamos todo el body para detectar cuando el framework (React/Vue/etc.)
// añade o modifica elementos del DOM.
observer.observe(document.body, { childList: true, subtree: true });
