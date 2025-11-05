/**
 * ComponentManager - Handles loading and management of draggable components
 */
class ComponentManager {
    constructor(notificationManager) {
        this.notificationManager = notificationManager;
        this.components = [];
        this.dropdownManager = null;
        this.init();
    }

    /**
     * Initialize component manager
     */
    async init() {
        try {
            // Import and initialize dropdown manager
            const DropdownManager = await import('./dropdown_manager.js');
            this.dropdownManager = new DropdownManager.default();
            
            await this.loadComponents();
            this.renderComponents();
        } catch (error) {
            console.error('Failed to initialize components:', error);
            throw error;
        }
    }

    /**
     * Load components from JSON file
     */
    async loadComponents() {
        try {
            const response = await fetch('./data/components.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.components = await response.json();
        } catch (error) {
            console.error('Error loading components:', error);
            throw error;
        }
    }

    /**
     * Render components in dropdown structure
     */
    renderComponents() {
        if (!this.dropdownManager) {
            console.error('Dropdown manager not initialized');
            return;
        }

        // Get the HTML elements dropdown content container
        const htmlContainer = this.dropdownManager.getContentContainer('html');
        if (!htmlContainer) {
            console.error('HTML dropdown container not found');
            return;
        }

        // Clear existing content
        htmlContainer.innerHTML = '';

        // Render each HTML component
        this.components.forEach((item, index) => {
            const element = this.createComponentElement(item, index);
            htmlContainer.appendChild(element);
        });

        // Announce to screen readers
        const statusRegion = document.getElementById('status-region');
        if (statusRegion) {
            statusRegion.textContent = `${this.components.length} HTML components loaded`;
        }
    }

    /**
     * Create a draggable component element
     * @param {Object} item - Component data
     * @param {number} index - Component index
     * @returns {HTMLElement} Component element
     */
    createComponentElement(item, index) {
        const element = document.createElement('div');
        element.className = 'element';
        element.draggable = true;
        element.setAttribute('data-html', item.HTML);
        element.setAttribute('data-css', item.CSS);
        element.setAttribute('data-reference', item.Reference);
        element.setAttribute('data-index', index);
        element.textContent = item.Title;

        // Add drag event listeners
        this.addDragListeners(element, item);

        return element;
    }

    /**
     * Add drag event listeners to element
     * @param {HTMLElement} element - Element to add listeners to
     * @param {Object} item - Component data
     */
    addDragListeners(element, item) {
        element.addEventListener('dragstart', (e) => {
            const data = {
                html: item.HTML,
                css: item.CSS,
                reference: item.Reference,
                title: item.Title
            };
            e.dataTransfer.setData('text/html', JSON.stringify(data));
            e.dataTransfer.effectAllowed = 'copy';
            
            // Add visual feedback
            element.classList.add('dragging');
        });

        element.addEventListener('dragend', () => {
            element.classList.remove('dragging');
        });

        // Add keyboard support
        element.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.simulateDragDrop(item);
            }
        });

        // Make focusable for accessibility
        element.setAttribute('tabindex', '0');
        element.setAttribute('role', 'button');
        element.setAttribute('aria-label', `Drag ${item.Title} component to canvas`);
    }

    /**
     * Simulate drag and drop for keyboard users
     * @param {Object} item - Component data
     */
    simulateDragDrop(item) {
        const canvas = document.getElementById('canvas');
        const canvasManager = window.DesignITApp?.getManager('canvas');
        
        if (canvas && canvasManager) {
            const data = {
                html: item.HTML,
                css: item.CSS,
                reference: item.Reference,
                title: item.Title
            };
            canvasManager.addComponent(data);
        }
    }

    /**
     * Get component by index
     * @param {number} index - Component index
     * @returns {Object|null} Component data
     */
    getComponent(index) {
        return this.components[index] || null;
    }

    /**
     * Get all components
     * @returns {Array} All components
     */
    getAllComponents() {
        return [...this.components];
    }

    /**
     * Search components by title
     * @param {string} query - Search query
     * @returns {Array} Matching components
     */
    searchComponents(query) {
        const searchTerm = query.toLowerCase();
        return this.components.filter(component => 
            component.Title.toLowerCase().includes(searchTerm)
        );
    }
}

export default ComponentManager;