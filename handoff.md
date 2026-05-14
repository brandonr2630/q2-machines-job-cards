# Q2 Machines Job Card System — Planning & Tracking Tools
## Project Handoff Document

**Date:** May 14, 2026  
**Status:** System Stabilisation Complete — Ready for Planning Tools Development  
**Scope:** Planning tools, tracking tools, and interoperability (Client portal deferred)

---

## OVERVIEW

The Job Card System is being enhanced with a comprehensive **project management layer** following **PMI PMBOK** principles. The system will support two distinct modes:

1. **Planning Phase** — Crystallize scope, timelines, budget, risks, QA/QC strategy, H&S assessment
2. **Execution Phase** — Track progress against plan; monitor schedule, budget, quality, safety

Key principle: **Planning tools create the baseline; tracking tools monitor execution against that baseline.**

---

## PROJECT PHASES & TOOLS

### PHASE 1: INITIATING
- Project Charter (high-level business case, authority, constraints)
- Stakeholder Register (identify key players, interests, engagement)

### PHASE 2: PLANNING ← **APPROVAL GATE**
- Scope Definition (deliverables, acceptance criteria, constraints, assumptions)
- Work Breakdown Structure (WBS) — hierarchical task decomposition (max 7 levels)
- Schedule Planner (task durations, sequences, dependencies, milestones, critical path)
- Budget Planner (cost estimation by task; auto-populate from material rates)
- Risk Register (identify risks, assess probability/impact, mitigation plans)
- Resource Plan (staff, equipment, skill requirements; availability windows)
- QA/QC Assessment (quality standards, acceptance criteria, testing plan, inspection checkpoints)
- Health & Safety Assessment (hazard identification, risk mitigation, PPE, training requirements)

**Approval Workflow:**
1. Admin completes all planning tools (status: DRAFT)
2. Admin submits for approval (status: PENDING_APPROVAL)
3. Customer/approver signs off
4. **Baseline snapshot created** (frozen copy for tracking comparison)
5. Status: APPROVED / BASELINED
6. Execution unlocks

### PHASE 3: EXECUTION
- Daily Standup Log (daily team status, blockers, next actions)
- Labour Tracking (already exists — continues as-is)
- Material/Equipment Tracking (consumption logging)
- Issue & Change Log (scope changes, decisions, impacts)
- Daily Job Safety Brief (pre-work hazard identification, team briefing, incident logging)

### PHASE 4: MONITORING & CONTROLLING (Parallel with Execution)
- Gantt Chart (actual vs. planned schedule; variance, critical path, ETA)
- Budget Tracker (actual vs. budgeted spend; variance, cost forecast)
- Milestone Dashboard (milestone achievement tracking; on-time/late/missed)
- Risk Status Tracker (risk materialization, mitigation effectiveness)
- Quality Checklist (QC checkpoint sign-offs; defect logging)
- Incident/Near-Miss Log (safety incidents, root cause, corrective actions)

### PHASE 5: CLOSING
- Lessons Learned (what went well, what to improve)
- Final Sign-Off (customer acceptance)
- Project Archive (lock job, retain for history)

---

## DATA MODEL

### PLANNING TABLES

**job_charter**
```
id, job_id, project_title, description, business_case, 
customer_name, customer_contact, project_manager, team_lead,
start_date, target_completion_date, budget_authorization,
constraints, assumptions, success_criteria,
approved_by, approval_date, status (draft|approved|active|closed),
created_at, updated_at
```

**job_scope**
```
id, job_id, scope_statement, in_scope (array), out_of_scope (array),
acceptance_criteria, constraints, assumptions, created_at, updated_at
```

**job_deliverables** (child of job_scope)
```
id, job_id, sequence, deliverable_name, description, 
acceptance_criteria, owner, target_completion_date,
status (pending|in-progress|delivered|accepted)
```

