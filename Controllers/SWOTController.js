/**
 * SWOT Analysis Module
 * Provides SWOT matrix view, analysis item management, and strategy formulation
 */

// ============================================================================
// SWOT ANALYSIS CONTROLLER
// ============================================================================

const SWOTController = {
    /**
     * Get SWOT items for a goal
     */
    getByGoal: function(goalId) {
        try {
            const sheet = DatabaseService.getSheet('AnalysisItems');
            const data = DatabaseService.getAllData(sheet);

            const swotItems = data.filter(item => item.goal_id === goalId);

            return ResponseFormatter.formatSuccess({
                goalId,
                items: swotItems,
                summary: {
                    strength: swotItems.filter(i => i.analysis_category === 'STRENGTH').length,
                    weakness: swotItems.filter(i => i.analysis_category === 'WEAKNESS').length,
                    opportunity: swotItems.filter(i => i.analysis_category === 'OPPORTUNITY').length,
                    threat: swotItems.filter(i => i.analysis_category === 'THREAT').length
                }
            });

        } catch (error) {
            Logger.log('Error getting SWOT items: ' + error.toString());
            return ResponseFormatter.formatError('Failed to get SWOT items: ' + error.message);
        }
    },

    /**
     * Create SWOT analysis item
     */
    create: function(data, userId = 'system') {
        try {
            // Validate
            const validation = ValidationService.gs.validateSWOT(data);
            if (!validation.valid) {
                return ResponseFormatter.formatValidationError(validation.errors);
            }

            // Generate analysis code
            const typePrefix = data.analysis_type === 'INTERNAL' ? 'INT' : 'EXT';
            const categoryPrefix = data.analysis_category.substring(0, 3);
            const count = DatabaseService.getNextCounter('AnalysisItems', 'analysis_id');
            data.analysis_code = `${typePrefix}-${categoryPrefix}-${String(count).padStart(3, '0')}`;

            // Create
            const sheet = DatabaseService.getSheet('AnalysisItems');
            const id = DatabaseService.create(sheet, data, userId);

            if (id) {
                // Log to audit
                AuditService.logAudit('CREATE', 'AnalysisItems', id, userId, data);

                return ResponseFormatter.formatSuccess({
                    analysis_id: id,
                    ...data
                });
            }

            return ResponseFormatter.formatError('Failed to create SWOT analysis item');

        } catch (error) {
            Logger.log('Error creating SWOT item: ' + error.toString());
            return ResponseFormatter.formatError('Failed to create SWOT analysis: ' + error.message);
        }
    },

    /**
     * Update SWOT analysis item
     */
    update: function(analysisId, updates, userId = 'system') {
        try {
            const sheet = DatabaseService.getSheet('AnalysisItems');
            const existing = DatabaseService.getById(sheet, analysisId);

            if (!existing) {
                return ResponseFormatter.formatNotFound('Analysis item not found');
            }

            // Update
            const updated = DatabaseService.update(sheet, analysisId, updates, userId);

            if (updated) {
                // Log to audit
                AuditService.logAudit('UPDATE', 'AnalysisItems', analysisId, userId, updates);

                return ResponseFormatter.formatSuccess({
                    analysis_id: analysisId,
                    ...updated
                });
            }

            return ResponseFormatter.formatError('Failed to update SWOT analysis item');

        } catch (error) {
            Logger.log('Error updating SWOT item: ' + error.toString());
            return ResponseFormatter.formatError('Failed to update SWOT analysis: ' + error.message);
        }
    },

    /**
     * Delete SWOT analysis item
     */
    delete: function(analysisId, userId = 'system') {
        try {
            const sheet = DatabaseService.getSheet('AnalysisItems');
            const deleted = DatabaseService.deleteById(sheet, analysisId, userId);

            if (deleted) {
                AuditService.logAudit('DELETE', 'AnalysisItems', analysisId, userId);

                return ResponseFormatter.formatSuccess({
                    message: 'SWOT analysis item deleted successfully'
                });
            }

            return ResponseFormatter.formatError('Failed to delete SWOT analysis item');

        } catch (error) {
            Logger.log('Error deleting SWOT item: ' + error.toString());
            return ResponseFormatter.formatError('Failed to delete SWOT analysis: ' + error.message);
        }
    },

    /**
     * Get SWOT matrix for a goal
     */
    getMatrix: function(goalId) {
        try {
            const sheet = DatabaseService.getSheet('AnalysisItems');
            const data = DatabaseService.getAllData(sheet);

            const items = data.filter(item => item.goal_id === goalId);

            // Group by category
            const matrix = {
                strength: items.filter(i => i.analysis_category === 'STRENGTH'),
                weakness: items.filter(i => i.analysis_category === 'WEAKNESS'),
                opportunity: items.filter(i => i.analysis_category === 'OPPORTUNITY'),
                threat: items.filter(i => i.analysis_category === 'THREAT')
            };

            // Calculate TOWS analysis
            const strategies = this._generateTOWSStrategies(matrix);

            return ResponseFormatter.formatSuccess({
                goalId,
                matrix,
                strategies
            });

        } catch (error) {
            Logger.log('Error getting SWOT matrix: ' + error.toString());
            return ResponseFormatter.formatError('Failed to get SWOT matrix: ' + error.message);
        }
    },

    /**
     * Generate TOWS strategies
     * @private
     */
    _generateTOWSStrategies(matrix) {
        const strategies = [];

        // SO Strategies (Strengths + Opportunities)
        matrix.strength.forEach(s => {
            matrix.opportunity.forEach(o => {
                strategies.push({
                    type: 'SO',
                    description: `Use "${s.title}" to leverage "${o.title}"`,
                    strength: s.analysis_id,
                    opportunity: o.analysis_id
                });
            });
        });

        // WO Strategies (Weaknesses + Opportunities)
        matrix.weakness.forEach(w => {
            matrix.opportunity.forEach(o => {
                strategies.push({
                    type: 'WO',
                    description: `Address "${w.title}" by taking advantage of "${o.title}"`,
                    weakness: w.analysis_id,
                    opportunity: o.analysis_id
                });
            });
        });

        // ST Strategies (Strengths + Threats)
        matrix.strength.forEach(s => {
            matrix.threat.forEach(t => {
                strategies.push({
                    type: 'ST',
                    description: `Use "${s.title}" to mitigate "${t.title}"`,
                    strength: s.analysis_id,
                    threat: t.analysis_id
                });
            });
        });

        // WT Strategies (Weaknesses + Threats)
        matrix.weakness.forEach(w => {
            matrix.threat.forEach(t => {
                strategies.push({
                    type: 'WT',
                    description: `Minimize "${w.title}" and "${t.title}" to avoid risks`,
                    weakness: w.analysis_id,
                    threat: t.analysis_id
                });
            });
        });

        return strategies;
    },

    /**
     * Get impact analysis
     */
    getImpactAnalysis: function(goalId) {
        try {
            const sheet = DatabaseService.getSheet('AnalysisItems');
            const data = DatabaseService.getAllData(sheet);

            const items = data.filter(item => item.goal_id === goalId);

            // Calculate impact score
            const highImpactItems = items.filter(i => i.impact_level === 'HIGH').length;
            const mediumImpactItems = items.filter(i => i.impact_level === 'MEDIUM').length;
            const lowImpactItems = items.filter(i => i.impact_level === 'LOW').length;

            const overallScore = (highImpactItems * 3 + mediumImpactItems * 2 + lowImpactItems * 1) / (items.length || 1);

            return ResponseFormatter.formatSuccess({
                goalId,
                impactScore: overallScore,
                distribution: {
                    high: highImpactItems,
                    medium: mediumImpactItems,
                    low: lowImpactItems
                },
                recommendations: this._generateImpactRecommendations(overallScore, items)
            });

        } catch (error) {
            Logger.log('Error getting impact analysis: ' + error.toString());
            return ResponseFormatter.formatError('Failed to get impact analysis: ' + error.message);
        }
    },

    /**
     * Generate impact recommendations
     * @private
     */
    _generateImpactRecommendations(score, items) {
        const recommendations = [];

        if (score >= 2.5) {
            recommendations.push({
                type: 'info',
                message: 'High impact factors detected. Focus on leveraging strengths and opportunities.'
            });
        } else if (score >= 1.5) {
            recommendations.push({
                type: 'warning',
                message: 'Moderate impact. Consider addressing key weaknesses and threats.'
            });
        } else {
            recommendations.push({
                type: 'success',
                message: 'Low impact factors. Favorable conditions for goal achievement.'
            });
        }

        return recommendations;
    }
};

// ============================================================================
// EXPORT
// ============================================================================

if (typeof window !== 'undefined') {
    window.SWOTController = SWOTController;
}
