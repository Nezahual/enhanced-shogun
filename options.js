// options.js

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('saveBtn').addEventListener('click', saveOptions);
document.getElementById('changelogBtn').addEventListener('click', () => {
    chrome.tabs.create({ url: 'changelog.html' });
});

// Habilitar/Deshabilitar inputs según los checkboxes y validar
document.getElementById('enableSpyReport').addEventListener('change', (e) => {
    document.getElementById('spyReportWebhookURL').disabled = !e.target.checked;
    validateInputs();
});

document.getElementById('enableBattleReport').addEventListener('change', (e) => {
    document.getElementById('battleReportWebhookURL').disabled = !e.target.checked;
    validateInputs();
});

document.getElementById('enableNinjutsuReportPng').addEventListener('change', updateNinjutsuWebhookState);
document.getElementById('enableNinjutsuReportHtm').addEventListener('change', updateNinjutsuWebhookState);

function updateNinjutsuWebhookState() {
    const isPngChecked = document.getElementById('enableNinjutsuReportPng').checked;
    const isHtmChecked = document.getElementById('enableNinjutsuReportHtm').checked;
    document.getElementById('ninjutsuReportWebhookURL').disabled = !(isPngChecked || isHtmChecked);
    validateInputs();
}

document.getElementById('enableArmyReportPng').addEventListener('change', updateArmyWebhookState);
document.getElementById('enableArmyReportHtm').addEventListener('change', updateArmyWebhookState);

function updateArmyWebhookState() {
    const isPngChecked = document.getElementById('enableArmyReportPng').checked;
    const isHtmChecked = document.getElementById('enableArmyReportHtm').checked;
    document.getElementById('armyReportWebhookURL').disabled = !(isPngChecked || isHtmChecked);
    validateInputs();
}

// Validar al escribir en los inputs
document.getElementById('spyReportWebhookURL').addEventListener('input', validateInputs);
document.getElementById('battleReportWebhookURL').addEventListener('input', validateInputs);
document.getElementById('ninjutsuReportWebhookURL').addEventListener('input', validateInputs);
document.getElementById('armyReportWebhookURL').addEventListener('input', validateInputs);

function validateInputs() {
    const saveBtn = document.getElementById('saveBtn');
    const status = document.getElementById('status');
    const discordPrefix = "https://discord.com/api/webhooks/";

    const enableSpy = document.getElementById('enableSpyReport').checked;
    const spyUrl = document.getElementById('spyReportWebhookURL').value.trim();

    const enableBattle = document.getElementById('enableBattleReport').checked;
    const battleUrl = document.getElementById('battleReportWebhookURL').value.trim();

    const enableNinjutsu = document.getElementById('enableNinjutsuReportPng').checked || document.getElementById('enableNinjutsuReportHtm').checked;
    const ninjutsuUrl = document.getElementById('ninjutsuReportWebhookURL').value.trim();

    const enableArmy = document.getElementById('enableArmyReportPng').checked || document.getElementById('enableArmyReportHtm').checked;
    const armyUrl = document.getElementById('armyReportWebhookURL').value.trim();

    let errorMessage = "";

    if (enableSpy) {
        if (!spyUrl) {
            errorMessage = "Debes rellenar la URL del webhook de reportes de espionaje.";
        } else if (!spyUrl.startsWith(discordPrefix)) {
            errorMessage = "La URL del webhook debe empezar por 'https://discord.com/api/webhooks/'.";
        }
    }

    if (!errorMessage && enableBattle) {
        if (!battleUrl) {
            errorMessage = "Debes rellenar la URL del Webhook de reportes de batalla.";
        } else if (!battleUrl.startsWith(discordPrefix)) {
            errorMessage = "La URL del webhook debe empezar por 'https://discord.com/api/webhooks/'.";
        }
    }

    if (!errorMessage && enableNinjutsu) {
        if (!ninjutsuUrl) {
            errorMessage = "Debes rellenar la URL del Webhook de reportes de ninjutsu.";
        } else if (!ninjutsuUrl.startsWith(discordPrefix)) {
            errorMessage = "La URL del webhook debe empezar por 'https://discord.com/api/webhooks/'.";
        }
    }

    if (!errorMessage && enableArmy) {
        if (!armyUrl) {
            errorMessage = "Debes rellenar la URL del Webhook de reportes de ejércitos.";
        } else if (!armyUrl.startsWith(discordPrefix)) {
            errorMessage = "La URL del webhook debe empezar por 'https://discord.com/api/webhooks/'.";
        }
    }

    if (errorMessage) {
        saveBtn.disabled = true;
        status.textContent = errorMessage;
        status.style.color = '#e74c3c'; // Rojo para errores
    } else {
        saveBtn.disabled = false;
        if (status.textContent !== 'Configuración guardada correctamente.') {
            status.textContent = '';
            status.style.color = '';
        }
    }
}

