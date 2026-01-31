/**
 * Strategic Execution Monitoring Application - ES5 Inline Script
 * Converted from ES6 to ES5 for Google Apps Script V8 compatibility
 *
 * This script combines utils.js, components.js, and app.js
 */

// ============================================================================
// DATE UTILITIES
// ============================================================================

var DateUtils = {
    formatDate: function(date, format, locale) {
        if (!date) return '-';
        var d = new Date(date);
        if (isNaN(d.getTime())) return '-';

        format = format || 'short';
        locale = locale || 'id-ID';

        var options = {
            'short': { year: 'numeric', month: 'short', day: 'numeric' },
            'long': { year: 'numeric', month: 'long', day: 'numeric' },
            'time': { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' },
            'full': { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' },
            'monthYear': { year: 'numeric', month: 'long' },
            'yearMonth': { year: 'numeric', month: '2-digit' }
        };

        return d.toLocaleDateString(locale, options[format] || options['short']);
    },

    getDateRange: function(startDate, endDate) {
        var start = this.formatDate(startDate, 'short');
        var end = this.formatDate(endDate, 'short');
        return start + ' - ' + end;
    },

    getWeekNumber: function(date) {
        var d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        var dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    },

    getWeekDates: function(year, week) {
        var firstDayOfYear = new Date(year, 0, 1);
        var daysToAdd = (week - 1) * 7;
        var startDate = new Date(firstDayOfYear);
        startDate.setDate(firstDayOfYear.getDate() + daysToAdd);

        var dayOfWeek = startDate.getDay();
        var diff = startDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        startDate.setDate(diff);

        var endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);

        return { startDate: startDate, endDate: endDate };
    },

    getMonthName: function(month, locale) {
        locale = locale || 'id-ID';
        var date = new Date();
        date.setMonth(month);
        return date.toLocaleDateString(locale, { month: 'long' });
    },

    getQuarter: function(date) {
        return Math.floor(date.getMonth() / 3) + 1;
    },

    addDays: function(date, days) {
        var result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    },

    addMonths: function(date, months) {
        var result = new Date(date);
        result.setMonth(result.getMonth() + months);
        return result;
    },

    daysBetween: function(startDate, endDate) {
        var oneDay = 24 * 60 * 60 * 1000;
        return Math.round((endDate - startDate) / oneDay);
    },

    isToday: function(date) {
        var today = new Date();
        return date.getDate() === today.getDate() &&
               date.getMonth() === today.getMonth() &&
               date.getFullYear() === today.getFullYear();
    },

    isThisWeek: function(date) {
        var today = new Date();
        var weekNum = this.getWeekNumber(today);
        return this.getWeekNumber(date) === weekNum && date.getFullYear() === today.getFullYear();
    },

    getRelativeTime: function(date) {
        var now = new Date();
        var diffMs = now - new Date(date);
        var diffSec = Math.floor(diffMs / 1000);
        var diffMin = Math.floor(diffSec / 60);
        var diffHour = Math.floor(diffMin / 60);
        var diffDay = Math.floor(diffHour / 24);

        if (diffSec < 60) return 'just now';
        if (diffMin < 60) return diffMin + ' minute' + (diffMin > 1 ? 's' : '') + ' ago';
        if (diffHour < 24) return diffHour + ' hour' + (diffHour > 1 ? 's' : '') + ' ago';
        if (diffDay < 7) return diffDay + ' day' + (diffDay > 1 ? 's' : '') + ' ago';
        return this.formatDate(date, 'short');
    }
};

// ============================================================================
// STRING UTILITIES
// ============================================================================

var StringUtils = {
    toTitleCase: function(str) {
        if (!str) return '';
        return str.replace(/\w\S*/g, function(txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    },

    toSentenceCase: function(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    },

    toSlug: function(str) {
        if (!str) return '';
        return str
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    },

    truncate: function(str, length, suffix) {
        if (!str) return '';
        suffix = suffix || '...';
        if (str.length <= length) return str;
        return str.substring(0, length - suffix.length) + suffix;
    },

    random: function(length, charset) {
        length = length || 8;
        charset = charset || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var result = '';
        for (var i = 0; i < length; i++) {
            result += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        return result;
    },

    uuid: function() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0;
            var v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },

    escapeHtml: function(str) {
        if (!str) return '';
        var div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    unescapeHtml: function(str) {
        if (!str) return '';
        var div = document.createElement('div');
        div.innerHTML = str;
        return div.textContent;
    },

    formatNumber: function(num, locale) {
        locale = locale || 'id-ID';
        if (num == null) return '-';
        return num.toLocaleString(locale);
    },

    formatCurrency: function(amount, currency, locale) {
        currency = currency || 'IDR';
        locale = locale || 'id-ID';
        if (amount == null) return '-';
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    },

    formatPercentage: function(value, decimals) {
        decimals = decimals || 1;
        if (value == null) return '-';
        return value.toFixed(decimals) + '%';
    },

    capitalize: function(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    },

    isEmpty: function(str) {
        return !str || str.trim().length === 0;
    },

    padZero: function(num, size) {
        size = size || 2;
        var s = num.toString();
        while (s.length < size) s = '0' + s;
        return s;
    },

    chunk: function(str, chunkSize) {
        var chunks = [];
        for (var i = 0; i < str.length; i += chunkSize) {
            chunks.push(str.substring(i, i + chunkSize));
        }
        return chunks;
    },

    highlight: function(text, searchTerm) {
        if (!text || !searchTerm) return text;
        var regex = new RegExp('(' + searchTerm + ')', 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    },

    camelToSnake: function(str) {
        return str.replace(/[A-Z]/g, function(letter) {
            return '_' + letter.toLowerCase();
        });
    },

    snakeToCamel: function(str) {
        return str.replace(/([-_][a-z])/g, function(group) {
            return group.toUpperCase().replace('-', '').replace('_', '');
        });
    },

    parseQueryString: function(queryString) {
        var params = {};
        var pairs = queryString.substring(1).split('&');
        pairs.forEach(function(pair) {
            var parts = pair.split('=');
            var key = decodeURIComponent(parts[0]);
            var value = decodeURIComponent(parts[1]);
            params[key] = value;
        });
        return params;
    },

    buildQueryString: function(params) {
        return Object.keys(params)
            .map(function(key) {
                return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
            })
            .join('&');
    }
};

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

var ValidationUtils = {
    isValidEmail: function(email) {
        var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    isValidUrl: function(url) {
        try {
            new URL(url);
            return true;
        } catch (e) {
            return false;
        }
    },

    isValidPhone: function(phone) {
        var re = /^[\d\s\-+()]+$/;
        return re.test(phone) && phone.replace(/\D/g, '').length >= 10;
    },

    validatePassword: function(password) {
        var issues = [];
        var strength = 'weak';

        if (password.length < 8) issues.push('At least 8 characters');
        if (!/[a-z]/.test(password)) issues.push('Lowercase letter');
        if (!/[A-Z]/.test(password)) issues.push('Uppercase letter');
        if (!/\d/.test(password)) issues.push('Number');
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) issues.push('Special character');

        var score = 5 - issues.length;
        if (score >= 4) strength = 'strong';
        else if (score >= 3) strength = 'medium';

        return {
            isValid: issues.length === 0,
            strength: strength,
            issues: issues
        };
    },

    isBetween: function(value, min, max) {
        return value >= min && value <= max;
    },

    isValidDateRange: function(startDate, endDate) {
        return new Date(startDate) <= new Date(endDate);
    },

    isValidPercentage: function(value) {
        return value >= 0 && value <= 100;
    }
};

// ============================================================================
// STORAGE UTILITIES
// ============================================================================

var StorageUtils = {
    save: function(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error('Error saving to localStorage:', e);
        }
    },

    get: function(key, defaultValue) {
        defaultValue = defaultValue || null;
        try {
            var item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.error('Error reading from localStorage:', e);
            return defaultValue;
        }
    },

    remove: function(key) {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            console.error('Error removing from localStorage:', e);
        }
    },

    clear: function() {
        try {
            localStorage.clear();
        } catch (e) {
            console.error('Error clearing localStorage:', e);
        }
    },

    saveSession: function(key, value) {
        try {
            sessionStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error('Error saving to sessionStorage:', e);
        }
    },

    getSession: function(key, defaultValue) {
        defaultValue = defaultValue || null;
        try {
            var item = sessionStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.error('Error reading from sessionStorage:', e);
            return defaultValue;
        }
    }
};

// ============================================================================
// TOAST NOTIFICATION COMPONENT
// ============================================================================

function Toast(options) {
    this.message = options.message || '';
    this.title = options.title || '';
    this.type = options.type || 'info';
    this.duration = options.duration !== undefined ? options.duration : 5000;
    this.position = options.position || 'top-right';
    this.closeButton = options.closeButton !== false;
}

Toast.prototype.show = function() {
    var container = this._getContainer();
    var self = this;

    var toast = document.createElement('div');
    toast.className = 'toast toast-' + this.type + ' show';
    toast.innerHTML = [
        '<div class="toast-header">',
        '<i class="bi bi-' + this._getIcon() + ' me-2"></i>',
        '<strong class="me-auto">' + this.title + '</strong>',
        this.closeButton ? '<button type="button" class="btn-close" data-bs-dismiss="toast"></button>' : '',
        '</div>',
        this.message ? '<div class="toast-body">' + this.message + '</div>' : ''
    ].join('');

    container.appendChild(toast);

    if (this.duration > 0) {
        setTimeout(function() {
            self.hide(toast);
        }, this.duration);
    }

    if (this.closeButton) {
        var closeBtn = toast.querySelector('.btn-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                self.hide(toast);
            });
        }
    }

    return toast;
};

Toast.prototype.hide = function(toast) {
    toast.classList.remove('show');
    setTimeout(function() {
        toast.remove();
    }, 300);
};

Toast.prototype._getContainer = function() {
    var container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container position-fixed ' + this._getPositionClass();
        document.body.appendChild(container);
    }
    return container;
};

