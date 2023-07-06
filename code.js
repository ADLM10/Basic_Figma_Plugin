
// This shows the HTML page in "ui.html".
figma.showUI(__html__);

figma.ui.resize(420, 400);

// Get CSS for the selected frame
async function getCSS(frame) {
    const cssData = await frame.getCSSAsync();
    cssData["position"] = "absolute";
    cssData["top"] = `${frame.y}px`;
    cssData["left"] = `${frame.x}px`;
    return `.${frame.name.replace(/\s/g, "")} { ${Object.keys(cssData).map(key => `${key}: ${cssData[key]};`).join(' ')} }`
}

async function generateHTMLCSS(frame) {
    let html = '';
    let css = '';

    // Generate HTML code for the selected frame
    html += `<div class="${frame.name.replace(/\s/g, "")}">`;

    css += await getCSS(frame);

    // Generate HTML code for child frames
    for (const child of frame.children) {
        if (child.type === 'FRAME') {
            html += `<div class="${child.name.replace(/\s/g, "")}">`;
            css += await getCSS(child);
        }
        if (child.type === 'TEXT') {
            html += `<p class="${child.name.replace(/\s/g, "")}">${child.characters}</p>`;
            css += await getCSS(child);
        }
        if (child.type === 'RECTANGLE') {
            html += `<div class="${child.name.replace(/\s/g, "")}"></div>`;
            css += await getCSS(child);
        }
        if (child.type === 'IMAGE') {
            html += `<img class="${child.name.replace(/\s/g, "")}" src="${child.fills[0].imageHash}"/>`;
            css += await getCSS(child);
        }
    }

    html += `</div>`;

    return `<!DOCTYPE html><html><head><style>${css}</style></head><body>${html}</body></html>`;

}

figma.ui.onmessage = msg => {

    if (msg.type === 'export') {
        const selectedFrame = figma.currentPage.selection[0];
        console.log(selectedFrame)
        if (selectedFrame && selectedFrame.type === 'FRAME') {
            generateHTMLCSS(selectedFrame)
                .then(html => {
                    figma.ui.postMessage({
                        type: 'success',
                        html: html,
                        frameName: `${selectedFrame.name}`
                    });
                })
        } else {
            figma.ui.postMessage({ type: 'error', message: 'Please select a frame.' });
        }

    };
};



