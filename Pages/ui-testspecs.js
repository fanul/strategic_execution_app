// ui-testspecs.js - Test Specifications
const testSpecs = {
    organization: {
        name: 'Organization Management',
        pages: ['organization.html'],
        tests: [
            {
                name: 'Directorates Section',
                type: 'section',
                checks: [
                    { selector: 'table#directoratesTable', desc: 'Directorates DataTable exists' },
                    { selector: 'button[data-bs-target="#newOrgModal"]', desc: 'Add New button exists' },
                    { selector: 'th:contains("Code")', desc: 'Table has Code column' },
                    { selector: ' th:contains("Name")', desc: 'Table has Name column' },
                    { selector: 'th:contains("Director")', desc: 'Table has Director column' },
                    { selector: 'th:contains("Actions")', desc: 'Table has Actions column' }
                ]
            },
            {
                name: 'Work Units Tab',
                type: 'section',
                checks: [
                    { selector: '#workunits-tab', desc: 'Work Units tab exists' },
                    { selector: '#workunits', desc: 'Work Units tab content exists' }
                ]
            },
            {
                name: 'Organization Modal',
                type: 'modal',
                checks: [
                    { selector: '#newOrgModal', desc: 'Organization modal exists' },
                    { selector: '#orgTypeSelector', desc: 'Entity type selector exists' }
                ]
            }
        ]
    },
    
    kpi: {
        name: 'KPI Management',
        pages: ['kpi.html'],
        tests: [
            {
                name: 'Organizational KPIs Tab',
                type: 'section',
                checks: [
                    { selector: 'table#orgKPITable', desc: 'Organizational KPI DataTable exists' },
                    { selector: 'button[onclick*="createNewKPI"]', desc: 'Create KPI button exists' },
                    { selector: '#orgKPITable th:contains("Code")', desc: 'Table has Code column' },
                    { selector: '#orgKPITable th:contains("Name")', desc: 'Table has Name column' },
                    { selector: '#orgKPITable th:contains("Type")', desc: 'Table has Type column' },
                    { selector: '#orgKPITable th:contains("Target")', desc: 'Table has Target column' },
                    { selector: '#orgKPITable th:contains("Progress")', desc: 'Table has Progress column' }
                ]
            },
            {
                name: 'Individual KPIs Tab',
                type: 'section',
                checks: [
                    { selector: 'table#indKPITable', desc: 'Individual KPI DataTable exists' },
                    { selector: '#ind-kpi-tab', desc: 'Individual KPI tab exists' }
                ]
            },
            {
                name: 'KPI Modal Form',
                type: 'modal',
                checks: [
                    { selector: '#kpiModal', desc: 'KPI modal exists' },
                    { selector: '#kpiForm input[name="kpi_name"]', desc: 'KPI Name field exists' },
                    { selector: '#kpiForm input[name="kpi_code"]', desc: 'KPI Code field exists' },
                    { selector: '#kpiForm select[name="kpi_type"]', desc: 'KPI Type dropdown exists' },
                    { selector: '#kpiForm select[name="perspective"]', desc: 'Perspective dropdown exists' },
                    { selector: '#kpiForm input[name="target_value"]', desc: 'Target Value field exists' },
                    { selector: 'button[onclick*="saveKPI"]', desc: 'Save KPI button exists' }
                ]
            },
            {
                name: 'Filters',
                type: 'filters',
                checks: [
                    { selector: '#yearFilter', desc: 'Year filter exists' },
                    { selector: '#perspectiveFilter', desc: 'Perspective filter exists' }
                ]
            }
        ]
    },
    
    okr: {
        name: 'OKR Management',
        pages: ['okr.html'],
        tests: [
            {
                name: 'Weekly OKRs Section',
                type: 'section',
                checks: [
                    { selector: '#weekSelector', desc: 'Week selector exists' },
                    { selector: 'button[onclick*="createNewOKR"]', desc: 'Create OKR button exists' },
                    { selector: '#myOKRsContent', desc: 'My OKRs content area exists' }
                ]
            },
            {
                name: 'Review Tab',
                type: 'section',
                checks: [
                    { selector: '#review-tab', desc: 'Pending Reviews tab exists' },
                    { selector: '#reviewOKRsContent', desc: 'Review content area exists' }
                ]
            },
            {
                name: 'OKR Modal',
                type: 'modal',
                checks: [
                    { selector: '#okrModal', desc: 'OKR modal exists' },
                    { selector: '#okrForm textarea[name="objective_text"]', desc: 'Objective field exists' },
                    { selector: '#okrForm input[name="key_result_1"]', desc: 'Key Result 1 field exists' },
                    { selector: '#okrForm input[name="key_result_1_progress"]', desc: 'KR1 Progress field exists' },
                    { selector: '#okrForm input[name="key_result_2"]', desc: 'Key Result 2 field exists' },
                    { selector: '#okrForm input[name="key_result_3"]', desc: 'Key Result 3 field exists' },
                    { selector: 'button[onclick*="saveOKR"]', desc: 'Save OKR button exists' }
                ]
            },
            {
                name: 'Review Modal',
                type: 'modal',
                checks: [
                    { selector: '#reviewModal', desc: 'Review modal exists' },
                    { selector: '#reviewNotes', desc: 'Review notes field exists' },
                    { selector: 'button[onclick*="submitReview"]', desc: 'Submit review button exists' }
                ]
            },
            {
                name: 'History Table',
                type: 'section',
                checks: [
                    { selector: 'table#okrHistoryTable', desc: 'OKR History DataTable exists' },
                    { selector: '#okrHistoryTable th:contains("Week")', desc: 'Table has Week column' },
                    { selector: '#okrHistoryTable th:contains("Objective")', desc: 'Table has Objective column' },
                    { selector: '#okrHistoryTable th:contains("Progress")', desc: 'Table has Progress column' }
                ]
            }
        ]
    },
    
    programs: {
        name: 'Programs & Activities',
        pages: ['programs.html'],
        tests: [
            {
                name: 'Programs Table',
                type: 'section',
                checks: [
                    { selector: 'table#programsTable', desc: 'Programs DataTable exists' },
                    { selector: 'button[onclick*="createProgram"]', desc: 'Create Program button exists' },
                    { selector: '#programsTable th:contains("Code")', desc: 'Table has Code column' },
                    { selector: '#programsTable th:contains("Budget")', desc: 'Table has Budget column' },
                    { selector: '#programsTable th:contains("Activities")', desc: 'Table has Activities column' }
                ]
            },
            {
                name: 'Activities Modal',
                type: 'modal',
                checks: [
                    { selector: '#activitiesModal', desc: 'Activities modal exists' },
                    { selector: 'table#activitiesTable', desc: 'Activities DataTable exists' },
                    { selector: 'button[onclick*="addActivity"]', desc: 'Add Activity button exists' }
                ]
            },
            {
                name: 'Activity Form Modal',
                type: 'modal',
                checks: [
                    { selector: '#activityModal', desc: 'Activity modal exists' },
                    { selector: '#activityForm input[name="activity_name"]', desc: 'Activity Name field exists' },
                    { selector: '#activityForm input[name="unit_price"]', desc: 'Unit Price field exists' },
                    { selector: '#activityForm input[name="quantity"]', desc: 'Quantity field exists' },
                    { selector: 'button[onclick*="saveActivity"]', desc: 'Save Activity button exists' }
                ]
            },
            {
                name: 'Program Modal',
                type: 'modal',
                checks: [
                    { selector: '#programModal', desc: 'Program modal exists' },
                    { selector: '#programForm input[name="program_name"]', desc: 'Program Name field exists' },
                    { selector: '#programForm input[name="budget_amount"]', desc: 'Budget field exists' }
                ]
            }
        ]
    },
    
    impactCenters: {
        name: 'Impact Centers',
        pages: ['impact-centers.html'],
        tests: [
            {
                name: 'Impact Centers Table',
                type: 'section',
                checks: [
                    { selector: 'table#impactCentersTable', desc: 'Impact Centers DataTable exists' },
                    { selector: 'button[onclick*="createImpactCenter"]', desc: 'Create Impact Center button exists' },
                    { selector: '#impactCentersTable th:contains("Code")', desc: 'Table has Code column' },
                    { selector: '#impactCentersTable th:contains("Year")', desc: 'Table has Year column' }
                ]
            },
            {
                name: 'Progress Panel',
                type: 'section',
                checks: [
                    { selector: '#progressPanel', desc: 'Progress panel exists' },
                    { selector: '#selectedICName', desc: 'Selected IC name display exists' }
                ]
            },
            {
                name: 'Impact Center Modal',
                type: 'modal',
                checks: [
                    { selector: '#impactCenterModal', desc: 'Impact Center modal exists' },
                    { selector: '#icForm input[name="impact_center_name"]', desc: 'Name field exists' },
                    { selector: '#icForm input[name="impact_center_code"]', desc: 'Code field exists' },
                    { selector: '#icForm input[name="year"]', desc: 'Year field exists' }
                ]
            },
            {
                name: 'Progress Submission Modal',
                type: 'modal',
                checks: [
                    { selector: '#progressModal', desc: 'Progress modal exists' },
                    { selector: '#progressForm select[name="month"]', desc: 'Month selector exists' },
                    { selector: '#progressForm input[name="achievement_percentage"]', desc: 'Achievement field exists' },
                    { selector: 'button[onclick*="saveProgress"]', desc: 'Submit Progress button exists' }
                ]
            }
        ]
    },
    
    strategicPlan: {
        name: 'Strategic Planning',
        pages: ['strategic-plan.html'],
        tests: [
            {
                name: 'Navigation Tabs',
                type: 'section',
                checks: [
                    { selector: '#periods-tab', desc: 'Periods tab exists' },
                    { selector: '#vision-tab', desc: 'Vision & Mission tab exists' },
                    { selector: '#initiatives-tab', desc: 'Init iatives tab exists' },
                    { selector: '#goals-tab', desc: 'Goals tab exists' }
                ]
            },
            {
                name: 'Vision & Mission Section',
                type: 'section',
                checks: [
                    { selector: '#vision', desc: 'Vision & Mission content area exists' },
                    { selector: '#visionEmptyState', desc: 'Empty state message exists' },
                    { selector: '#visionActiveState', desc: 'Active state container exists' }
                ]
            },
            {
                name: 'Initiatives Table',
                type: 'section',
                checks: [
                    { selector: 'table#initiativesTable', desc: 'Initiatives table exists' }
                ]
            },
            {
                name: 'Periods Section',
                type: 'section',
                checks: [
                    { selector: 'table#periodsTable', desc: 'Periods table exists' },
                    { selector: 'button[onclick*="createNewPeriod"]', desc: 'New Period button exists' },
                    { selector: '#periodSelector', desc: 'Period selector exists' }
                ]
            }
        ]
    }
};