**job_wbs_tasks**
```
id, job_id, parent_task_id (null=top level), task_name, level (1-7),
description, estimated_duration_days, estimated_cost, 
resource_type_needed, assigned_to, priority, status,
deliverable_id, created_at, updated_at
```

**job_task_scheduling** (for Schedule Planner)
```
id, job_id, wbs_task_id, task_name, planned_start_date, 
planned_finish_date, duration_days, predecessor_task_id, lag_days,
slack_days, is_milestone, actual_start_date, actual_finish_date, 
%_complete
```

**job_milestones**
```
id, job_id, task_id, milestone_name, planned_date, actual_date,
status (pending|achieved|missed), sign_off_by, sign_off_date, notes
```

**job_budget_estimate**
```
id, job_id, total_budgeted_amount, contingency_reserve_%,
contingency_reserve_amount, management_reserve_%,
total_authorized_budget, status (draft|approved|active|closed)
```

**job_budget_line_items** (child of job_budget_estimate)
```
id, job_id, sequence, category (labour|materials|equipment|subcontractor|overhead|other),
description, wbs_task_id, quantity, unit, unit_cost, 
estimated_total_cost, notes, created_at, updated_at
```

**job_risk_register**
```
id, job_id, risk_id, risk_description, risk_category 
(schedule|budget|resource|technical|external|quality),
trigger_condition, probability_%, impact_scale (1-5), risk_score,
priority (low|medium|high|critical), owner, mitigation_strategy,
mitigation_owner, contingency_plan, contingency_budget, 
status (identified|mitigated|closed|materialized),
created_at, reviewed_at, updated_at
```

**job_resource_plan**
```
id, job_id, planning_status (draft|approved|active),
total_person_hours_budgeted, total_equipment_hours_budgeted
```

**job_planned_resources** (child of job_resource_plan)
```
id, job_id, resource_type (staff|equipment|material|subcontractor),
resource_name, role_or_skill, availability_start_date, 
availability_end_date, estimated_hours_needed, estimated_cost,
wbs_task_ids (JSON array), notes, created_at
```

**job_stakeholders**
```
id, job_id, stakeholder_name, role (customer|sponsor|team-member|approver|other),
contact_email, contact_phone, organization, interest, 
influence_level (low|medium|high), engagement_level 
(unaware|resistant|neutral|supportive|champion),
communication_plan, created_at, updated_at
```

**job_qa_plan**
```
id, job_id, applicable_standards, customer_specifications,
regulatory_requirements, industry_best_practices,
overall_acceptance_statement, critical_quality_attributes (JSON array),
pass_fail_criteria, critical_defects (text), major_defects (text),
minor_defects (text), rework_allowed (yes|no),
created_at, updated_at
```

**job_qa_testing_plan** (child of job_qa_plan)
```
id, job_id, testing_strategy, test_types_to_conduct (JSON array with:
test_id, test_name, test_phase, procedure, frequency, sample_size,
equipment_needed, time_per_test_hours, pass_criteria, 
responsible_person, wbs_task_id),
total_qa_hours_budgeted
```

**job_qa_checkpoints** (child of job_qa_plan)
```
id, job_id, sequence, checkpoint_name, checkpoint_phase 
(in-process|pre-delivery|post-delivery), wbs_task_id,
trigger_condition, responsible_person, what_to_inspect,
how_to_inspect, acceptance_criteria, if_fails,
estimated_time_minutes, documentation_required,
tool_equipment_needed (array), linked_tests (array)
```

**job_qa_resources** (child of job_qa_plan)
```
id, job_id, qa_team_requirements (JSON array: role, hours_needed, skills),
qa_equipment_requirements (JSON array: equipment, hours_needed, cost_per_hour, notes),
qa_forms_templates (JSON array: form_name, form_link, revision),
total_qa_cost_estimate
```

**job_qa_risks** (child of job_qa_plan)
```
id, job_id, high_risk_areas (JSON array: area, risk, mitigation),
defect_history, prevention_actions (JSON array: action, responsibility, verify_by),
status (draft|approved|active)
```