Toast.prototype._getPositionClass = function() {
    var positions = {
        'top-right': 'top-0 end-0',
        'top-left': 'top-0 start-0',
        'bottom-right': 'bottom-0 end-0',
        'bottom-left': 'bottom-0 start-0',
        'top-center': 'top-0 start-50 translate-middle-x'
    };
    return positions[this.position] || positions['top-right'];
};

Toast.prototype._getIcon = function() {
    var icons = {
        'success': 'check-circle-fill text-success',
        'error': 'x-circle-fill text-danger',
        'warning': 'exclamation-triangle-fill text-warning',
        'info': 'info-circle-fill text-info'
    };
    return icons[this.type] || icons['info'];
};

// ============================================================================
// QUICK TOAST HELPERS
// ============================================================================

function showToast(message, title, type) {
    title = title || 'Notification';
    type = type || 'info';
    var toast = new Toast({ message: message, title: title, type: type });
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
// LOADING OVERLAY
// ============================================================================

function LoadingOverlay(message) {
    this.id = 'loading-overlay';
    this.message = message || 'Loading...';
    this.element = null;
}

LoadingOverlay.prototype.show = function(message) {
    if (message) this.message = message;

    var overlay = document.getElementById(this.id);
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = this.id;
        overlay.className = 'loading-overlay';
        overlay.innerHTML = [
            '<div class="loading-overlay-content">',
            '<div class="spinner-border text-primary" role="status">',
            '<span class="visually-hidden">Loading...</span>',
            '</div>',
            '<div class="loading-overlay-message">' + this.message + '</div>',
            '</div>'
        ].join('');
        document.body.appendChild(overlay);
    } else {
        overlay.querySelector('.loading-overlay-message').textContent = this.message;
    }

    overlay.style.display = 'flex';
    var self = this;
    setTimeout(function() {
        overlay.classList.add('show');
    }, 10);
};

