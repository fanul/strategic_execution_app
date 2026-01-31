/**
 * Controllers/ReportController.js
 * Report generation controller
 */

const ReportController = {
  generateKPIReport(filters = {}) {
    try {
      const { workUnitId, year, month } = filters;
      
      let kpis = workUnitId 
        ? KPIModel.getByWorkUnit(workUnitId, year)
        : getTableData(DB_CONFIG.SHEET_NAMES.KPIS).filter(k => !year || k.year === year);

      const reportData = kpis.map(kpi => {
        const progress = KPIModel.Progress.getByKPI(kpi.kpi_id, year, month);
        const latestProgress = progress.length > 0 ? progress[progress.length - 1] : null;

        return {
          kpi_code: kpi.kpi_code,
          kpi_name: kpi.kpi_name,
          target_value: kpi.target_value,
          actual_value: latestProgress ? latestProgress.actual_value : 0,
          achievement: latestProgress ? latestProgress.achievement_percentage : 0,
          status: this.calculateKPIStatus(latestProgress ? latestProgress.achievement_percentage : 0),
          work_unit: OrganizationModel.WorkUnit.findById(kpi.work_unit_id)?.work_unit_name || 'N/A'
        };
      });

      return { 
        success: true, 
        data: reportData,
        summary: this.calculateSummary(reportData)
      };
    } catch (error) {
      Logger.log('ReportController.generateKPIReport error: ' + error);
      return { success: false, message: 'Failed to generate KPI report', error: error.toString() };
    }
  },

  generateOKRReport(filters = {}) {
    try {
      const { userId, year, quarter } = filters;
      
      let okrs = userId
        ? OKRModel.getByUser(userId, year, quarter)
        : getTableData(DB_CONFIG.SHEET_NAMES.OKRS).filter(o => 
            (!year || o.year === year) && (!quarter || o.quarter === quarter)
          );

      const reportData = okrs.map(okr => {
        const user = UserModel.findById(okr.user_id);
        return {
          week: `${okr.year}-W${okr.week_number}`,
          user_name: user ? user.full_name : 'N/A',
          objective: okr.objective_text,
          overall_progress: okr.overall_progress,
          status: okr.status,
          key_results_count: [okr.key_result_1, okr.key_result_2, okr.key_result_3].filter(kr => kr).length
        };
      });

      return {
        success: true,
        data: reportData,
        summary: {
          total: okrs.length,
          avgProgress: okrs.reduce((sum, o) => sum + parseFloat(o.overall_progress || 0), 0) / okrs.length || 0
        }
      };
    } catch (error) {
      Logger.log('ReportController.generateOKRReport error: ' + error);
      return { success: false, message: 'Failed to generate OKR report', error: error.toString() };
    }
  },

  generatePerformanceDashboard(year) {
    try {
      const currentYear = year || new Date().getFullYear();
      
      // Get all KPIs for the year
      const kpis = getTableData(DB_CONFIG.SHEET_NAMES.KPIS).filter(k => k.year === currentYear);
      
      // Get all work units
      const workUnits = OrganizationModel.WorkUnit.getAll({ is_active: true });
      
      const workUnitPerformance = workUnits.map(wu => {
        const wuKPIs = kpis.filter(k => k.work_unit_id === wu.work_unit_id);
        
        let totalAchievement = 0;
        let kpiCount = 0;
        
        wuKPIs.forEach(kpi => {
          const progress = KPIModel.Progress.getByKPI(kpi.kpi_id, currentYear);
          if (progress.length > 0) {
            const latest = progress[progress.length - 1];
            totalAchievement += parseFloat(latest.achievement_percentage) || 0;
            kpiCount++;
          }
        });
        
        const avgAchievement = kpiCount > 0 ? totalAchievement / kpiCount : 0;
        
        return {
          work_unit_name: wu.work_unit_name,
          kpi_count: wuKPIs.length,
          avg_achievement: avgAchievement.toFixed(2),
          status: this.calculateKPIStatus(avgAchievement)
        };
      });

      return {
        success: true,
        data: {
          year: currentYear,
          work_units: workUnitPerformance,
          overall_avg: workUnitPerformance.reduce((sum, wu) => sum + parseFloat(wu.avg_achievement), 0) / workUnitPerformance.length || 0
        }
      };
    } catch (error) {
      Logger.log('ReportController.generatePerformanceDashboard error: ' + error);
      return { success: false, message: 'Failed to generate performance dashboard', error: error.toString() };
    }
  },

  calculateKPIStatus(achievementPercentage) {
    const achievement = parseFloat(achievementPercentage) || 0;
    const thresholds = CONFIG.KPI.THRESHOLDS;
    
    if (achievement >= thresholds.ON_TRACK_MIN) return 'ON_TRACK';
    if (achievement >= thresholds.AT_RISK_MIN) return 'AT_RISK';
    return 'OFF_TRACK';
  },

  calculateSummary(reportData) {
    const total = reportData.length;
    const onTrack = reportData.filter(r => r.status === 'ON_TRACK').length;
    const atRisk = reportData.filter(r => r.status === 'AT_RISK').length;
    const offTrack = reportData.filter(r => r.status === 'OFF_TRACK').length;
    const avgAchievement = reportData.reduce((sum, r) => sum + parseFloat(r.achievement || 0), 0) / total || 0;

    return {
      total,
      onTrack,
      atRisk,
      offTrack,
      avgAchievement: avgAchievement.toFixed(2)
    };
  }
};
