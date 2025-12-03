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

        // Categorize components
        const inputComponents = [];
        const listComponents = [];
        const mediaComponents = [];
        const otherComponents = [];

        this.components.forEach((item, index) => {
            if (item.Title.toLowerCase().startsWith('input type')) {
                inputComponents.push({ item, index });
            } else if (item.Title.toLowerCase().startsWith('list ')) {
                listComponents.push({ item, index });
            } else if (item.Title.toLowerCase().includes('<audio>') || 
                       item.Title.toLowerCase().includes('<video>') || 
                       item.Title.toLowerCase().includes('<picture>')) {
                mediaComponents.push({ item, index });
            } else {
                otherComponents.push({ item, index });
            }
        });

        // Create a combined list for alphabetical ordering
        const allItems = [];

        // Add input subcategory as a special item
        if (inputComponents.length > 0) {
            allItems.push({
                type: 'subcategory',
                title: 'Input <input>',
                sortKey: 'Input <input>',
                subcategory: this.createSubcategoryDropdown('inputs', 'Input <input>', inputComponents)
            });
        }

        // Add list subcategory as a special item
        if (listComponents.length > 0) {
            allItems.push({
                type: 'subcategory',
                title: 'List',
                sortKey: 'List',
                subcategory: this.createSubcategoryDropdown('lists', 'List', listComponents)
            });
        }

        // Add media subcategory as a special item
        if (mediaComponents.length > 0) {
            allItems.push({
                type: 'subcategory',
                title: 'Media',
                sortKey: 'Media',
                subcategory: this.createSubcategoryDropdown('media', 'Media', mediaComponents)
            });
        }

        // Add other components
        otherComponents.forEach(({ item, index }) => {
            allItems.push({
                type: 'component',
                title: item.Title,
                sortKey: item.Title,
                item: item,
                index: index
            });
        });

        // Sort alphabetically
        allItems.sort((a, b) => a.sortKey.localeCompare(b.sortKey));

        // Render in alphabetical order
        allItems.forEach(item => {
            if (item.type === 'subcategory') {
                htmlContainer.appendChild(item.subcategory);
            } else {
                const element = this.createComponentElement(item.item, item.index);
                htmlContainer.appendChild(element);
            }
        });

        // Announce to screen readers
        const statusRegion = document.getElementById('status-region');
        if (statusRegion) {
            statusRegion.textContent = `${this.components.length} HTML components loaded`;
        }
    }

    /**
     * Create a subcategory dropdown
     * @param {string} id - Subcategory ID
     * @param {string} title - Subcategory title
     * @param {Array} components - Array of components with item and index
     * @returns {HTMLElement} Subcategory dropdown element
     */
    createSubcategoryDropdown(id, title, components) {
        const subcategoryDiv = document.createElement('div');
        subcategoryDiv.className = 'subcategory-dropdown';
        subcategoryDiv.setAttribute('data-subcategory', id);

        const header = document.createElement('button');
        header.className = 'subcategory-header';
        header.setAttribute('aria-expanded', 'false');
        header.setAttribute('aria-controls', `${id}-content`);

        const icon = document.createElement('span');
        icon.className = 'dropdown-icon';
        icon.textContent = '▶';

        const titleSpan = document.createElement('span');
        titleSpan.className = 'dropdown-title';
        titleSpan.textContent = title;

        header.appendChild(icon);
        header.appendChild(titleSpan);

        const content = document.createElement('div');
        content.className = 'subcategory-content';
        content.id = `${id}-content`;
        content.setAttribute('role', 'group');

        // Add components to subcategory
        components.forEach(({ item, index }) => {
            const element = this.createComponentElement(item, index);
            content.appendChild(element);
        });

        subcategoryDiv.appendChild(header);
        subcategoryDiv.appendChild(content);

        return subcategoryDiv;
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