LoadingOverlay.prototype.hide = function() {
    var overlay = document.getElementById(this.id);
    if (overlay) {
        overlay.classList.remove('show');
        setTimeout(function() {
            overlay.style.display = 'none';
        }, 300);
    }
};

// ============================================================================
// MODAL COMPONENT (Simplified)
// ============================================================================

function Modal(options) {
    this.id = options.id || 'modal-' + Date.now();
    this.title = options.title || 'Modal';
    this.size = options.size || 'medium';
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

Modal.prototype.create = function() {
    var sizeClasses = {
        'small': 'modal-sm',
        'medium': '',
        'large': 'modal-lg',
        'extra-large': 'modal-xl'
    };

    var self = this;
    var modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = this.id;
    modal.setAttribute('tabindex', '-1');
    modal.setAttribute('aria-labelledby', this.id + '-label');
    modal.setAttribute('aria-hidden', 'true');

    modal.innerHTML = [
        '<div class="modal-dialog ' + (sizeClasses[this.size] || '') + ' ' + (this.centered ? 'modal-dialog-centered' : '') + '">',
        '<div class="modal-content">',
        '<div class="modal-header">',
        '<h5 class="modal-title" id="' + this.id + '-label">' + this.title + '</h5>',
        '<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>',
        '</div>',
        '<div class="modal-body">',
        this.content,
        '</div>',
        this.footer ? '<div class="modal-footer">' + this.footer + '</div>' : '',
        '</div>',
        '</div>'
    ].join('');

    document.body.appendChild(modal);
    this.element = modal;

    if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
        this.bsInstance = new bootstrap.Modal(modal, {
            backdrop: this.backdrop,
            keyboard: this.keyboard
        });
    }

    modal.addEventListener('shown.bs.modal', function() {
        if (self.onShow) self.onShow();
    });

    modal.addEventListener('hidden.bs.modal', function() {
        if (self.onHide) self.onHide();
    });

    return this;
};

