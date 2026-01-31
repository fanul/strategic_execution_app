/**
 * KPIController.gs
 * Business logic for monitoring and updating KPIs.
 */

/**
 * Calculates the status of a KPI based on current vs target value.
 * @param {number} current 
 * @param {number} target 
 * @param {string} trend - 'HIGHER_BETTER' or 'LOWER_BETTER'
 * @returns {string} 'ON_TRACK', 'AT_RISK', 'OFF_TRACK'
 */
function calculateKPIStatus(current, target, trend = 'HIGHER_BETTER') {
  if (target === 0) return 'UNKNOWN';

  const percentage = (current / target) * 100;
  
  if (trend === 'HIGHER_BETTER') {
    if (percentage >= 90) return 'ON_TRACK';
    if (percentage >= 75) return 'AT_RISK';
    return 'OFF_TRACK';
  } else {
    // For 'LOWER_BETTER' (e.g., defects, costs)
    // If current is 110% of target (bad), it's off track
    if (percentage <= 100) return 'ON_TRACK';
    if (percentage <= 115) return 'AT_RISK';
    return 'OFF_TRACK';
  }
}

/**
 * Updates a KPI value and recalculates status.
 * @param {string} kpiId 
 * @param {number} newValue 
 */
function updateKPIValue(kpiId, newValue) {
  // TODO: Fetch KPI, update value, calculate status, save to DB
  // logAudit('UPDATE', 'KPI', kpiId, `Value updated to ${newValue}`);
  return { success: true, message: 'KPI updated successfully' };
}
