# CLAUDE.md — Q2 Machines Job Cards PWA

Live URL: `q2m.io/jobs` · Repo: `brandonr2630/q2-machines-job-cards`

## Architecture

Dual-backend PWA. No build system or bundler — files deployed as-is.

- **`index.html`** (~3100 lines) — the entire frontend: Login, Dashboard, Job form, Config Manager, Offline queue, User Management
- **`service-worker.js`** — caches app shell under `CACHE_NAME = 'q2-machines-v3'`. Increment this version string when deploying changes that must bust the cache. **Always read the current version from `origin/master`, never the local file** (another PR may have already bumped it):
  ```bash
  git fetch origin master
  current=$(git show origin/master:service-worker.js | grep -oP "q2-machines-v\K\d+")
  sed -i "s/q2-machines-v[0-9]*/q2-machines-v$((current + 1))/" service-worker.js
  ```
- **`Code.gs`** — Google Apps Script (not deployed to GreenGeeks). Deployed separately as a web app ("Execute as: Me, Access: Anyone") backed by a Google Spreadsheet.

## Backends

- **Supabase** — primary data store for job records and user auth. All job CRUD goes here.
- **Google Apps Script** — serves config catalogues (Labour, Equipment, Materials, Consumables, QC Checklists) and generates job numbers. Config is fetched from Apps Script on app load.

## Job form modules

Labour · Equipment · Materials · Consumables · Sub-contractors · QC Checklist · Costing Summary · Drawings/Specs/Reports

## Deployment

Push to `master` auto-deploys via GitHub Actions → cPanel Fileman API (GreenGeeks). Deploy dir: `/home/terranre/public_html/q2m.io/jobs`. `Code.gs` and `README.md` are excluded from deploy. Manual redeploy: Actions → Deploy to cPanel → Run workflow.

## Session context

See `handoff.md` for the running log of completed work and known issues.
