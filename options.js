// options.js

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('saveBtn').addEventListener('click', saveOptions);

// Habilitar/Deshabilitar inputs según los checkboxes y validar
document.getElementById('enableSpyReport').addEventListener('change', (e) => {
    document.getElementById('spyReportWebhookURL').disabled = !e.target.checked;
    validateInputs();
});

document.getElementById('enableBattleReport').addEventListener('change', (e) => {
    document.getElementById('battleReportWebhookURL').disabled = !e.target.checked;
    validateInputs();
});

document.getElementById('enableNinjutsuReport').addEventListener('change', (e) => {
    document.getElementById('ninjutsuReportWebhookURL').disabled = !e.target.checked;
    validateInputs();
});

// Validar al escribir en los inputs
document.getElementById('spyReportWebhookURL').addEventListener('input', validateInputs);
document.getElementById('battleReportWebhookURL').addEventListener('input', validateInputs);
document.getElementById('ninjutsuReportWebhookURL').addEventListener('input', validateInputs);

function validateInputs() {
    const saveBtn = document.getElementById('saveBtn');
    const status = document.getElementById('status');
    const discordPrefix = "https://discord.com/api/webhooks/";

    const enableSpy = document.getElementById('enableSpyReport').checked;
    const spyUrl = document.getElementById('spyReportWebhookURL').value.trim();

    const enableBattle = document.getElementById('enableBattleReport').checked;
    const battleUrl = document.getElementById('battleReportWebhookURL').value.trim();

    const enableNinjutsu = document.getElementById('enableNinjutsuReport').checked;
    const ninjutsuUrl = document.getElementById('ninjutsuReportWebhookURL').value.trim();

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
    const enableNinjutsuReport = document.getElementById('enableNinjutsuReport').checked;
    const ninjutsuReportWebhookURL = document.getElementById('ninjutsuReportWebhookURL').value.trim();
    const enableDownloadNinjutsuReport = document.getElementById('enableDownloadNinjutsuReport').checked;

    chrome.storage.local.set({
        currentUser: currentUser,
        enableSpyReport: enableSpyReport,
        spyReportWebhookURL: spyReportWebhookURL,
        enableDownloadSpyReport: enableDownloadSpyReport,
        enableBattleReport: enableBattleReport,
        battleReportWebhookURL: battleReportWebhookURL,
        enableCopyBattleReport: enableCopyBattleReport,
        enableNinjutsuReport: enableNinjutsuReport,
        ninjutsuReportWebhookURL: ninjutsuReportWebhookURL,
        enableDownloadNinjutsuReport: enableDownloadNinjutsuReport
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
        enableNinjutsuReport: false,
        ninjutsuReportWebhookURL: '',
        enableDownloadNinjutsuReport: false
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

        document.getElementById('enableNinjutsuReport').checked = items.enableNinjutsuReport;
        document.getElementById('ninjutsuReportWebhookURL').value = items.ninjutsuReportWebhookURL;
        document.getElementById('ninjutsuReportWebhookURL').disabled = !items.enableNinjutsuReport;

        document.getElementById('enableDownloadNinjutsuReport').checked = items.enableDownloadNinjutsuReport;

        validateInputs();
    });
}