**job_hs_assessment**
```
id, job_id, site_location, work_environment, hazards_identified (array),
hs_owner, required_ppe (array), required_training (array),
emergency_procedures, status (draft|approved|active|closed),
created_at, updated_at
```

**job_hs_hazards** (child of job_hs_assessment)
```
id, job_id, hazard_description, location, affected_tasks (array of task_ids),
risk_level (low|medium|high|critical), likelihood_rating (1-5),
severity_rating (1-5), risk_score, control_measures, responsible_person,
residual_risk_level, status (identified|controlled|closed)
```

**job_plan_approval**
```
id, job_id, submitted_by, submitted_date, approved_by, approval_date,
baseline_snapshot (JSON: frozen copy of all planning data),
baseline_version (1, 2, 3, ... for re-baselines after changes),
status (draft|pending|approved|closed), approval_notes
```

---

### EXECUTION & TRACKING TABLES

**job_daily_standup** (exists partially; enhance)
```
id, job_id, log_date, logged_by_user, status_summary, blockers,
next_actions, completion_percentage, notes, created_at
```

**job_issue_change_log**
```
id, job_id, issue_date, logged_by, issue_type (scope-change|blocker|decision|other),
description, priority, impact_on_schedule, impact_on_budget,
resolution, resolved_by, resolved_date, status (open|resolved|closed),
created_at, updated_at
```

**job_daily_safety_brief**
```
id, job_id, date, conducted_by, team_present (array),
tasks_planned_today (array of task_ids), hazards_for_today,
weather_conditions, equipment_status, near_miss_incidents,
pre_use_checks_done (boolean), ppe_confirmed (boolean),
emergency_contacts_confirmed (boolean), safety_briefing_notes,
team_acknowledgment (boolean), signed_off_by, status (draft|briefed|acknowledged),
created_at
```

**job_incidents** (child of job_daily_safety_brief or standalone)
```
id, job_id, date_reported, incident_type (near-miss|injury|property-damage|environmental),
description, severity (low|medium|high|critical), reported_by,
root_cause_analysis, corrective_actions (array), assigned_to,
status (open|corrected|closed), created_at, resolved_at
```

**job_gantt_tracking** (Execution view of job_task_scheduling)
```
-- Extends job_task_scheduling with actual data
-- Tracks: actual_start_date, actual_finish_date, %_complete
-- Calculated fields: schedule_variance, forecasted_completion
```

**job_budget_tracking** (Execution view of job_budget_estimate)
```
-- Extends job_budget_line_items with actual data
-- Tracks: actual_spent per line item
-- Calculated fields: variance, ETC (estimate to complete), forecast at completion
```

**job_milestone_tracking** (Execution view of job_milestones)
```
-- Extends job_milestones with actual achievement data
-- Status updates: pending → achieved or missed
```

**job_risk_status_tracker** (Execution view of job_risk_register)
```
-- Extends job_risk_register with execution data
-- Tracks: is_materializing, mitigation_effectiveness, new_risks_identified
-- Status updates: identified → open → mitigated → closed
```

**job_quality_checklist** (Execution; enhanced from existing)
```
-- Implements job_qa_checkpoints during execution
-- Tracks: checkpoint completed date, pass/fail, defects found,
-- rework_required, signed_off_by, sign_off_date
```

---

## WORKFLOWS

### Workflow 1: Job Creation & Planning

