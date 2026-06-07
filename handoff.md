# Q2 Machines Job Cards — Handoff

*Last updated: 2026-05-16 · Session 8*

---

## Quick Reference

| Item | Value |
|------|-------|
| Live URL | `https://www.q2m.io/jobs` |
| GitHub repo | `brandonr2630/q2-machines-job-cards` |
| Deploy | Push to `master` via PR → GitHub Actions → GreenGeeks cPanel auto-deploys |
| Service worker | `service-worker.js` · current: `q2-machines-v3` |

---

## Sessions

### Session 8 — 2026-05-16 (GitHub Infrastructure — Round 2)

| Change | PR |
|--------|----|
| Delete branch on merge enabled on all 5 repos | — (GitHub API) |
| Concurrency control added to reusable deploy workflow | [projects#1](https://github.com/brandonr2630/projects/pull/1) |
| `CLAUDE.md` excluded from server deploys (alongside `handoff.md`) | [projects#2](https://github.com/brandonr2630/projects/pull/2) |
| `CLAUDE.md` added to `meridian-erp` | [meridian-erp#6](https://github.com/brandonr2630/meridian-erp/pull/6) |
| `CLAUDE.md` added to `q2-machines-job-cards` | [q2-machines-job-cards#4](https://github.com/brandonr2630/q2-machines-job-cards/pull/4) |
| `CLAUDE.md` added to `q2m-website` | [q2m-website#4](https://github.com/brandonr2630/q2m-website/pull/4) |
| `CLAUDE.md` added to `coc-website` | [coc-website#7](https://github.com/brandonr2630/coc-website/pull/7) |
| `terran-resources-website` deploy workflow — deferred; files exist locally | — |

### Session 7 — 2026-05-16 (GitHub Infrastructure)

| Change | Commit |
|--------|--------|
| Reusable deploy workflow — inline script → call to `brandonr2630/projects` | `ac534dd` |
| Auto-merge enabled | — |
| GitHub Projects board linked | [projects/1](https://github.com/users/brandonr2630/projects/1) |

### Session 6 — 2026-05-16 (Repo Overhaul)

| Change | Commit |
|--------|--------|
| `.gitignore` created | `c18e8f5` |
| Deploy workflow overhauled — binary upload, secrets, `workflow_dispatch` | `c18e8f5` |
| `.cpanel.yml` removed | `6e789fe` |
| `Q2_JobCard_ProjectContext.docx` removed from git; `*.docx` added to `.gitignore` | `a9d7910` |
| Branch protection ruleset on `master` — requires PR | — |
| Folder renamed `q2-machines-job-cards/` (was already correct) | — |

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
pct_complete
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
id, job_id, testing_strategy, total_qa_hours_budgeted
```

**job_qa_tests** (child of job_qa_testing_plan)
```
id, job_id, qa_plan_id, sequence, test_name, test_phase
(design|fabrication|in-process|pre-delivery|post-delivery),
procedure, frequency, sample_size, equipment_needed,
time_per_test_hours, pass_criteria, responsible_person,
wbs_task_id, created_at
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

## CURRENT SYSTEM STATE (as of May 2026 — updated post-session 5)

### Live System — `https://www.q2m.io/jobs/`
- **Service worker:** `CACHE_NAME = 'q2-machines-v3'`, network-first for HTML
- **Supabase project:** `pnrfcusipgojhkuvtjio`
- **Active file:** `index.html` (~4000 lines). `index1.html` is archive — do not edit.
- **Email / SMTP:** Custom SMTP configured via Resend (`smtp.resend.com:465`), sending from `noreply@q2m.io`. Supabase built-in email removed. `https://www.q2m.io/jobs/` is whitelisted in Supabase → Authentication → URL Configuration → Additional Redirect URLs.

### Login Flow
`doLogin()` → `initApp()` → `openDashboard()`

`initApp()` is now isolated from the auth `try/catch` in both `doLogin()` and the `DOMContentLoaded` session-restore path. Auth errors (bad credentials, profile load failure) still display on the login form. Errors thrown inside `initApp()` after a successful login surface via `showToast()` and `console.error()` — no more blank screen with no feedback.

**Note:** `newJobCard(true)` was removed from `initApp()`. It was burning a job number on every login before the dashboard opened. Job numbers now only increment when the user explicitly clicks New Job.

**Job number integrity:** `fetchNewJobNo()` calls `sb.rpc('next_job_no')` which permanently increments the Supabase sequence. Two additional gaps were fixed in session 3:
- `duplicateJob()` was calling `fetchNewJobNo()` explicitly then calling `newJobCard(true)` (which calls it again) — two increments per duplicate. Fixed by removing the pre-fetch; `newJobCard()` fetches internally.
- `deleteJob()` called `newJobCard(true)` after deletion, consuming a number that was discarded if the user navigated away. Fixed by redirecting to `openDashboard()` after delete instead.

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

Approval badge count is driven by `checkPendingApprovals()` — queries config tables for `status='pending'`. Custom tabs (`employees`, `users`, `equipment`) are flagged `skipApprovals:true` and excluded from this query.

### Config Manager (Setup Panel)
8 tabs, accessible from the dashboard header (admin) or ⚙ Config button. **Session 5 redesign (May 2026):** tabs moved to a left sidebar (vertical layout, desktop) or collapsible panel (mobile). Header spans full width with "Setup" title. Desktop sidebar is 160px wide; active tab highlighted with gold left border. Mobile uses hamburger toggle (☰) to collapse/expand tabs.

| Tab | Table | Renderer | Notes |
|-----|-------|----------|-------|
| Labour Classification | `config_labour` | generic | workshop & onsite rates |
| Equipment / Machine | `config_equipment` | custom | full detail form, see below |
| Material / Stock Item | `config_materials` | generic | unit, default cost |
| Consumable | `config_consumables` | generic | category, unit, cost |
| Task Type | `config_tasks` | generic | category |
| QC Checklist Item | `config_qc_checklists` | generic | job type filter |
| Employees | `employees` | custom | full CRUD, age calculated from DOB |
| User Accounts | `profiles` + auth | custom | admin only, dashed tab border |

**Equipment / Machine tab** uses a custom panel renderer (`renderEquipmentPanel()` / `openEquipmentForm(id)`). The list view shows a summary table (Name, Make, Model, Type, Power, Mobility). Edit/Add opens a full detail form with sections:

- **Identity:** equipment_name *(required)*, description_type, make, model_no, serial_no, shop_number, year_of_manufacture, age *(auto-calculated, read-only)*, date_of_acquisition, capacity_size
- **Rates:** workshop_rate_ttd, onsite_rate_ttd *(these feed the job form dropdowns via `loadConfig()`)*
- **Accessories:** dynamic multi-entry list stored as `jsonb` array
- **Classification:** power_type (electric | diesel), mobility_type (fixed | mobile) — radio buttons that toggle conditional sections
- **Mobile Details** *(shown when mobile)*: tyre_size, tyre_qty
- **Electric Details** *(shown when electric)*: hp_kw, voltage, amps, frequency, phase_type (3-phase | single-phase), electric_notes
- **Diesel / Fluid Servicing** *(shown when diesel)*: fuel_capacity, fuel_filter_no/qty, engine_oil_filter_no/qty, hydraulic_filter_no/qty, coolant_spec/capacity, engine_oil_spec/capacity, hydraulic_oil_spec/capacity

The Supabase migration `expand_config_equipment_fields` added 32 new columns to `config_equipment` (applied May 14, 2026). `loadConfig()` still maps only `equipment_name`, `asset_no`, `workshop_rate_ttd`, `onsite_rate_ttd` — the job form dropdowns are unaffected by the new columns.

Equipment is removed from the Suggest modal (it previously offered a 4-field form that would break with the new schema). All equipment management goes through the Config Manager directly.

**Employees table** (`employees`): name, date_of_birth, date_of_employment, address, contact_no, email, job_classification, nationality, next_of_kin, next_of_kin_contact, created_at, updated_at, created_by. Age is calculated client-side from DOB — not stored.

**User Accounts tab** (admin only): inline create-user form (calls `sb.auth.signUp` + upserts `profiles`) and user list with full management actions. Uses `createNewUserInline()` — separate from the legacy `createNewUser()` which is still wired to the standalone `usermgr-overlay`.

**User Accounts — Existing Users table columns:** Username · Email · Role (inline dropdown) · Status (Active/Blocked badge) · Joined · Actions

**Actions per user row:**
- **Edit** — opens `edit-user-modal` (id, name, email, role fields). Populated from `_userMap` (module-level map built on each `renderUsersPanel()` call — avoids embedding data in onclick attributes). Modal also contains a "Send Reset Email" button.
- **Block / Unblock** — toggles `profiles.blocked`. Blocked users are rejected at login with "Account suspended" after Supabase sign-out. The current logged-in admin cannot block themselves (isSelf guard).
- **Send Reset Email** — calls `sb.auth.resetPasswordForEmail(email, { redirectTo: window.location.href.split('#')[0] })`. Sends a Supabase magic link via Resend SMTP. When the user clicks the link they land back on the app and the login box transforms into a Set New Password form (see Password Recovery Flow below).

**`profiles` table columns (session 4 migration `profiles_add_email_and_blocked`):** `id`, `username`, `role`, `created_at`, `email` (text), `blocked` (boolean default false). `createNewUserInline()` saves `email` to `profiles` so it is available for reset emails and display.

**ID namespacing:** The inline panel's form fields use `inu-*` IDs (`inu-email`, `inu-name`, `inu-pw`, `inu-role`, `inu-msg`) to avoid collision with the identically-named inputs in the legacy `usermgr-overlay` which remains in the static DOM. Do not reuse `new-user-*` IDs in the inline panel. Edit modal uses `eum-*` IDs.

**Session handling:** `createNewUserInline()` saves the admin session before calling `sb.auth.signUp`. If Supabase returns a new session (email confirmation disabled), the admin session is restored immediately after. Without this, the admin gets silently logged out mid-operation.

### Password Recovery Flow
When an admin sends a password reset email, the user receives a link pointing back to `q2m.io/jobs/` with a `#access_token=...&type=recovery` hash.

On page load, `DOMContentLoaded` checks `window.location.hash` for `type=recovery` **before** the normal session-restore path. If detected, `showPasswordRecoveryUI()` is called immediately. `onAuthStateChange` also listens for the `PASSWORD_RECOVERY` event as a fallback.

`showPasswordRecoveryUI()` transforms the login box in place:
- Hides the email/password fields and Sign In button
- Shows `#login-recovery-section` (two password fields + Set New Password button)
- Updates the title/eyebrow text

`doPasswordReset()` calls `sb.auth.updateUser({ password })`, signs out, restores the normal login UI, clears the URL hash via `history.replaceState`, and shows a success message prompting the user to sign in with their new password.

### Draft Restore
`restoreDraft()` in `initApp()` now shows a `showConfirm` dialog instead of a persistent toast. The old toast had no dismiss option, causing it to reappear on every login. The old restore path (`homeGoNewJob()`) was also unreachable from the new dashboard.

- **Restore Draft** → `closeDashboard()` + `newJobCard(true)` + `loadJobFromRow(draft.data)` + `clearDraft()`
- **Cancel** → `clearDraft()` immediately

Either choice removes the draft from `localStorage`. Drafts older than 24 hours are auto-discarded by `restoreDraft()`.

### Known Bugs Fixed

**Session 1**
- `clearAuditLog` / `addAuditEntry` undefined → ReferenceError silently blocked `openDashboard()` on login
- `currentJobId` not reset in `newJobCard()` → second job save overwrote first job's record
- Job number consumed on every login → removed eager `newJobCard(true)` from `initApp()`

**Session 2**
- `initApp()` errors swallowed by `doLogin()` try/catch → blank screen after login if app failed to load; fixed by isolating `initApp()` into its own try/catch with toast feedback
- Inline User Accounts form non-functional → all five form field IDs (`new-user-*`, `usermgr-create-msg`) duplicated in the hidden legacy `usermgr-overlay`; `getElementById` always returned the hidden elements, making validation errors invisible and reading empty field values; fixed by namespacing inline panel to `inu-*` IDs
- `createNewUserInline()` missing admin session save/restore → Supabase `signUp` switched active session to new user, silently logging out the admin; fixed by capturing and restoring the admin session around the `signUp` call

**Session 3**
- `duplicateJob()` called `fetchNewJobNo()` then `newJobCard(true)` (which calls it again) → two job numbers consumed per duplicate, causing non-sequential numbering; fixed by removing the explicit pre-fetch from `duplicateJob()`
- `deleteJob()` called `newJobCard(true)` after deletion → consumed a job number immediately regardless of whether the user intended to create a new job; fixed by redirecting to `openDashboard()` after delete

**Session 4**
- User Accounts table had no Edit/Block/Reset actions → added full user management (edit modal, block/unblock toggle, send password reset email)
- Action buttons rendered via `display:flex` on `<td>` directly → broke table row border alignment; fixed by moving flex to an inner `<div>`
- `onclick` attributes embedded username/email as string arguments → any name with an apostrophe silently broke the JS handler; fixed by storing all user records in `_userMap` and passing only the UUID to handlers
- `.modal-overlay` had a duplicate CSS rule with `z-index:9000`, overriding the correct `z-index:10000` — all modals were rendering behind the Config Manager (`z-index:9100`); fixed by correcting the duplicate rule
- `#confirm-modal` rendered behind the edit-user-modal (same z-index, earlier in DOM) → added `#confirm-modal { z-index:11000 }`
- Password reset link pointed to `localhost:3000` (Supabase default Site URL) → added `redirectTo: window.location.href.split('#')[0]` to `resetPasswordForEmail`, wired `PASSWORD_RECOVERY` event handler, added `showPasswordRecoveryUI()` / `doPasswordReset()` for in-app password setting; configured Resend custom SMTP
- Draft restore toast had no dismiss option → reappeared on every login; draft restore path (`homeGoNewJob()`) was unreachable from new dashboard; replaced with `showConfirm` dialog offering Restore or Discard, both clearing the draft from `localStorage`

**Session 6 — Infrastructure & Audit (2026-05-16)**
- Deploy workflow overhauled (`c18e8f5`): `HOST` and `CPANEL_USER` moved to GitHub Secrets (`CPANEL_HOST`, `CPANEL_USER`); binary file upload added (images/icons now upload correctly via `Fileman/upload_files` multipart — previously corrupted silently); subdirectory creation step added; `workflow_dispatch` trigger added for manual full redeploy from GitHub UI/mobile; BEFORE null check fixed (empty string + all-zeros); excluded `ARCHIVES/`, `Code.gs`, `Q2_JobCard_ProjectContext.docx`, `README.md`, `handoff.md` from deploy.
- `.gitignore` created: OS files (`.DS_Store`, `Thumbs.db`, `Desktop.ini`), editor dirs (`.vscode/`, `.idea/`), Claude Code worktrees (`.claude/`).
- Cross-repo audit conducted across all 5 Terran Resources repos — findings listed in NEXT STEPS below.
- Phone management strategy: all repos being prepared for GitHub Mobile — `workflow_dispatch` triggers on all workflows, branch protection + PR flow, `github.dev` for in-browser editing.

**Session 5**
- Config Manager sidebar redesign: tabs moved from horizontal header layout to dedicated left sidebar (desktop) / collapsible panel (mobile). Header now spans full width. Title changed from "Config Manager" to "Setup". Desktop sidebar 160px wide with gold left-border active state; mobile toggle via hamburger icon (☰). HTML restructured with new `cfgmgr-main` wrapper and `toggleCfgSidebar()`/`closeCfgSidebar()` JS functions. CSS updated for row/column flex layouts and responsive breakpoint at 768px.
- HMI brainstorm completed for planning tools phase: decided on non-linear canvas (card-based UI showing all 8 planning tools) instead of sequential wizard; lean terminology (e.g., "What Could Go Wrong" vs. "Risk Register"); mobile-first execution views; approver workflow with summary-based review (not detail drill-down); smart cascading with manual override (budget auto-populates from material rates, other downstream tools flagged for review); contextual audit trails (not separate report view). Key architectural decision: baseline snapshot frozen at approval, version increments on re-approval (v1, v2, etc.) for comparison after changes.
- Document handling discussion: Supabase Storage (simplest) vs. Zoho Workdrive (Option 3: Edge Function proxy for security). No Zoho MCP in registry; will use Supabase Storage for file uploads or build Edge Function proxy if organizational requirement for Workdrive integration emerges.

---

## NEXT STEPS

1. ✅ Design complete (this document)
2. ✅ System stabilisation: login flow fixed, dashboard wired, toolbar consolidated
3. ✅ Config Manager: Employees and User Accounts tabs added
4. ✅ Bug fixes: initApp error swallow, inline user form duplicate IDs, session restore
5. ✅ Bug fixes: job number gaps on duplicate and delete
6. ✅ Config Manager: Equipment / Machine tab expanded (32 new fields, custom form with conditional sections)
7. ✅ User Accounts: Edit, Block/Unblock, Password Reset (send email + in-app Set New Password flow)
8. ✅ Email: Custom SMTP via Resend, sending from noreply@q2m.io
9. ✅ Bug fixes: modal z-index stack, onclick data embedding, draft toast/restore
10. ✅ Config Manager UI redesign: sidebar layout, "Setup" naming, mobile-responsive toggle
11. ✅ HMI brainstorm: planning tools phase strategy (non-linear canvas, lean terminology, baseline versioning)
12. ⏳ Development: Build planning tools UI (Charter through H&S)
   - Start with non-linear canvas showing all 8 planning tools as cards
   - Implement auto-cascade for Budget (material/labour rates auto-populate)
   - Implement audit trail for all edits
   - Use lean terminology throughout
13. ⏳ Development: Build approval workflow & baseline snapshot
   - Approver summary view (one-screen review)
   - Baseline snapshot creation and version history
   - Rejection feedback flow (status back to DRAFT, comment visible)
14. ⏳ Development: Build mobile-first execution views
   - Daily Standup (phone-friendly form)
   - Labour Log (swipe-to-log by task)
   - Safety Brief (pre-work checklist with signatures)
   - QC Checklist (mobile checkbox list with photo capture)
   - Material/Equipment Log (quick-entry by task/item)
15. ⏳ Development: Build execution dashboard (tracking tools)
   - Project Health top section (on track / behind / over budget)
   - 3-column view: Schedule Variance, Budget Variance, Risk & Quality
   - WBS task linking across all views
16. ⏳ Document handling: Supabase Storage file upload (if needed) or Edge Function proxy for Zoho Workdrive
17. ⏳ Testing: Full workflow (plan → approval → execution → tracking)
18. ⏳ Templates: Create standard project templates (Machining, Assembly, Fabrication)
19. ⏳ Deployment: Test on live Q2M jobs
20. ⏳ Phase 2: Client portal (future build)

### Infrastructure (Audit Action Items)

21. ✅ Fix COC Website (`coc-website`) deploy workflow — resolved by switching all repos to the reusable workflow (session 7), which has binary file handling built in
22. ✅ Fix Terran Group ERP (`meridian-erp`) deploy workflow — same; resolved by reusable workflow; secrets moved to `CPANEL_HOST`/`CPANEL_USER`
23. ✅ `.cpanel.yml` — never committed to `coc-website` or `meridian-erp`; already clean
24. ✅ Branch protection enabled on `master` for all 5 repos
25. ⏳ Wire deploy workflow for `terran-resources-website` when site is ready to launch (files exist locally; just needs commit + PR)
26. ✅ `Q2_JobCard_ProjectContext.docx` removed from git (`a9d7910`)
27. ✅ `ARCHIVES/` gitignored and 9 tracked files untracked in `q2-machines-job-cards`; `archives/` gitignored in `q2m-website`; `coc-website` already had it

---

**Questions? Clarifications needed before development starts? Add notes here or contact project stakeholder.**