Modal.prototype.show = function() {
    if (!this.element) this.create();
    if (this.bsInstance) {
        this.bsInstance.show();
    } else {
        this.element.classList.add('show');
        this.element.style.display = 'block';
    }
    return this;
};

Modal.prototype.hide = function() {
    if (this.bsInstance) {
        this.bsInstance.hide();
    } else if (this.element) {
        this.element.classList.remove('show');
        this.element.style.display = 'none';
    }
    return this;
};

Modal.prototype.setContent = function(content) {
    this.content = content;
    if (this.element) {
        this.element.querySelector('.modal-body').innerHTML = content;
    }
    return this;
};

Modal.prototype.setTitle = function(title) {
    this.title = title;
    if (this.element) {
        this.element.querySelector('.modal-title').textContent = title;
    }
    return this;
};

Modal.prototype.destroy = function() {
    if (this.bsInstance) {
        this.bsInstance.dispose();
    }
    if (this.element) {
        this.element.remove();
    }
    this.element = null;
    this.bsInstance = null;
    return this;
};

// ============================================================================
// CONFIRMATION DIALOG
// ============================================================================

function confirmDialog(options) {
    options = options || {};
    return new Promise(function(resolve) {
        var modal = new Modal({
            title: options.title || 'Confirm',
            size: 'small',
            content: options.message || 'Are you sure?',
            footer: [
                '<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">' + (options.cancelText || 'Cancel') + '</button>',
                '<button type="button" class="btn btn-' + (options.type || 'danger') + '" id="confirm-btn">' + (options.confirmText || 'Confirm') + '</button>'
            ].join(''),
            onShow: function() {
                var confirmBtn = document.getElementById('confirm-btn');
                confirmBtn.focus();

                confirmBtn.addEventListener('click', function() {
                    modal.hide();
                    resolve(true);
                });
            },
            onHide: function() {
                resolve(false);
            }
        });

        modal.show();
    });
}

// ============================================================================
// ALERT DIALOG
// ============================================================================

function alertDialog(options) {
    options = options || {};
    return new Promise(function(resolve) {
        var type = options.type || 'info';
        var icons = {
            'success': 'check-circle-fill text-success',
            'error': 'x-circle-fill text-danger',
            'warning': 'exclamation-triangle-fill text-warning',
            'info': 'info-circle-fill text-info'
        };

        var modal = new Modal({
            title: options.title || 'Notice',
            size: 'small',
            content: [
                '<div class="text-center">',
                '<i class="bi bi-' + icons[type] + ' fs-1 mb-3"></i>',
                '<p class="mb-0">' + (options.message || '') + '</p>',
                '</div>'
            ].join(''),
            footer: '<button type="button" class="btn btn-primary" data-bs-dismiss="modal">OK</button>',
            onHide: function() {
                resolve();
            }
        });

        modal.show();
    });
}

// ============================================================================
// DATA TABLE COMPONENT (Simplified for ES5)
// ============================================================================

function DataTable(options) {
    this.container = options.container;
    this.columns = options.columns || [];
    this.data = options.data || [];
    this.rowId = options.rowId || 'id';
    this.selectable = options.selectable || false;
    this.onRowClick = options.onRowClick || null;
    this.paginator = options.paginator !== false;
    this.pageSize = options.pageSize || 25;
    this.currentPage = 1;
    this.searchable = options.searchable !== false;
    this.sortable = options.sortable !== false;
    this.element = null;
    this.selectedRows = [];
}

DataTable.prototype.render = function() {
    var container = document.querySelector(this.container);
    if (!container) return;

    container.innerHTML = [
        '<div class="data-table-wrapper">',
        this.searchable ? this._renderSearch() : '',
        '<div class="table-responsive">',
        '<table class="table table-hover table-striped">',
        '<thead>' + this._renderHeader() + '</thead>',
        '<tbody>' + this._renderBody() + '</tbody>',
        '</table>',
        '</div>',
        this.paginator ? this._renderPaginator() : '',
        '</div>'
    ].join('');

    this.element = container.querySelector('.data-table-wrapper');
    this._attachEventListeners();
};

DataTable.prototype._renderSearch = function() {
    return [
        '<div class="data-table-search mb-3">',
        '<div class="input-group">',
        '<span class="input-group-text"><i class="bi bi-search"></i></span>',
        '<input type="text" class="form-control" placeholder="Search..." id="table-search">',
        '</div>',
        '</div>'
    ].join('');
};