function saveOptions() {
    const currentUser = document.getElementById('currentUser').value.trim();
    const enableSpyReport = document.getElementById('enableSpyReport').checked;
    const spyReportWebhookURL = document.getElementById('spyReportWebhookURL').value.trim();
    const enableDownloadSpyReport = document.getElementById('enableDownloadSpyReport').checked;
    const enableBattleReport = document.getElementById('enableBattleReport').checked;
    const battleReportWebhookURL = document.getElementById('battleReportWebhookURL').value.trim();
    const enableCopyBattleReport = document.getElementById('enableCopyBattleReport').checked;
    
    const enableNinjutsuReportPng = document.getElementById('enableNinjutsuReportPng').checked;
    const enableNinjutsuReportHtm = document.getElementById('enableNinjutsuReportHtm').checked;
    const ninjutsuReportWebhookURL = document.getElementById('ninjutsuReportWebhookURL').value.trim();
    const enableDownloadNinjutsuReportPng = document.getElementById('enableDownloadNinjutsuReportPng').checked;
    const enableDownloadNinjutsuReportHtm = document.getElementById('enableDownloadNinjutsuReportHtm').checked;
    
    const enableArmyReportPng = document.getElementById('enableArmyReportPng').checked;
    const enableArmyReportHtm = document.getElementById('enableArmyReportHtm').checked;
    const armyReportWebhookURL = document.getElementById('armyReportWebhookURL').value.trim();
    const enableDownloadArmyReportPng = document.getElementById('enableDownloadArmyReportPng').checked;
    const enableDownloadArmyReportHtm = document.getElementById('enableDownloadArmyReportHtm').checked;
    
    const autoShowChangelog = document.getElementById('autoShowChangelog').checked;

    chrome.storage.local.set({
        currentUser: currentUser,
        enableSpyReport: enableSpyReport,
        spyReportWebhookURL: spyReportWebhookURL,
        enableDownloadSpyReport: enableDownloadSpyReport,
        enableBattleReport: enableBattleReport,
        battleReportWebhookURL: battleReportWebhookURL,
        enableCopyBattleReport: enableCopyBattleReport,
        enableNinjutsuReportPng: enableNinjutsuReportPng,
        enableNinjutsuReportHtm: enableNinjutsuReportHtm,
        ninjutsuReportWebhookURL: ninjutsuReportWebhookURL,
        enableDownloadNinjutsuReportPng: enableDownloadNinjutsuReportPng,
        enableDownloadNinjutsuReportHtm: enableDownloadNinjutsuReportHtm,
        enableArmyReportPng: enableArmyReportPng,
        enableArmyReportHtm: enableArmyReportHtm,
        armyReportWebhookURL: armyReportWebhookURL,
        enableDownloadArmyReportPng: enableDownloadArmyReportPng,
        enableDownloadArmyReportHtm: enableDownloadArmyReportHtm,
        autoShowChangelog: autoShowChangelog
    }, () => {
        // Actualizar el estado para informar al usuario
        const status = document.getElementById('status');
        status.textContent = 'Configuración guardada correctamente.';
        status.style.color = '#2ecc71'; // Verde para éxito
        setTimeout(() => {
            status.textContent = '';
            status.style.color = '';
        }, 3000);
    });
}

function restoreOptions() {
    // Definimos los valores por defecto
    chrome.storage.local.get({
        currentUser: '',
        enableSpyReport: false,
        spyReportWebhookURL: '',
        enableDownloadSpyReport: false,
        enableBattleReport: false,
        battleReportWebhookURL: '',
        enableCopyBattleReport: false,
        enableNinjutsuReportPng: false,
        enableNinjutsuReportHtm: false,
        ninjutsuReportWebhookURL: '',
        enableDownloadNinjutsuReportPng: false,
        enableDownloadNinjutsuReportHtm: false,
        enableArmyReportPng: false,
        enableArmyReportHtm: false,
        armyReportWebhookURL: '',
        enableDownloadArmyReportPng: false,
        enableDownloadArmyReportHtm: false,
        autoShowChangelog: true
    }, (items) => {
        document.getElementById('currentUser').value = items.currentUser;

        document.getElementById('enableSpyReport').checked = items.enableSpyReport;
        document.getElementById('spyReportWebhookURL').value = items.spyReportWebhookURL;
        document.getElementById('spyReportWebhookURL').disabled = !items.enableSpyReport;

        document.getElementById('enableDownloadSpyReport').checked = items.enableDownloadSpyReport;

        document.getElementById('enableBattleReport').checked = items.enableBattleReport;
        document.getElementById('battleReportWebhookURL').value = items.battleReportWebhookURL;
        document.getElementById('battleReportWebhookURL').disabled = !items.enableBattleReport;

        document.getElementById('enableCopyBattleReport').checked = items.enableCopyBattleReport;

        document.getElementById('enableNinjutsuReportPng').checked = items.enableNinjutsuReportPng;
        document.getElementById('enableNinjutsuReportHtm').checked = items.enableNinjutsuReportHtm;
        document.getElementById('ninjutsuReportWebhookURL').value = items.ninjutsuReportWebhookURL;
        document.getElementById('ninjutsuReportWebhookURL').disabled = !(items.enableNinjutsuReportPng || items.enableNinjutsuReportHtm);

        document.getElementById('enableDownloadNinjutsuReportPng').checked = items.enableDownloadNinjutsuReportPng;
        document.getElementById('enableDownloadNinjutsuReportHtm').checked = items.enableDownloadNinjutsuReportHtm;

        document.getElementById('enableArmyReportPng').checked = items.enableArmyReportPng;
        document.getElementById('enableArmyReportHtm').checked = items.enableArmyReportHtm;
        document.getElementById('armyReportWebhookURL').value = items.armyReportWebhookURL;
        document.getElementById('armyReportWebhookURL').disabled = !(items.enableArmyReportPng || items.enableArmyReportHtm);

        document.getElementById('enableDownloadArmyReportPng').checked = items.enableDownloadArmyReportPng;
        document.getElementById('enableDownloadArmyReportHtm').checked = items.enableDownloadArmyReportHtm;
        
        document.getElementById('autoShowChangelog').checked = items.autoShowChangelog;

        validateInputs();
    });
}
