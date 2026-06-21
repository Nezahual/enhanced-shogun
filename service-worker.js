// service-worker.js

let spyReportWebhookURL = "";
let battleReportWebhookURL = "";
let ninjutsuReportWebhookURL = "";
let armyReportWebhookURL = "";
let currentUser = "";

// Cargamos la configuración inicialmente
chrome.storage.local.get(['currentUser', 'spyReportWebhookURL', 'battleReportWebhookURL', 'ninjutsuReportWebhookURL', 'armyReportWebhookURL']).then((result) => {
  spyReportWebhookURL = result.spyReportWebhookURL || "";
  battleReportWebhookURL = result.battleReportWebhookURL || "";
  ninjutsuReportWebhookURL = result.ninjutsuReportWebhookURL || "";
  armyReportWebhookURL = result.armyReportWebhookURL || "";
  currentUser = result.currentUser || "Usuario Desconocido";
});

// Mantenemos la configuración actualizada si el usuario la cambia en las opciones
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local') {
    if (changes.spyReportWebhookURL) spyReportWebhookURL = changes.spyReportWebhookURL.newValue || "";
    if (changes.battleReportWebhookURL) battleReportWebhookURL = changes.battleReportWebhookURL.newValue || "";
    if (changes.ninjutsuReportWebhookURL) ninjutsuReportWebhookURL = changes.ninjutsuReportWebhookURL.newValue || "";
    if (changes.armyReportWebhookURL) armyReportWebhookURL = changes.armyReportWebhookURL.newValue || "";
    if (changes.currentUser) currentUser = changes.currentUser.newValue || "Usuario Desconocido";
  }
});

// Evento que se dispara al instalar o actualizar la extensión
chrome.runtime.onInstalled.addListener((details) => {
  console.log("Enhanced Shogun Extension instalada correctamente.");

  // Mostrar página de novedades tras instalación o actualización
  if (details.reason === 'install' || details.reason === 'update') {
    chrome.storage.local.get({ autoShowChangelog: true }, (items) => {
      if (items.autoShowChangelog) {
        chrome.tabs.create({ url: 'changelog.html' });
      }
    });
  }
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

  if (request.action === "sendNinjutsuMissionReport") {
    console.log("Service Worker recibió el mensaje. Procesando envío de reporte ninjutsu a Discord...");

    // La imagen viene en formato base64 Data URL (data:image/png;base64,...)
    const base64Data = request.imageData.split(',')[1];

    // Convertir de base64 a Blob
    const byteCharacters = atob(base64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);

      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    const imageBlob = new Blob(byteArrays, { type: 'image/png' });

    const formData = new FormData();
    formData.append("file", imageBlob, 'NinjutsuReport.png');

    formData.append('payload_json', JSON.stringify({
      content: `**${currentUser}** ha compartido un reporte de misión ninjutsu:`
    }));

    fetch(ninjutsuReportWebhookURL, {
      method: "POST",
      body: formData
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }
        console.log("Reporte ninjutsu enviado con éxito a Discord");
        sendResponse({ success: true, message: "Reporte ninjutsu enviado exitosamente" });
      })
      .catch(error => {
        console.error("Fallo al enviar reporte ninjutsu a Discord:", error);
        sendResponse({ success: false, message: "Error al enviar", error: error.toString() });
      });

    return true;
  }

  if (request.action === "sendNinjutsuHtmReport") {
    console.log("Service Worker recibió el mensaje. Procesando envío de reporte ninjutsu (HTM) a Discord...");

    const htmlBlob = new Blob([request.html], { type: 'text/html' });

    const formData = new FormData();
    formData.append("file", htmlBlob, 'NinjutsuReport.htm');

    formData.append('payload_json', JSON.stringify({
      content: `**${currentUser}** ha compartido un reporte de misión ninjutsu (HTM):`
    }));

    fetch(ninjutsuReportWebhookURL, {
      method: "POST",
      body: formData
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }
        console.log("Reporte ninjutsu (HTM) enviado con éxito a Discord");
        sendResponse({ success: true, message: "Reporte ninjutsu enviado exitosamente" });
      })
      .catch(error => {
        console.error("Fallo al enviar reporte ninjutsu (HTM) a Discord:", error);
        sendResponse({ success: false, message: "Error al enviar", error: error.toString() });
      });

    return true;
  }

  if (request.action === "sendArmyReportPng") {
    console.log("Service Worker recibió el mensaje. Procesando envío de reporte de ejércitos a Discord...");

    const base64Data = request.imageData.split(',')[1];

    const byteCharacters = atob(base64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);

      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    const imageBlob = new Blob(byteArrays, { type: 'image/png' });

    const formData = new FormData();
    formData.append("file", imageBlob, 'ArmyReport.png');

    formData.append('payload_json', JSON.stringify({
      content: `**${currentUser}** ha compartido un reporte de ejércitos de la provincia de **${request.sourceUser}**:`
    }));

    fetch(armyReportWebhookURL, {
      method: "POST",
      body: formData
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }
        console.log("Reporte de ejércitos enviado con éxito a Discord");
        sendResponse({ success: true, message: "Reporte de ejércitos enviado exitosamente" });
      })
      .catch(error => {
        console.error("Fallo al enviar reporte de ejércitos a Discord:", error);
        sendResponse({ success: false, message: "Error al enviar", error: error.toString() });
      });

    return true;
  }

  if (request.action === "sendArmyReportHtm") {
    console.log("Service Worker recibió el mensaje. Procesando envío de reporte de ejércitos (HTM) a Discord...");

    const htmlBlob = new Blob([request.html], { type: 'text/html' });

    const formData = new FormData();
    formData.append("file", htmlBlob, 'ArmyReport.htm');

    formData.append('payload_json', JSON.stringify({
      content: `**${currentUser}** ha compartido un reporte de ejércitos de la provincia de **${request.sourceUser}**:`
    }));

    fetch(armyReportWebhookURL, {
      method: "POST",
      body: formData
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }
        console.log("Reporte de ejércitos (HTM) enviado con éxito a Discord");
        sendResponse({ success: true, message: "Reporte de ejércitos enviado exitosamente" });
      })
      .catch(error => {
        console.error("Fallo al enviar reporte de ejércitos (HTM) a Discord:", error);
        sendResponse({ success: false, message: "Error al enviar", error: error.toString() });
      });

    return true;
  }
});
