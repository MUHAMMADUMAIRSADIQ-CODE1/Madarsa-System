const request = require('supertest');
const app = require('../src/app');

describe('App Infrastructure', () => {
  test('GET /api/v1/health should return 200', async () => {
    const response = await request(app).get('/api/v1/health');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('uptime');
    expect(response.body.data).toHaveProperty('timestamp');
    expect(response.body.data).toHaveProperty('environment');
  });

  test('GET /unknown-route should return 404', async () => {
    const response = await request(app).get('/unknown-route');
    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });

  test('API response format should be consistent on 404', async () => {
    const response = await request(app).get('/api/v1/nonexistent');
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('message');
  });

  test('CORS headers should be set', async () => {
    const response = await request(app)
      .get('/api/v1/health')
      .set('Origin', 'http://localhost:5173');
    expect(response.headers['access-control-allow-origin']).toBeDefined();
  });

  test('Helmet security headers should be set', async () => {
    const response = await request(app).get('/api/v1/health');
    expect(response.headers['x-frame-options']).toBeDefined();
    expect(response.headers['x-content-type-options']).toBeDefined();
  });
});
