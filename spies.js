// spies.js

function showExtraData() {
    const armiesBtns = Array.from(document.querySelectorAll('[id^="armies-strategy-profile"]'))
        .filter(btn => btn.textContent.trim() === 'Estadisticas del Ejército');
    const samurais = document.querySelectorAll('[id^="samurais-card-portrait-tooltip"]');

    armiesBtns.forEach(btn => {
        /*btn.addEventListener('click', function () {
            const infoDiv = this.nextElementSibling;

            if (infoDiv && infoDiv.tagName === 'DIV')
                infoDiv.className = '';
        });*/
        btn.setAttribute('onclick', "const infoDiv = this.nextElementSibling; if (infoDiv && infoDiv.tagName === 'DIV') infoDiv.className = '';");
    });

    samurais.forEach(sam => sam.className = '');
}

function createSpyWebhookBtn() {
    const btn = document.createElement('button');
    btn.className = 'shogun-custom-btn';
    btn.textContent = '🚀 Enviar a Discord';

    btn.addEventListener('click', () => {
        btn.textContent = 'Enviando...';
        btn.disabled = true;

        showExtraData();

        const spiedUserEl = document.querySelector('h3.text-2xl.font-bold.text-white');
        const spiedUser = spiedUserEl ? spiedUserEl.textContent.trim() : 'Unknown';
        const htmlCompleto = getFullHTML();

        chrome.runtime.sendMessage({
            action: "sendSpyReport",
            html: htmlCompleto,
            spiedUser: spiedUser
        }, (response) => {
            if (response && response.success) {
                btn.textContent = '¡Enviado!';
            } else {
                btn.textContent = 'Error';
            }

            setTimeout(() => {
                btn.textContent = '🚀 Enviar a Discord';
                btn.disabled = false;
            }, 2000);
        });
    });

    return btn;
}

function createDownloadSpyBtn() {
    const btn = document.createElement('button');
    btn.className = 'shogun-custom-btn';
    btn.title = 'Descargar reporte';

    const icon = document.createElement('img');
    icon.src = chrome.runtime.getURL('images/download16.png');
    icon.style.width = '16px';
    icon.style.height = '16px';
    icon.style.display = 'block';

    btn.appendChild(icon);

    btn.style.padding = '6px 10px';
    btn.style.marginLeft = '4px';

    btn.addEventListener('click', () => {
        showExtraData();

        const spiedUserEl = document.querySelector('h3.text-2xl.font-bold.text-white');
        const spiedUser = spiedUserEl ? spiedUserEl.textContent.trim() : 'Unknown';

        const htmlCompleto = getFullHTML();

        const blob = new Blob([htmlCompleto], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ShogunSpyReport - ${spiedUser}.htm`;

        document.body.appendChild(a);
        a.click();

        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 0);

        btn.style.backgroundColor = '#43b581'; // Verde success
        setTimeout(() => {
            btn.style.backgroundColor = '';
        }, 1000);
    });

    return btn;
}

function injectSpyBtns() {
    if (!window.location.href.includes('/profile') || window.location.href.includes('clan')) return;

    const targetDiv = document.querySelector('div.inline-flex.flex-wrap.items-center.gap-1');

    if (!targetDiv) {
        return;
    }

    if (document.querySelector('.shogun-spy-btns-container')) {
        return;
    }

    const btnContainer = document.createElement('div');
    btnContainer.className = 'shogun-spy-btns-container';
    btnContainer.style.display = 'inline-flex';
    btnContainer.style.alignItems = 'center';

    // Lo insertamos en el targetDiv original (que tiene clase de flex con gap)
    if (config.enableSpyReport) {
        btnContainer.appendChild(createSpyWebhookBtn());
    }

    if (config.enableDownloadSpyReport) {
        btnContainer.appendChild(createDownloadSpyBtn());
    }

    if (btnContainer.childNodes.length > 0) {
        const links = targetDiv.querySelectorAll('a');
        if (links.length > 0) {
            const ultimoLink = links[links.length - 1];
            ultimoLink.insertAdjacentElement('afterend', btnContainer);
        } else {
            targetDiv.appendChild(btnContainer);
        }
    }
}

function getFullHTML() {
    let clon = document.documentElement.cloneNode(true);
    const urlBase = new URL(window.location.href);

    clon.querySelectorAll('[href], [src]').forEach(el => {
        if (el.hasAttribute('href')) {
            el.setAttribute('href', new URL(el.getAttribute('href'), urlBase).href);
        }
        if (el.hasAttribute('src')) {
            el.setAttribute('src', new URL(el.getAttribute('src'), urlBase).href);
        }
    });

    return clon.outerHTML;
}
