import { Router } from 'express';
import { config } from '../config.js';
import { nowIso } from '../lib/ids.js';
import { QUESTION_TYPES, QUESTION_TYPE_LABELS, PROCTORING_EVENT_TYPES, DEFAULT_COMPONENTS, DEFAULT_PROPOSAL_TEMPLATE, COMMON_SECTION } from '../services/templates.js';

const router = Router();

/** Public, non-sensitive configuration for the frontend. */
router.get('/', (_req, res) => {
  res.json({
    course: config.course,
    server_time: nowIso(),
    question_types: QUESTION_TYPES.map((v) => ({ value: v, label: QUESTION_TYPE_LABELS[v] })),
    proctoring_event_types: PROCTORING_EVENT_TYPES,
    default_components: DEFAULT_COMPONENTS,
    default_proposal_template: DEFAULT_PROPOSAL_TEMPLATE,
    common_section: COMMON_SECTION,
    data_store: config.dataStore,
    ice_servers: config.monitoring.iceServers.map((s) => (config.monitoring.turnUsername && String(s.urls).startsWith('turn')
      ? { ...s, username: config.monitoring.turnUsername, credential: config.monitoring.turnCredential } : s)),
    monitoring_retention_days: config.monitoring.retentionDays,
  });
});

router.get('/time', (_req, res) => res.json({ server_time: nowIso(), epoch_ms: Date.now() }));

export default router;
