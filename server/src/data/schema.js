/**
 * Worksheet / table definitions.
 *
 * Every table maps to one worksheet in the Google Sheet (or one JSON file in the
 * local store). The first row of each worksheet holds the column names below.
 * `id` names the primary-key column. `types` lists columns that must be coerced
 * when reading from Sheets (everything in a sheet is text).
 */
export const TABLES = {
  Users: {
    id: 'user_id',
    columns: [
      'user_id', 'username', 'password_hash', 'role', 'name', 'email', 'student_id',
      'active', 'must_change_password', 'created_at', 'updated_at', 'last_login_at',
    ],
    types: { active: 'boolean', must_change_password: 'boolean' },
  },
  Students: {
    id: 'student_id',
    columns: ['student_id', 'matric_no', 'name', 'email', 'group_id', 'role', 'course_code', 'section', 'active'],
    types: { active: 'boolean' },
  },
  Groups: {
    id: 'group_id',
    columns: ['group_id', 'group_name', 'business_name', 'business_idea', 'student_1', 'student_2', 'student_3', 'student_4', 'status'],
    types: {},
  },
  Assessments: {
    id: 'assessment_id',
    columns: [
      'assessment_id', 'title', 'course_code', 'course_name', 'semester', 'description', 'instructions',
      'duration_minutes', 'start_at', 'end_at', 'status', 'camera_required', 'proctoring_enabled',
      'question_mode', 'components', 'proposal_template', 'results_released', 'created_by', 'created_at', 'updated_at',
    ],
    types: {
      duration_minutes: 'number', camera_required: 'boolean', proctoring_enabled: 'boolean',
      results_released: 'boolean', components: 'json', proposal_template: 'json',
    },
  },
  Questions: {
    id: 'question_id',
    columns: [
      'question_id', 'assessment_id', 'section', 'topic', 'question_text', 'question_type', 'marks',
      'time_limit', 'active', 'order_index', 'options', 'guidance', 'created_at', 'updated_at',
    ],
    types: { marks: 'number', time_limit: 'number', active: 'boolean', order_index: 'number', options: 'json' },
  },
  Attempts: {
    id: 'attempt_id',
    columns: [
      'attempt_id', 'assessment_id', 'student_id', 'group_id', 'component', 'status', 'started_at', 'deadline_at',
      'submitted_at', 'last_activity_at', 'last_saved_at', 'camera_status', 'flags_count', 'marking_status',
      'total_marks', 'max_marks', 'lecturer_feedback', 'marked_by', 'marked_at', 'reopened_by', 'reopened_at', 'reopen_reason',
    ],
    types: { flags_count: 'number', total_marks: 'number', max_marks: 'number' },
  },
  Answers: {
    id: 'answer_id',
    columns: [
      'answer_id', 'assessment_id', 'student_id', 'group_id', 'question_id', 'component', 'answer', 'timestamp',
      'status', 'marks', 'lecturer_feedback', 'marked_at', 'marked_by',
    ],
    types: { marks: 'number' },
  },
  ProctoringLogs: {
    id: 'log_id',
    columns: [
      'log_id', 'assessment_id', 'student_id', 'group_id', 'timestamp', 'event_type', 'severity', 'description',
      'review_status', 'reviewed_by', 'review_note',
    ],
    types: {},
  },
  BusinessProposals: {
    id: 'proposal_id',
    columns: [
      'proposal_id', 'group_id', 'assessment_id', 'business_name', 'executive_summary', 'marketing', 'product_plan',
      'operations', 'financial_plan', 'other_sections', 'generated_document', 'status', 'sections_json',
      'generated_at', 'updated_at', 'reviewed_by', 'reviewed_at', 'finalised_by', 'finalised_at', 'lecturer_notes',
    ],
    types: { sections_json: 'json', other_sections: 'json' },
  },
  GroupReports: {
    id: 'report_id',
    columns: [
      'report_id', 'group_id', 'assessment_id', 'business_name', 'members', 'submission_status', 'proposal_status',
      'total_group_score', 'lecturer_feedback', 'generated_document', 'reviewed_by', 'reviewed_at', 'status',
      'generated_at', 'updated_at',
    ],
    types: { total_group_score: 'number', members: 'json' },
  },
  AuditLogs: {
    id: 'log_id',
    columns: ['log_id', 'timestamp', 'actor_id', 'actor_role', 'actor_name', 'action', 'entity_type', 'entity_id', 'details', 'ip'],
    types: {},
  },
  Settings: {
    id: 'key',
    columns: ['key', 'value', 'updated_at', 'updated_by'],
    types: {},
  },
};

export const TABLE_NAMES = Object.keys(TABLES);

/** Convert a raw worksheet cell value into a typed value. */
export function coerceIn(table, column, value) {
  const type = TABLES[table].types[column];
  if (value === undefined || value === null) return type === 'boolean' ? false : type === 'json' ? null : '';
  const s = typeof value === 'string' ? value : String(value);
  switch (type) {
    case 'boolean':
      return ['true', '1', 'yes'].includes(s.trim().toLowerCase());
    case 'number': {
      if (s.trim() === '') return null;
      const n = Number(s);
      return Number.isFinite(n) ? n : null;
    }
    case 'json': {
      if (s.trim() === '') return null;
      try { return JSON.parse(s); } catch { return null; }
    }
    default:
      return s;
  }
}

/** Convert a typed value into a worksheet-safe string. */
export function coerceOut(table, column, value) {
  const type = TABLES[table].types[column];
  if (value === undefined || value === null) return '';
  switch (type) {
    case 'boolean':
      return value ? 'TRUE' : 'FALSE';
    case 'number':
      return value === '' ? '' : String(value);
    case 'json':
      return typeof value === 'string' ? value : JSON.stringify(value);
    default:
      return typeof value === 'string' ? value : typeof value === 'object' ? JSON.stringify(value) : String(value);
  }
}

export function rowToObject(table, headerRow, cells) {
  const def = TABLES[table];
  const obj = {};
  for (const col of def.columns) {
    const idx = headerRow.indexOf(col);
    obj[col] = coerceIn(table, col, idx >= 0 ? cells[idx] : undefined);
  }
  return obj;
}

export function objectToRow(table, headerRow, obj) {
  return headerRow.map((col) => coerceOut(table, col, obj[col]));
}
