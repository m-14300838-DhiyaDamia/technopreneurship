/**
 * Default business components and proposal template.
 * Both are stored per assessment and editable by the lecturer, so these are
 * only the starting values.
 */
export const COMMON_SECTION = 'Common';

export const DEFAULT_COMPONENTS = ['Marketing', 'Product Planning', 'Financial Planning'];

export const QUESTION_TYPES = [
  'multiple_choice', 'short_answer', 'structured', 'long_answer', 'case_study', 'numerical', 'scenario',
];

export const QUESTION_TYPE_LABELS = {
  multiple_choice: 'Multiple Choice',
  short_answer: 'Short Answer',
  structured: 'Structured Answer',
  long_answer: 'Long Answer',
  case_study: 'Case Study',
  numerical: 'Numerical',
  scenario: 'Scenario-based Question',
};

/**
 * Each template section lists the question topics whose answers feed it.
 *  - source: 'group'   -> built from the group's business name / idea (no student answer)
 *  - source: 'answers' -> answers to questions whose topic matches one of source_topics
 *  - compose_fallback: 'excerpts' -> if no answer matches, build the section from the
 *    opening paragraph of each member's first contribution (clearly labelled and traceable)
 */
export const DEFAULT_PROPOSAL_TEMPLATE = [
  { key: 'business_overview', title: 'Business Overview', source: 'group', source_topics: [] },
  { key: 'executive_summary', title: 'Executive Summary', source: 'answers', source_topics: ['Executive Summary'], compose_fallback: 'excerpts' },
  { key: 'business_problem', title: 'Business Problem', source: 'answers', source_topics: ['Business Problem'] },
  { key: 'target_market', title: 'Target Market', source: 'answers', source_topics: ['Target Market'] },
  { key: 'marketing_strategy', title: 'Marketing Strategy', source: 'answers', source_topics: ['Marketing Strategy'] },
  { key: 'product_plan', title: 'Product / Service Planning', source: 'answers', source_topics: ['Product / Service Planning'] },
  { key: 'operations', title: 'Operations Plan', source: 'answers', source_topics: ['Operations Plan'] },
  { key: 'financial_plan', title: 'Financial Plan', source: 'answers', source_topics: ['Financial Plan'] },
  { key: 'competitive_analysis', title: 'Competitive Analysis', source: 'answers', source_topics: ['Competitive Analysis'] },
  { key: 'innovation', title: 'Innovation', source: 'answers', source_topics: ['Innovation'] },
  { key: 'conclusion', title: 'Conclusion', source: 'answers', source_topics: ['Conclusion'] },
];

export const PROCTORING_EVENT_TYPES = [
  'TAB_SWITCH_DETECTED', 'WINDOW_BLUR', 'FULLSCREEN_EXIT', 'CAMERA_DISABLED', 'CAMERA_PERMISSION_REVOKED',
  'CAMERA_DISCONNECTED', 'FACE_NOT_DETECTED', 'MULTIPLE_FACES_DETECTED', 'LARGE_PASTE_DETECTED', 'LONG_IDLE_PERIOD',
  'CAMERA_ENABLED', 'FULLSCREEN_ENTERED', 'CONNECTION_LOST', 'CONNECTION_RESTORED',
];

export const PROCTORING_SEVERITY = {
  TAB_SWITCH_DETECTED: 'medium', WINDOW_BLUR: 'low', FULLSCREEN_EXIT: 'low', CAMERA_DISABLED: 'high',
  CAMERA_PERMISSION_REVOKED: 'high', CAMERA_DISCONNECTED: 'high', FACE_NOT_DETECTED: 'medium',
  MULTIPLE_FACES_DETECTED: 'medium', LARGE_PASTE_DETECTED: 'medium', LONG_IDLE_PERIOD: 'low',
  CAMERA_ENABLED: 'info', FULLSCREEN_ENTERED: 'info', CONNECTION_LOST: 'info', CONNECTION_RESTORED: 'info',
};

export const normaliseTopic = (t) => String(t || '').trim().toLowerCase().replace(/\s+/g, ' ');
