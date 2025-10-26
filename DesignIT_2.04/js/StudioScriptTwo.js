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
                    reference: item.Reference
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
            tab1Content: document.getElementById('tab1').querySelector('pre').textContent,
            tab2Content: document.getElementById('tab2').querySelector('pre').textContent,
            tab3Content: document.getElementById('tab3').querySelector('p').textContent,
        });

        // Accumulate content in the canvas
        canvas.innerHTML += data.html + '<br>';

        // Accumulate content in each tab
        document.getElementById('tab1').querySelector('pre').textContent += data.html + "\n";
        document.getElementById('tab2').querySelector('pre').textContent += data.css + "\n";
        document.getElementById('tab3').querySelector('p').textContent += data.reference + "\n";

        // Apply CSS inline for preview in the canvas
        const style = document.createElement('style');
        style.innerHTML = data.css;
        canvas.appendChild(style);
    });

    undoButton.addEventListener('click', () => {
        if (history.length > 0) {
            const lastState = history.pop();
            canvas.innerHTML = lastState.canvasContent;
            document.getElementById('tab1').querySelector('pre').textContent = lastState.tab1Content;
            document.getElementById('tab2').querySelector('pre').textContent = lastState.tab2Content;
            document.getElementById('tab3').querySelector('p').textContent = lastState.tab3Content;
        }
    });

    clearButton.addEventListener('click', () => {
        history.push({
            canvasContent: canvas.innerHTML,
            tab1Content: document.getElementById('tab1').querySelector('pre').textContent,
            tab2Content: document.getElementById('tab2').querySelector('pre').textContent,
            tab3Content: document.getElementById('tab3').querySelector('p').textContent,
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
        document.getElementById('tab1').querySelector('pre').textContent = '';
        document.getElementById('tab2').querySelector('pre').textContent = '';
        document.getElementById('tab3').querySelector('p').textContent = '';
    }
});

