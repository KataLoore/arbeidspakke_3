fetch('./data/components.json')
    .then(response => response.json())
    .then(data => {
        const elementsContainer = document.querySelector('.menu');
        data.forEach(item => {
            const element = document.createElement('div');
            element.className = 'element';
            element.draggable = true;
            element.setAttribute('data-html', item.HTML);
            element.setAttribute('data-css', item.CSS);
            element.setAttribute('data-reference', item.Reference);
            element.textContent = item.Title;
            elementsContainer.appendChild(element);

            element.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/html', JSON.stringify({
                    html: item.HTML,
                    css: item.CSS,
                    reference: item.Reference,
                    title: item.Title
                }));
            });
        });
    });

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('canvas');
    const undoButton = document.getElementById('undo');
    const clearButton = document.getElementById('clear');
    const exportButton = document.getElementById('export');
    let history = [];

    canvas.addEventListener('dragover', (e) => e.preventDefault());

    canvas.addEventListener('drop', (e) => {
        e.preventDefault();
        const data = JSON.parse(e.dataTransfer.getData('text/html'));

        history.push({
            canvasContent: canvas.innerHTML,
            tab1Content: document.getElementById('tab1').querySelector('pre').innerHTML,
            tab2Content: document.getElementById('tab2').querySelector('pre').innerHTML,
            tab3Content: document.getElementById('tab3').querySelector('p').innerHTML,
        });

        // Accumulate content in the canvas
        canvas.innerHTML += data.html + '<br>';

        // Accumulate content in each tab
        const htmlPre = document.getElementById('tab1').querySelector('pre');
        const cssPre = document.getElementById('tab2').querySelector('pre');
        
        // Add separators for visual clarity (but not copied)
        if (htmlPre.textContent.trim() !== '') {
            // Add a visual separator in HTML tab
            const htmlSeparator = document.createElement('div');
            htmlSeparator.className = 'code-separator';
            htmlPre.appendChild(htmlSeparator);
        }
        
        // Add HTML content
        const htmlContent = document.createTextNode(data.html + "\n");
        htmlPre.appendChild(htmlContent);
        
        if (cssPre.textContent.trim() !== '') {
            // Add a visual separator in CSS tab
            const cssSeparator = document.createElement('div');
            cssSeparator.className = 'code-separator';
            cssPre.appendChild(cssSeparator);
        }
        
        // Add CSS content
        const cssContent = document.createTextNode(data.css + "\n");
        cssPre.appendChild(cssContent);
        
        // Improved reference formatting with element labels
        const referenceContainer = document.getElementById('tab3').querySelector('p');
        const elementTitle = data.title || 'Element'; // Use the actual element title
        const referenceUrl = data.reference.includes('http') ? data.reference.split(' ').find(word => word.includes('http')) : data.reference;
        
        const referenceEntry = document.createElement('div');
        referenceEntry.className = 'reference-entry';
        referenceEntry.innerHTML = `
            <div class="reference-label">${elementTitle}</div>
            <a href="${referenceUrl}" class="reference-link" target="_blank">${referenceUrl}</a>
        `;
        referenceContainer.appendChild(referenceEntry);

        // Apply CSS inline for preview in the canvas
        const style = document.createElement('style');
        style.innerHTML = data.css;
        canvas.appendChild(style);
    });

    undoButton.addEventListener('click', () => {
        if (history.length > 0) {
            const lastState = history.pop();
            canvas.innerHTML = lastState.canvasContent;
            document.getElementById('tab1').querySelector('pre').innerHTML = lastState.tab1Content;
            document.getElementById('tab2').querySelector('pre').innerHTML = lastState.tab2Content;
            document.getElementById('tab3').querySelector('p').innerHTML = lastState.tab3Content;
        }
    });

    clearButton.addEventListener('click', () => {
        history.push({
            canvasContent: canvas.innerHTML,
            tab1Content: document.getElementById('tab1').querySelector('pre').innerHTML,
            tab2Content: document.getElementById('tab2').querySelector('pre').innerHTML,
            tab3Content: document.getElementById('tab3').querySelector('p').innerHTML,
        });

        canvas.innerHTML = '<h3>Canvas</h3>';
        clearTabs();
    });

    exportButton.addEventListener('click', () => {
        // Collect the HTML content of the canvas, excluding the <h3>Canvas</h3> header
        const canvasContent = canvas.innerHTML.replace('<h3>Canvas</h3>', '');

        // Gather all CSS from the canvas styles
        const cssContent = Array.from(canvas.querySelectorAll('style')).map(style => style.innerHTML).join("\n");

        // Remove all <style> elements from the canvas content
        const contentWithoutStyle = canvasContent.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');

        // Create the full HTML with inline CSS in the <head>
        const fullHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Exported Design</title>
<style>${cssContent}</style>
</head>
<body>
${contentWithoutStyle}
</body>
</html>`;

        // Create a Blob with the HTML content
        const blob = new Blob([fullHTML], { type: 'text/html' });
        const url = URL.createObjectURL(blob);

        // Open the Blob URL in a new tab
        window.open(url, '_blank');
    });

    function openTab(evt, tabName) {
        const tabContents = document.getElementsByClassName("tab-content");
        for (let i = 0; i < tabContents.length; i++) {
            tabContents[i].classList.remove("active");
        }
        const tabLinks = document.getElementsByClassName("tab");
        for (let i = 0; i < tabLinks.length; i++) {
            tabLinks[i].classList.remove("active-tab");
        }
        document.getElementById(tabName).classList.add("active");
        evt.currentTarget.classList.add("active-tab");
    }

    document.addEventListener('DOMContentLoaded', function() {
        document.querySelector('.tab').click();
    });

    function clearTabs() {
        document.getElementById('tab1').querySelector('pre').innerHTML = '';
        document.getElementById('tab2').querySelector('pre').innerHTML = '';
        document.getElementById('tab3').querySelector('p').innerHTML = '';
    }
});

