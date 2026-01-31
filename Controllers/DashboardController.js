/**
 * Controllers/DashboardController.gs
 * Dashboard data aggregation controller
 */

const DashboardController = {
  getData(userId) {
    try {
      const user = UserModel.findById(userId);
      if (!user) {
        return { success: false, message: "User not found" };
      }

      // Get active period
      const activePeriod = StrategicModel.Period.getActive();

      // Get user's position
      const primaryPosition =
        OrganizationModel.PositionAssignment.getPrimaryPosition(userId);

      // Get KPI statistics
      const currentYear = new Date().getFullYear();
      const kpis = primaryPosition
        ? KPIModel.getByWorkUnit(primaryPosition.work_unit_id, currentYear)
        : [];

      // Get OKR statistics
      const okrs = OKRModel.getByUser(userId, currentYear);
      const currentWeekOKR = OKRModel.getCurrentWeekOKR(userId);

      // Get recent activity
      const recentRevisions = getRecentRevisions(10, userId);

      return {
        success: true,
        data: {
          user: {
            user_id: user.user_id,
            full_name: user.full_name,
            email: user.email,
            role_id: user.role_id,
          },
          period: activePeriod,
          position: primaryPosition,
          stats: {
            totalKPIs: kpis.length,
            activeKPIs: kpis.filter((k) => k.status === "ACTIVE").length,
            totalOKRs: okrs.length,
            currentWeekOKR: currentWeekOKR,
            performanceScore: this.calculatePerformanceScore(kpis, okrs),
          },
          recentActivity: recentRevisions.data || [],
        },
      };
    } catch (error) {
      Logger.log("DashboardController.getData error: " + error);
      return {
        success: false,
        message: "Failed to load dashboard data",
        error: error.toString(),
      };
    }
  },

  calculatePerformanceScore(kpis, okrs) {
    if (kpis.length === 0 && okrs.length === 0) return 0;

    let totalScore = 0;
    let count = 0;

    // Calculate KPI average
    if (kpis.length > 0) {
      const kpiProgress = kpis.map((k) => {
        const progress = KPIModel.Progress.getByKPI(k.kpi_id);
        if (progress.length > 0) {
          const latest = progress[progress.length - 1];
          return parseFloat(latest.achievement_percentage) || 0;
        }
        return 0;
      });
      totalScore += kpiProgress.reduce((sum, p) => sum + p, 0);
      count += kpis.length;
    }

    // Calculate OKR average
    if (okrs.length > 0) {
      const okrProgress = okrs.map((o) => parseFloat(o.overall_progress) || 0);
      totalScore += okrProgress.reduce((sum, p) => sum + p, 0);
      count += okrs.length;
    }

    return count > 0 ? Math.round(totalScore / count) : 0;
  },

  // Get executive dashboard data
  getExecutiveData() {
    try {
      const currentYear = new Date().getFullYear();
      const activePeriod = StrategicModel.Period.getActive();

      // Get overall stats
      const allGoals = StrategicModel.Goal.getByYear(currentYear);
      const allKPIs = KPIModel.getAll(currentYear);
      const allUsers = UserModel.getAll();
      const activeWorkUnits = OrganizationModel.WorkUnit.getAll();

      return {
        success: true,
        data: {
          period: activePeriod,
          stats: {
            totalGoals: allGoals ? allGoals.length : 0,
            activeKPIs: allKPIs ? allKPIs.filter(k => k.status === 'ACTIVE').length : 0,
            totalUsers: allUsers ? allUsers.length : 0,
            totalWorkUnits: activeWorkUnits ? activeWorkUnits.length : 0,
            performanceScore: this.calculatePerformanceScore(allKPIs || [], [])
          }
        }
      };
    } catch (error) {
      Logger.log('DashboardController.getExecutiveData error: ' + error);
      return { success: false, message: 'Failed to load executive data', error: error.toString() };
    }
  },

  // Get recent activities
  getRecentActivities(limit = 10) {
    try {
      const recentRevisions = getRecentRevisions(limit);
      return {
        success: true,
        data: recentRevisions.data || []
      };
    } catch (error) {
      Logger.log('DashboardController.getRecentActivities error: ' + error);
      return { success: true, data: [] };
    }
  },

  // Get KPI data
  getKPIData(filters = {}) {
    try {
      const year = filters.year || new Date().getFullYear();
      const workUnitId = filters.work_unit_id;

      let kpis = [];
      if (workUnitId) {
        kpis = KPIModel.getByWorkUnit(workUnitId, year);
      } else {
        kpis = KPIModel.getAll(year);
      }

      // Add progress data
      const kpiWithProgress = (kpis || []).map(kpi => {
        const progress = KPIModel.Progress.getByKPI(kpi.kpi_id);
        const latest = progress && progress.length > 0 ? progress[progress.length - 1] : null;
        return {
          ...kpi,
          current_value: latest ? latest.current_value : null,
          achievement_percentage: latest ? latest.achievement_percentage : null
        };
      });

      return {
        success: true,
        data: {
          kpis: kpiWithProgress,
          total: kpiWithProgress.length,
          on_track: kpiWithProgress.filter(k => k.achievement_percentage >= 80).length,
          at_risk: kpiWithProgress.filter(k => k.achievement_percentage >= 50 && k.achievement_percentage < 80).length,
          behind: kpiWithProgress.filter(k => k.achievement_percentage < 50).length
        }
      };
    } catch (error) {
      Logger.log('DashboardController.getKPIData error: ' + error);
      return { success: true, data: { kpis: [], total: 0, on_track: 0, at_risk: 0, behind: 0 } };
    }
  },

  // Get Impact Center data
  getImpactCenterData(filters = {}) {
    try {
      const year = filters.year || new Date().getFullYear();
      const impactCenters = ImpactCenterModel.getAll(year);

      return {
        success: true,
        data: {
          impactCenters: impactCenters || [],
          total: impactCenters ? impactCenters.length : 0
        }
      };
    } catch (error) {
      Logger.log('DashboardController.getImpactCenterData error: ' + error);
      return { success: true, data: { impactCenters: [], total: 0 } };
    }
  }
};
