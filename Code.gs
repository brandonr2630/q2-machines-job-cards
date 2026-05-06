// ═══════════════════════════════════════════════════════════════
//  Q2 MACHINES — Job Card Apps Script
//  Paste this entire file into your Apps Script editor and deploy
//  as a Web App (Execute as: Me, Access: Anyone).
//
//  Sheet names expected in your Google Spreadsheet:
//    "Jobs"         — one row per job card
//    "Labour"       — labour classifications & rates
//    "Equipment"    — equipment & rates
//    "Tasks"        — task list for sub-rows
//    "Materials"    — materials catalogue
//    "Consumables"  — consumables catalogue
//    "QC Checklists"— checklist items per job type
//
//  Column A of "Jobs" must be "Job No" (header in row 1).
// ═══════════════════════════════════════════════════════════════

// ── CONFIGURATION ───────────────────────────────────────────────
const JOBS_SHEET         = 'Jobs';
const LABOUR_SHEET       = 'Labour';
const EQUIPMENT_SHEET    = 'Equipment';
const TASKS_SHEET        = 'Tasks';
const MATERIALS_SHEET    = 'Materials';
const CONSUMABLES_SHEET  = 'Consumables';
const QC_SHEET           = 'QC Checklists';

const JOB_NO_PREFIX      = 'JC-';
const JOB_NO_PADDING     = 4;          // JC-0001
const SEARCH_MAX_RESULTS = 20;
const DASHBOARD_MAX_ROWS = 500;        // max rows returned to dashboard


// ── ROUTER ──────────────────────────────────────────────────────

function doGet(e) {
  const action = e.parameter.action || '';
  try {
    switch (action) {
      case 'getConfig':  return jsonResponse(getConfig());
      case 'newJobNo':   return jsonResponse(newJobNo());
      case 'search':     return jsonResponse(searchJobs(e.parameter.q, e.parameter.type));
      case 'getAllJobs':  return jsonResponse(getAllJobs());
      default:           return jsonResponse({ error: 'Unknown GET action: ' + action }, 400);
    }
  } catch(err) {
    return jsonResponse({ error: err.message, stack: err.stack }, 500);
  }
}

function doPost(e) {
  let body;
  try { body = JSON.parse(e.postData.contents); }
  catch(err) { return jsonResponse({ error: 'Invalid JSON in request body' }, 400); }

  const action = body.action || '';
  try {
    switch (action) {
      case 'saveJob':   return jsonResponse(saveJob(body.data));
      case 'deleteJob': return jsonResponse(deleteJob(body.jobNo));
      default:          return jsonResponse({ error: 'Unknown POST action: ' + action }, 400);
    }
  } catch(err) {
    return jsonResponse({ error: err.message, stack: err.stack }, 500);
  }
}

function jsonResponse(data, code) {
  const output = ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
  return output;
}


// ── GET CONFIG ───────────────────────────────────────────────────
// Returns all lookup tables the front-end needs.

function getConfig() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const readSheet = name => {
    try {
      const sh = ss.getSheetByName(name);
      if (!sh) return [];
      const data = sh.getDataRange().getValues();
      if (data.length < 2) return [];
      const headers = data[0];
      return data.slice(1).map(row => {
        const obj = {};
        headers.forEach((h, i) => { if (h) obj[h] = row[i] !== undefined ? row[i].toString() : ''; });
        return obj;
      }).filter(r => Object.values(r).some(v => v !== ''));
    } catch(err) {
      console.warn('Could not read sheet: ' + name, err.message);
      return [];
    }
  };

  return {
    labour:        readSheet(LABOUR_SHEET),
    equipment:     readSheet(EQUIPMENT_SHEET),
    tasks:         readSheet(TASKS_SHEET),
    materials:     readSheet(MATERIALS_SHEET),
    consumables:   readSheet(CONSUMABLES_SHEET),
    qcChecklists:  readSheet(QC_SHEET),
  };
}


// ── NEW JOB NUMBER ───────────────────────────────────────────────
// Finds the highest existing JC-NNNN number and returns the next one.
// Uses a lock to prevent race conditions if two users hit it simultaneously.

function newJobNo() {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet   = getJobsSheet();
    const col     = getColIndex(sheet, 'Job No');
    const lastRow = sheet.getLastRow();
    let maxNum    = 0;

    if (lastRow > 1) {
      const values = sheet.getRange(2, col, lastRow - 1, 1).getValues();
      values.forEach(([val]) => {
        const s   = val ? val.toString() : '';
        const num = parseInt(s.replace(/[^0-9]/g, ''), 10);
        if (!isNaN(num) && num > maxNum) maxNum = num;
      });
    }

    const next  = maxNum + 1;
    const jobNo = JOB_NO_PREFIX + String(next).padStart(JOB_NO_PADDING, '0');
    return { jobNo };
  } finally {
    lock.releaseLock();
  }
}


// ── SAVE JOB ─────────────────────────────────────────────────────
// Upsert: if the Job No already exists, update that row.
// If not, append a new row.