DataTable.prototype._renderHeader = function() {
    var self = this;
    var headerRow = ['<tr>'];

    if (this.selectable) {
        headerRow.push('<th><input type="checkbox" id="select-all"></th>');
    }

    this.columns.forEach(function(col) {
        var sortableAttr = self.sortable ? 'class="sortable" data-column="' + col.key + '"' : '';
        var sortIcon = self.sortable ? '<i class="bi bi-arrow-down-up sort-icon"></i>' : '';
        headerRow.push('<th ' + sortableAttr + '>' + col.label + ' ' + sortIcon + '</th>');
    });

    headerRow.push('</tr>');
    return headerRow.join('');
};

DataTable.prototype._renderBody = function() {
    var self = this;
    if (this.data.length === 0) {
        var colspan = this.columns.length + (this.selectable ? 1 : 0);
        return '<tr><td colspan="' + colspan + '" class="text-center text-muted py-5">No data available</td></tr>';
    }

    return this._getPaginatedData().map(function(row) {
        var cells = [];
        cells.push('<tr data-row-id="' + row[self.rowId] + '"' + (self.onRowClick ? ' class="clickable"' : '') + '>');

        if (self.selectable) {
            cells.push('<td><input type="checkbox" class="row-select" value="' + row[self.rowId] + '"></td>');
        }

        self.columns.forEach(function(col) {
            cells.push('<td>' + self._formatCellValue(row[col.key], col) + '</td>');
        });

        cells.push('</tr>');
        return cells.join('');
    }).join('');
};

DataTable.prototype._formatCellValue = function(value, column) {
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
        var badgeClass = column.badgeClass || 'secondary';
        return '<span class="badge bg-' + badgeClass + '">' + value + '</span>';
    }

    return value != null && value !== undefined ? value : '-';
};

DataTable.prototype._renderPaginator = function() {
    var totalPages = Math.ceil(this.data.length / this.pageSize);
    var start = (this.currentPage - 1) * this.pageSize + 1;
    var end = Math.min(this.currentPage * this.pageSize, this.data.length);

    return [
        '<nav aria-label="Table pagination" class="mt-3">',
        '<div class="d-flex justify-content-between align-items-center">',
        '<div class="text-muted small">Showing ' + start + ' to ' + end + ' of ' + this.data.length + ' entries</div>',
        '<ul class="pagination pagination-sm mb-0">',
        '<li class="page-item ' + (this.currentPage === 1 ? 'disabled' : '') + '">',
        '<a class="page-link" href="#" data-page="' + (this.currentPage - 1) + '">Previous</a>',
        '</li>',
        this._renderPageNumbers(totalPages),
        '<li class="page-item ' + (this.currentPage === totalPages ? 'disabled' : '') + '">',
        '<a class="page-link" href="#" data-page="' + (this.currentPage + 1) + '">Next</a>',
        '</li>',
        '</ul>',
        '</div>',
        '</nav>'
    ].join('');
};

DataTable.prototype._renderPageNumbers = function(totalPages) {
    var pages = [];
    var maxPages = 5;
    var start = Math.max(1, this.currentPage - Math.floor(maxPages / 2));
    var end = Math.min(totalPages, start + maxPages - 1);

    if (end - start < maxPages - 1) {
        start = Math.max(1, end - maxPages + 1);
    }

    for (var i = start; i <= end; i++) {
        pages.push([
            '<li class="page-item ' + (i === this.currentPage ? 'active' : '') + '">',
            '<a class="page-link" href="#" data-page="' + i + '">' + i + '</a>',
            '</li>'
        ].join(''));
    }

    return pages.join('');
};

DataTable.prototype._getPaginatedData = function() {
    if (!this.paginator) return this.data;

    var start = (this.currentPage - 1) * this.pageSize;
    var end = start + this.pageSize;
    return this.data.slice(start, end);
};

DataTable.prototype._attachEventListeners = function() {
    var self = this;

    // Search
    if (this.searchable) {
        var searchInput = this.element.querySelector('#table-search');
        if (searchInput) {
            searchInput.addEventListener('input', function(e) {
                var query = e.target.value.toLowerCase();
                self.filter(query);
            });
        }
    }

    // Sort
    if (this.sortable) {
        var sortableHeaders = this.element.querySelectorAll('th.sortable');
        sortableHeaders.forEach(function(th) {
            th.addEventListener('click', function() {
                var column = th.getAttribute('data-column');
                self.sort(column);
            });
        });
    }

    // Pagination
    if (this.paginator) {
        var pageLinks = this.element.querySelectorAll('.page-link');
        pageLinks.forEach(function(link) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                var page = parseInt(e.target.getAttribute('data-page'));
                if (page > 0 && page <= Math.ceil(self.data.length / self.pageSize)) {
                    self.goToPage(page);
                }
            });
        });
    }
};

