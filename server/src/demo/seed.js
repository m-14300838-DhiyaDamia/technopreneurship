/**
 * Seed the data store with clearly labelled DEMO data.
 *
 *   node src/demo/seed.js            -> seeds if the store is empty
 *   node src/demo/seed.js --reset    -> wipes ALL data first (use with care)
 *   node src/demo/seed.js --no-answers -> accounts, groups and questions only
 */
import { config } from '../config.js';
import { createStore } from '../data/index.js';
import { TABLE_NAMES } from '../data/schema.js';
import { createUser } from '../services/users.js';
import { createStudent } from '../services/students.js';
import { createGroup } from '../services/groups.js';
import { createAssessment, updateAssessment } from '../services/assessments.js';
import { createQuestion } from '../services/questions.js';
import { startAttempt, saveAnswers, submitAttempt } from '../services/attempts.js';
import { getStudent } from '../services/students.js';
import { DEMO_GROUPS, DEMO_QUESTIONS, demoAnswer } from './demoContent.js';
import { logger } from '../lib/logger.js';

export async function seedDemo(store, { withAnswers = true, log = console.log } = {}) {
  const password = config.demoPassword;
  const admin = await createUser({ username: 'admin', password, role: 'admin', name: 'Demo Administrator', must_change_password: false });
  const lecturer = await createUser({ username: 'lecturer', password, role: 'lecturer', name: 'Demo Lecturer', must_change_password: false });

  const assessment = await createAssessment({
    title: `${config.course.assessmentTitle} (DEMO)`, description: 'DEMO assessment seeded for evaluation. All data is fictional.',
    instructions: '<p>Answer every question assigned to your business component. Your answers will be combined with your group members\' answers into one business proposal.</p><p>Keep your camera on if required and stay on this tab for the duration of the assessment.</p>',
    duration_minutes: 120, status: 'open', camera_required: true, proctoring_enabled: true, question_mode: 'component',
  }, admin);

  const questions = [];
  for (const q of DEMO_QUESTIONS) questions.push(await createQuestion(assessment.assessment_id, q));

  const groups = [];
  for (const g of DEMO_GROUPS) {
    const group = await createGroup({ group_name: g.group_name, business_name: g.business_name, business_idea: g.business_idea });
    const members = [];
    for (const m of g.members) {
      const { student } = await createStudent({ matric_no: m.matric_no, name: m.name, email: '', section: 'DEMO', group_id: group.group_id, component: m.component, password, must_change_password: false });
      members.push(student);
    }
    groups.push({ def: g, group, members });
  }

  if (withAnswers) {
    // Group A: everyone submitted. Group B: two of three submitted. Group C: nobody started.
    const plan = [[0, [0, 1, 2]], [1, [0, 1]]];
    for (const [gi, memberIdx] of plan) {
      const g = groups[gi];
      for (const mi of memberIdx) {
        const student = getStudent(g.members[mi].student_id);
        await startAttempt(student, assessment.assessment_id);
        const mine = questions.filter((q) => q.section === student.role);
        await saveAnswers(student, assessment.assessment_id, mine.map((q) => ({ question_id: q.question_id, answer: demoAnswer(q.topic, g.def) })));
        await submitAttempt(student, assessment.assessment_id);
      }
    }
  }
  await updateAssessment(assessment.assessment_id, { status: 'open' });
  await store.flush();

  log('');
  log('DEMO data created. Login accounts (all use the same password):');
  log(`  password : ${password}`);
  log('  admin    : admin');
  log('  lecturer : lecturer');
  for (const g of groups) for (const m of g.members) log(`  student  : ${m.matric_no.padEnd(10)} ${m.name} — ${g.def.group_name}, ${m.role}`);
  log('');
  return { admin, lecturer, assessment, questions, groups };
}

async function wipe(store) {
  for (const t of TABLE_NAMES) for (const row of store.list(t)) await store.remove(t, row[Object.keys(row)[0]]);
  await store.flush();
}

const isMain = process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/').split('/').pop());
if (isMain) {
  const args = new Set(process.argv.slice(2));
  const store = await createStore();
  if (args.has('--reset')) { logger.warn('Wiping ALL existing data…'); await wipe(store); }
  if (store.count('Users')) {
    logger.error('The store already contains users. Run with --reset to wipe everything first (this deletes ALL data).');
    process.exit(1);
  }
  await seedDemo(store, { withAnswers: !args.has('--no-answers') });
  await store.close();
  process.exit(0);
}
