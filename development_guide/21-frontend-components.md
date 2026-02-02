# Frontend Components

## Overview

This guide covers the reusable UI components used throughout the application.

## Bootstrap Components

The application uses Bootstrap 5 components extensively:

### Buttons

```html
<!-- Primary action -->
<button class="btn btn-primary">
    <i class="bi bi-save"></i> Save
</button>

<!-- Secondary action -->
<button class="btn btn-secondary">Cancel</button>

<!-- Danger action -->
<button class="btn btn-danger">
    <i class="bi bi-trash"></i> Delete
</button>

<!-- Outline styles -->
<button class="btn btn-outline-primary">Edit</button>
```

### Modals

```html
<!-- Modal structure -->
<div class="modal fade" id="myEntityModal" tabindex="-1">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Add My Entity</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                <form id="myEntityForm">
                    <input type="hidden" id="entity_id">
                    <div class="mb-3">
                        <label class="form-label">Name *</label>
                        <input type="text" class="form-control" id="entity_name" required>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-primary" onclick="saveMyEntity()">Save</button>
            </div>
        </div>
    </div>
</div>
```

### DataTables

```html
<table id="myentities-table" class="table table-striped">
    <thead>
        <tr>
            <th>Code</th>
            <th>Name</th>
            <th>Status</th>
            <th>Actions</th>
        </tr>
    </thead>
    <tbody id="myentities-body">
        <!-- Data will be inserted here -->
    </tbody>
</table>
```

```javascript
// Initialize DataTable
$('#myentities-table').DataTable({
    pageLength: 10,
    lengthMenu: [5, 10, 25, 50],
    language: { search: "_INPUT_", searchPlaceholder: "Search..." }
});
```

### Toast Notifications

```html
<!-- Toast container (in toasts.html) -->
<div class="toast-container position-fixed bottom-0 end-0 p-3">
    <div id="liveToast" class="toast" role="alert">
        <div class="toast-header">
            <strong class="me-auto" id="toastTitle">Notification</strong>
            <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
        </div>
        <div class="toast-body" id="toastMessage">
            Message content
        </div>
    </div>
</div>
```

```javascript
// Show toast
showToast('Operation completed successfully', 'success');
```

## Application Components

### Loading Overlay

```html
<!-- Loading indicator -->
<div class="loading-overlay" id="loadingOverlay">
    <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
    </div>
</div>
```

```javascript
// Show/hide loading
showLoading();
// ... do work
hideLoading();
```

### Confirmation Dialog

```html
<!-- Delete confirmation modal -->
<div class="modal fade" id="deleteConfirmModal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header bg-danger text-white">
                <h5 class="modal-title">
                    <i class="bi bi-exclamation-triangle me-2"></i>
                    Confirm Delete
                </h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                <p>Are you sure you want to delete <strong id="deleteItemName">this item</strong>?</p>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-danger" onclick="executeDelete()">
                    <i class="bi bi-trash me-2"></i>Delete
                </button>
            </div>
        </div>
    </div>
</div>
```

### Tabs

```html
<!-- Bootstrap tabs -->
<ul class="nav nav-tabs" id="myTab" role="tablist">
    <li class="nav-item">
        <button class="nav-link active" data-bs-target="#tab1" data-bs-toggle="tab">
            Tab 1
        </button>
    </li>
    <li class="nav-item">
        <button class="nav-link" data-bs-target="#tab2" data-bs-toggle="tab">
            Tab 2
        </button>
    </li>
</ul>

<div class="tab-content mt-3">
    <div class="tab-pane fade show active" id="tab1">
        Tab 1 content
    </div>
    <div class="tab-pane fade" id="tab2">
        Tab 2 content
    </div>
</div>
```

### Filters Panel

```html
<!-- Collapsible filters -->
<div class="accordion" id="filtersAccordion">
    <div class="accordion-item">
        <h2 class="accordion-header">
            <button class="accordion-button collapsed" type="button"
                    data-bs-toggle="collapse" data-bs-target="#filterCollapse">
                <i class="bi bi-funnel me-2"></i> Filters
            </button>
        </h2>
        <div id="filterCollapse" class="accordion-collapse collapse"
             data-bs-parent="#filtersAccordion">
            <div class="accordion-body">
                <div class="row g-3">
                    <div class="col-md-4">
                        <label class="form-label">Search</label>
                        <input type="text" class="form-control filter-input"
                               data-column="0" placeholder="Search...">
                    </div>
                    <div class="col-md-4">
                        <label class="form-label">Status</label>
                        <select class="form-select filter-input" data-column="2">
                            <option value="">All</option>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>
                    <div class="col-md-4 d-flex align-items-end">
                        <button class="btn btn-outline-secondary" onclick="clearFilters()">
                            Clear Filters
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
```

## Icons

The application uses Bootstrap Icons:

```html
<!-- Common icons -->
<i class="bi bi-plus-lg"></i>           <!-- Plus -->
<i class="bi bi-pencil"></i>            <!-- Edit -->
<i class="bi bi-trash"></i>             <!-- Delete -->
<i class="bi bi-search"></i>            <!-- Search -->
<i class="bi bi-funnel"></i>            <!-- Filter -->
<i class="bi bi-download"></i>          <!-- Download -->
<i class="bi bi-save"></i>              <!-- Save -->
<i class="bi bi-x-lg"></i>              <!-- Close/X -->
<i class="bi bi-check-lg"></i>          <!-- Check -->
<i class="bi bi-exclamation-triangle"></> <!-- Warning -->
<i class="bi bi-info-circle"></i>       <!-- Info -->
```

See [Bootstrap Icons](https://icons.getbootstrap.com/) for full list.

## Card Component

```html
<div class="card">
    <div class="card-header">
        <h5 class="card-title mb-0">Card Title</h5>
    </div>
    <div class="card-body">
        Card content goes here
    </div>
    <div class="card-footer">
        <button class="btn btn-primary btn-sm">Action</button>
    </div>
</div>
```

## Badge Component

```html
<!-- Status badges -->
<span class="badge bg-success">Active</span>
<span class="badge bg-warning">At Risk</span>
<span class="badge bg-danger">Off Track</span>
<span class="badge bg-secondary">Draft</span>
```

## Progress Bar

```html
<div class="progress" style="height: 25px;">
    <div class="progress-bar" role="progressbar"
         style="width: 75%"
         aria-valuenow="75" aria-valuemin="0" aria-valuemax="100">
        75%
    </div>
</div>
```

## Form Validation

```html
<form id="myForm" novalidate>
    <div class="mb-3">
        <label class="form-label">Email *</label>
        <input type="email" class="form-control" id="email" required>
        <div class="invalid-feedback">
            Please provide a valid email.
        </div>
    </div>
</form>

<script>
// Validate form
function validateForm() {
    const form = document.getElementById('myForm');
    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return false;
    }
    return true;
}
</script>
```

## Next Steps

- See [Frontend Structure](./20-frontend-structure.md) for architecture
- See [JavaScript Modules](./22-javascript-modules.md) for module patterns
