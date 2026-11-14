# Technopreneurship Final Assessment Management System

**Diploma Teknologi Maklumat (DAT) · Jabatan Teknologi Maklumat (JTM) · Pusat Pengajian Diploma · Universiti Tun Hussein Onn Malaysia (UTHM)**

A secure web application for the DAT Technopreneurship final assessment. Students answer assessment questions **individually** for the business component they have been assigned (for example Marketing, Product Planning or Financial Planning). The lecturer marks each student individually, and the system combines the group members' answers into one **Group Business Proposal** while keeping every original answer stored, separate and traceable.

> This software is developed by Dr. Rosfuzah Roslan for teaching use. It is **not** an official UTHM system and makes no claim of institutional endorsement. Replace the placeholder logos with official artwork only with the institution's permission (see section 4).

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/m-14300838-DhiyaDamia/technopreneurship?quickstart=1)

**Fastest way to try it (runs on GitHub, nothing to install):** click the badge above, or open the repository → **Code** → **Codespaces** → **Create codespace on main**. After one to two minutes the web application opens in a new browser tab. Sign in with `lecturer` / `Demo@2026`. See [section 8a](#8a-running-on-github-codespaces).

---

## Contents

1. [Project overview](#1-project-overview)
2. [Architecture](#2-architecture)
3. [Installing dependencies](#3-installing-dependencies)
4. [Environment variables](#4-environment-variables)
5. [Google Sheets setup](#5-google-sheets-setup)
6. [Creating the required worksheets](#6-creating-the-required-worksheets)
7. [Google authentication / service account configuration](#7-google-authentication--service-account-configuration)
8. [Running locally](#8-running-locally)
9. [Testing](#9-testing)
10. [GitHub workflow](#10-github-workflow)
11. [Deployment](#11-deployment)
12. [Updating the system from GitHub](#12-updating-the-system-from-github)
13. [Lecturer usage](#13-lecturer-usage)
14. [Student usage](#14-student-usage)
15. [Assessment setup](#15-assessment-setup)
16. [Question management](#16-question-management)
17. [Group management](#17-group-management)
18. [Marking](#18-marking)
19. [Business proposal generation](#19-business-proposal-generation)
20. [Printing / exporting](#20-printing--exporting)
21. [Camera monitoring](#21-camera-monitoring)
22. [Troubleshooting](#22-troubleshooting)
23. [Security](#23-security)
24. [Privacy](#24-privacy)
25. [Technical limitations](#25-technical-limitations)

Further reading: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) · [docs/LIMITATIONS.md](docs/LIMITATIONS.md) · [docs/PRIVACY.md](docs/PRIVACY.md)

---

## 1. Project overview

| Role | What they do |
|---|---|
| **Student** | Logs in with matric number, sees group, business and assigned component, answers questions in a focused interface with auto-save and a server-controlled timer, grants camera permission when required, submits, and later views released marks and feedback. |
| **Lecturer** | Creates the assessment and questions, manages students and groups, assigns business ideas and components, monitors the live assessment (status, camera status, monitoring events, individual live camera view), reviews answers, marks and gives feedback, generates/reviews/finalises group business proposals, and prints/exports individual reports, proposals and group reports. |
| **Administrator** | Manages user accounts and roles, configuration, privacy settings, data retention and the audit log. Administrators can also use every lecturer screen. |

Three distinct outputs are produced for the lecturer:

1. **Individual Student Assessment Report** – one student's questions, answers, marks, feedback, totals, submission and monitoring summary.
2. **Group Business Proposal** – the complete proposal assembled from the group's individual contributions, with every section traceable to its source student and question.
3. **Group Report** – the group's members, components, submission status, individual marks, total group score, proposal status and lecturer feedback.

Data relationship maintained everywhere:

```
Student → Assigned component → Individual questions → Individual answers → Individual marks
       → Group → Business → Combined business proposal → Group report
```

## 2. Architecture

```
Student / Lecturer / Administrator (browser)
        │   HTTPS + WebSocket
        ▼
Web application  (React single-page app, built with Vite)   ← client/
        │   JSON API  (/api/…)  +  Socket.IO (live monitoring, camera signalling)
        ▼
Backend API      (Node.js 22 + Express + Socket.IO)         ← server/
        │   Google Sheets service (in-memory cache + batched writes)
        ▼
Google Sheets    (one spreadsheet, one worksheet per table)
```

* **Frontend** – `client/`. React 18, React Router, plain CSS. Contains **no secrets**. It talks only to the backend API.
* **Backend** – `server/`. Express API with JWT authentication, role-based access, validation (Zod), HTML sanitisation, rate limiting, security headers (Helmet), audit logging, Socket.IO realtime, and a pluggable data store.
* **Data store** – `server/src/data/`. `sheetsStore.js` uses the Google Sheets API through a service account. `localJsonStore.js` keeps the same data as JSON files on disk for demos and tests, so the whole system runs without Google credentials.
* **Hosting** – the backend serves the built frontend from `client/dist`, so the simplest deployment is **one Node service** (Render, Railway, Fly.io, a campus VM, Docker). GitHub Pages can host only the static frontend and **cannot** hold Google credentials; see section 11.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for folder structure, API routes and realtime events.

## 3. Installing dependencies

You need **Node.js 20 or newer** (22 recommended) and **Git**. Download Node from <https://nodejs.org>. Check in a terminal:

```bash
node --version
```

Then, inside the project folder:

```bash
npm run install:all
```

This installs the root tools, the server packages and the client packages.

## 4. Environment variables

Settings and secrets live in a file named `.env` in the project root. It is **never committed** (`.gitignore` excludes it).

```bash
cp .env.example .env
```

Open `.env` in a text editor and fill in the values. The most important ones:

| Variable | Meaning |
|---|---|
| `DATA_STORE` | `local` (JSON files, for trying the system) or `sheets` (Google Sheets, for real use). |
| `JWT_SECRET` | A long random text used to sign login sessions. Generate one with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`. Required in production. |
| `GOOGLE_SHEET_ID` | The long id in the spreadsheet URL: `https://docs.google.com/spreadsheets/d/`**`THIS-PART`**`/edit`. |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | From the service account JSON file (`client_email`). |
| `GOOGLE_PRIVATE_KEY` | From the service account JSON file (`private_key`). Keep the quotes and the `\n` characters exactly as in the JSON file. |
| `COURSE_CODE`, `COURSE_NAME`, `ASSESSMENT_TITLE`, `SEMESTER` | Shown in headers and reports. |
| `CAMERA_REQUIRED_DEFAULT` | Whether new assessments require the camera. |
| `MONITORING_RETENTION_DAYS` | Shown in the privacy notice and used by the purge tool. |
| `CORS_ORIGIN` | Only needed when the frontend is hosted on a different address than the backend. |

Branding assets: put the official logos in `client/public/assets/images/` as `uthm-logo.png`, `jtm-logo.png` and `pusat-pengajian-diploma-logo.png`. Until then, clearly labelled placeholders are shown.

## 5. Google Sheets setup

1. Sign in to Google and create a **new blank spreadsheet** (<https://sheets.new>). Name it, for example, `Technopreneurship Assessment 2026`.
2. Copy the spreadsheet id from the address bar into `GOOGLE_SHEET_ID` in `.env`.
3. Create a service account and share the spreadsheet with it (section 7).
4. Run the setup check:

```bash
npm run sheets:setup
```

It connects, creates every missing worksheet with the correct header row, and prints a summary. It never deletes rows.

Keep the spreadsheet private. Do not share it with students. Avoid editing cells by hand while an assessment is running: the server reloads the sheet every `SHEETS_REFRESH_SECONDS` and your edit could be overwritten by a queued save.

## 6. Creating the required worksheets

`npm run sheets:setup` (or simply starting the server with `DATA_STORE=sheets`) creates these worksheets automatically. If you prefer to create them by hand, use exactly these names and header rows (row 1):

| Worksheet | Columns |
|---|---|
| **Users** | user_id, username, password_hash, role, name, email, student_id, active, must_change_password, created_at, updated_at, last_login_at |
| **Students** | student_id, matric_no, name, email, group_id, role, course_code, section, active |
| **Groups** | group_id, group_name, business_name, business_idea, student_1, student_2, student_3, student_4, status |
| **Assessments** | assessment_id, title, course_code, course_name, semester, description, instructions, duration_minutes, start_at, end_at, status, camera_required, proctoring_enabled, question_mode, components, proposal_template, results_released, created_by, created_at, updated_at |
| **Questions** | question_id, assessment_id, section, topic, question_text, question_type, marks, time_limit, active, order_index, options, guidance, created_at, updated_at |
| **Attempts** | attempt_id, assessment_id, student_id, group_id, component, status, started_at, deadline_at, submitted_at, last_activity_at, last_saved_at, camera_status, flags_count, marking_status, total_marks, max_marks, lecturer_feedback, marked_by, marked_at, reopened_by, reopened_at, reopen_reason |
| **Answers** | answer_id, assessment_id, student_id, group_id, question_id, component, answer, timestamp, status, marks, lecturer_feedback, marked_at, marked_by |
| **ProctoringLogs** | log_id, assessment_id, student_id, group_id, timestamp, event_type, severity, description, review_status, reviewed_by, review_note |
| **BusinessProposals** | proposal_id, group_id, assessment_id, business_name, executive_summary, marketing, product_plan, operations, financial_plan, other_sections, generated_document, status, sections_json, generated_at, updated_at, reviewed_by, reviewed_at, finalised_by, finalised_at, lecturer_notes |
| **GroupReports** | report_id, group_id, assessment_id, business_name, members, submission_status, proposal_status, total_group_score, lecturer_feedback, generated_document, reviewed_by, reviewed_at, status, generated_at, updated_at |
| **AuditLogs** | log_id, timestamp, actor_id, actor_role, actor_name, action, entity_type, entity_id, details, ip |
| **Settings** | key, value, updated_at, updated_by |

Notes: `Students.role` holds the student's assigned **business component**. `Groups.student_1…student_4` mirror the members for easy reading; the authoritative link is `Students.group_id`. Passwords are stored only as bcrypt hashes. Missing columns are added automatically when the server starts.

## 7. Google authentication / service account configuration

The server signs in to Google as a **service account** (a robot account), never as you.

1. Go to <https://console.cloud.google.com> and create a project (e.g. `tfa-assessment`).
2. **APIs & Services → Library** → search **Google Sheets API** → **Enable**.
3. **IAM & Admin → Service Accounts → Create service account**. Name it `tfa-server`. No roles are required. Finish.
4. Open the service account → **Keys → Add key → Create new key → JSON**. A JSON file downloads. **Keep it secret; never commit it to GitHub.**
5. Open the JSON file in a text editor. Copy `client_email` into `GOOGLE_SERVICE_ACCOUNT_EMAIL` and `private_key` into `GOOGLE_PRIVATE_KEY` in `.env` (keep the quotes; the value contains `\n` sequences — leave them as they are).
6. Open your spreadsheet → **Share** → paste the service account email → role **Editor** → Share.
7. Run `npm run sheets:setup` to verify.

## 8. Running locally

**Try the system with demo data (no Google account needed):**

```bash
npm run install:all
npm run seed:demo
npm run dev
```

Open <http://localhost:5173>. Demo accounts (password `Demo@2026`, or whatever `DEMO_PASSWORD` is set to):

| Role | Username |
|---|---|
| Administrator | `admin` |
| Lecturer | `lecturer` |
| Students | `DEMO-A001` … `DEMO-C003` (Abu, Ali, Ahmad / Siti, Aina, Farah / Adam, Hakim, Danish) |

The demo contains 3 groups × 3 students, 3 components × 3 questions, Group A fully submitted, Group B partly submitted and Group C not started. All demo data is fictional and labelled DEMO.

**Run against Google Sheets:** set `DATA_STORE=sheets` and the Google variables in `.env`, then `npm run dev`. On an empty Users worksheet the server creates a bootstrap `admin` account and prints its one-time password in the terminal. Log in, change the password, then create a lecturer account under *Administration → Users*.

**Production-style run (single server):**

```bash
npm run build
npm start
```

Open <http://localhost:4000>.

To reseed the demo store from scratch: `npm --prefix server run seed:demo -- --reset` (deletes all data in the configured store).

## 8a. Running on GitHub (Codespaces)

GitHub Codespaces runs the whole system (backend and frontend) on GitHub's servers inside your browser. The repository contains a `.devcontainer` configuration, so everything is automatic:

1. Open the repository on GitHub → **Code** → **Codespaces** → **Create codespace on main** (or click the badge at the top of this README).
2. Wait for the editor to appear. Dependencies are installed and the DEMO data is seeded automatically; the application then starts in the terminal and a browser tab opens with the web application. If the tab does not open, click the **Ports** tab at the bottom and open port **5173** ("Web application").
3. Sign in with `lecturer` / `Demo@2026` (students: `DEMO-A001` … `DEMO-C003`).

To let other people (for example students in a trial run) open the same address, go to the **Ports** tab, right-click port 5173 → **Port Visibility** → **Public**. The address stays private by default.

To use Google Sheets inside Codespaces without creating a `.env` file: on GitHub go to **Settings → Codespaces → Secrets → New secret** and add `DATA_STORE` = `sheets`, `JWT_SECRET`, `GOOGLE_SHEET_ID`, `GOOGLE_SERVICE_ACCOUNT_EMAIL` and `GOOGLE_PRIVATE_KEY` (paste the key exactly as in the JSON file), each with access to this repository. Restart the codespace afterwards.

Limits to know: a codespace stops after 30 minutes without activity (changeable up to 4 hours in GitHub settings), the free plan has a monthly hours quota, and the address changes if you create a new codespace. It is excellent for trying, demonstrating and configuring the system. For a real graded assessment with a whole class, deploy the backend to a permanent host (section 11) so the address is stable and the server never sleeps mid-assessment.

## 9. Testing

```bash
npm test          # server tests: authentication, permissions, saving, timer expiry, marking, proposals, reports, Google Sheets adapter (with a fake Sheets API), sanitisation
npm run test:e2e  # browser test with Chromium (Playwright): student login → camera → answer → auto-save → monitoring → camera view → submit → marking → proposal → reports → results
```

The end-to-end test starts its own server on port 4300 with a temporary local store and writes screenshots to `test-results/`. It needs the `playwright` package and a Chromium browser (`npx playwright install chromium` once, if not already present).

Manual checks worth repeating before a real assessment: internet interruption (switch off Wi-Fi while answering: the status bar shows *Offline*, answers stay on the device, and they sync when the connection returns), timer expiry (set a 1-minute duration), camera permission denial, and printing of all three outputs.

## 10. GitHub workflow

GitHub holds the **source code only** – never the `.env` file, the service account JSON, passwords or real student data (the spreadsheet is the data store; it is not in Git).

First time:

```bash
git init -b main
git add .
git commit -m "Initial import"
git remote add origin https://github.com/<your-account>/<repository>.git
git push -u origin main
```

Day to day:

```bash
git pull            # get the latest version
# …edit…
git add .
git commit -m "Describe the change"
git push
```

The workflow in `.github/workflows/ci.yml` runs the tests and the build on every push and fails if a `.env` file or private key is accidentally committed.

## 11. Deployment

Summary of what lives where:

| Part | Where | Holds secrets? |
|---|---|---|
| Source code | GitHub | No |
| Assessment data | Google Sheets (private spreadsheet) | No (data only) |
| Backend / API / WebSocket | A Node.js host (Render, Railway, Fly.io, campus server, Docker) | **Yes** – Google credentials and `JWT_SECRET` are set as environment variables on the host |
| Frontend | Served by the backend (recommended) **or** GitHub Pages (static only) | No |

**Recommended: one Node service.**

* *Render*: create a Web Service from the GitHub repository (the included `render.yaml` can be used as a blueprint). Build command `npm run install:all && npm run build`, start command `npm start`. Add the environment variables from `.env.example` in the dashboard (`DATA_STORE=sheets`, `NODE_ENV=production`, `JWT_SECRET`, Google values). Only run **one instance**.
* *Docker*: `docker build -t tfa .` then `docker run -p 4000:4000 --env-file .env tfa`.
* *Campus server*: install Node, clone the repository, create `.env`, `npm run install:all && npm run build`, then run `npm start` under a process manager such as `pm2` behind HTTPS (nginx/Caddy). HTTPS is required for camera access in browsers.

**Optional: frontend on GitHub Pages.** GitHub Pages can host the static files in `client/dist`, but it cannot run the API or keep Google credentials safe, so the backend must still be deployed elsewhere. Build with `VITE_API_BASE_URL=https://your-backend.example.com VITE_BASE_PATH=/<repository>/ npm run build`, publish `client/dist`, and set `CORS_ORIGIN=https://<account>.github.io` on the backend. Deep links need a `404.html` copy of `index.html`.

## 12. Updating the system from GitHub

On the server (or your computer):

```bash
git pull
npm run install:all
npm run build
```

then restart the service (`pm2 restart tfa`, or redeploy on Render/Railway, which usually happens automatically after `git push`). Worksheet columns added by a new version are created automatically on start.

## 13. Lecturer usage

Typical sequence: **Login → Assessments & Questions → Students → Groups → (open assessment) → Live Monitoring → Review & Marking → Business Proposals → Reports**.

* **Dashboard** – counters (students, groups, not started, in progress, submitted, not submitted, marking completed/pending, proposals incomplete/ready, monitoring alerts) and a student table with filters by group, student, section, submission status, marking status and monitoring status.
* **Assessments & Questions** – settings, timing, question visibility, components, proposal template, questions.
* **Students** – add students (a login is created automatically; the temporary password is shown once), edit, deactivate, reset passwords.
* **Groups** – create groups, set business name and idea, add/remove members, assign components.
* **Live Monitoring** – status table, camera status grid, monitoring events with review actions, individual live camera view.
* **Review & Marking** – answer review, per-question marks and feedback, draft/finalise, reopen attempt.
* **Business Proposals** – generate, preview, edit sections, mark reviewed, finalise, print.
* **Reports** – individual student reports, group reports, links to proposals.
* **My Account** – change password.

## 14. Student usage

1. Log in with the matric number and the password given by the lecturer (change it on first login).
2. The dashboard shows name, matric number, group, business, assessment, assigned component, assessment status, remaining time, camera status and submission status.
3. Click **Open assessment**, read the instructions and the monitoring/privacy notice, enable the camera when required, tick the confirmation and click **Start assessment**. The timer starts now.
4. Answer the questions. Answers save automatically about two seconds after typing stops (status shown at the bottom). **Save now** forces a save. Navigation: Previous / Next or the question list.
5. Stay on the assessment tab; switching tabs or windows is recorded as a monitoring event for the lecturer to review.
6. Click **Submit assessment** and confirm. After submission the answers are locked.
7. When the lecturer releases results, the dashboard shows marks and feedback.

If the internet drops, keep working: answers are kept on the device and synchronised when the connection returns. If time runs out, the latest saved answers are submitted automatically.

## 15. Assessment setup

*Assessments & Questions → New assessment.*

* **Duration** – each student's countdown starts when they click Start.
* **Window opens / closes** – optional absolute limits. Attempts are auto-submitted at the closing time.
* **Question visibility** – *Common + assigned component* (default) or *every student answers every question*.
* **Camera required** and **monitoring events** toggles.
* **Status** – Draft → **Open assessment** (students can start) → **Close assessment**. Draft assessments are invisible to students.
* **Release results** – students see their marks only when this is on **and** their marking is finalised.
* **Components** tab – edit the list of business components (default: Marketing, Product Planning, Financial Planning).
* **Proposal template** tab – the 11 default sections, each mapped to question topics.

## 16. Question management

The same question set is shared by every group and student; you never duplicate questions per group. Each question has:

* **Section** – a component name, or *Common* for questions every student answers.
* **Topic** – links the question to a proposal section (choose from the template topics or type your own).
* **Type** – Multiple Choice, Short Answer, Structured Answer, Long Answer, Case Study, Numerical, Scenario-based.
* **Marks**, optional **suggested time**, **active** flag, optional **guidance** shown to students, and MCQ options.

Use ↑ ↓ to reorder, **Preview** to see the student view, and **Deactivate** instead of delete once students have answered.

## 17. Group management

*Groups → Create group* → enter group name, business name and business idea → **Add member** → choose the student and component. Rules enforced by the system: a student belongs to at most one group, a group has at most four members, group names are unique, and the page warns about unassigned or duplicated components. A group with answers cannot be deleted.

## 18. Marking

*Review & Marking* lists attempts per assessment. Open an attempt to see student details, group, business, component, each question with the student's answer, marks (limited to the question's maximum), feedback and the running total. **Save draft** stores marks as *draft*; **Finalise marking** locks them (all questions must have a mark). Finalised marks cannot be changed until **Reopen marking** is used with a reason, which is recorded in the audit log. **Reopen attempt for student** unlocks a submitted attempt with extra minutes (reason required, audited).

## 19. Business proposal generation

*Business Proposals → Group → Generate proposal.* The system reads the group's members and their components, finds each template section's question topics, and assembles the section from the matching answers. Each section shows **source tags** (student, group, question number, topic, answer status). Sections are built live from the stored answers; **lecturer edits are stored separately** and never change the student answers. Statuses: *Draft → Contributions incomplete → Ready for review → Reviewed → Finalised → Printed / Exported*. A proposal can only be finalised when every member has submitted. **Regenerate** rebuilds from current answers (your edits are kept unless you choose to discard them). Finalised proposals must be reopened before editing.

## 20. Printing / exporting

Every output (individual report, proposal, group report) has **Print / Export PDF**. Choose *Save as PDF* in the browser's print dialog. Turn on *Headers and footers* in the dialog for page numbers; the branded header, assessment title, semester, group, members, date and footer are part of the document. Printing a finalised proposal marks it *Printed / Exported*.

## 21. Camera monitoring

When *Camera required* is on, the student must click **Enable camera** and allow access before starting. During the assessment the system records camera status (active, denied, disconnected, permission revoked) and the lecturer can open **View camera** for one student at a time; the video travels directly between the two browsers (WebRTC) and is **never recorded or stored**. The student sees a banner while being viewed. Face presence detection (no face / multiple faces) runs only in browsers that provide the `FaceDetector` API; otherwise the interface says it is unsupported and no face events are produced. Browsers require HTTPS (or `localhost`) for camera access. On networks with strict firewalls a TURN server may be needed for the live view (`WEBRTC_ICE_SERVERS`, `WEBRTC_TURN_USERNAME`, `WEBRTC_TURN_CREDENTIAL`).

Recorded monitoring events: `TAB_SWITCH_DETECTED`, `WINDOW_BLUR`, `FULLSCREEN_EXIT`, `CAMERA_DISABLED`, `CAMERA_PERMISSION_REVOKED`, `CAMERA_DISCONNECTED`, `FACE_NOT_DETECTED`, `MULTIPLE_FACES_DETECTED`, `LARGE_PASTE_DETECTED`, `LONG_IDLE_PERIOD`, plus informational `CAMERA_ENABLED`, `FULLSCREEN_ENTERED`, `CONNECTION_LOST`, `CONNECTION_RESTORED`. They are shown as *potential monitoring events* for lecturer review and can be marked reviewed, dismissed or escalated. The system never labels an event as cheating and cannot detect ChatGPT or any other tool on other tabs, devices or screens.

## 22. Troubleshooting

| Problem | What to check |
|---|---|
| "Cannot reach the server" on the login page | Is the backend running (`npm run dev` or `npm start`)? Correct port? |
| `Could not access the spreadsheet` | Spreadsheet shared with the service-account email as Editor; Google Sheets API enabled; private key copied completely; correct spreadsheet id. |
| Bootstrap admin password lost | Delete the `admin` row from the Users worksheet and restart the server; a new password is printed. |
| Student cannot start | Student needs a group **and** a component; assessment must be *open* and inside its time window. |
| Camera blocked | Site must use HTTPS; the student must allow the camera in the browser's address-bar permission; try Chrome or Edge. |
| Live camera view stays on "Connecting…" | Both browsers need a direct or TURN-relayed path; configure a TURN server for off-campus students. |
| Rate limit message | More than 20 login attempts in 15 minutes from one address, or very high request rates; wait and retry. |
| Google API quota errors in the log | The server retries automatically with back-off; increase `SHEETS_FLUSH_MS` and keep a single server instance. |
| Changes made directly in the spreadsheet disappear | The server's queued writes overwrote them; edit through the application while it is running. |

## 23. Security

* Passwords hashed with bcrypt; login tokens are signed JWTs (expiry `JWT_EXPIRES_IN`) held in session storage and sent as a header (not vulnerable to CSRF); login is rate-limited.
* Role-based access on every route; students can only reach their own attempt, answers and results. Lecturer and admin routes reject student tokens.
* All input validated (Zod); rich-text answers sanitised on the server (allow-list of formatting tags) and again in the browser (DOMPurify); security headers and Content-Security-Policy via Helmet.
* Google credentials and secrets exist only in server environment variables and are never sent to the browser or committed to Git.
* Audit log for logins, submissions, marks, finalisation, reopening, proposal changes, user and settings changes.
* Data-integrity rules: answers are always stored with student, group, assessment, question and component; proposal generation only reads answers of the proposal's own group; lecturer proposal edits are stored separately from answers; finalised marks are protected.

## 24. Privacy

Students see a clear notice before the camera is requested, explaining the purpose, what is monitored, what is stored, who can access it and the retention period. Only live camera status and an optional live view are used; **no video is recorded**. Administrators can add institution-specific notice text, set the retention period and purge old monitoring events. See [docs/PRIVACY.md](docs/PRIVACY.md).

## 25. Technical limitations

* Monitoring is limited to observable browser events; it cannot see other devices, screens, applications or AI tools.
* Face detection depends on the browser `FaceDetector` API, which few browsers ship; it is disabled elsewhere rather than faked.
* The live camera view is one student at a time; a multi-camera grid with simultaneous video would need a media server (e.g. an SFU) and considerably more bandwidth. The grid view shows live status cards instead.
* Page numbers in exported PDFs come from the browser's print headers/footers; server-side PDF generation would require a headless browser on the host.
* The Google Sheets store caches data in memory in a single server process; run one instance. Sheets cells are limited to 50,000 characters, so answers are capped at 45,000 characters.

Full detail: [docs/LIMITATIONS.md](docs/LIMITATIONS.md).

---

© 2026 Dr. Rosfuzah Roslan, Diploma Teknologi Maklumat, Jabatan Teknologi Maklumat, Pusat Pengajian Diploma, Universiti Tun Hussein Onn Malaysia (UTHM). All Rights Reserved. Developed by Dr. Rosfuzah Roslan.