function saveJob(data) {
  if (!data) throw new Error('No data provided to saveJob');

  const sheet   = getJobsSheet();
  const headers = getHeaders(sheet);
  const jobNo   = (data['Job No'] || '').toString().trim();
  if (!jobNo) throw new Error('Job No is required');

  // Stamp last-saved time and JSA ref if not set
  data['Last Saved'] = new Date().toISOString();
  if (!data['JSA Ref'] || data['JSA Ref'] === '') {
    data['JSA Ref'] = 'JSA-' + jobNo;
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const existingRow = findJobRow(sheet, jobNo);

    if (existingRow > 0) {
      // Update existing row
      const row = headers.map(h => data[h] !== undefined ? data[h] : '');
      sheet.getRange(existingRow, 1, 1, row.length).setValues([row]);
    } else {
      // Append new row
      const row = headers.map(h => data[h] !== undefined ? data[h] : '');
      sheet.appendRow(row);
    }

    return { status: 'ok', jobNo };
  } finally {
    lock.releaseLock();
  }
}


// ── DELETE JOB ───────────────────────────────────────────────────
// Permanently removes the row for the given Job No.
// The front-end only shows this button to admin users.

function deleteJob(jobNo) {
  if (!jobNo) throw new Error('jobNo is required for deleteJob');

  jobNo = jobNo.toString().trim();

  const sheet      = getJobsSheet();
  const existingRow = findJobRow(sheet, jobNo);

  if (existingRow < 2) {
    // Row not found — treat as success (idempotent)
    return { status: 'ok', jobNo, note: 'Job not found — nothing deleted' };
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    sheet.deleteRow(existingRow);
    return { status: 'ok', jobNo };
  } finally {
    lock.releaseLock();
  }
}


// ── SEARCH JOBS ──────────────────────────────────────────────────
// Searches by Job No or Customer. Returns up to SEARCH_MAX_RESULTS rows.

function searchJobs(q, type) {
  if (!q || q.length < 2) return { results: [] };
  q = q.toString().toLowerCase();

  const sheet   = getJobsSheet();
  const headers = getHeaders(sheet);
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return { results: [] };

  const colIndex = type === 'customer'
    ? headers.indexOf('Customer')
    : headers.indexOf('Job No');

  if (colIndex < 0) return { results: [], error: 'Column not found: ' + type };

  const allData = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
  const results = [];

  for (const row of allData) {
    const cell = (row[colIndex] || '').toString().toLowerCase();
    if (cell.includes(q)) {
      const obj = {};
      headers.forEach((h, i) => { obj[h] = row[i] !== undefined ? row[i].toString() : ''; });
      results.push(obj);
      if (results.length >= SEARCH_MAX_RESULTS) break;
    }
  }

  return { results };
}


// ── GET ALL JOBS ─────────────────────────────────────────────────
// Returns summary data for all jobs — used by the dashboard view.
// To keep the payload lean, we only return the columns the dashboard
// actually displays. Heavy columns (Labour Detail, etc.) are excluded.

function getAllJobs() {
  const sheet   = getJobsSheet();
  const headers = getHeaders(sheet);
  const lastRow = sheet.getLastRow();

  if (lastRow < 2) return { jobs: [] };

  // Columns to include in dashboard response (keeps payload small)
  const SUMMARY_COLS = [
    'Job No', 'Customer', 'Contact', 'Phone', 'Email',
    'Job Type', 'Job Category', 'Status', 'Priority',
    'Date Received', 'Due Date', 'Description', 'Part Name',
    'Customer PO', 'Quoted TTD', 'Accepted By', 'Last Saved',
    'Date Completed', 'QC Result', 'Modified By',
  ];

  // Build column index map for only the columns we want
  const colMap = {};
  SUMMARY_COLS.forEach(col => {
    const idx = headers.indexOf(col);
    if (idx >= 0) colMap[col] = idx;
  });

  const allData = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
  const jobs    = [];

  for (const row of allData) {
    // Skip completely empty rows
    if (!row.some(cell => cell !== '')) continue;

    const obj = {};
    Object.entries(colMap).forEach(([col, idx]) => {
      obj[col] = row[idx] !== undefined ? row[idx].toString() : '';
    });
    jobs.push(obj);

    if (jobs.length >= DASHBOARD_MAX_ROWS) break;
  }

  // Sort newest first by Job No descending
  jobs.sort((a, b) => {
    const an = parseInt((a['Job No']||'').replace(/\D/g,''), 10) || 0;
    const bn = parseInt((b['Job No']||'').replace(/\D/g,''), 10) || 0;
    return bn - an;
  });

  return { jobs };
}


// ── HELPERS ──────────────────────────────────────────────────────

function getJobsSheet() {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(JOBS_SHEET);
  if (!sheet) throw new Error(`Sheet "${JOBS_SHEET}" not found. Check the sheet name.`);
  return sheet;
}

// Returns header row as array of strings
function getHeaders(sheet) {
  const lastCol = sheet.getLastColumn();
  if (lastCol < 1) throw new Error('Jobs sheet appears to be empty.');
  return sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(h => h.toString());
}

// Returns the column index (1-based) of a named column. Throws if not found.
function getColIndex(sheet, colName) {
  const headers = getHeaders(sheet);
  const idx     = headers.indexOf(colName);
  if (idx < 0) throw new Error(`Column "${colName}" not found in sheet "${sheet.getName()}"`);
  return idx + 1; // Sheets is 1-based
}

// Finds the 1-based row number of a job by its Job No. Returns -1 if not found.
function findJobRow(sheet, jobNo) {
  const col     = getColIndex(sheet, 'Job No');
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return -1;

  const values = sheet.getRange(2, col, lastRow - 1, 1).getValues();
  for (let i = 0; i < values.length; i++) {
    if (values[i][0].toString().trim() === jobNo) return i + 2; // +2: header + 0-index
  }
  return -1;
}
