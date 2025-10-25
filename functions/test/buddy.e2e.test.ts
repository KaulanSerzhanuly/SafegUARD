import request from 'supertest';
import {
  TEST_CONFIG,
  createMockBuddySession,
  authHeader,
  isSuccessfulCreation,
  isUnauthorized,
  isValidationError
} from './helpers/test-config';

describe('Buddy System API', () => {
  const apiUrl = TEST_CONFIG.apiUrl;

  describe('Authentication', () => {
    it('should return 401 for unauthenticated requests', async () => {
      const response = await request(apiUrl)
        .get('/api/buddy/sessions')
        .expect(401);
      
      expect(isUnauthorized(response)).toBe(true);
    });

    it('should return 401 for requests with invalid token', async () => {
      const response = await request(apiUrl)
        .post('/api/buddy/sessions')
        .set(authHeader('invalid-token'))
        .send(createMockBuddySession())
        .expect(401);
      
      expect(isUnauthorized(response)).toBe(true);
    });
  });

  describe('POST /api/buddy/sessions', () => {
    it('should create a new buddy session with valid data', async () => {
      const newSession = createMockBuddySession();

      const response = await request(apiUrl)
        .post('/api/buddy/sessions')
        .set(authHeader())
        .send(newSession)
        .expect(201);

      expect(isSuccessfulCreation(response)).toBe(true);
      expect(response.body).toMatchObject({
        participants: newSession.participants,
        checkInIntervalSec: newSession.checkInIntervalSec,
      });
    });

    it('should create session with multiple participants', async () => {
      const session = createMockBuddySession({
        participants: ['user1', 'user2', 'user3', 'user4'],
      });

      const response = await request(apiUrl)
        .post('/api/buddy/sessions')
        .set(authHeader())
        .send(session)
        .expect(201);

      expect(isSuccessfulCreation(response)).toBe(true);
      expect(response.body.participants).toHaveLength(4);
    });

    it('should create session with different check-in intervals', async () => {
      const intervals = [60, 300, 600, 1800, 3600]; // 1min, 5min, 10min, 30min, 1hr

      for (const interval of intervals) {
        const session = createMockBuddySession({ checkInIntervalSec: interval });
        
        const response = await request(apiUrl)
          .post('/api/buddy/sessions')
          .set(authHeader())
          .send(session)
          .expect(201);

        expect(isSuccessfulCreation(response)).toBe(true);
        expect(response.body.checkInIntervalSec).toBe(interval);
      }
    });

    it('should reject session with less than 2 participants', async () => {
      const invalidSession = createMockBuddySession({
        participants: ['user1'], // Only one participant
      });

      const response = await request(apiUrl)
        .post('/api/buddy/sessions')
        .set(authHeader())
        .send(invalidSession)
        .expect(400);

      expect(isValidationError(response)).toBe(true);
    });

    it('should reject session without required fields', async () => {
      const invalidSession = {
        participants: ['user1', 'user2'],
        // Missing checkInIntervalSec
      };

      const response = await request(apiUrl)
        .post('/api/buddy/sessions')
        .set(authHeader())
        .send(invalidSession)
        .expect(400);

      expect(isValidationError(response)).toBe(true);
    });

    it('should reject session with invalid check-in interval', async () => {
      const invalidSession = createMockBuddySession({
        checkInIntervalSec: -100, // Negative interval
      });

      const response = await request(apiUrl)
        .post('/api/buddy/sessions')
        .set(authHeader())
        .send(invalidSession)
        .expect(400);

      expect(isValidationError(response)).toBe(true);
    });

    it('should reject session without authentication', async () => {
      const newSession = createMockBuddySession();

      const response = await request(apiUrl)
        .post('/api/buddy/sessions')
        .send(newSession)
        .expect(401);

      expect(isUnauthorized(response)).toBe(true);
    });
  });

  describe('GET /api/buddy/sessions', () => {
    it('should retrieve buddy sessions list with authentication', async () => {
      const response = await request(apiUrl)
        .get('/api/buddy/sessions')
        .set(authHeader())
        .expect(200);

      expect(response.body).toBeDefined();
      expect(Array.isArray(response.body) || typeof response.body === 'object').toBe(true);
    });

    it('should filter sessions by participant', async () => {
      const response = await request(apiUrl)
        .get('/api/buddy/sessions')
        .query({ participant: 'user1' })
        .set(authHeader())
        .expect(200);

      expect(response.body).toBeDefined();
    });
  });

  describe('GET /api/buddy/sessions/:id', () => {
    it('should retrieve a specific session by id', async () => {
      // First create a session
      const newSession = createMockBuddySession();
      const createResponse = await request(apiUrl)
        .post('/api/buddy/sessions')
        .set(authHeader())
        .send(newSession)
        .expect(201);

      const sessionId = createResponse.body.id;

      // Then retrieve it
      const response = await request(apiUrl)
        .get(`/api/buddy/sessions/${sessionId}`)
        .set(authHeader())
        .expect(200);

      expect(response.body).toMatchObject({
        id: sessionId,
        participants: newSession.participants,
        checkInIntervalSec: newSession.checkInIntervalSec,
      });
    });

    it('should return 404 for non-existent session', async () => {
      const response = await request(apiUrl)
        .get('/api/buddy/sessions/non-existent-id')
        .set(authHeader())
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/buddy/sessions/:id/check-in', () => {
    it('should allow participant to check in', async () => {
      // First create a session
      const newSession = createMockBuddySession();
      const createResponse = await request(apiUrl)
        .post('/api/buddy/sessions')
        .set(authHeader())
        .send(newSession)
        .expect(201);

      const sessionId = createResponse.body.id;

      // Then check in
      const response = await request(apiUrl)
        .post(`/api/buddy/sessions/${sessionId}/check-in`)
        .set(authHeader())
        .send({ userId: 'user1' })
        .expect(200);

      expect(response.body).toHaveProperty('success');
    });

    it('should reject check-in without authentication', async () => {
      const response = await request(apiUrl)
        .post('/api/buddy/sessions/some-id/check-in')
        .send({ userId: 'user1' })
        .expect(401);

      expect(isUnauthorized(response)).toBe(true);
    });
  });

  describe('DELETE /api/buddy/sessions/:id', () => {
    it('should allow ending a buddy session', async () => {
      // First create a session
      const newSession = createMockBuddySession();
      const createResponse = await request(apiUrl)
        .post('/api/buddy/sessions')
        .set(authHeader())
        .send(newSession)
        .expect(201);

      const sessionId = createResponse.body.id;

      // Then end it
      const response = await request(apiUrl)
        .delete(`/api/buddy/sessions/${sessionId}`)
        .set(authHeader())
        .expect(200);

      expect(response.body).toHaveProperty('success');
    });

    it('should return 404 when ending non-existent session', async () => {
      const response = await request(apiUrl)
        .delete('/api/buddy/sessions/non-existent-id')
        .set(authHeader())
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });
});