/**
 * HistoryManager - Handles undo/redo functionality
 */
class HistoryManager {
    constructor(canvasManager, notificationManager) {
        this.canvasManager = canvasManager;
        this.notificationManager = notificationManager;
        this.history = [];
        this.maxHistorySize = 50;
        this.init();
    }

    /**
     * Initialize history manager
     */
    init() {
        this.bindEvents();
    }

    /**
     * Bind history-related events
     */
    bindEvents() {
        const undoButton = document.getElementById('undo');
        if (undoButton) {
            undoButton.addEventListener('click', () => this.undo());
        }

        // Add keyboard shortcut for undo (Ctrl+Z)
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                this.undo();
            }
        });
    }

    /**
     * Save current state to history
     */
    saveState() {
        const canvas = document.getElementById('canvas');
        if (!canvas) return;

        const state = {
            canvasContent: canvas.innerHTML,
            tab1Content: this.getTabContent('tab1'),
            tab2Content: this.getTabContent('tab2'),
            tab3Content: this.getTabContent('tab3'),
            tab3Structure: this.getTabStructure('tab3'),
            timestamp: Date.now()
        };

        this.history.push(state);

        // Limit history size
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
        }

        this.updateUndoButton();
    }

    /**
     * Get content from a tab
     * @param {string} tabId - Tab ID
     * @returns {string} Tab content
     */
    getTabContent(tabId) {
        const tab = document.getElementById(tabId);
        if (!tab) return '';

        const preElement = tab.querySelector('pre');
        const pElement = tab.querySelector('p');

        if (preElement) {
            return preElement.textContent;
        } else if (pElement) {
            return pElement.textContent;
        }

        return '';
    }

    /**
     * Get the full HTML structure of a tab (for references tab)
     * @param {string} tabId - Tab ID
     * @returns {string} Tab HTML structure
     */
    getTabStructure(tabId) {
        const tab = document.getElementById(tabId);
        if (!tab) return '';

        const divElement = tab.querySelector('div');
        if (divElement) {
            return divElement.innerHTML;
        }

        return '';
    }

    /**
     * Set content to a tab
     * @param {string} tabId - Tab ID
     * @param {string} content - Content to set
     */
    setTabContent(tabId, content) {
        const tab = document.getElementById(tabId);
        if (!tab) return;

        const preElement = tab.querySelector('pre');
        const pElement = tab.querySelector('p');

        if (preElement) {
            preElement.textContent = content;
            // Update visibility after setting content
            this.updatePreElementVisibility(tab);
        } else if (pElement) {
            pElement.textContent = content;
        }
    }

    /**
     * Set the full HTML structure of a tab (for references tab)
     * @param {string} tabId - Tab ID
     * @param {string} structure - HTML structure to set
     */
    setTabStructure(tabId, structure) {
        const tab = document.getElementById(tabId);
        if (!tab) return;

        const divElement = tab.querySelector('div');
        if (divElement) {
            divElement.innerHTML = structure;
        }
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
     * Undo the last action
     */
    undo() {
        if (this.history.length === 0) {
            return;
        }

        const lastState = this.history.pop();
        const canvas = document.getElementById('canvas');

        if (canvas && lastState) {
            // Restore canvas content
            canvas.innerHTML = lastState.canvasContent;

            // Restore tab contents
            this.setTabContent('tab1', lastState.tab1Content);
            this.setTabContent('tab2', lastState.tab2Content);
            this.setTabContent('tab3', lastState.tab3Content);
            
            // Restore tab3 structure (references) if available
            if (lastState.tab3Structure !== undefined) {
                this.setTabStructure('tab3', lastState.tab3Structure);
            }
        }

        this.updateUndoButton();
    }

    /**
     * Update undo button state
     */
    updateUndoButton() {
        const undoButton = document.getElementById('undo');
        if (undoButton) {
            undoButton.disabled = this.history.length === 0;
            undoButton.title = this.history.length === 0 
                ? 'Nothing to undo' 
                : `Undo (${this.history.length} actions available)`;
        }
    }

    /**
     * Clear history
     */
    clearHistory() {
        this.history = [];
        this.updateUndoButton();
    }

    /**
     * Get history size
     * @returns {number} Number of items in history
     */
    getHistorySize() {
        return this.history.length;
    }

    /**
     * Check if history is empty
     * @returns {boolean} True if history is empty
     */
    isEmpty() {
        return this.history.length === 0;
    }

    /**
     * Get history summary for debugging
     * @returns {Array} History summary
     */
    getHistorySummary() {
        return this.history.map((state, index) => ({
            index,
            timestamp: new Date(state.timestamp).toLocaleTimeString(),
            hasContent: state.canvasContent.length > 20
        }));
    }
}

export default HistoryManager;