```
1. User clicks "New Job"
   ├─ Basic job info form (customer, due date, description)
   └─ Creates job record, status: CREATED

2. User navigates to "Plan This Project"
   ├─ Planning wizard appears
   └─ Offers: Charter → Scope → WBS → Schedule → Budget → Risk → Resource → QA → H&S

3. User fills Charter
   └─ Status: PLANNING / Charter DRAFT

4. User fills Scope Definition
   ├─ Defines deliverables
   └─ Status: PLANNING / Scope DRAFT

5. User builds WBS
   ├─ Hierarchical task decomposition (max 7 levels)
   ├─ Estimates durations per task
   └─ Status: PLANNING / WBS DRAFT

6. User fills Schedule Planner
   ├─ Links tasks (predecessor relationships, lag days)
   ├─ System calculates critical path, project duration
   └─ Status: PLANNING / Schedule DRAFT

7. User fills Budget Planner
   ├─ Adds labour, materials, equipment line items
   ├─ System auto-populates material rates from config
   ├─ Adds contingency/management reserve
   └─ Status: PLANNING / Budget DRAFT

8. User fills Risk Register
   ├─ Identifies risks, assesses probability/impact
   ├─ Plans mitigation, allocates contingency
   └─ Status: PLANNING / Risk DRAFT

9. User fills Resource Plan
   ├─ Identifies staff, equipment, training needed
   └─ Status: PLANNING / Resource DRAFT

10. User fills QA/QC Plan
    ├─ Defines quality standards, testing plan, inspection checkpoints
    └─ Status: PLANNING / QA DRAFT

11. User fills H&S Assessment
    ├─ Identifies hazards, control measures, PPE, training
    └─ Status: PLANNING / H&S DRAFT

12. User submits plan for approval
    ├─ All tools locked (read-only)
    ├─ Status: PLANNING / PENDING_APPROVAL
    └─ Approval notification sent to customer/approver

13. Customer approves
    ├─ Baseline snapshot created (frozen copy)
    ├─ Status: ACTIVE / BASELINED
    ├─ Execution phase unlocked
    └─ Team notified: work can begin
```

### Workflow 2: Execution & Tracking

```
1. Team begins execution (start date reached)
   ├─ Gantt chart unlocked for updates
   ├─ Daily Standup Log available
   └─ Daily Safety Brief conducted

2. Daily Operations
   ├─ Labour entries logged (existing system)
   ├─ Materials consumed tracked
   ├─ Equipment used logged
   ├─ Safety incidents (if any) logged
   └─ Standup completed (status, blockers, next steps)

3. Task Completion
   ├─ Task marked in-progress
   ├─ QC checkpoint triggered (from plan)
   ├─ Quality checklist completed (pass/fail)
   ├─ If pass: task progress updated, next task starts
   ├─ If fail: issue logged, rework planned
   └─ Actual dates recorded

4. Schedule Variance Detected
   ├─ Task running behind → critical path recalculated
   ├─ Forecasted completion date updated
   ├─ Change request triggered (if customer approval needed)
   └─ Issue logged with impact analysis

5. Budget Variance Detected
   ├─ Labour hours exceed estimate → actual cost increases
   ├─ Material costs overrun → budget variance flagged
   ├─ Cost forecast updated
   └─ Finance alerted if significant

6. Risk Materializes
   ├─ Risk status updated to "materialized"
   ├─ Mitigation plan executed
   ├─ Impact assessed (schedule/cost/quality)
   └─ Contingency activated if needed

7. Milestone Achievement
   ├─ Milestone marked complete
   ├─ Sign-off obtained from approver
   ├─ Customer notified
   └─ Progress dashboard updated

8. Quality Issue Found
   ├─ Defect logged in Quality Checklist
   ├─ Severity assessed (critical/major/minor)
   ├─ Rework planned & assigned
   ├─ Schedule impact assessed
   └─ Cost impact assessed
```

### Workflow 3: Plan Changes

```
1. Change Request Initiated
   ├─ Scope change (new deliverable, removed task)
   ├─ Schedule impact (task takes longer)
   ├─ Budget impact (materials cost more)
   └─ Or combination

2. Change Logged
   ├─ Logged in Issue & Change Log
   ├─ Impact on schedule/budget calculated
   ├─ Baseline version incremented (v1 → v2)
   └─ Customer approval requested

3. If Approved
   ├─ Baseline re-calculated and re-snapshot
   ├─ Plan tools updated (WBS, Schedule, Budget, etc.)
   ├─ Tracking tools reset to compare against new baseline
   └─ Status: ACTIVE / BASELINED_v2

4. If Rejected
   ├─ Change documented as "not approved"
   ├─ Execution continues against original baseline
   └─ Status: ACTIVE / BASELINED_v1
```

