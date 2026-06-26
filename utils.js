// utils.js

function generateReportImage(reportElement) {
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

function cleanResourceUrls(html) {
    return html
        .replace(/images\/logo-[a-fA-F0-9]+\.png(?:\?vsn=[a-zA-Z0-9_]+)?/g, 'images/logo.png')
        .replace(/assets\/css\/app-[a-fA-F0-9]+\.css(?:\?vsn=[a-zA-Z0-9_]+)?/g, 'assets/css/app.css')
        .replace(/assets\/js\/app-[a-fA-F0-9]+\.js(?:\?vsn=[a-zA-Z0-9_]+)?/g, 'assets/js/app.js');
}

function getReportHTML(reportElement) {
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

    return cleanResourceUrls('<!DOCTYPE html>\n' + clon.outerHTML);
}
