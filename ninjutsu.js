// ninjutsu.js

function createNinjutsuWebhookBtn(reportId) {
    const btn = document.createElement('button');
    btn.className = 'shogun-custom-btn';
    btn.textContent = '🚀 Enviar a Discord';

    btn.addEventListener('click', () => {
        const reportElement = document.getElementById(`message-ninjutsu-report-details-${reportId}`);
        if (!reportElement) {
            console.error(`No se encontró el elemento message-ninjutsu-report-details-${reportId}`);
            btn.textContent = 'Error';
            setTimeout(() => { btn.textContent = '🚀 Enviar a Discord'; }, 2000);
            return;
        }

        btn.textContent = 'Generando...';
        btn.disabled = true;

        domtoimage.toPng(reportElement, {
            copyDefaultStyles: false
        })
            .then(function (dataUrl) {
                btn.textContent = 'Enviando...';

                chrome.runtime.sendMessage({
                    action: "sendNinjutsuMissionReport",
                    imageData: dataUrl
                }, (response) => {
                    if (response && response.success) {
                        btn.textContent = '¡Enviado!';
                    } else {
                        btn.textContent = 'Error';
                        console.error('Error enviando a discord:', response ? response.error : 'Sin respuesta');
                    }

                    setTimeout(() => {
                        btn.textContent = '🚀 Enviar a Discord';
                        btn.disabled = false;
                    }, 2000);
                });
            })
            .catch(function (error) {
                console.error('oops, algo salió mal al generar la imagen!', error);
                btn.textContent = 'Error';
                setTimeout(() => {
                    btn.textContent = '🚀 Enviar a Discord';
                    btn.disabled = false;
                }, 2000);
            });
    });

    return btn;
}

function createDownloadNinjutsuBtn(reportId) {
    const btn = document.createElement('button');
    btn.className = 'shogun-custom-btn';
    btn.title = 'Descargar reporte (PNG)';

    const icon = document.createElement('img');
    icon.src = chrome.runtime.getURL('images/download16.png');
    icon.style.width = '16px';
    icon.style.height = '16px';
    icon.style.display = 'block';

    btn.appendChild(icon);

    btn.style.padding = '6px 10px';
    btn.style.marginLeft = '4px';

    btn.addEventListener('click', () => {
        const reportElement = document.getElementById(`message-ninjutsu-report-details-${reportId}`);
        if (!reportElement) {
            console.error(`No se encontró el elemento message-ninjutsu-report-details-${reportId}`);
            return;
        }

        const originalBg = btn.style.backgroundColor;
        btn.style.backgroundColor = '#ccc';

        domtoimage.toPng(reportElement, { copyDefaultStyles: false })
            .then(function (dataUrl) {
                const a = document.createElement('a');
                a.href = dataUrl;
                a.download = `NinjutsuReport-${reportId}.png`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);

                btn.style.backgroundColor = '#43b581'; // Verde success
                setTimeout(() => {
                    btn.style.backgroundColor = originalBg;
                }, 1000);
            })
            .catch(function (error) {
                console.error('oops, algo salió mal al generar la imagen!', error);
                btn.style.backgroundColor = '#e74c3c'; // Rojo error
                setTimeout(() => {
                    btn.style.backgroundColor = originalBg;
                }, 1000);
            });
    });

    return btn;
}

function injectNinjutsuBtns() {
    // Buscamos todos los botones que empiecen por "message-ninjutsu-review-submit-"
    const submitBtns = document.querySelectorAll('button[id^="message-ninjutsu-review-submit-"]');

    submitBtns.forEach(submitBtn => {
        // Evitamos inyectar múltiples veces verificando si ya existe nuestro contenedor
        if (submitBtn.nextElementSibling && submitBtn.nextElementSibling.classList.contains('shogun-ninjutsu-btns-container')) {
            return;
        }

        const btnId = submitBtn.id;
        const reportId = btnId.split('-').pop();

        const btnContainer = document.createElement('div');
        btnContainer.className = 'shogun-ninjutsu-btns-container';
        btnContainer.style.display = 'inline-flex';
        btnContainer.style.alignItems = 'center';
        btnContainer.style.marginLeft = '8px'; // Espacio con el botón original

        if (config.enableNinjutsuReport) {
            btnContainer.appendChild(createNinjutsuWebhookBtn(reportId));
        }

        if (config.enableDownloadNinjutsuReport) {
            btnContainer.appendChild(createDownloadNinjutsuBtn(reportId));
        }

        if (btnContainer.childNodes.length > 0) {
            // Insertamos el contenedor justo después del botón original
            submitBtn.insertAdjacentElement('afterend', btnContainer);
        }
    });
}
