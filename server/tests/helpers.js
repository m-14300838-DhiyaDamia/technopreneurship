process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-test-secret-test-secret-test-secret';
process.env.DATA_STORE = 'memory';
process.env.DEMO_PASSWORD = 'Demo@2026';

import request from 'supertest';

/** Fresh in-memory store + Express app seeded with DEMO data. */
export async function setup({ withAnswers = true } = {}) {
  const { createStore } = await import('../src/data/index.js');
  const { createApp } = await import('../src/app.js');
  const { seedDemo } = await import('../src/demo/seed.js');
  const store = await createStore({ kind: 'memory' });
  // clear anything a previous test left in the shared module cache
  for (const t of Object.keys(store.cache)) store.cache[t].clear();
  const seed = await seedDemo(store, { withAnswers, log: () => {} });
  const app = createApp();
  const agent = request(app);
  const login = async (username, password = 'Demo@2026') => {
    const res = await agent.post('/api/auth/login').send({ username, password });
    if (res.status !== 200) throw new Error(`login failed for ${username}: ${res.body.error}`);
    return res.body.token;
  };
  const as = (token) => ({
    get: (p) => agent.get(`/api${p}`).set('Authorization', `Bearer ${token}`),
    post: (p, body = {}) => agent.post(`/api${p}`).set('Authorization', `Bearer ${token}`).send(body),
    put: (p, body = {}) => agent.put(`/api${p}`).set('Authorization', `Bearer ${token}`).send(body),
    patch: (p, body = {}) => agent.patch(`/api${p}`).set('Authorization', `Bearer ${token}`).send(body),
    delete: (p) => agent.delete(`/api${p}`).set('Authorization', `Bearer ${token}`),
  });
  return { store, app, agent, seed, login, as };
}
