// battles.js

function createBattleReportBtn(battleId) {
    const btn = document.createElement('button');
    btn.className = 'shogun-custom-btn shogun-battle-report-btn';
    btn.textContent = '🚀 Enviar a Discord';

    btn.addEventListener('click', (e) => {
        e.preventDefault();
        btn.textContent = 'Enviando...';
        btn.disabled = true;

        chrome.runtime.sendMessage({
            action: "sendBattleReport",
            battleId: battleId
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

function createCopyBattleReportBtn(battleId) {
    const btn = document.createElement('button');
    btn.className = 'shogun-custom-btn shogun-copy-report-btn';
    btn.title = 'Copiar enlace al portapapeles';

    const icon = document.createElement('img');
    icon.src = chrome.runtime.getURL('images/copyToClipboard16.png');
    icon.style.width = '16px';
    icon.style.height = '16px';
    icon.style.display = 'block';

    btn.appendChild(icon);

    // Ajustes específicos para que solo sea un icono
    btn.style.padding = '6px 10px';
    btn.style.marginLeft = '4px';

    btn.addEventListener('click', (e) => {
        e.preventDefault();

        const url = `https://shogunsreturn.com/battle-reports/battle/${battleId}`;
        navigator.clipboard.writeText(url).then(() => {
            // Feedback visual rápido
            btn.style.backgroundColor = '#43b581'; // Verde discord success
            setTimeout(() => {
                btn.style.backgroundColor = ''; // Restaura por css original
            }, 1000);
        }).catch(err => console.error("Error al copiar al portapapeles:", err));
    });

    return btn;
}

function injectBattleBtns() {
    // Verificamos que estamos en la URL de historial
    if (!window.location.href.includes('/history')) return;

    const containers = document.querySelectorAll('[id^="armies-history-battle"][id$="summary"]');

    if (containers.length > 0) {
        containers.forEach((container) => {
            const secondChild = container.children[1];

            // Inyectamos el contenedor si no existe ya
            if (secondChild && !container.querySelector('.shogun-battle-btns-container')) {
                const btnContainer = document.createElement('div');
                btnContainer.className = 'shogun-battle-btns-container';
                btnContainer.style.marginTop = '8px'; // Añadimos algo de margen para que respire
                btnContainer.style.display = 'inline-flex';
                btnContainer.style.alignItems = 'center';

                const battleId = container.getAttribute('data-battle-id');
                if (battleId) {
                    if (config.enableBattleReport) {
                        btnContainer.appendChild(createBattleReportBtn(battleId));
                    }
                    if (config.enableCopyBattleReport) {
                        btnContainer.appendChild(createCopyBattleReportBtn(battleId));
                    }

                    // Si hemos añadido al menos un botón
                    if (btnContainer.childNodes.length > 0) {
                        secondChild.classList.remove("w-sm");
                        secondChild.insertAdjacentElement('afterend', btnContainer);
                    }
                }
            }
        });
    }
}
