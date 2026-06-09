// shared.js
console.log("Enhanced Shogun: shared.js inyectado en la página.");

// Mantenemos el estado de la configuración en memoria
let config = { enableSpyReport: false, enableDownloadSpyReport: false, enableBattleReport: false, enableCopyBattleReport: false, enableNinjutsuReportPng: false, enableDownloadNinjutsuReportPng: false, enableNinjutsuReportHtm: false, enableDownloadNinjutsuReportHtm: false };

chrome.storage.local.get(['enableSpyReport', 'enableDownloadSpyReport', 'enableBattleReport', 'enableCopyBattleReport', 'enableNinjutsuReportPng', 'enableDownloadNinjutsuReportPng', 'enableNinjutsuReportHtm', 'enableDownloadNinjutsuReportHtm'], (items) => {
    config.enableSpyReport = items.enableSpyReport || false;
    config.enableDownloadSpyReport = items.enableDownloadSpyReport || false;
    config.enableBattleReport = items.enableBattleReport || false;
    config.enableCopyBattleReport = items.enableCopyBattleReport || false;
    config.enableNinjutsuReportPng = items.enableNinjutsuReportPng || false;
    config.enableDownloadNinjutsuReportPng = items.enableDownloadNinjutsuReportPng || false;
    config.enableNinjutsuReportHtm = items.enableNinjutsuReportHtm || false;
    config.enableDownloadNinjutsuReportHtm = items.enableDownloadNinjutsuReportHtm || false;
});

chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local') {
        if (changes.enableSpyReport) config.enableSpyReport = changes.enableSpyReport.newValue;
        if (changes.enableDownloadSpyReport) config.enableDownloadSpyReport = changes.enableDownloadSpyReport.newValue;
        if (changes.enableBattleReport) config.enableBattleReport = changes.enableBattleReport.newValue;
        if (changes.enableCopyBattleReport) config.enableCopyBattleReport = changes.enableCopyBattleReport.newValue;
        if (changes.enableNinjutsuReportPng) config.enableNinjutsuReportPng = changes.enableNinjutsuReportPng.newValue;
        if (changes.enableDownloadNinjutsuReportPng) config.enableDownloadNinjutsuReportPng = changes.enableDownloadNinjutsuReportPng.newValue;
        if (changes.enableNinjutsuReportHtm) config.enableNinjutsuReportHtm = changes.enableNinjutsuReportHtm.newValue;
        if (changes.enableDownloadNinjutsuReportHtm) config.enableDownloadNinjutsuReportHtm = changes.enableDownloadNinjutsuReportHtm.newValue;
    }
});
