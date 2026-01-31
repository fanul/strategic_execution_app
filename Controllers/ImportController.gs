/**
 * Import Controller for Strategic Execution Monitoring Application
 * Handles bulk import of data from Excel/CSV files with validation and column mapping
 */

const ImportController = {
    /**
     * Validate import data
     */
    validate: function(entityType, data) {
        try {
            // Define validation rules for each entity type
            const validationRules = {
                'users': {
                    requiredFields: ['username', 'email', 'full_name', 'role_id'],
                    uniqueFields: ['username', 'email'],
                    validation: {
                        username: (value) => ValidationService.gs.validateUsername(value),
                        email: (value) => ValidationService.gs.validateEmail(value)
                    }
                },
                'directorates': {
                    requiredFields: ['directorate_name'],
                    validation: {
                        directororate_name: (value) => value && value.length > 0
                    }
                },
                'workunits': {
                    requiredFields: ['work_unit_name', 'directorate_id'],
                    validation: {
                        work_unit_name: (value) => value && value.length > 0
                    }
                },
                'kpis': {
                    requiredFields: ['kpi_name', 'directorate_id', 'work_unit_id', 'year', 'perspective'],
                    validation: {
                        kpi_name: (value) => value && value.length > 0
                    }
                },
                'goals': {
                    requiredFields: ['goal_name', 'year'],
                    validation: {
                        goal_name: (value) => value && value.length > 0
                    }
                }
            };

            const rules = validationRules[entityType];
            if (!rules) {
                return ResponseFormatter.formatError('Unknown entity type', 'INVALID_ENTITY');
            }

            const errors = [];
            const warnings = [];
            const validRows = [];
            const invalidRows = [];

            // Validate each row
            data.forEach((row, index) => {
                const rowErrors = [];
                const rowNum = index + 2; // +2 because Excel is 1-indexed and we have headers

                // Check required fields
                rules.requiredFields.forEach(field => {
                    if (!row[field] || row[field].toString().trim() === '') {
                        rowErrors.push({
                            field,
                            message: `${field} is required`,
                            row: rowNum
                        });
                    }
                });

                // Check unique fields
                if (rules.uniqueFields) {
                    rules.uniqueFields.forEach(field => {
                        const values = data.map(r => r[field]);
                        const count = values.filter(v => v === row[field]).length;
                        if (count > 1) {
                            rowErrors.push({
                                field,
                                message: `${field} must be unique (found ${count} duplicates)`,
                                row: rowNum
                            });
                        }
                    });
                }

                // Run custom validation
                if (rules.validation) {
                    Object.keys(rules.validation).forEach(field => {
                        if (row[field] && !rules.validation[field](row[field])) {
                            rowErrors.push({
                                field,
                                message: `${field} validation failed`,
                                row: rowNum
                            });
                        }
                    });
                }

                if (rowErrors.length > 0) {
                    invalidRows.push({
                        row: rowNum,
                        data: row,
                        errors: rowErrors
                    });
                } else {
                    validRows.push(row);
                }
            });

            return ResponseFormatter.formatSuccess({
                summary: {
                    total: data.length,
                    valid: validRows.length,
                    invalid: invalidRows.length
                },
                validRows,
                invalidRows,
                warnings
            });

        } catch (error) {
            Logger.log('Import validation error: ' + error.toString());
            return ResponseFormatter.formatError('Validation failed: ' + error.message);
        }
    },

    /**
     * Process import
     */
    process: function(entityType, data, options = {}) {
        try {
            const validation = this.validate(entityType, data);

            if (!validation.success) {
                return validation;
            }

            const validRows = validation.data.validRows;
            const summary = {
                entityType,
                total: validation.data.summary.total,
                success: 0,
                failed: 0,
                details: []
            };

            // Import each valid row
            validRows.forEach((row, index) => {
                try {
                    let result;

                    switch (entityType) {
                        case 'users':
                            result = UserController.create(row, 'import');
                            break;
                        case 'directorates':
                            result = OrganizationController.Directorate.create(row, 'import');
                            break;
                        case 'workunits':
                            result = OrganizationController.WorkUnit.create(row, 'import');
                            break;
                        case 'kpis':
                            result = KPIController.create(row, 'import');
                            break;
                        case 'goals':
                            result = StrategicController.Goal.create(row, 'import');
                            break;
                        default:
                            throw new Error(`Unknown entity type: ${entityType}`);
                    }

                    if (result.success) {
                        summary.success++;
                        summary.details.push({
                            row: index + 2,
                            status: 'success',
                            id: result.data?.id,
                            message: 'Imported successfully'
                        });
                    } else {
                        summary.failed++;
                        summary.details.push({
                            row: index + 2,
                            status: 'failed',
                            message: result.message || 'Import failed'
                        });
                    }

                } catch (error) {
                    summary.failed++;
                    summary.details.push({
                        row: index + 2,
                        status: 'error',
                        message: error.toString()
                    });
                }
            });

            // Log import to audit trail
            AuditService.logAudit('IMPORT', entityType, null, 'system', {
                summary: summary,
                timestamp: new Date().toISOString()
            });

            return ResponseFormatter.formatSuccess({
                message: `Import complete: ${summary.success} succeeded, ${summary.failed} failed`,
                summary
            });

        } catch (error) {
            Logger.log('Import processing error: ' + error.toString());
            return ResponseFormatter.formatError('Import failed: ' + error.message);
        }
    },

    /**
     * Get import template
     */
    getTemplate: function(entityType) {
        const templates = {
            'users': [
                { username: 'john.doe', email: 'john.doe@example.com', full_name: 'John Doe', role_id: 'role-uuid', active_from: '2024-01-01' },
                { username: 'jane.smith', email: 'jane.smith@example.com', full_name: 'Jane Smith', role_id: 'role-uuid', active_from: '2024-01-01' }
            ],
            'directorates': [
                { directorate_name: 'Information Technology', description: 'IT department' },
                { directorate_name: 'Finance', description: 'Finance department' }
            ],
            'workunits': [
                { work_unit_name: 'Software Development', directorate_id: 'dir-uuid', description: 'Dev team' },
                { work_unit_name: 'Infrastructure', directorate_id: 'dir-uuid', description: 'Infrastructure team' }
            ],
            'kpis': [
                { kpi_name: 'Customer Satisfaction', year: 2024, directorate_id: 'dir-uuid', work_unit_id: 'wu-uuid', perspective: 'CUSTOMER', target_value: 90 },
                { kpi_name: 'Budget Utilization', year: 2024, directorate_id: 'dir-uuid', work_unit_id: 'wu-uuid', perspective: 'FINANCIAL', target_value: 95 }
            ],
            'goals': [
                { goal_name: 'Digital Transformation', year: 2024, goal_description: 'Achieve digital excellence' },
                { goal_name: 'Cost Optimization', year: 2024, goal_description: 'Reduce operational costs' }
            ]
        };

        const template = templates[entityType];
        if (!template) {
            return ResponseFormatter.formatError('No template available for entity type: ' + entityType);
        }

        return ResponseFormatter.formatSuccess({
            entityType,
            template,
            filename: `${entityType}_template.json`
        });
    }
};
