/**
 * CanvasManager - Handles canvas operations and component dropping
 */
class CanvasManager {
    constructor(historyManager, notificationManager) {
        this.historyManager = historyManager;
        this.notificationManager = notificationManager;
        this.canvas = null;
        this.init();
    }

    /**
     * Initialize canvas manager
     */
    init() {
        this.canvas = document.getElementById('canvas');
        if (!this.canvas) {
            console.error('Canvas element not found');
            return;
        }

        this.bindEvents();
    }

    /**
     * Bind canvas events
     */
    bindEvents() {
        if (!this.canvas) return;

        this.canvas.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.canvas.addEventListener('drop', (e) => this.handleDrop(e));
        this.canvas.addEventListener('dragenter', (e) => this.handleDragEnter(e));
        this.canvas.addEventListener('dragleave', (e) => this.handleDragLeave(e));
    }

    /**
     * Handle drag over event
     * @param {DragEvent} e - Drag event
     */
    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    }

    /**
     * Handle drag enter event
     * @param {DragEvent} e - Drag event
     */
    handleDragEnter(e) {
        e.preventDefault();
        this.canvas.classList.add('drag-over');
    }

    /**
     * Handle drag leave event
     * @param {DragEvent} e - Drag event
     */
    handleDragLeave(e) {
        // Only remove class if we're actually leaving the canvas
        if (!this.canvas.contains(e.relatedTarget)) {
            this.canvas.classList.remove('drag-over');
        }
    }

    /**
     * Handle drop event
     * @param {DragEvent} e - Drop event
     */
    handleDrop(e) {
        e.preventDefault();
        this.canvas.classList.remove('drag-over');

        try {
            const dataString = e.dataTransfer.getData('text/html');
            if (!dataString) {
                throw new Error('No data received');
            }

            const data = JSON.parse(dataString);
            this.addComponent(data);

        } catch (error) {
            console.error('Error handling drop:', error);
        }
    }

    /**
     * Add component to canvas
     * @param {Object} data - Component data
     */
    addComponent(data) {
        if (!this.canvas) return;

        // Save current state to history
        if (this.historyManager) {
            this.historyManager.saveState();
        }

        // Add HTML to canvas
        const componentWrapper = this.createComponentWrapper(data);
        this.canvas.appendChild(componentWrapper);

        // Update tabs
        this.updateTabs(data);

        // Apply CSS
        this.applyComponentCSS(data.css);
    }

    /**
     * Create a wrapper for the component
     * @param {Object} data - Component data
     * @returns {HTMLElement} Component wrapper
     */
    createComponentWrapper(data) {
        const wrapper = document.createElement('div');
        wrapper.className = 'component-wrapper';
        wrapper.innerHTML = data.html;
        
        // Add data attributes for identification
        wrapper.setAttribute('data-component-title', data.title || 'Component');
        
        return wrapper;
    }

    /**
     * Update tab contents with new component data
     * @param {Object} data - Component data
     */
    updateTabs(data) {
        // Update HTML tab
        const htmlTab = document.getElementById('tab1');
        if (htmlTab) {
            const preElement = htmlTab.querySelector('pre');
            if (preElement) {
                // Add spacing between components if there's already content
                if (preElement.textContent.trim()) {
                    preElement.textContent += "\n\n";
                }
                preElement.textContent += data.html + "\n";
                
                // Update visibility after adding content
                this.updatePreElementVisibility(htmlTab);
            }
        }

        // Update CSS tab
        const cssTab = document.getElementById('tab2');
        if (cssTab) {
            const preElement = cssTab.querySelector('pre');
            if (preElement) {
                // Add spacing between components if there's already content
                if (preElement.textContent.trim()) {
                    preElement.textContent += "\n\n";
                }
                preElement.textContent += data.css + "\n";
                
                // Update visibility after adding content
                this.updatePreElementVisibility(cssTab);
            }
        }

        // Update Reference tab
        const referenceTab = document.getElementById('tab3');
        if (referenceTab) {
            const divElement = referenceTab.querySelector('div');
            if (divElement) {
                // Create a labeled reference entry
                const referenceEntry = document.createElement('div');
                referenceEntry.className = 'reference-entry';
                referenceEntry.style.marginBottom = '1rem';
                referenceEntry.style.paddingBottom = '0.5rem';
                referenceEntry.style.borderBottom = '1px solid #e0e0e0';

                // Add component title as label
                const label = document.createElement('h4');
                label.textContent = data.title;
                label.style.margin = '0 0 0.5rem 0';
                label.style.fontSize = '14px';
                label.style.fontWeight = 'bold';
                label.style.color = '#333';
                referenceEntry.appendChild(label);

                // Process the reference text to make URLs clickable
                const referenceContent = this.createClickableReference(data.reference);
                referenceEntry.appendChild(referenceContent);

                divElement.appendChild(referenceEntry);
            }
        }
    }

    /**
     * Check if CSS content already has a comment at the beginning
     * @param {string} css - CSS content to check
     * @returns {boolean} True if CSS starts with a comment
     */
    cssHasComment(css) {
        if (!css) return false;
        const trimmedCss = css.trim();
        return trimmedCss.startsWith('/*');
    }

    /**
     * Add a visual separator between code sections
     * @param {HTMLElement} preElement - The pre element to add separator to
     * @param {string} componentTitle - Title of the component
     */
    addCodeSeparator(preElement, componentTitle) {
        // Check if this is the first element (empty content)
        const isFirstElement = !preElement.textContent.trim();
        
        // Add appropriate separator based on whether it's first or subsequent
        const separatorText = isFirstElement 
            ? `/* ===== ${componentTitle} ===== */\n\n`
            : `\n\n/* ===== ${componentTitle} ===== */\n\n`;
            
        preElement.textContent += separatorText;
    }

    /**
     * Create clickable reference content from reference text
     * @param {string} referenceText - Reference text that may contain URLs
     * @returns {HTMLElement} Element with clickable links
     */
    createClickableReference(referenceText) {
        const container = document.createElement('div');
        container.style.fontSize = '13px';
        container.style.lineHeight = '1.4';

        // URL regex pattern
        const urlPattern = /(https?:\/\/[^\s\n]+)/g;
        
        // Split text by URLs and create elements
        const parts = referenceText.split(urlPattern);
        
        parts.forEach(part => {
            if (part.match(urlPattern)) {
                // This is a URL - create a clickable link
                const link = document.createElement('a');
                link.href = part.trim();
                link.textContent = part.trim();
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                link.style.color = '#007acc';
                link.style.textDecoration = 'underline';
                link.style.wordBreak = 'break-all';
                container.appendChild(link);
            } else if (part.trim()) {
                // This is regular text
                const textNode = document.createElement('span');
                textNode.textContent = part;
                container.appendChild(textNode);
            }
        });

        return container;
    }

    /**
     * Apply CSS for the component
     * @param {string} css - CSS content
     */
    applyComponentCSS(css) {
        if (!css || !this.canvas) return;

        const style = document.createElement('style');
        style.innerHTML = css;
        style.setAttribute('data-component-style', 'true');
        this.canvas.appendChild(style);
    }

    /**
     * Clear the canvas
     */
    clear() {
        if (!this.canvas) return;

        // Save current state to history
        if (this.historyManager) {
            this.historyManager.saveState();
        }

        // Reset canvas content
        this.canvas.innerHTML = '<h3>Canvas</h3>';

        // Clear tabs
        this.clearTabs();
    }

    /**
     * Clear all tab contents
     */
    clearTabs() {
        const tabs = ['tab1', 'tab2', 'tab3'];
        tabs.forEach(tabId => {
            const tab = document.getElementById(tabId);
            if (tab) {
                const preElement = tab.querySelector('pre');
                const pElement = tab.querySelector('p');
                const divElement = tab.querySelector('div');
                
                if (preElement) {
                    preElement.textContent = '';
                }
                if (pElement) {
                    pElement.textContent = '';
                }
                if (divElement) {
                    divElement.innerHTML = '<p></p>'; // Reset to original structure
                }
                
                // Update visibility of pre elements
                this.updatePreElementVisibility(tab);
            }
        });
    }

    /**
     * Update visibility of pre elements based on content
     * @param {HTMLElement} tab - Tab element to check
     */
    updatePreElementVisibility(tab) {
        const preElement = tab.querySelector('pre');
        if (preElement) {
            const hasContent = preElement.textContent.trim().length > 0;
            preElement.style.display = hasContent ? '' : 'none';
        }
    }

    /**
     * Get canvas content without header
     * @returns {string} Canvas HTML content
     */
    getCanvasContent() {
        if (!this.canvas) return '';
        
        return this.canvas.innerHTML.replace('<h3>Canvas</h3>', '');
    }

    /**
     * Get all component styles
     * @returns {string} Combined CSS content
     */
    getComponentStyles() {
        if (!this.canvas) return '';

        const styles = this.canvas.querySelectorAll('style[data-component-style="true"]');
        return Array.from(styles).map(style => style.innerHTML).join('\n');
    }

    /**
     * Set canvas content
     * @param {string} content - HTML content
     */
    setCanvasContent(content) {
        if (!this.canvas) return;
        
        this.canvas.innerHTML = content;
    }
}

export default CanvasManager;