---

## KEY DESIGN DECISIONS

1. **Planning is mandatory.** Execution cannot start without an approved baseline.

2. **Only project admins can create plans.** Reduces scope creep, ensures consistency.

3. **WBS is hierarchical (max 7 levels).** Balances detail with manageability.

4. **Budget auto-populates from material rates.** Reduces manual entry, improves accuracy.

5. **Baseline is snapshot, not calculated field.** Allows comparison against plan even if plan is later edited.

6. **QA/QC is baked into planning.** Not an afterthought; checkpoints are linked to WBS tasks.

7. **H&S assessment is mandatory.** Compliance + safety.

8. **Daily Safety Brief is mandatory.** Pre-work hazard identification, team briefment.

9. **Schedule Planner calculates critical path.** Identifies schedule risk upfront.

10. **Templates available for planning.** Seed new projects with common structures.

11. **Gantt chart is tracking tool, not planning tool.** Schedule Planner is planning; Gantt tracks execution.

12. **Client portal deferred.** Build internal system first; add client visibility later.

---

## INTEGRATION POINTS

```
Charter
  └─→ Scope, WBS, Budget, Risk, Resource, QA, H&S (all reference charter authority)

Scope Definition
  ├─→ WBS (tasks deliver scope)
  ├─→ Budget (scope drivers cost)
  └─→ Risk (scope changes = risk)

WBS
  ├─→ Schedule Planner (tasks → duration → timeline)
  ├─→ Budget Planner (tasks → cost estimates)
  ├─→ Resource Plan (tasks → resources needed)
  ├─→ QA/QC Plan (tasks → QC checkpoints)
  ├─→ H&S Assessment (tasks → hazards)
  └─→ Gantt Chart (tasks tracked in execution)

Schedule Planner
  ├─→ Budget Planner (schedule changes affect cost)
  ├─→ Risk Register (tight schedule = risk)
  └─→ Gantt Chart (baseline for tracking)

Budget Planner
  ├─→ Resource Plan (resources have costs)
  ├─→ Risk Register (cost risk mitigation needs budget)
  └─→ Budget Tracker (baseline for tracking spend)

Risk Register
  ├─→ Budget Planner (risk contingency reserve)
  ├─→ QA/QC Plan (quality risks → prevention actions)
  ├─→ H&S Assessment (safety risks → controls)
  └─→ Risk Status Tracker (baseline for tracking)

QA/QC Plan
  └─→ Quality Checklist (checkpoints executed during QC)

H&S Assessment
  └─→ Daily Job Safety Brief (hazards pulled for daily briefing)

Milestones (in Schedule Planner)
  └─→ Milestone Dashboard (achievement tracked)

All Planning Tools
  └─→ job_plan_approval (baseline snapshot)
      └─→ All Tracking Tools (compare actual vs. baseline)
```

---

## ROLE-BASED ACCESS

**Project Admin:**
- Create/edit/approve all planning tools
- Submit plan for approval
- Monitor execution (read-only on tracking dashboards)
- Create change requests

**Team Lead/Project Manager:**
- View plan (read-only)
- Update execution data (daily standup, labour, QC, safety)
- Report issues & changes
- Update risk/schedule/budget status

**QC/Quality Inspector:**
- View QA/QC Plan (read-only)
- Complete Quality Checklist (sign-off on checkpoints)
- Log defects, rework

**H&S Officer:**
- Create/edit H&S Assessment (planning)
- Conduct Daily Safety Brief (execution)
- Log incidents, investigate

