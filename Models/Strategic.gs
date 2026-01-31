/**
 * Models/Strategic.gs
 * Strategic planning model (Periods, Visions, Missions, Initiatives, Goals)
 */

const StrategicModel = {
  // ===== PERIODS =====
  Period: {
    findById(periodId) {
      const periods = this.getAll();
      return periods.find(p => p.period_id === periodId) || null;
    },

    getActive() {
      const periods = this.getAll();
      return periods.find(p => p.is_active === true) || null;
    },

    getAll() {
      const data = getTableData(DB_CONFIG.SHEET_NAMES.PERIODS);
      return data.map(p => {
        // Fallback for period_name if missing in sheet
        if (!p.period_name) {
          p.period_name = p.period_code || `${p.start_year || '?'}-${p.end_year || '?'}`;
        }
        return p;
      });
    },

    create(data) {
      const newPeriod = {
        period_id: generateUUID(),
        period_code: data.period_code || `${data.start_year}-${data.end_year}`,
        period_name: data.period_name || `${data.start_year}-${data.end_year}`,
        start_year: data.start_year,
        end_year: data.end_year,
        description: data.description || '',
        is_active: data.is_active !== undefined ? data.is_active : false,
        created_at: formatDateTime(new Date()),
        created_by: data.created_by,
        updated_at: formatDateTime(new Date()),
        updated_by: data.created_by,
        notes: data.notes || ''
      };
      const result = insertRecord(DB_CONFIG.SHEET_NAMES.PERIODS, newPeriod);
      return result.success
        ? { success: true, data: newPeriod, message: 'Period created successfully' }
        : { success: false, error: result.error, message: 'Failed to create period' };
    },

    setActive(periodId, userId) {
      // Deactivate all periods first
      const periods = this.getAll();
      periods.forEach(p => {
        if (p.is_active) {
          updateRecord(DB_CONFIG.SHEET_NAMES.PERIODS, 'period_id', p.period_id, { is_active: false, updated_by: userId });
        }
      });
      // Activate selected period
      return updateRecord(DB_CONFIG.SHEET_NAMES.PERIODS, 'period_id', periodId, { is_active: true, updated_by: userId });
    },

    update(periodId, data) {
      const updateData = { ...data, updated_at: formatDateTime(new Date()) };
      delete updateData.period_id;
      delete updateData.created_at;
      delete updateData.created_by;
      
      return updateRecord(DB_CONFIG.SHEET_NAMES.PERIODS, 'period_id', periodId, updateData);
    },

    getDeletionImpact(periodId) {
      const period = this.findById(periodId);
      if (!period) return { success: false, message: 'Period not found' };

      const visionRange = StrategicModel.Vision.getByPeriod(periodId);
      const visionIds = visionRange.map(v => v.vision_id);
      
      const missionCount = visionIds.reduce((sum, vid) => sum + StrategicModel.Mission.getByVision(vid).length, 0);
      
      // Years within range
      const years = [];
      for (let y = parseInt(period.start_year); y <= parseInt(period.end_year); y++) {
        years.push(y);
      }

      const initiatives = getTableData(DB_CONFIG.SHEET_NAMES.STRATEGIC_INITIATIVES).filter(i => years.includes(parseInt(i.year)));
      const goals = getTableData(DB_CONFIG.SHEET_NAMES.ORGANIZATIONAL_GOALS).filter(g => years.includes(parseInt(g.year)));
      const goalIds = goals.map(g => g.goal_id);
      
      const wuGoals = getTableData(DB_CONFIG.SHEET_NAMES.WORK_UNIT_GOALS).filter(wug => goalIds.includes(wug.goal_id));
      const wuGoalIds = wuGoals.map(wug => wug.work_unit_goal_id);
      
      const kpis = getTableData(DB_CONFIG.SHEET_NAMES.KPIS).filter(k => years.includes(parseInt(k.year)) || wuGoalIds.includes(k.work_unit_goal_id));
      const kpiIds = kpis.map(k => k.kpi_id);
      
      const progress = getTableData(DB_CONFIG.SHEET_NAMES.KPI_MONTHLY_PROGRESS).filter(p => kpiIds.includes(p.kpi_id));
      
      const programs = getTableData(DB_CONFIG.SHEET_NAMES.PROGRAMS).filter(pg => wuGoalIds.includes(pg.work_unit_goal_id));
      const programIds = programs.map(pg => pg.program_id);
      
      const activities = getTableData(DB_CONFIG.SHEET_NAMES.ACTIVITIES).filter(act => programIds.includes(act.program_id));

      return {
        success: true,
        impact: {
          visions: visionRange.length,
          missions: missionCount,
          initiatives: initiatives.length,
          orgGoals: goals.length,
          wuGoals: wuGoals.length,
          kpis: kpis.length,
          progress: progress.length,
          programs: programs.length,
          activities: activities.length
        }
      };
    },

    deleteCascade(periodId) {
      const impact = this.getDeletionImpact(periodId);
      const period = this.findById(periodId);
      
      // Delete Visions and Missions
      const visions = StrategicModel.Vision.getByPeriod(periodId);
      visions.forEach(v => {
        const missions = StrategicModel.Mission.getByVision(v.vision_id);
        missions.forEach(m => deleteRecord(DB_CONFIG.SHEET_NAMES.MISSIONS, 'mission_id', m.mission_id));
        deleteRecord(DB_CONFIG.SHEET_NAMES.VISIONS, 'vision_id', v.vision_id);
      });

      const years = [];
      for (let y = parseInt(period.start_year); y <= parseInt(period.end_year); y++) {
        years.push(y);
      }

      // Delete Initiatives, Goals, WU Goals, KPIs, Progress, Programs, Activities
      // (This is intensive, but necessary for clean cascade)
      const allInitiatives = getTableData(DB_CONFIG.SHEET_NAMES.STRATEGIC_INITIATIVES);
      allInitiatives.filter(i => years.includes(parseInt(i.year))).forEach(i => deleteRecord(DB_CONFIG.SHEET_NAMES.STRATEGIC_INITIATIVES, 'initiative_id', i.initiative_id));

      const orgGoals = getTableData(DB_CONFIG.SHEET_NAMES.ORGANIZATIONAL_GOALS).filter(g => years.includes(parseInt(g.year)));
      const goalIds = orgGoals.map(g => g.goal_id);
      
      const wuGoals = getTableData(DB_CONFIG.SHEET_NAMES.WORK_UNIT_GOALS).filter(wug => goalIds.includes(wug.goal_id));
      const wuGoalIds = wuGoals.map(wug => wug.work_unit_goal_id);
      
      const kpis = getTableData(DB_CONFIG.SHEET_NAMES.KPIS).filter(k => years.includes(parseInt(k.year)) || wuGoalIds.includes(k.work_unit_goal_id));
      const kpiIds = kpis.map(k => k.kpi_id);
      
      const progress = getTableData(DB_CONFIG.SHEET_NAMES.KPI_MONTHLY_PROGRESS).filter(p => kpiIds.includes(p.kpi_id));
      const programs = getTableData(DB_CONFIG.SHEET_NAMES.PROGRAMS).filter(pg => wuGoalIds.includes(pg.work_unit_goal_id));
      const programIds = programs.map(pg => pg.program_id);
      const activities = getTableData(DB_CONFIG.SHEET_NAMES.ACTIVITIES).filter(act => programIds.includes(act.program_id));

      // Execute Deletions (Reverse Order of dependencies)
      progress.forEach(p => deleteRecord(DB_CONFIG.SHEET_NAMES.KPI_MONTHLY_PROGRESS, 'progress_id', p.progress_id));
      activities.forEach(a => deleteRecord(DB_CONFIG.SHEET_NAMES.ACTIVITIES, 'activity_id', a.activity_id));
      programs.forEach(p => deleteRecord(DB_CONFIG.SHEET_NAMES.PROGRAMS, 'program_id', p.program_id));
      kpis.forEach(k => deleteRecord(DB_CONFIG.SHEET_NAMES.KPIS, 'kpi_id', k.kpi_id));
      wuGoals.forEach(w => deleteRecord(DB_CONFIG.SHEET_NAMES.WORK_UNIT_GOALS, 'work_unit_goal_id', w.work_unit_goal_id));
      orgGoals.forEach(g => deleteRecord(DB_CONFIG.SHEET_NAMES.ORGANIZATIONAL_GOALS, 'goal_id', g.goal_id));

      // Finally delete the period itself
      return deleteRecord(DB_CONFIG.SHEET_NAMES.PERIODS, 'period_id', periodId);
    }
  },

  // ===== VISIONS =====
  Vision: {
    findById(visionId) {
      const visions = getTableData(DB_CONFIG.SHEET_NAMES.VISIONS);
      return visions.find(v => v.vision_id === visionId) || null;
    },

    getByPeriod(periodId) {
      const visions = getTableData(DB_CONFIG.SHEET_NAMES.VISIONS);
      return visions.filter(v => v.period_id === periodId);
    },

    create(data) {
      const newVision = {
        vision_id: generateUUID(),
        period_id: data.period_id,
        vision_code: data.vision_code || this.generateCode(data.period_id),
        vision_text: data.vision_text,
        description: data.description || '',
        created_at: formatDateTime(new Date()),
        created_by: data.created_by,
        updated_at: formatDateTime(new Date()),
        updated_by: data.created_by,
        approval_status: 'APPROVED',
        approved_by: data.created_by,
        approved_at: formatDateTime(new Date()),
        notes: data.notes || ''
      };
      const result = insertRecord(DB_CONFIG.SHEET_NAMES.VISIONS, newVision);
      return result.success
        ? { success: true, data: newVision, message: 'Vision created successfully' }
        : { success: false, error: result.error, message: 'Failed to create vision' };
    },

    approve(visionId, approverId) {
      return updateRecord(DB_CONFIG.SHEET_NAMES.VISIONS, 'vision_id', visionId, {
        approval_status: 'APPROVED',
        approved_by: approverId,
        approved_at: formatDateTime(new Date()),
        updated_by: approverId
      });
    },

    update(visionId, data) {
      const updateData = { ...data, updated_at: formatDateTime(new Date()) };
      delete updateData.vision_id;
      delete updateData.period_id;
      delete updateData.created_at;
      delete updateData.created_by;
      
      return updateRecord(DB_CONFIG.SHEET_NAMES.VISIONS, 'vision_id', visionId, updateData);
    },

    delete(visionId) {
      // Cascade delete missions
      const missions = StrategicModel.Mission.getByVision(visionId);
      missions.forEach(m => deleteRecord(DB_CONFIG.SHEET_NAMES.MISSIONS, 'mission_id', m.mission_id));
      return deleteRecord(DB_CONFIG.SHEET_NAMES.VISIONS, 'vision_id', visionId);
    },

    generateCode(periodId) {
      const period = StrategicModel.Period.findById(periodId);
      const visions = this.getByPeriod(periodId);
      return `VIS-${period.start_year}-${String(visions.length + 1).padStart(3, '0')}`;
    }
  },

  // ===== MISSIONS =====
  Mission: {
    findById(missionId) {
      const missions = getTableData(DB_CONFIG.SHEET_NAMES.MISSIONS);
      return missions.find(m => m.mission_id === missionId) || null;
    },

    getByVision(visionId) {
      const missions = getTableData(DB_CONFIG.SHEET_NAMES.MISSIONS);
      return missions.filter(m => m.vision_id === visionId).sort((a, b) => a.mission_order - b.mission_order);
    },

    create(data) {
      const newMission = {
        mission_id: generateUUID(),
        vision_id: data.vision_id,
        mission_code: data.mission_code || this.generateCode(data.vision_id),
        mission_text: data.mission_text,
        mission_order: data.mission_order || (this.getByVision(data.vision_id).length + 1),
        description: data.description || '',
        created_at: formatDateTime(new Date()),
        created_by: data.created_by,
        updated_at: formatDateTime(new Date()),
        updated_by: data.created_by,
        approval_status: 'APPROVED',
        approved_by: data.created_by,
        approved_at: formatDateTime(new Date()),
        notes: data.notes || ''
      };
      const result = insertRecord(DB_CONFIG.SHEET_NAMES.MISSIONS, newMission);
      return result.success
        ? { success: true, data: newMission, message: 'Mission created successfully' }
        : { success: false, error: result.error, message: 'Failed to create mission' };
    },

    approve(missionId, approverId) {
      return updateRecord(DB_CONFIG.SHEET_NAMES.MISSIONS, 'mission_id', missionId, {
        approval_status: 'APPROVED',
        approved_by: approverId,
        approved_at: formatDateTime(new Date()),
        updated_by: approverId
      });
    },

    update(missionId, data) {
      const updateData = { ...data, updated_at: formatDateTime(new Date()) };
      delete updateData.mission_id;
      delete updateData.vision_id;
      delete updateData.created_at;
      delete updateData.created_by;
      
      return updateRecord(DB_CONFIG.SHEET_NAMES.MISSIONS, 'mission_id', missionId, updateData);
    },

    delete(missionId) {
      return deleteRecord(DB_CONFIG.SHEET_NAMES.MISSIONS, 'mission_id', missionId);
    },

    generateCode(visionId) {
      const vision = StrategicModel.Vision.findById(visionId);
      const missions = this.getByVision(visionId);
      return `MIS-${vision.vision_code.split('-')[1]}-${String(missions.length + 1).padStart(3, '0')}`;
    }
  },

  // ===== STRATEGIC INITIATIVES =====
  Initiative: {
    findById(initiativeId) {
      const initiatives = getTableData(DB_CONFIG.SHEET_NAMES.STRATEGIC_INITIATIVES);
      return initiatives.find(i => i.initiative_id === initiativeId) || null;
    },

    getByYear(year) {
      const initiatives = getTableData(DB_CONFIG.SHEET_NAMES.STRATEGIC_INITIATIVES);
      return initiatives.filter(i => i.year === year);
    },

    create(data) {
      const newInitiative = {
        initiative_id: generateUUID(),
        year: data.year,
        theme_code: data.theme_code || this.generateCode(data.year),
        theme_name: data.theme_name,
        target_description: data.target_description || '',
        description: data.description || '',
        budget_allocated: data.budget_allocated || 0,
        created_at: formatDateTime(new Date()),
        created_by: data.created_by,
        updated_at: formatDateTime(new Date()),
        updated_by: data.created_by,
        status: 'PLANNING',
        notes: data.notes || ''
      };
      const result = insertRecord(DB_CONFIG.SHEET_NAMES.STRATEGIC_INITIATIVES, newInitiative);
      return result.success
        ? { success: true, data: newInitiative, message: 'Strategic initiative created successfully' }
        : { success: false, error: result.error, message: 'Failed to create strategic initiative' };
    },
    
    update(initiativeId, updates) {
      updates.updated_at = formatDateTime(new Date());
      delete updates.initiative_id;
      return updateRecord(DB_CONFIG.SHEET_NAMES.STRATEGIC_INITIATIVES, 'initiative_id', initiativeId, updates);
    },

    delete(initiativeId) {
      return deleteRecord(DB_CONFIG.SHEET_NAMES.STRATEGIC_INITIATIVES, 'initiative_id', initiativeId);
    },

    generateCode(year) {
      const initiatives = this.getByYear(year);
      return `STI-${year}-${String(initiatives.length + 1).padStart(3, '0')}`;
    }
  },

  // ===== ORGANIZATIONAL GOALS =====
  Goal: {
    findById(goalId) {
      const goals = getTableData(DB_CONFIG.SHEET_NAMES.ORGANIZATIONAL_GOALS);
      return goals.find(g => g.goal_id === goalId) || null;
    },

    getByYear(year) {
      const goals = getTableData(DB_CONFIG.SHEET_NAMES.ORGANIZATIONAL_GOALS);
      return goals.filter(g => g.year === year);
    },

    create(data) {
      const newGoal = {
        goal_id: generateUUID(),
        year: data.year,
        goal_code: data.goal_code || this.generateCode(data.year),
        goal_name: data.goal_name,
        goal_description: data.goal_description || '',
        target_description: data.target_description || '',
        created_at: formatDateTime(new Date()),
        created_by: data.created_by,
        updated_at: formatDateTime(new Date()),
        updated_by: data.created_by,
        status: 'PLANNING',
        notes: data.notes || ''
      };
      const result = insertRecord(DB_CONFIG.SHEET_NAMES.ORGANIZATIONAL_GOALS, newGoal);
      return result.success
        ? { success: true, data: newGoal, message: 'Organizational goal created successfully' }
        : { success: false, error: result.error, message: 'Failed to create organizational goal' };
    },

    update(goalId, updates) {
      updates.updated_at = formatDateTime(new Date());
      delete updates.goal_id;
      return updateRecord(DB_CONFIG.SHEET_NAMES.ORGANIZATIONAL_GOALS, 'goal_id', goalId, updates);
    },

    delete(goalId) {
      return deleteRecord(DB_CONFIG.SHEET_NAMES.ORGANIZATIONAL_GOALS, 'goal_id', goalId);
    },

    generateCode(year) {
      const goals = this.getByYear(year);
      return `SB-${year}-${String(goals.length + 1).padStart(3, '0')}`;
    }
  },

  // ===== WORK UNIT GOALS =====
  WorkUnitGoal: {
    findById(goalId) {
      const goals = getTableData(DB_CONFIG.SHEET_NAMES.WORK_UNIT_GOALS);
      return goals.find(g => g.work_unit_goal_id === goalId) || null;
    },

    getByOrgGoal(orgGoalId) {
      const goals = getTableData(DB_CONFIG.SHEET_NAMES.WORK_UNIT_GOALS);
      return goals.filter(g => g.goal_id === orgGoalId);
    },

    getByWorkUnit(workUnitId) {
      const goals = getTableData(DB_CONFIG.SHEET_NAMES.WORK_UNIT_GOALS);
      return goals.filter(g => g.work_unit_id === workUnitId);
    },

    create(data) {
      const newGoal = {
        work_unit_goal_id: generateUUID(),
        goal_id: data.goal_id,
        work_unit_id: data.work_unit_id,
        goal_code: data.goal_code || this.generateCode(data.goal_id),
        goal_name: data.goal_name,
        goal_description: data.goal_description || '',
        target_description: data.target_description || '',
        created_at: formatDateTime(new Date()),
        created_by: data.created_by,
        updated_at: formatDateTime(new Date()),
        updated_by: data.created_by,
        status: 'PLANNING',
        notes: data.notes || ''
      };
      const result = insertRecord(DB_CONFIG.SHEET_NAMES.WORK_UNIT_GOALS, newGoal);
      return result.success
        ? { success: true, data: newGoal, message: 'Work unit goal created successfully' }
        : { success: false, error: result.error, message: 'Failed to create work unit goal' };
    },

    generateCode(orgGoalId) {
      const goals = this.getByOrgGoal(orgGoalId);
      const orgGoal = StrategicModel.Goal.findById(orgGoalId);
      return `SUK-${orgGoal.year}-${String(goals.length + 1).padStart(3, '0')}`;
    }
  }
};
