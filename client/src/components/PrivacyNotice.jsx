/** Clear, visible monitoring notice. Shown before camera access is requested. */
export function PrivacyNotice({ cameraRequired, proctoringEnabled, retentionDays, customText }) {
  return (
    <div className="alert info" style={{ marginBottom: 0 }}>
      <h4>Assessment monitoring and privacy notice</h4>
      {customText && <p>{customText}</p>}
      <ul className="small" style={{ margin: '0 0 .5rem 1.1rem' }}>
        <li><strong>Purpose.</strong> Monitoring is used only to support the academic integrity of this assessment.</li>
        {cameraRequired && <li><strong>Camera.</strong> You will be asked to grant camera permission. Your camera is used for live status (on/off/disconnected) and, if your lecturer selects you, a live view during the assessment. <strong>No video is recorded or stored.</strong></li>}
        {proctoringEnabled && <li><strong>Browser events.</strong> The system records observable browser events such as switching tabs, the window losing focus, leaving full screen, large pasted text, long idle periods and camera status changes. It cannot see other applications, devices or websites.</li>}
        <li><strong>What is stored.</strong> Your answers, save/submit timestamps, and the monitoring events above (event type, time and a short description).</li>
        <li><strong>Who can access it.</strong> Only the course lecturer(s) and system administrator. Other students cannot see your answers or monitoring information.</li>
        <li><strong>Retention.</strong> Monitoring events are kept for up to {retentionDays || 90} days after the assessment and may then be deleted. Answers and marks are kept according to university assessment record rules.</li>
        <li><strong>Review.</strong> Monitoring events are <em>not</em> automatic accusations. They are reviewed by your lecturer, who makes the final judgement.</li>
      </ul>
    </div>
  );
}
