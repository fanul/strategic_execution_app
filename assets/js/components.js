/**
 * Reusable UI Components for Strategic Execution Monitoring Application
 * Provides modals, tables, forms, cards, charts, and other UI components
 */

// ============================================================================
// MODAL COMPONENT
// ============================================================================

class Modal {
    constructor(options = {}) {
        this.id = options.id || `modal-${Date.now()}`;
        this.title = options.title || 'Modal';
        this.size = options.size || 'medium'; // small, medium, large, extra-large
        this.centered = options.centered !== false;
        this.backdrop = options.backdrop !== false;
        this.keyboard = options.keyboard !== false;
        this.content = options.content || '';
        this.footer = options.footer || '';
        this.onShow = options.onShow || null;
        this.onHide = options.onHide || null;
        this.element = null;
        this.bsInstance = null;
    }

    /**
     * Create modal element
     */
    create() {
        const sizeClasses = {
            'small': 'modal-sm',
            'medium': '',
            'large': 'modal-lg',
            'extra-large': 'modal-xl'
        };

        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = this.id;
        modal.setAttribute('tabindex', '-1');
        modal.setAttribute('aria-labelledby', `${this.id}-label`);
        modal.setAttribute('aria-hidden', 'true');

        modal.innerHTML = `
            <div class="modal-dialog ${sizeClasses[this.size]} ${this.centered ? 'modal-dialog-centered' : ''}">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="${this.id}-label">${this.title}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        ${this.content}
                    </div>
                    ${this.footer ? `<div class="modal-footer">${this.footer}</div>` : ''}
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.element = modal;
        this.bsInstance = new bootstrap.Modal(modal, {
            backdrop: this.backdrop,
            keyboard: this.keyboard
        });

        // Event listeners
        modal.addEventListener('shown.bs.modal', () => {
            if (this.onShow) this.onShow();
        });

        modal.addEventListener('hidden.bs.modal', () => {
            if (this.onHide) this.onHide();
        });

        return this;
    }

    /**
     * Show modal
     */
    show() {
        if (!this.element) this.create();
        this.bsInstance.show();
        return this;
    }

    /**
     * Hide modal
     */
    hide() {
        if (this.bsInstance) {
            this.bsInstance.hide();
        }
        return this;
    }

    /**
     * Update modal content
     */
    setContent(content) {
        this.content = content;
        if (this.element) {
            this.element.querySelector('.modal-body').innerHTML = content;
        }
        return this;
    }

    /**
     * Update modal title
     */
    setTitle(title) {
        this.title = title;
        if (this.element) {
            this.element.querySelector('.modal-title').textContent = title;
        }
        return this;
    }

    /**
     * Destroy modal
     */
    destroy() {
        if (this.bsInstance) {
            this.bsInstance.dispose();
        }
        if (this.element) {
            this.element.remove();
        }
        this.element = null;
        this.bsInstance = null;
        return this;
    }
}

// ============================================================================
// CONFIRMATION DIALOG
// ============================================================================

function confirmDialog(options = {}) {
    return new Promise((resolve) => {
        const modal = new Modal({
            title: options.title || 'Confirm',
            size: 'small',
            content: options.message || 'Are you sure?',
            footer: `
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${options.cancelText || 'Cancel'}</button>
                <button type="button" class="btn btn-${options.type || 'danger'}" id="confirm-btn">${options.confirmText || 'Confirm'}</button>
            `,
            onShow: () => {
                const confirmBtn = document.getElementById('confirm-btn');
                confirmBtn.focus();

                confirmBtn.addEventListener('click', () => {
                    modal.hide();
                    resolve(true);
                });
            },
            onHide: () => {
                resolve(false);
            }
        });

        modal.show();
    });
}

// ============================================================================
// ALERT DIALOG
// ============================================================================

function alertDialog(options = {}) {
    return new Promise((resolve) => {
        const type = options.type || 'info';
        const icons = {
            'success': 'check-circle-fill text-success',
            'error': 'x-circle-fill text-danger',
            'warning': 'exclamation-triangle-fill text-warning',
            'info': 'info-circle-fill text-info'
        };

        const modal = new Modal({
            title: options.title || 'Notice',
            size: 'small',
            content: `
                <div class="text-center">
                    <i class="bi bi-${icons[type]} fs-1 mb-3"></i>
                    <p class="mb-0">${options.message || ''}</p>
                </div>
            `,
            footer: `
                <button type="button" class="btn btn-primary" data-bs-dismiss="modal">OK</button>
            `,
            onHide: () => resolve()
        });

        modal.show();
    });
}

// ============================================================================
// LOADING OVERLAY
// ============================================================================

class LoadingOverlay {
    constructor(message = 'Loading...') {
        this.id = 'loading-overlay';
        this.message = message;
        this.element = null;
    }

    show(message = null) {
        if (message) this.message = message;

        let overlay = document.getElementById(this.id);
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = this.id;
            overlay.className = 'loading-overlay';
            overlay.innerHTML = `
                <div class="loading-overlay-content">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <div class="loading-overlay-message">${this.message}</div>
                </div>
            `;
            document.body.appendChild(overlay);
        } else {
            overlay.querySelector('.loading-overlay-message').textContent = this.message;
        }

        overlay.style.display = 'flex';
        setTimeout(() => overlay.classList.add('show'), 10);
    }

    hide() {
        const overlay = document.getElementById(this.id);
        if (overlay) {
            overlay.classList.remove('show');
            setTimeout(() => {
                overlay.style.display = 'none';
            }, 300);
        }
    }
}

// ============================================================================
// DATA TABLE COMPONENT
// ============================================================================

class DataTable {
    constructor(options = {}) {
        this.container = options.container;
        this.columns = options.columns || [];
        this.data = options.data || [];
        this.rowId = options.rowId || 'id';
        this.selectable = options.selectable || false;
        this.onRowClick = options.onRowClick || null;
        this.onRowDoubleClick = options.onRowDoubleClick || null;
        this.paginator = options.paginator !== false;
        this.pageSize = options.pageSize || 25;
        this.currentPage = 1;
        this.searchable = options.searchable !== false;
        this.sortable = options.sortable !== false;
        this.element = null;
        this.selectedRows = new Set();
    }

    /**
     * Render table
     */
    render() {
        const container = document.querySelector(this.container);
        if (!container) return;

        container.innerHTML = `
            <div class="data-table-wrapper">
                ${this.searchable ? this._renderSearch() : ''}
                <div class="table-responsive">
                    <table class="table table-hover table-striped">
                        <thead>${this._renderHeader()}</thead>
                        <tbody>${this._renderBody()}</tbody>
                    </table>
                </div>
                ${this.paginator ? this._renderPaginator() : ''}
            </div>
        `;

        this.element = container.querySelector('.data-table-wrapper');
        this._attachEventListeners();
    }

    _renderSearch() {
        return `
            <div class="data-table-search mb-3">
                <div class="input-group">
                    <span class="input-group-text"><i class="bi bi-search"></i></span>
                    <input type="text" class="form-control" placeholder="Search..." id="table-search">
                    ${this.selectedRows.size > 0 ? `
                        <button class="btn btn-outline-danger" id="clear-selection">
                            Clear Selection (${this.selectedRows.size})
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }

    _renderHeader() {
        return `
            <tr>
                ${this.selectable ? '<th><input type="checkbox" id="select-all"></th>' : ''}
                ${this.columns.map(col => `
                    <th ${this.sortable ? `class="sortable" data-column="${col.key}"` : ''}>
                        ${col.label}
                        ${this.sortable ? '<i class="bi bi-arrow-down-up sort-icon"></i>' : ''}
                    </th>
                `).join('')}
            </tr>
        `;
    }

    _renderBody() {
        if (this.data.length === 0) {
            const colspan = this.columns.length + (this.selectable ? 1 : 0);
            return `<tr><td colspan="${colspan}" class="text-center text-muted py-5">No data available</td></tr>`;
        }

        return this._getPaginatedData().map(row => `
            <tr data-row-id="${row[this.rowId]}" ${this.onRowClick ? 'class="clickable"' : ''}>
                ${this.selectable ? `<td><input type="checkbox" class="row-select" value="${row[this.rowId]}"></td>` : ''}
                ${this.columns.map(col => `
                    <td>${this._formatCellValue(row[col.key], col)}</td>
                `).join('')}
            </tr>
        `).join('');
    }

    _formatCellValue(value, column) {
        if (column.render) {
            return column.render(value);
        }

        if (column.type === 'date') {
            return DateUtils.formatDate(value, column.format || 'short');
        }

        if (column.type === 'currency') {
            return StringUtils.formatCurrency(value);
        }

        if (column.type === 'percentage') {
            return StringUtils.formatPercentage(value);
        }

        if (column.type === 'boolean') {
            return value ? '<i class="bi bi-check-circle-fill text-success"></i>' : '<i class="bi bi-x-circle-fill text-danger"></i>';
        }

        if (column.type === 'badge') {
            const badgeClass = column.badgeClass || 'secondary';
            return `<span class="badge bg-${badgeClass}">${value}</span>`;
        }

        return value !== null && value !== undefined ? value : '-';
    }

    _renderPaginator() {
        const totalPages = Math.ceil(this.data.length / this.pageSize);
        const start = (this.currentPage - 1) * this.pageSize + 1;
        const end = Math.min(this.currentPage * this.pageSize, this.data.length);

        return `
            <nav aria-label="Table pagination" class="mt-3">
                <div class="d-flex justify-content-between align-items-center">
                    <div class="text-muted small">
                        Showing ${start} to ${end} of ${this.data.length} entries
                    </div>
                    <ul class="pagination pagination-sm mb-0">
                        <li class="page-item ${this.currentPage === 1 ? 'disabled' : ''}">
                            <a class="page-link" href="#" data-page="${this.currentPage - 1}">Previous</a>
                        </li>
                        ${this._renderPageNumbers(totalPages)}
                        <li class="page-item ${this.currentPage === totalPages ? 'disabled' : ''}">
                            <a class="page-link" href="#" data-page="${this.currentPage + 1}">Next</a>
                        </li>
                    </ul>
                </div>
            </nav>
        `;
    }

    _renderPageNumbers(totalPages) {
        const pages = [];
        const maxPages = 5;
        let start = Math.max(1, this.currentPage - Math.floor(maxPages / 2));
        let end = Math.min(totalPages, start + maxPages - 1);

        if (end - start < maxPages - 1) {
            start = Math.max(1, end - maxPages + 1);
        }

        for (let i = start; i <= end; i++) {
            pages.push(`
                <li class="page-item ${i === this.currentPage ? 'active' : ''}">
                    <a class="page-link" href="#" data-page="${i}">${i}</a>
                </li>
            `);
        }

        return pages.join('');
    }

    _getPaginatedData() {
        if (!this.paginator) return this.data;

        const start = (this.currentPage - 1) * this.pageSize;
        const end = start + this.pageSize;
        return this.data.slice(start, end);
    }

    _attachEventListeners() {
        // Row selection
        if (this.selectable) {
            const selectAll = this.element.querySelector('#select-all');
            const rowCheckboxes = this.element.querySelectorAll('.row-select');

            selectAll?.addEventListener('change', (e) => {
                const checked = e.target.checked;
                rowCheckboxes.forEach(cb => {
                    cb.checked = checked;
                    if (checked) {
                        this.selectedRows.add(cb.value);
                    } else {
                        this.selectedRows.delete(cb.value);
                    }
                });
                this.render();
            });

            rowCheckboxes.forEach(cb => {
                cb.addEventListener('change', (e) => {
                    if (e.target.checked) {
                        this.selectedRows.add(e.target.value);
                    } else {
                        this.selectedRows.delete(e.target.value);
                    }
                    this.render();
                });
            });
        }

        // Row click
        if (this.onRowClick) {
            this.element.querySelectorAll('tbody tr').forEach(row => {
                row.addEventListener('click', (e) => {
                    if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'A') {
                        const rowId = row.dataset.rowId;
                        const rowData = this.data.find(d => d[this.rowId] === rowId);
                        this.onRowClick(rowData, rowId);
                    }
                });
            });
        }

        // Search
        if (this.searchable) {
            const searchInput = this.element.querySelector('#table-search');
            searchInput?.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase();
                this.filter(query);
            });
        }

        // Sort
        if (this.sortable) {
            this.element.querySelectorAll('th.sortable').forEach(th => {
                th.addEventListener('click', () => {
                    const column = th.dataset.column;
                    this.sort(column);
                });
            });
        }

        // Pagination
        if (this.paginator) {
            this.element.querySelectorAll('.page-link').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const page = parseInt(e.target.dataset.page);
                    if (page > 0 && page <= Math.ceil(this.data.length / this.pageSize)) {
                        this.goToPage(page);
                    }
                });
            });
        }
    }

    /**
     * Set data
     */
    setData(data) {
        this.data = data;
        this.currentPage = 1;
        this.render();
    }

    /**
     * Filter data
     */
    filter(query) {
        if (!query) {
            this.render();
            return;
        }

        const filtered = this.data.filter(row => {
            return this.columns.some(col => {
                const value = row[col.key];
                return value && value.toString().toLowerCase().includes(query);
            });
        });

        const container = document.querySelector(this.container);
        container.innerHTML = '';
        const originalData = this.data;
        this.data = filtered;
        this.render();
        this.data = originalData;
    }

    /**
     * Sort data
     */
    sort(column) {
        this.data.sort((a, b) => {
            const aVal = a[column];
            const bVal = b[column];

            if (aVal < bVal) return -1;
            if (aVal > bVal) return 1;
            return 0;
        });

        this.render();
    }

    /**
     * Go to page
     */
    goToPage(page) {
        this.currentPage = page;
        this.render();
    }

    /**
     * Get selected rows
     */
    getSelectedRows() {
        return Array.from(this.selectedRows).map(id => {
            return this.data.find(d => d[this.rowId] === id);
        });
    }
}

// ============================================================================
// CARD COMPONENT
// ============================================================================

class Card {
    constructor(options = {}) {
        this.title = options.title || '';
        this.subtitle = options.subtitle || '';
        this.content = options.content || '';
        this.footer = options.footer || '';
        this.color = options.color || 'primary';
        this.icon = options.icon || null;
        this.value = options.value || null;
        this.trend = options.trend || null;
        this.element = null;
    }

    render() {
        return `
            <div class="card shadow-sm">
                ${this.title || this.icon ? `
                    <div class="card-header">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                ${this.title ? `<h6 class="mb-0">${this.title}</h6>` : ''}
                                ${this.subtitle ? `<small class="text-muted">${this.subtitle}</small>` : ''}
                            </div>
                            ${this.icon ? `<i class="bi bi-${this.icon} text-${this.color} fs-4"></i>` : ''}
                        </div>
                    </div>
                ` : ''}
                ${this.content ? `
                    <div class="card-body">
                        ${this.value ? `<h3 class="card-title">${this.value}</h3>` : ''}
                        ${this.trend ? `
                            <small class="${this.trend > 0 ? 'text-success' : 'text-danger'}">
                                <i class="bi bi-arrow-${this.trend > 0 ? 'up' : 'down'}"></i>
                                ${Math.abs(this.trend)}%
                            </small>
                        ` : ''}
                        ${this.content}
                    </div>
                ` : ''}
                ${this.footer ? `<div class="card-footer">${this.footer}</div>` : ''}
            </div>
        `;
    }
}

// ============================================================================
// STAT CARD COMPONENT
// ============================================================================

class StatCard extends Card {
    constructor(options = {}) {
        super(options);
        this.label = options.label || '';
        this.prefix = options.prefix || '';
        this.suffix = options.suffix || '';
    }

    render() {
        const valueStr = `${this.prefix}${this.value !== null ? this.value : '-'}${this.suffix}`;

        return `
            <div class="card stat-card stat-card-${this.color}">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <p class="stat-label mb-1">${this.label}</p>
                            <h3 class="stat-value mb-0">${valueStr}</h3>
                            ${this.trend !== null ? `
                                <small class="${this.trend > 0 ? 'text-success' : 'text-danger'}">
                                    <i class="bi bi-arrow-${this.trend > 0 ? 'up' : 'down'}"></i>
                                    ${Math.abs(this.trend)}% from last period
                                </small>
                            ` : ''}
                        </div>
                        ${this.icon ? `
                            <div class="stat-icon bg-${this.color} bg-opacity-10">
                                <i class="bi bi-${this.icon} text-${this.color} fs-2"></i>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }
}

// ============================================================================
// FORM COMPONENT
// ============================================================================

class Form {
    constructor(options = {}) {
        this.id = options.id || `form-${Date.now()}`;
        this.fields = options.fields || [];
        this.onSubmit = options.onSubmit || null;
        this.action = options.action || '#';
        this.method = options.method || 'POST';
        this.element = null;
    }

    render() {
        const form = document.createElement('form');
        form.id = this.id;
        form.action = this.action;
        form.method = this.method;
        form.noValidate = true;

        this.fields.forEach(field => {
            form.appendChild(this._renderField(field));
        });

        this.element = form;
        this._attachEventListeners();
        return form;
    }

    _renderField(field) {
        const wrapper = document.createElement('div');
        wrapper.className = `mb-3 ${field.class || ''}`;

        const label = document.createElement('label');
        label.className = 'form-label';
        label.textContent = field.label;
        if (field.required) label.innerHTML += ' <span class="text-danger">*</span>';
        wrapper.appendChild(label);

        let input;

        switch (field.type) {
            case 'select':
                input = this._renderSelect(field);
                break;
            case 'textarea':
                input = this._renderTextarea(field);
                break;
            case 'checkbox':
                input = this._renderCheckbox(field);
                break;
            case 'radio':
                input = this._renderRadio(field);
                break;
            case 'date':
                input = this._renderDate(field);
                break;
            case 'file':
                input = this._renderFile(field);
                break;
            default:
                input = this._renderInput(field);
        }

        if (field.hint) {
            const hint = document.createElement('small');
            hint.className = 'form-text text-muted';
            hint.textContent = field.hint;
            wrapper.appendChild(hint);
        }

        wrapper.appendChild(input);

        if (field.feedback) {
            const feedback = document.createElement('div');
            feedback.className = 'invalid-feedback';
            feedback.textContent = field.feedback;
            wrapper.appendChild(feedback);
        }

        return wrapper;
    }

    _renderInput(field) {
        const input = document.createElement('input');
        input.type = field.type || 'text';
        input.className = 'form-control';
        input.name = field.name;
        input.id = field.id || field.name;
        if (field.placeholder) input.placeholder = field.placeholder;
        if (field.required) input.required = true;
        if (field.value) input.value = field.value;
        if (field.min !== undefined) input.min = field.min;
        if (field.max !== undefined) input.max = field.max;
        if (field.step !== undefined) input.step = field.step;
        return input;
    }

    _renderSelect(field) {
        const select = document.createElement('select');
        select.className = 'form-control';
        select.name = field.name;
        select.id = field.id || field.name;
        if (field.required) select.required = true;

        if (field.placeholder) {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = field.placeholder;
            option.selected = true;
            option.disabled = true;
            select.appendChild(option);
        }

        (field.options || []).forEach(opt => {
            const option = document.createElement('option');
            option.value = opt.value;
            option.textContent = opt.label;
            if (opt.selected) option.selected = true;
            select.appendChild(option);
        });

        return select;
    }

    _renderTextarea(field) {
        const textarea = document.createElement('textarea');
        textarea.className = 'form-control';
        textarea.name = field.name;
        textarea.id = field.id || field.name;
        if (field.placeholder) textarea.placeholder = field.placeholder;
        if (field.required) textarea.required = true;
        if (field.rows) textarea.rows = field.rows;
        if (field.value) textarea.value = field.value;
        return textarea;
    }

    _renderCheckbox(field) {
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.className = 'form-check-input';
        input.name = field.name;
        input.id = field.id || field.name;
        if (field.checked) input.checked = true;

        const wrapper = document.createElement('div');
        wrapper.className = 'form-check';
        wrapper.appendChild(input);

        if (field.label) {
            const label = document.createElement('label');
            label.className = 'form-check-label';
            label.htmlFor = input.id;
            label.textContent = field.label;
            wrapper.appendChild(label);
        }

        return wrapper;
    }

    _renderRadio(field) {
        const wrapper = document.createElement('div');
        wrapper.className = 'form-check';

        (field.options || []).forEach((opt, index) => {
            const input = document.createElement('input');
            input.type = 'radio';
            input.className = 'form-check-input';
            input.name = field.name;
            input.id = `${field.name}-${index}`;
            input.value = opt.value;
            if (opt.checked) input.checked = true;

            const label = document.createElement('label');
            label.className = 'form-check-label';
            label.htmlFor = input.id;
            label.textContent = opt.label;

            const itemWrapper = document.createElement('div');
            itemWrapper.className = 'form-check';
            itemWrapper.appendChild(input);
            itemWrapper.appendChild(label);

            wrapper.appendChild(itemWrapper);
        });

        return wrapper;
    }

    _renderDate(field) {
        const input = document.createElement('input');
        input.type = 'date';
        input.className = 'form-control';
        input.name = field.name;
        input.id = field.id || field.name;
        if (field.required) input.required = true;
        if (field.value) input.value = field.value;
        return input;
    }

    _renderFile(field) {
        const input = document.createElement('input');
        input.type = 'file';
        input.className = 'form-control';
        input.name = field.name;
        input.id = field.id || field.name;
        if (field.required) input.required = true;
        if (field.accept) input.accept = field.accept;
        if (field.multiple) input.multiple = true;
        return input;
    }

    _attachEventListeners() {
        if (this.onSubmit) {
            this.element.addEventListener('submit', (e) => {
                e.preventDefault();
                const formData = new FormData(this.element);
                const data = Object.fromEntries(formData.entries());
                this.onSubmit(data, this.element);
            });
        }
    }

    getValues() {
        const formData = new FormData(this.element);
        return Object.fromEntries(formData.entries());
    }

    setValues(values) {
        Object.keys(values).forEach(key => {
            const input = this.element.querySelector(`[name="${key}"]`);
            if (input) {
                if (input.type === 'checkbox') {
                    input.checked = values[key];
                } else {
                    input.value = values[key];
                }
            }
        });
    }

    reset() {
        this.element.reset();
    }

    validate() {
        return this.element.checkValidity();
    }
}

// ============================================================================
// PROGRESS BAR COMPONENT
// ============================================================================

class ProgressBar {
    constructor(options = {}) {
        this.value = options.value || 0;
        this.max = options.max || 100;
        this.label = options.label || '';
        this.showPercentage = options.showPercentage !== false;
        this.color = options.color || 'primary'; // primary, success, warning, danger, info
        this.striped = options.striped || false;
        this.animated = options.animated || false;
        this.height = options.height || null;
    }

    setValue(value) {
        this.value = Math.max(0, Math.min(this.max, value));
        if (this.element) {
            const bar = this.element.querySelector('.progress-bar');
            const percentage = (this.value / this.max) * 100;
            bar.style.width = `${percentage}%`;
            bar.setAttribute('aria-valuenow', this.value);

            if (this.showPercentage) {
                const label = this.element.querySelector('.progress-label');
                if (label) {
                    label.textContent = `${Math.round(percentage)}%`;
                }
            }
        }
    }

    render() {
        const percentage = Math.round((this.value / this.max) * 100);
        const heightStyle = this.height ? `height: ${this.height}px;` : '';

        return `
            <div class="progress-wrapper">
                ${this.label ? `<div class="d-flex justify-content-between mb-1"><span>${this.label}</span>${this.showPercentage ? `<span class="progress-label">${percentage}%</span>` : ''}</div>` : ''}
                <div class="progress" style="${heightStyle}">
                    <div class="progress-bar bg-${this.color} ${this.striped ? 'progress-bar-striped' : ''} ${this.animated ? 'progress-bar-animated' : ''}"
                         role="progressbar"
                         style="width: ${percentage}%"
                         aria-valuenow="${this.value}"
                         aria-valuemin="0"
                         aria-valuemax="${this.max}">
                    </div>
                </div>
            </div>
        `;
    }
}

// ============================================================================
// TOAST NOTIFICATION COMPONENT
// ============================================================================

class Toast {
    constructor(options = {}) {
        this.message = options.message || '';
        this.title = options.title || '';
        this.type = options.type || 'info'; // success, error, warning, info
        this.duration = options.duration || 5000;
        this.position = options.position || 'top-right'; // top-right, top-left, bottom-right, bottom-left, top-center
        this.closeButton = options.closeButton !== false;
    }

    show() {
        const container = this._getContainer();

        const toast = document.createElement('div');
        toast.className = `toast toast-${this.type} show`;
        toast.innerHTML = `
            <div class="toast-header">
                <i class="bi bi-${this._getIcon()} me-2"></i>
                <strong class="me-auto">${this.title}</strong>
                ${this.closeButton ? '<button type="button" class="btn-close" data-bs-dismiss="toast"></button>' : ''}
            </div>
            ${this.message ? `<div class="toast-body">${this.message}</div>` : ''}
        `;

        container.appendChild(toast);

        // Auto dismiss
        if (this.duration > 0) {
            setTimeout(() => {
                this.hide(toast);
            }, this.duration);
        }

        // Close button handler
        if (this.closeButton) {
            const closeBtn = toast.querySelector('.btn-close');
            closeBtn?.addEventListener('click', () => {
                this.hide(toast);
            });
        }

        return toast;
    }

    hide(toast) {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }

    _getContainer() {
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = `toast-container position-fixed ${this._getPositionClass()}`;
            document.body.appendChild(container);
        }
        return container;
    }

    _getPositionClass() {
        const positions = {
            'top-right': 'top-0 end-0',
            'top-left': 'top-0 start-0',
            'bottom-right': 'bottom-0 end-0',
            'bottom-left': 'bottom-0 start-0',
            'top-center': 'top-0 start-50 translate-middle-x'
        };
        return positions[this.position] || positions['top-right'];
    }

    _getIcon() {
        const icons = {
            'success': 'check-circle-fill text-success',
            'error': 'x-circle-fill text-danger',
            'warning': 'exclamation-triangle-fill text-warning',
            'info': 'info-circle-fill text-info'
        };
        return icons[this.type] || icons['info'];
    }
}

// ============================================================================
// QUICK TOAST HELPERS
// ============================================================================

function showToast(message, title = 'Notification', type = 'info') {
    const toast = new Toast({ message, title, type });
    return toast.show();
}

function showSuccessToast(message) {
    return showToast(message, 'Success', 'success');
}

function showErrorToast(message) {
    return showToast(message, 'Error', 'error');
}

function showWarningToast(message) {
    return showToast(message, 'Warning', 'warning');
}

// ============================================================================
// GLOBAL WRAPPER FUNCTIONS (for backward compatibility)
// ============================================================================

/**
 * Show loading overlay - wrapper for LoadingOverlay class
 */
function showLoadingOverlay() {
    const existing = document.getElementById('loading-overlay');
    if (existing) {
        existing.classList.add('show');
        existing.style.display = 'flex';
        return;
    }

    const overlay = new LoadingOverlay('Loading...');
    overlay.show();
}

/**
 * Hide loading overlay
 */
function hideLoadingOverlay() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.classList.remove('show');
        setTimeout(() => {
            if (!overlay.classList.contains('show')) {
                overlay.style.display = 'none';
            }
        }, 300);
    }
}

/**
 * Show success message - wrapper for showSuccessToast
 */
function showSuccessMessage(message) {
    showSuccessToast(message);
}

/**
 * Show error message - wrapper for showErrorToast
 */
function showErrorMessage(message) {
    showErrorToast(message);
}

/**
 * Show info message - wrapper for showInfoToast
 */
function showInfoMessage(message) {
    if (typeof showInfoToast === 'function') {
        showInfoToast(message);
    } else {
        console.info(message);
    }
}

// ============================================================================
// EXPORT ALL COMPONENTS
// ============================================================================

if (typeof window !== 'undefined') {
    window.Modal = Modal;
    window.confirmDialog = confirmDialog;
    window.alertDialog = alertDialog;
    window.LoadingOverlay = LoadingOverlay;
    window.DataTable = DataTable;
    window.Card = Card;
    window.StatCard = StatCard;
    window.Form = Form;
    window.ProgressBar = ProgressBar;
    window.Toast = Toast;
    window.showToast = showToast;
    window.showSuccessToast = showSuccessToast;
    window.showErrorToast = showErrorToast;
    window.showWarningToast = showWarningToast;
    // Global wrapper functions
    window.showLoadingOverlay = showLoadingOverlay;
    window.hideLoadingOverlay = hideLoadingOverlay;
    window.showSuccessMessage = showSuccessMessage;
    window.showErrorMessage = showErrorMessage;
    window.showInfoMessage = showInfoMessage;
}
