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

        const rect = reportElement.getBoundingClientRect();

        // Fijar el ancho en el DOM real temporalmente
        const originalWidth = reportElement.style.width;
        const originalMaxWidth = reportElement.style.maxWidth;
        reportElement.style.width = rect.width + 'px';
        reportElement.style.maxWidth = rect.width + 'px';

        const computedStyle = window.getComputedStyle(reportElement);

        domtoimage.toPng(reportElement, {
            copyDefaultStyles: false,
            adjustClonedNode: (node, clonedNode) => {
                // Si el nodo clonado es un elemento HTML
                if (clonedNode.nodeType === 1) {
                    const tag = clonedNode.tagName.toUpperCase();
                    const text = clonedNode.textContent.trim();

                    // Si el texto es corto (menos de 40 caracteres), asumimos que es una insignia, nombre o valor 
                    // que NO debería saltar de línea bajo ninguna circunstancia.
                    if (text.length > 0 && text.length < 40) {
                        // Aplicamos nowrap a elementos en línea comunes
                        if (['SPAN', 'B', 'STRONG', 'I', 'EM', 'A', 'LABEL'].includes(tag)) {
                            clonedNode.style.whiteSpace = 'nowrap';
                        }
                        // Aplicamos nowrap a DIVs y Ps solo si son "hojas" (sin otros elementos HTML dentro)
                        else if (['DIV', 'P'].includes(tag) && clonedNode.children.length === 0) {
                            clonedNode.style.whiteSpace = 'nowrap';
                        }
                    }
                }
            },
            width: rect.width,
            height: rect.height,
            style: {
                width: rect.width + 'px',
                height: rect.height + 'px',
                margin: '0'
            }
        })
            .then(function (dataUrl) {
                // Restaurar el DOM real
                reportElement.style.width = originalWidth;
                reportElement.style.maxWidth = originalMaxWidth;

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
                // Restaurar el DOM real en caso de error
                reportElement.style.width = originalWidth;
                reportElement.style.maxWidth = originalMaxWidth;

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
