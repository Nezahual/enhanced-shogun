// service-worker.js

let spyReportWebhookURL = "";
let battleReportWebhookURL = "";
let currentUser = "";

// Cargamos la configuración inicialmente
chrome.storage.local.get(['currentUser', 'spyReportWebhookURL', 'battleReportWebhookURL']).then((result) => {
  spyReportWebhookURL = result.spyReportWebhookURL || "";
  battleReportWebhookURL = result.battleReportWebhookURL || "";
  currentUser = result.currentUser || "Usuario Desconocido";
});

// Mantenemos la configuración actualizada si el usuario la cambia en las opciones
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local') {
    if (changes.spyReportWebhookURL) spyReportWebhookURL = changes.spyReportWebhookURL.newValue || "";
    if (changes.battleReportWebhookURL) battleReportWebhookURL = changes.battleReportWebhookURL.newValue || "";
    if (changes.currentUser) currentUser = changes.currentUser.newValue || "Usuario Desconocido";
  }
});

// Evento que se dispara al instalar o actualizar la extensión
chrome.runtime.onInstalled.addListener(() => {
  console.log("Enhanced Shogun Extension instalada correctamente.");
});

// Escuchamos los mensajes que vienen desde content.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "sendSpyReport") {
    console.log("Service Worker recibió el mensaje. Procesando envío a Discord...");

    const spiedUser = request.spiedUser;

    // Convertimos el HTML recibido en un "archivo" virtual usando Blob
    const htmlBlob = new Blob([request.html], { type: 'text/html' });

    // Para enviar archivos por webhook, Discord exige usar FormData (multipart/form-data)
    const formData = new FormData();
    formData.append("file", htmlBlob, 'ShogunSpyReport - ' + spiedUser + '.htm');

    // Añadimos el mensaje de texto usando payload_json
    formData.append('payload_json', JSON.stringify({
      content: `**${currentUser}** espió a: **${spiedUser}**`
    }));

    // Hacemos la petición a los servidores de Discord
    fetch(spyReportWebhookURL, {
      method: "POST",
      body: formData
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }
        console.log("Reporte enviado con éxito a Discord");
        sendResponse({ success: true, message: "Reporte enviado exitosamente" });
      })
      .catch(error => {
        console.error("Fallo al enviar a Discord:", error);
        sendResponse({ success: false, message: "Error al enviar", error: error.toString() });
      });

    // Retornar true indica que la respuesta será asíncrona
    return true;
  }

  if (request.action === "sendBattleReport") {
    console.log("Service Worker recibió el mensaje. Procesando envío de batalla a Discord...");

    const battleId = request.battleId;

    // Para enviar el enlace al reporte de batalla por webhook usamos FormData
    const formData = new FormData();

    // Añadimos el mensaje de texto usando payload_json
    formData.append('payload_json', JSON.stringify({
      content: `**${currentUser}** ha compartido un reporte de batalla:\nhttps://shogunsreturn.com/battle-reports/battle/${battleId}`
    }));

    // Hacemos la petición a los servidores de Discord
    fetch(battleReportWebhookURL, {
      method: "POST",
      body: formData
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }
        console.log("Reporte de batalla enviado con éxito a Discord");
        sendResponse({ success: true, message: "Reporte enviado exitosamente" });
      })
      .catch(error => {
        console.error("Fallo al enviar a Discord:", error);
        sendResponse({ success: false, message: "Error al enviar", error: error.toString() });
      });

    // Retornar true indica que la respuesta será asíncrona
    return true;
  }
});
