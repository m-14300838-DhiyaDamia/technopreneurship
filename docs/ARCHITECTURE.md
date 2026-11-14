# Architecture

## Folder structure

```
.
├── client/                      React frontend (Vite)
│   ├── public/assets/images/    Replaceable logo files (PNG official, SVG placeholder)
│   └── src/
│       ├── api/client.js        fetch wrapper, token storage
│       ├── auth/AuthContext.jsx login state
│       ├── components/          UniversityHeader, UniversityFooter, AppShell, AssessmentTimer,
│       │                        AnswerEditor, RichTextEditor, PrivacyNotice, DocHeader, ui kit
│       ├── hooks/               useSocket, useCamera (+ useFaceDetection), useProctoring
│       └── pages/
│           ├── LoginPage, AccountPage
│           ├── student/         StudentDashboard, AssessmentPage (exam room)
│           ├── lecturer/        LecturerDashboard, StudentManager, GroupManager, AssessmentManager
│           │                    (QuestionManager, components, proposal template), LiveMonitoring
│           │                    (CameraMonitor/StudentMonitoringCard/ProctoringDashboard), MarkingList,
│           │                    MarkingPanel, ProposalsOverview, ProposalPage (preview + editor),
│           │                    ReportsPage, IndividualStudentReport, GroupReport
│           └── admin/AdminDashboard
├── server/                      Node.js backend
│   ├── scripts/setup-sheets.js  Google Sheets worksheet creation / connectivity check
│   ├── src/
│   │   ├── app.js, index.js     Express app and HTTP/Socket.IO server
│   │   ├── config.js            environment variables
│   │   ├── auth/                password hashing, JWT, role middleware
│   │   ├── data/                schema (worksheets), store base, localJsonStore, sheetsStore
│   │   ├── services/            users, students, groups, assessments, questions, attempts,
│   │   │                        marking, proctoring, proposals, reports, audit, templates
│   │   ├── routes/              auth, meta, student, lecturer, admin
│   │   ├── realtime/            Socket.IO presence, monitoring events, WebRTC signalling
│   │   └── demo/                DEMO seed data
│   └── tests/                   node:test suites (API, Sheets adapter, sanitiser)
├── tests/e2e/run.mjs            Playwright browser test
├── docs/                        this folder
├── .env.example                 environment template (copy to .env)
├── Dockerfile, render.yaml      deployment helpers
└── .github/workflows/ci.yml     tests + build + secret scan on every push
```

## Two editions from one codebase

The services, validation schemas and the route table in `server/src/api/routes.js` are shared.

* **Node edition** – `server/src/api/express.js` mounts the route table on Express; `server/src/realtime` adds Socket.IO; the data store is `sheetsStore.js` (service account) or `localJsonStore.js`.
* **Apps Script edition** – `apps-script/build.mjs` bundles `apps-script/src/main.js` + the shared code with esbuild into `apps-script/Code.gs`. Platform pieces are swapped by the bundler: `apps-script/shims/store.js` (SpreadsheetApp-backed store, loads a worksheet on first use per request and writes immediately), `config.js` (Script Properties), `bcryptjs.js` (PBKDF2-style hashing), `jsonwebtoken.js` (HMAC tokens), `sanitize-html.js` (allow-list sanitiser), `crypto.js`, `logger.js`. The bundler also strips `async`/`await` from the shared modules because Apps Script's `doPost` must return synchronously and every awaited operation is synchronous in that environment. Mutating requests are serialised with `LockService`. The client selects the transport from `client/public/config.json`: when `apiUrl` is set, every call becomes a `POST { method, path, body, token }` to the Web App and the HTTP status is read from the JSON envelope. Pages that used Socket.IO fall back to polling (`runtime.pollMs`) and presence is derived from heartbeats stored on the attempt.
* `apps-script/test/` runs the generated `Code.gs` inside a simulated Apps Script environment (Node `vm` + fake `SpreadsheetApp`, `Utilities`, `LockService`, `PropertiesService`, `ContentService`) so the bundle is tested before it is pasted into a Sheet.

## Request flow

1. The browser loads the React app (served by Express from `client/dist`, or by Vite in development).
2. Login posts to `/api/auth/login`; the server verifies the bcrypt hash and returns a JWT. The client stores it in `sessionStorage` and sends `Authorization: Bearer …` on each call.
3. Every `/api/student|lecturer|admin` route runs `requireAuth` (token → fresh user record → active check) and a role check.
4. Services operate on the in-memory cache of the store. Writes are queued; the Sheets adapter flushes them in batches (`values.batchUpdate` for updates, `values.append` for inserts) every `SHEETS_FLUSH_MS`. Reads never wait for Google.
5. The realtime layer pushes attempt changes and monitoring events to lecturers, and relays WebRTC offers/answers/ICE candidates between one lecturer and one student for the live camera view. Video never passes through the server.

## API routes (summary)

| Area | Routes |
|---|---|
| Auth | `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/change-password`, `POST /api/auth/logout` |
| Public | `GET /api/meta`, `GET /api/meta/time`, `GET /api/health` |
| Student | `GET /api/student/dashboard`, `GET/POST /api/student/assessments/:id[/start|/answers|/submit|/heartbeat|/events]` |
| Lecturer | `/api/lecturer/dashboard`, `/students`, `/groups[/:id/members…]`, `/assessments[/:id/questions|/monitoring|/proposals/:group…]`, `/questions/:id`, `/monitoring/events`, `/attempts[/:id/review|/marks|/finalise|/reopen-marking|/reopen]`, `/reports/individual/:attempt`, `/reports/group/:assessment/:group`, `/audit` |
| Admin | `/api/admin/users`, `/settings`, `/audit`, `/retention/purge-monitoring`, `/health` |

Errors are JSON `{ error, details?, code? }`. Codes used by the client: `TIME_EXPIRED`, `LOCKED`.

## Realtime events (Socket.IO)

| Direction | Event | Purpose |
|---|---|---|
| student → server | `student:presence` | heartbeat with camera status and state (every 15 s) |
| student → server | `student:event` | monitoring event (REST fallback `/events`, localStorage queue when offline) |
| server → lecturers | `monitor:snapshot`, `monitor:presence`, `monitor:attempt`, `monitor:event` | live dashboard updates |
| server → student | `attempt:update` | auto-submission / reopening notices |
| lecturer ↔ student | `camera:request`, `webrtc:offer`, `webrtc:answer`, `webrtc:ice`, `camera:stop`, `camera:unavailable`, `camera:ended` | one-to-one live camera signalling |

## Timing model

`Attempts.deadline_at = min(started_at + duration, assessment.end_at)` is computed on the server when the student starts. The client shows a countdown using the server time offset measured from every response, so a wrong browser clock cannot extend the attempt. The server rejects saves after the deadline (`TIME_EXPIRED`), auto-submits lazily on any request and in a 15-second sweep, and notifies the student and lecturers.

## Proposal assembly

For each template section: `source: group` sections are built from the group record; `source: answers` sections collect answers to questions whose `topic` matches `source_topics`, restricted to members whose component matches the question section (or any member for *Common* questions / "all" mode). The stored `BusinessProposals.sections_json` keeps only references (answer ids) plus optional `edited_html`; the full document is re-rendered from `Answers` on every view, which guarantees traceability and keeps cells under the Google Sheets size limit.
