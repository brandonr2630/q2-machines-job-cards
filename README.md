# Q2 Machines Job Cards

A Progressive Web App (PWA) for managing and tracking job cards for Q2 Machines.

**Live site:** [q2m.io/jobs](https://q2m.io/jobs)

## Features

- Job card creation and tracking
- Offline support via service worker
- Installable as a PWA on mobile and desktop
- Google Apps Script backend integration (`Code.gs`)

## Structure

| File | Purpose |
|------|---------|
| `index.html` | Main application |
| `manifest.json` | PWA manifest |
| `service-worker.js` | Offline caching |
| `Code.gs` | Google Apps Script backend |
| `ARCHIVES/` | Previous versions |

## Deployment

Hosted on GreenGeeks at `q2m.io/jobs`. Every push to `master` (via PR) auto-deploys via GitHub Actions → shared reusable workflow in `brandonr2630/projects`.

- **Incremental push:** only files changed in the PR are uploaded
- **Full redeploy:** Actions → Deploy to cPanel → Run workflow
- `Code.gs`, `ARCHIVES/`, and `README.md` are excluded from deploy

### Required GitHub Secrets

| Secret | Value |
|--------|-------|
| `CPANEL_API_TOKEN` | cPanel API token |
| `CPANEL_HOST` | `https://chi203.greengeeks.net:2083` |
| `CPANEL_USER` | `terranre` |