**Finance/Admin:**
- View Budget Planner baseline
- Track Budget Tracker (actual spend)
- Review cost variances

---

## TEMPLATES

Pre-built project templates can include:

- **Standard Machining Job** (WBS: Design → Setup → Machining → QC → Delivery)
- **Complex Assembly** (WBS: Procurement → Sub-assembly → Final Assembly → Test → Delivery)
- **Custom Fabrication** (WBS: Design → Material Prep → Fabrication → Welding → Finishing → QC → Delivery)

Templates pre-populate:
- WBS structure (user customizes task names, durations)
- QA/QC checkpoints (standard for job type)
- H&S hazards (common for job type)
- Risk categories (typical for job type)
- Milestone structure

---

## SCOPE NOTES

**NOT IN THIS BUILD:**
- Client portal / external visibility
- Advanced analytics / reporting dashboards
- Workflow automation / triggers
- Integration with external systems (ERP, accounting)
- Mobile app for daily safety brief (web-only for now)

**IN FUTURE BUILDS:**
- Client dashboard (read-only tracking for their projects)
- Predictive analytics (cost/schedule forecasting)
- Resource leveling / capacity planning across multiple jobs
- Mobile optimizations for field work
- Email notifications / reminders

---

## CURRENT SYSTEM STATE (as of May 14, 2026)

### Live System — `https://www.q2m.io/jobs/`
- **Service worker:** `CACHE_NAME = 'q2-machines-v3'`, network-first for HTML
- **Supabase project:** `pnrfcusipgojhkuvtjio`
- **Active file:** `index.html` (~3270 lines). `index1.html` is archive — do not edit.

### Login Flow
`doLogin()` → `initApp()` → `newJobCard(true)` → `openDashboard()`

`doLogin()` wraps `initApp()` in a try/catch — any JS error thrown inside `initApp()` is silently swallowed. The error message is set on the login form element which is already hidden, giving a blank screen with no feedback. This is a known fragility.

### Dashboard
The new dashboard (`dashboard-overlay`, opened by `openDashboard()`) is the primary landing screen after login. It contains:
- Header: logo, KPI-style title, Approvals (admin), Config (admin), New Job, Refresh, Close
- Filter bar: search, status, client, priority, location filters
- KPI cards: Total, In Progress, On Hold, Completed
- Jobs Needing Attention cards
- All Jobs sortable table

A legacy home screen (`home-overlay`, opened by `openHome()`) exists in the codebase but is no longer reachable from any button. It can be removed in a future cleanup pass.

### Toolbar (job form page)
Streamlined to per-job actions only:
`🏠 Home | ⧉ Duplicate | [search/load job] | 💾 Save | 🖨 Print`

Management functions (Approvals, Config) moved to dashboard header. Suggest Item button removed (functionality remains dormant in `openSuggestModal()`; Config manager covers catalogue management).

### Admin-Only Elements
Shown/hidden by `setRole()` on login:
- Dashboard header: Approvals button (`id="approvals-btn"`) + badge (`id="approval-badge"`)
- Dashboard header: Config button (`id="cfgmgr-btn"`)
- Job form: Delete Job button, Cost unlock button

Approval badge count is driven by `checkPendingApprovals()` — queries all `config_*` tables for `status='pending'`.

---

## NEXT STEPS

1. ✅ Design complete (this document)
2. ✅ System stabilisation: login flow fixed, dashboard wired, toolbar consolidated
3. ⏳ Development: Build planning tools (Charter through H&S)
4. ⏳ Development: Build approval workflow & baseline snapshot
5. ⏳ Development: Build tracking tools (Gantt through Incidents)
6. ⏳ Testing: Full workflow (plan → approval → execution → tracking)
7. ⏳ Templates: Create standard project templates
8. ⏳ Deployment: Test on live Q2M jobs
9. ⏳ Phase 2: Client portal (future build)

---

**Questions? Clarifications needed before development starts? Add notes here or contact project stakeholder.**