DataTable.prototype.setData = function(data) {
    this.data = data;
    this.currentPage = 1;
    this.render();
};

DataTable.prototype.filter = function(query) {
    if (!query) {
        this.render();
        return;
    }

    var self = this;
    var filtered = this.data.filter(function(row) {
        return self.columns.some(function(col) {
            var value = row[col.key];
            return value && value.toString().toLowerCase().indexOf(query) !== -1;
        });
    });

    var container = document.querySelector(this.container);
    container.innerHTML = '';
    var originalData = this.data;
    this.data = filtered;
    this.render();
    this.data = originalData;
};

DataTable.prototype.sort = function(column) {
    var self = this;
    this.data.sort(function(a, b) {
        var aVal = a[column];
        var bVal = b[column];

        if (aVal < bVal) return -1;
        if (aVal > bVal) return 1;
        return 0;
    });

    this.render();
};

DataTable.prototype.goToPage = function(page) {
    this.currentPage = page;
    this.render();
};

// ============================================================================
// PROGRESS BAR COMPONENT
// ============================================================================

function ProgressBar(options) {
    this.value = options.value || 0;
    this.max = options.max || 100;
    this.label = options.label || '';
    this.showPercentage = options.showPercentage !== false;
    this.color = options.color || 'primary';
    this.striped = options.striped || false;
    this.animated = options.animated || false;
    this.height = options.height || null;
    this.element = null;
}

ProgressBar.prototype.setValue = function(value) {
    this.value = Math.max(0, Math.min(this.max, value));
    if (this.element) {
        var bar = this.element.querySelector('.progress-bar');
        var percentage = (this.value / this.max) * 100;
        bar.style.width = percentage + '%';
        bar.setAttribute('aria-valuenow', this.value);

        if (this.showPercentage) {
            var label = this.element.querySelector('.progress-label');
            if (label) {
                label.textContent = Math.round(percentage) + '%';
            }
        }
    }
};

ProgressBar.prototype.render = function() {
    var percentage = Math.round((this.value / this.max) * 100);
    var heightStyle = this.height ? 'height: ' + this.height + 'px;' : '';

    return [
        '<div class="progress-wrapper">',
        this.label ? '<div class="d-flex justify-content-between mb-1"><span>' + this.label + '</span>' + (this.showPercentage ? '<span class="progress-label">' + percentage + '%</span>' : '') + '</div>' : '',
        '<div class="progress" style="' + heightStyle + '">',
        '<div class="progress-bar bg-' + this.color + ' ' + (this.striped ? 'progress-bar-striped' : '') + ' ' + (this.animated ? 'progress-bar-animated' : '') + '"',
        ' role="progressbar"',
        ' style="width: ' + percentage + '%"',
        ' aria-valuenow="' + this.value + '"',
        ' aria-valuemin="0"',
        ' aria-valuemax="' + this.max + '">',
        '</div>',
        '</div>',
        '</div>'
    ].join('');
};

// ============================================================================
// API CLIENT WRAPPER
// ============================================================================

var api = {
    dashboard: {
        getExecutiveData: function() {
            // Placeholder - replace with actual API call
            return Promise.resolve({
                success: true,
                data: {
                    stats: {
                        totalGoals: 0,
                        activeKPIs: 0,
                        pendingReviews: 0
                    }
                }
            });
        }
    },
    system: {
        getLogs: function(params) {
            // Placeholder - replace with actual API call
            return Promise.resolve({ success: true });
        }
    }
};

// ============================================================================
// AUTHENTICATION (Simplified)
// ============================================================================

var auth = {
    user: null,
    init: function() {
        // Placeholder - implement actual auth logic
        return Promise.resolve();
    },
    isAdmin: function() {
        // Placeholder - implement actual admin check
        return false;
    },
    on: function(event, callback) {
        // Placeholder - implement actual event handling
    }
};

// ============================================================================
// APPLICATION (Converted from Class to Function)
// ============================================================================

function Application() {
    this.name = 'Strategic Execution Monitoring';
    this.version = '1.0.0';
    this.currentUser = null;
    this.currentView = 'dashboard';
    this.views = {};
    this.plugins = [];
    this.isInitialized = false;
    this.developmentMode = false;
}

