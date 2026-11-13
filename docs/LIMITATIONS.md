# Technical limitations and what full implementation would need

| Feature | What is implemented | Limitation | Needed for full implementation |
|---|---|---|---|
| Tab / window monitoring | `visibilitychange`, `blur`, full-screen changes, large paste, idle, connection loss | A browser only sees its own tab. It cannot detect other browsers, devices, screens or applications, and cannot identify AI tools such as ChatGPT. | A locked-down exam browser (e.g. Safe Exam Browser) or supervised lab machines. |
| Camera status | Permission grant, active/denied/disconnected/revoked, camera on/off events | Status is self-reported by the student's browser. | Hardware/OS-level monitoring is outside a web application's reach. |
| Face detection | Uses the browser `FaceDetector` (Shape Detection API) when present; events are throttled to one per minute per type | Most browsers do not ship the API; the UI states when it is unsupported. | Shipping a client-side ML model (e.g. MediaPipe) adds large downloads and CPU load; a server-side analysis would require streaming video to a server, which conflicts with the no-recording policy. |
| Live camera view | One lecturer views one student via WebRTC (peer-to-peer, STUN) | Needs a network path between the two browsers; strict NAT/firewalls need a TURN server. One stream at a time. | A TURN server (coturn or a hosted service) for reliability; an SFU media server (e.g. LiveKit, mediasoup) for a simultaneous multi-student video grid. |
| Video recording | Not implemented (by design) | — | Consent management, encrypted storage, retention tooling and institutional approval. |
| Timer | Server-side deadline, client countdown with server offset, auto-submission | A student with no connection at expiry is auto-submitted with the last answers that reached the server; answers typed offline after the deadline are not accepted. | — |
| Offline answers | Drafts kept in `localStorage` and synced on reconnection | Only on the same browser/device. | — |
| PDF export | Browser print to PDF with print stylesheet and repeating footer | Page numbers depend on the browser's "headers and footers" option. | Server-side rendering with a headless browser (Playwright/Puppeteer) on the host. |
| Data store | Google Sheets with cache and batched writes | Single server instance; Google quotas (~300 write requests/minute per project); 50,000 characters per cell; not transactional. | For very large cohorts, a database (PostgreSQL/SQLite) adapter implementing the same store interface. |
| Google Sheets manual edits | Server refreshes its cache periodically | Manual edits to rows with pending writes can be overwritten. | Edit through the application while it is running. |
| Password recovery | Lecturer/admin resets passwords | No email-based self-service reset. | An SMTP/email provider and a reset-token flow. |
