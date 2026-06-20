// armies.js

function getArmyTargetElement(btn) {
    // btn -> btnWrapper -> wrapper
    const wrapper = btn.closest('.shogun-army-wrapper');
    if (!wrapper) return null;

    const container = wrapper.nextElementSibling;
    if (!container) return null;

    // Si tiene un solo hijo, devolvemos el hijo. Si no, el contenedor.
    if (container.children.length === 1) {
        return container.children[0];
    }
    return container;
}

function createArmyPngWebhookBtn() {
    const btn = document.createElement('button');
    btn.className = 'shogun-custom-btn';
    btn.textContent = '🚀 Enviar a Discord (.png)';

    btn.addEventListener('click', () => {
        const targetElement = getArmyTargetElement(btn);
        if (!targetElement) {
            console.error('No se encontró el elemento objetivo para el reporte de ejército');
            btn.textContent = 'Error';
            setTimeout(() => { btn.textContent = '🚀 Enviar a Discord (.png)'; }, 2000);
            return;
        }

        btn.textContent = 'Generando...';
        btn.disabled = true;

        generateReportImage(targetElement)
            .then(function (dataUrl) {
                btn.textContent = 'Enviando...';

                chrome.runtime.sendMessage({
                    action: "sendArmyReportPng",
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

function createDownloadArmyPngBtn() {
    const btn = document.createElement('button');
    btn.className = 'shogun-custom-btn';
    btn.title = 'Descargar reporte (.png)';
    btn.style.marginLeft = '0px';

    const icon = document.createElement('img');
    icon.src = chrome.runtime.getURL('images/download16.png');
    icon.style.width = '16px';
    icon.style.height = '16px';
    icon.style.display = 'block';

    btn.appendChild(icon);

    btn.style.padding = '6px 10px';

    btn.addEventListener('click', () => {
        const targetElement = getArmyTargetElement(btn);
        if (!targetElement) {
            console.error('No se encontró el elemento objetivo para el reporte de ejército');
            return;
        }

        const originalBg = btn.style.backgroundColor;
        btn.style.backgroundColor = '#ccc';
        btn.disabled = true;

        generateReportImage(targetElement)
            .then(function (dataUrl) {
                const a = document.createElement('a');
                a.href = dataUrl;
                a.download = `ArmyReport-${Date.now()}.png`;
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

function createArmyHtmWebhookBtn() {
    const btn = document.createElement('button');
    btn.className = 'shogun-custom-btn';
    btn.textContent = '🚀 Enviar a Discord (.htm)';
    btn.style.marginLeft = '0px';

    btn.addEventListener('click', () => {
        const targetElement = getArmyTargetElement(btn);
        if (!targetElement) {
            console.error('No se encontró el elemento objetivo para el reporte de ejército');
            btn.textContent = 'Error';
            setTimeout(() => { btn.textContent = '🚀 Enviar a Discord (.htm)'; }, 2000);
            return;
        }

        btn.textContent = 'Enviando...';
        btn.disabled = true;

        const htmlCompleto = getReportHTML(targetElement);

        chrome.runtime.sendMessage({
            action: "sendArmyReportHtm",
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

function createDownloadArmyHtmBtn() {
    const btn = document.createElement('button');
    btn.className = 'shogun-custom-btn';
    btn.title = 'Descargar reporte (.htm)';
    btn.style.marginLeft = '0px';

    const icon = document.createElement('img');
    icon.src = chrome.runtime.getURL('images/download16.png');
    icon.style.width = '16px';
    icon.style.height = '16px';
    icon.style.display = 'block';

    btn.appendChild(icon);

    btn.style.padding = '6px 10px';

    btn.addEventListener('click', () => {
        const targetElement = getArmyTargetElement(btn);
        if (!targetElement) {
            console.error('No se encontró el elemento objetivo para el reporte de ejército');
            return;
        }

        const originalBg = btn.style.backgroundColor;
        btn.style.backgroundColor = '#ccc';
        btn.disabled = true;

        const htmlCompleto = getReportHTML(targetElement);
        const blob = new Blob([htmlCompleto], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ArmyReport-${Date.now()}.htm`;

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

function injectArmiesBtns() {
    const selectors = [
        '#profile-incoming-attacks h4',
        '#profile-incoming-movements h4',
        '#profile-stationed-armies h4'
    ];

    let targetH4s = [];
    selectors.forEach(selector => {
        const el = document.querySelector(selector);
        if (el) targetH4s.push(el);
    });

    // Buscar el h4 de CASA
    const exactClassH4s = document.querySelectorAll('h4.mb-4.flex.items-center.gap-2.border-b.border-shogun-gold\\/20.pb-2.font-shogun.text-lg.uppercase.tracking-wider.text-shogun-gold');

    let casaH4 = Array.from(exactClassH4s).find(h4 => !h4.textContent.includes('Reserva'));

    if (!casaH4) {
        const allH4s = document.querySelectorAll('h4');
        casaH4 = Array.from(allH4s).find(h4 => h4.textContent.includes('CASA'));
    }
    if (casaH4) targetH4s.push(casaH4);

    targetH4s.forEach(h4 => {
        // Verificar si ya inyectamos el wrapper
        if (h4.parentElement && h4.parentElement.classList.contains('shogun-army-wrapper')) {
            return;
        }

        // Copiamos dinámicamente las clases del h4 referentes a márgenes, padding, borde y flex
        const originalClasses = Array.from(h4.classList).filter(c =>
            c.startsWith('mb-') ||
            c.startsWith('pb-') ||
            c.startsWith('border-') ||
            c === 'flex' ||
            c === 'items-center'
        );

        h4.style.display = 'inline-flex';
        h4.style.borderBottom = 'none';
        h4.style.marginBottom = '0';
        h4.style.paddingBottom = '0';

        const wrapper = document.createElement('div');
        wrapper.className = `shogun-army-wrapper ${originalClasses.join(' ')}`;

        // Aseguramos que el wrapper sea un contenedor flex para organizar el h4 y los botones
        wrapper.style.display = 'flex';
        wrapper.style.alignItems = 'center';

        const btnWrapper = document.createElement('div');
        btnWrapper.className = 'shogun-army-btns-container';
        btnWrapper.style.display = 'flex';
        btnWrapper.style.alignItems = 'center';
        btnWrapper.style.gap = '8px';
        //btnWrapper.style.marginLeft = 'auto'; // Lo empuja hacia la derecha

        if (config.enableArmyReportPng) {
            btnWrapper.appendChild(createArmyPngWebhookBtn());
        }

        if (config.enableDownloadArmyReportPng) {
            btnWrapper.appendChild(createDownloadArmyPngBtn());
        }

        if (config.enableArmyReportHtm) {
            btnWrapper.appendChild(createArmyHtmWebhookBtn());
        }

        if (config.enableDownloadArmyReportHtm) {
            btnWrapper.appendChild(createDownloadArmyHtmBtn());
        }

        if (btnWrapper.childNodes.length > 0) {
            h4.parentNode.insertBefore(wrapper, h4);
            wrapper.appendChild(h4);
            wrapper.appendChild(btnWrapper);
        }
    });
}
