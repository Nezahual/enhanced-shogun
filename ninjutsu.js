// ninjutsu.js

function generateNinjutsuImage(reportElement) {
    const rect = reportElement.getBoundingClientRect();
    const originalWidth = reportElement.style.width;
    const originalMaxWidth = reportElement.style.maxWidth;
    reportElement.style.width = rect.width + 'px';
    reportElement.style.maxWidth = rect.width + 'px';

    return domtoimage.toPng(reportElement, {
        copyDefaultStyles: false,
        adjustClonedNode: (node, clonedNode) => {
            if (clonedNode.nodeType === 1) {
                const tag = clonedNode.tagName.toUpperCase();
                const text = clonedNode.textContent.trim();
                
                if (text.length > 0 && text.length < 40) {
                    if (['SPAN', 'B', 'STRONG', 'I', 'EM', 'A', 'LABEL'].includes(tag)) {
                        clonedNode.style.whiteSpace = 'nowrap';
                    }
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
    }).finally(() => {
        reportElement.style.width = originalWidth;
        reportElement.style.maxWidth = originalMaxWidth;
    });
}

function getNinjutsuHTML(reportElement) {
    const clon = document.createElement('html');
    const headClon = document.head.cloneNode(true);
    const bodyClon = document.createElement('body');

    Array.from(document.body.attributes).forEach(attr => bodyClon.setAttribute(attr.name, attr.value));

    const reportClon = reportElement.cloneNode(true);
    bodyClon.appendChild(reportClon);

    clon.appendChild(headClon);
    clon.appendChild(bodyClon);

    const urlBase = new URL(window.location.href);
    clon.querySelectorAll('[href], [src]').forEach(el => {
        if (el.hasAttribute('href')) {
            el.setAttribute('href', new URL(el.getAttribute('href'), urlBase).href);
        }
        if (el.hasAttribute('src')) {
            el.setAttribute('src', new URL(el.getAttribute('src'), urlBase).href);
        }
    });

    return '<!DOCTYPE html>\n' + clon.outerHTML;
}

function createNinjutsuPngWebhookBtn(reportId) {
    const btn = document.createElement('button');
    btn.className = 'shogun-custom-btn';
    btn.textContent = '🚀 Enviar a Discord (.png)';

    btn.addEventListener('click', () => {
        const reportElement = document.getElementById(`message-ninjutsu-report-details-${reportId}`);
        if (!reportElement) {
            console.error(`No se encontró el elemento message-ninjutsu-report-details-${reportId}`);
            btn.textContent = 'Error';
            setTimeout(() => { btn.textContent = '🚀 Enviar a Discord (.png)'; }, 2000);
            return;
        }

        btn.textContent = 'Generando...';
        btn.disabled = true;

        generateNinjutsuImage(reportElement)
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
                        btn.textContent = '🚀 Enviar a Discord (.png)';
                        btn.disabled = false;
                    }, 2000);
                });
            })
            .catch(function (error) {
                console.error('oops, algo salió mal al generar la imagen!', error);
                btn.textContent = 'Error';
                setTimeout(() => {
                    btn.textContent = '🚀 Enviar a Discord (.png)';
                    btn.disabled = false;
                }, 2000);
            });
    });

    return btn;
}

function createDownloadNinjutsuPngBtn(reportId) {
    const btn = document.createElement('button');
    btn.className = 'shogun-custom-btn';
    btn.title = 'Descargar reporte (.png)';

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
        btn.disabled = true;

        generateNinjutsuImage(reportElement)
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
                    btn.disabled = false;
                }, 1000);
            })
            .catch(function (error) {
                console.error('oops, algo salió mal al generar la imagen!', error);
                btn.style.backgroundColor = '#e74c3c'; // Rojo error
                setTimeout(() => {
                    btn.style.backgroundColor = originalBg;
                    btn.disabled = false;
                }, 1000);
            });
    });

    return btn;
}

function createNinjutsuHtmWebhookBtn(reportId) {
    const btn = document.createElement('button');
    btn.className = 'shogun-custom-btn';
    btn.textContent = '🚀 Enviar a Discord (.htm)';

    btn.addEventListener('click', () => {
        const reportElement = document.getElementById(`message-ninjutsu-report-details-${reportId}`);
        if (!reportElement) {
            console.error(`No se encontró el elemento message-ninjutsu-report-details-${reportId}`);
            btn.textContent = 'Error';
            setTimeout(() => { btn.textContent = '🚀 Enviar a Discord (.htm)'; }, 2000);
            return;
        }

        btn.textContent = 'Enviando...';
        btn.disabled = true;

        const htmlCompleto = getNinjutsuHTML(reportElement);

        chrome.runtime.sendMessage({
            action: "sendNinjutsuHtmReport",
            html: htmlCompleto
        }, (response) => {
            if (response && response.success) {
                btn.textContent = '¡Enviado!';
            } else {
                btn.textContent = 'Error';
                console.error('Error enviando a discord:', response ? response.error : 'Sin respuesta');
            }

            setTimeout(() => {
                btn.textContent = '🚀 Enviar a Discord (.htm)';
                btn.disabled = false;
            }, 2000);
        });
    });

    return btn;
}

function createDownloadNinjutsuHtmBtn(reportId) {
    const btn = document.createElement('button');
    btn.className = 'shogun-custom-btn';
    btn.title = 'Descargar reporte (.htm)';

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
        btn.disabled = true;

        const htmlCompleto = getNinjutsuHTML(reportElement);
        const blob = new Blob([htmlCompleto], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `NinjutsuReport-${reportId}.htm`;

        document.body.appendChild(a);
        a.click();

        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 0);

        btn.style.backgroundColor = '#43b581'; // Verde success
        setTimeout(() => {
            btn.style.backgroundColor = originalBg;
            btn.disabled = false;
        }, 1000);
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

        if (config.enableNinjutsuReportPng) {
            btnContainer.appendChild(createNinjutsuPngWebhookBtn(reportId));
        }

        if (config.enableDownloadNinjutsuReportPng) {
            btnContainer.appendChild(createDownloadNinjutsuPngBtn(reportId));
        }

        if (config.enableNinjutsuReportHtm) {
            btnContainer.appendChild(createNinjutsuHtmWebhookBtn(reportId));
        }

        if (config.enableDownloadNinjutsuReportHtm) {
            btnContainer.appendChild(createDownloadNinjutsuHtmBtn(reportId));
        }

        if (btnContainer.childNodes.length > 0) {
            // Insertamos el contenedor justo después del botón original
            submitBtn.insertAdjacentElement('afterend', btnContainer);
        }
    });
}
