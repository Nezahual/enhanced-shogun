// shared.js
console.log("Enhanced Shogun: shared.js inyectado en la página.");

// Mantenemos el estado de la configuración en memoria
let config = { enableSpyReport: false, enableDownloadSpyReport: false, enableBattleReport: false, enableCopyBattleReport: false, enableNinjutsuReport: false, enableDownloadNinjutsuReport: false };

chrome.storage.local.get(['enableSpyReport', 'enableDownloadSpyReport', 'enableBattleReport', 'enableCopyBattleReport', 'enableNinjutsuReport', 'enableDownloadNinjutsuReport'], (items) => {
    config.enableSpyReport = items.enableSpyReport || false;
    config.enableDownloadSpyReport = items.enableDownloadSpyReport || false;
    config.enableBattleReport = items.enableBattleReport || false;
    config.enableCopyBattleReport = items.enableCopyBattleReport || false;
    config.enableNinjutsuReport = items.enableNinjutsuReport || false;
    config.enableDownloadNinjutsuReport = items.enableDownloadNinjutsuReport || false;
});

chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local') {
        if (changes.enableSpyReport) config.enableSpyReport = changes.enableSpyReport.newValue;
        if (changes.enableDownloadSpyReport) config.enableDownloadSpyReport = changes.enableDownloadSpyReport.newValue;
        if (changes.enableBattleReport) config.enableBattleReport = changes.enableBattleReport.newValue;
        if (changes.enableCopyBattleReport) config.enableCopyBattleReport = changes.enableCopyBattleReport.newValue;
        if (changes.enableNinjutsuReport) config.enableNinjutsuReport = changes.enableNinjutsuReport.newValue;
        if (changes.enableDownloadNinjutsuReport) config.enableDownloadNinjutsuReport = changes.enableDownloadNinjutsuReport.newValue;
    }
});