Application.prototype.init = function() {
    var self = this;
    if (this.isInitialized) return Promise.resolve();

    console.log('[' + this.name + '] Initializing...');

    return new Promise(function(resolve, reject) {
        try {
            var loading = new LoadingOverlay('Initializing application...');
            loading.show();

            auth.init().then(function() {
                self.currentUser = auth.user;

                if (!self.currentUser) {
                    console.warn('No user session found');
                    loading.hide();
                    resolve();
                    return;
                }

                self._initializeViews();
                self._setupEventListeners();
                self._setupErrorHandler();

                loading.hide();

                console.log('[' + self.name + '] Initialized successfully');
                self.isInitialized = true;
                self._triggerEvent('ready');
                resolve();
            }).catch(function(error) {
                console.error('Application initialization error:', error);
                showErrorToast('Failed to initialize application. Please refresh the page.');
                loading.hide();
                reject(error);
            });
        } catch (error) {
            console.error('Application initialization error:', error);
            showErrorToast('Failed to initialize application. Please refresh the page.');
            reject(error);
        }
    });
};

Application.prototype._initializeViews = function() {
    var self = this;
    this.views = {
        'dashboard': {
            title: 'Dashboard',
            icon: 'speedometer2',
            element: document.getElementById('dashboard-view'),
            onLoad: function() { return self._loadDashboard(); }
        },
        'organization': {
            title: 'Organization',
            icon: 'building',
            element: document.getElementById('organization-view'),
            onLoad: function() { return self._loadOrganization(); }
        },
        'strategic-plan': {
            title: 'Strategic Planning',
            icon: 'compass',
            element: document.getElementById('strategic-plan-view'),
            onLoad: function() { return self._loadStrategicPlan(); }
        },
        'kpi': {
            title: 'KPI Management',
            icon: 'graph-up',
            element: document.getElementById('kpi-view'),
            onLoad: function() { return self._loadKPI(); }
        },
        'okr': {
            title: 'Weekly OKRs',
            icon: 'trophy',
            element: document.getElementById('okr-view'),
            onLoad: function() { return self._loadOKR(); }
        },
        'programs': {
            title: 'Programs',
            icon: 'diagram-3-fill',
            element: document.getElementById('programs-view'),
            onLoad: function() { return self._loadPrograms(); }
        },
        'impact-centers': {
            title: 'Impact Centers',
            icon: 'radar',
            element: document.getElementById('impact-centers-view'),
            onLoad: function() { return self._loadImpactCenters(); }
        },
        'reports': {
            title: 'Reports',
            icon: 'file-earmark-bar-graph',
            element: document.getElementById('reports-view'),
            onLoad: function() { return self._loadReports(); }
        },
        'users': {
            title: 'User Management',
            icon: 'people',
            element: document.getElementById('users-view'),
            adminOnly: true,
            onLoad: function() { return self._loadUsers(); }
        },
        'settings': {
            title: 'Settings',
            icon: 'gear',
            element: document.getElementById('settings-view'),
            onLoad: function() { return self._loadSettings(); }
        }
    };
};

Application.prototype.switchView = function(viewName, navElement) {
    var self = this;
    var view = this.views[viewName];
    if (!view) {
        console.error('View not found: ' + viewName);
        return Promise.resolve();
    }

    // Check admin access
    if (view.adminOnly && !auth.isAdmin()) {
        showToast('You do not have permission to access this page', 'Access Denied');
        return Promise.resolve();
    }

    // Hide all views
    var viewSections = document.querySelectorAll('.view-section');
    Array.prototype.forEach.call(viewSections, function(el) {
        el.classList.remove('active');
    });

    // Update navigation active state
    if (navElement) {
        var navLinks = document.querySelectorAll('.nav-link');
        Array.prototype.forEach.call(navLinks, function(el) {
            el.classList.remove('active');
        });
        navElement.classList.add('active');
    }

    // Show selected view
    if (view.element) {
        view.element.classList.add('active');

        // Load view data
        if (view.onLoad) {
            return view.onLoad().then(function() {
                self.currentView = viewName;
                StorageUtils.saveSession('lastView', viewName);
                document.title = view.title + ' - ' + self.name;
                self._triggerEvent('viewChange', { viewName: viewName, view: view });
            }).catch(function(error) {
                console.error('Error loading view ' + viewName + ':', error);
            });
        }
    }

    return Promise.resolve();
};

Application.prototype._loadDashboard = function() {
    var self = this;
    console.log('Loading dashboard...');

    return api.dashboard.getExecutiveData().then(function(response) {
        if (response.success && response.data) {
            self._updateDashboardStats(response.data);
        }
    }).catch(function(error) {
        console.error('Error loading dashboard:', error);
    });
};

Application.prototype._updateDashboardStats = function(data) {
    if (data.stats) {
        this._updateStatCard('stat-total-goals', data.stats.totalGoals);
        this._updateStatCard('stat-active-kpis', data.stats.activeKPIs);
        this._updateStatCard('stat-pending-reviews', data.stats.pendingReviews);
    }
};

