# Privacy and academic-integrity design

## Principles

1. **Transparency.** Camera access is never hidden. The student sees the notice (purpose, what is monitored, what is stored, who can access it, retention, review process) before any permission request and a visible banner while a lecturer is viewing the camera.
2. **Minimisation.** Only metadata is stored: event type, time, short description, camera status. No video, audio or screenshots are recorded.
3. **No automatic accusation.** Events are labelled *potential monitoring events*. They are evidence for the lecturer, who makes the final judgement and records a review status and note.
4. **Access control.** Students see only their own data. Lecturers and administrators see monitoring data; the audit log records who viewed individual reports.
5. **Retention.** `MONITORING_RETENTION_DAYS` (default 90) is shown to students; administrators can purge events older than a chosen number of days. Answers, marks and audit entries are kept as assessment records under institutional rules.
6. **Traceability of assessment records.** Submission timestamps, marking history (draft/finalised/reopened with reasons), original answers and proposal source tags are preserved.

## What to configure before a real assessment

* Add institution-specific wording in *Administration → Configuration → privacy notice*.
* Decide whether the camera is required per assessment.
* Agree the retention period and who performs the purge.
* Obtain approval for the use of camera monitoring from the responsible academic body where required.
