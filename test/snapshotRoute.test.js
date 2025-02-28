const request = require('supertest');
const app = require('../src/app');

describe('Snapshot API Endpoints', () => {
  it('GET /api/snapshots should return 200 and an array', async () => {
    const response = await request(app).get('/api/snapshots');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should return 500 if database fails', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {}); // Prevent error logs

    const mockDb = require('../src/config/db');
    mockDb.then.mockImplementationOnce(() => {
      throw new Error('Database Error');
    });

    const response = await request(app).get('/api/snapshots');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Internal Server Error' });

    console.error.mockRestore();
  });
});