Application.prototype._updateStatCard = function(elementId, value) {
    var element = document.getElementById(elementId);
    if (element) {
        element.textContent = value || 0;
    }
};

Application.prototype._loadOrganization = function() {
    console.log('Loading organization...');
    return Promise.resolve();
};

Application.prototype._loadStrategicPlan = function() {
    console.log('Loading strategic plan...');
    return Promise.resolve();
};

Application.prototype._loadKPI = function() {
    console.log('Loading KPI management...');
    return Promise.resolve();
};

Application.prototype._loadOKR = function() {
    console.log('Loading OKRs...');
    return Promise.resolve();
};

Application.prototype._loadPrograms = function() {
    console.log('Loading programs...');
    return Promise.resolve();
};

Application.prototype._loadImpactCenters = function() {
    console.log('Loading impact centers...');
    return Promise.resolve();
};

Application.prototype._loadReports = function() {
    console.log('Loading reports...');
    return Promise.resolve();
};

Application.prototype._loadUsers = function() {
    console.log('Loading user management...');
    return Promise.resolve();
};

Application.prototype._loadSettings = function() {
    console.log('Loading settings...');
    return Promise.resolve();
};

Application.prototype._setupEventListeners = function() {
    var self = this;

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Escape to close modals
        if (e.key === 'Escape') {
            var openModal = document.querySelector('.modal.show');
            if (openModal && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
                var bsModal = bootstrap.Modal.getInstance(openModal);
                if (bsModal) bsModal.hide();
            }
        }
    });

    // Handle online/offline status
    window.addEventListener('online', function() {
        showToast('You are back online', 'Connection Restored');
        self._triggerEvent('online');
    });

    window.addEventListener('offline', function() {
        showWarningToast('You are offline. Some features may be unavailable.');
        self._triggerEvent('offline');
    });

    // Handle visibility change
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            self._triggerEvent('blur');
        } else {
            self._triggerEvent('focus');
            self._refreshCurrentView();
        }
    });
};

Application.prototype._setupErrorHandler = function() {
    var self = this;
    window.addEventListener('error', function(event) {
        console.error('Global error:', event.error);
        self._logError(event.error);
    });

    window.addEventListener('unhandledrejection', function(event) {
        console.error('Unhandled promise rejection:', event.reason);
        self._logError(event.reason);
    });
};

Application.prototype._logError = function(error) {
    try {
        var errorData = {
            message: error.message || error.toString(),
            stack: error.stack,
            url: window.location.href,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
        };

        api.system.getLogs({ error: errorData });
    } catch (e) {
        console.error('Failed to log error:', e);
    }
};

Application.prototype._refreshCurrentView = function() {
    var self = this;
    var view = this.views[this.currentView];
    if (view && view.onLoad) {
        view.onLoad().catch(function(error) {
            console.error('Error refreshing view:', error);
        });
    }
};

Application.prototype._triggerEvent = function(eventName, data) {
    data = data || null;
    var event = new CustomEvent('app:' + eventName, {
        detail: data
    });
    window.dispatchEvent(event);
};

Application.prototype.on = function(eventName, callback) {
    window.addEventListener('app:' + eventName, callback);
};

Application.prototype.off = function(eventName, callback) {
    window.removeEventListener('app:' + eventName, callback);
};

// ============================================================================
// CREATE GLOBAL APPLICATION INSTANCE
// ============================================================================

var app = new Application();

// Make available globally
if (typeof window !== 'undefined') {
    window.Application = Application;
    window.app = app;
    window.DateUtils = DateUtils;
    window.StringUtils = StringUtils;
    window.ValidationUtils = ValidationUtils;
    window.StorageUtils = StorageUtils;
    window.Toast = Toast;
    window.showToast = showToast;
    window.showSuccessToast = showSuccessToast;
    window.showErrorToast = showErrorToast;
    window.showWarningToast = showWarningToast;
    window.LoadingOverlay = LoadingOverlay;
    window.Modal = Modal;
    window.confirmDialog = confirmDialog;
    window.alertDialog = alertDialog;
    window.DataTable = DataTable;
    window.ProgressBar = ProgressBar;
    window.api = api;
    window.auth = auth;
}

// ============================================================================
// VIEW SWITCHING HELPER
// ============================================================================

function switchView(viewName, navElement) {
    app.switchView(viewName, navElement);
}

// ============================================================================
// APPLICATION INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', function() {
    var devMode = StorageUtils.getSession('developmentMode', false);
    app.developmentMode = devMode;
    app.init();
});

window.onload = function() {
    if (!app.isInitialized) {
        app.init();
    }
};
