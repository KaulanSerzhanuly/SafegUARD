import request from 'supertest';
import {
  TEST_CONFIG,
  createMockIncident,
  authHeader,
  isSuccessfulCreation,
  isUnauthorized,
  isValidationError
} from './helpers/test-config';

describe('Incidents API', () => {
  const apiUrl = TEST_CONFIG.apiUrl;

  describe('Authentication', () => {
    it('should return 401 for unauthenticated requests', async () => {
      const response = await request(apiUrl)
        .get('/api/incidents')
        .expect(401);
      
      expect(isUnauthorized(response)).toBe(true);
    });

    it('should return 401 for requests with invalid token', async () => {
      const response = await request(apiUrl)
        .get('/api/incidents')
        .set(authHeader('invalid-token'))
        .expect(401);
      
      expect(isUnauthorized(response)).toBe(true);
    });
  });

  describe('POST /api/incidents', () => {
    it('should create a new incident with valid data', async () => {
      const newIncident = createMockIncident();

      const response = await request(apiUrl)
        .post('/api/incidents')
        .set(authHeader())
        .send(newIncident)
        .expect(201);

      expect(isSuccessfulCreation(response)).toBe(true);
      expect(response.body).toMatchObject({
        type: newIncident.type,
        text: newIncident.text,
        severity: newIncident.severity,
      });
    });

    it('should create incident with different severity levels', async () => {
      const severityLevels = [1, 2, 3, 4, 5];

      for (const severity of severityLevels) {
        const incident = createMockIncident({ severity });
        
        const response = await request(apiUrl)
          .post('/api/incidents')
          .set(authHeader())
          .send(incident)
          .expect(201);

        expect(isSuccessfulCreation(response)).toBe(true);
        expect(response.body.severity).toBe(severity);
      }
    });

    it('should create incident with different types', async () => {
      const types = ['theft', 'assault', 'harassment', 'suspicious', 'other'];

      for (const type of types) {
        const incident = createMockIncident({ type });
        
        const response = await request(apiUrl)
          .post('/api/incidents')
          .set(authHeader())
          .send(incident)
          .expect(201);

        expect(isSuccessfulCreation(response)).toBe(true);
        expect(response.body.type).toBe(type);
      }
    });

    it('should reject incident without required fields', async () => {
      const invalidIncident = {
        type: 'theft',
        // Missing text, location, and severity
      };

      const response = await request(apiUrl)
        .post('/api/incidents')
        .set(authHeader())
        .send(invalidIncident)
        .expect(400);

      expect(isValidationError(response)).toBe(true);
    });

    it('should reject incident with invalid location', async () => {
      const invalidIncident = createMockIncident({
        location: { lat: 200, lng: 300 }, // Invalid coordinates
      });

      const response = await request(apiUrl)
        .post('/api/incidents')
        .set(authHeader())
        .send(invalidIncident)
        .expect(400);

      expect(isValidationError(response)).toBe(true);
    });

    it('should reject incident with invalid severity', async () => {
      const invalidIncident = createMockIncident({
        severity: 10, // Out of range
      });

      const response = await request(apiUrl)
        .post('/api/incidents')
        .set(authHeader())
        .send(invalidIncident)
        .expect(400);

      expect(isValidationError(response)).toBe(true);
    });

    it('should reject incident without authentication', async () => {
      const newIncident = createMockIncident();

      const response = await request(apiUrl)
        .post('/api/incidents')
        .send(newIncident)
        .expect(401);

      expect(isUnauthorized(response)).toBe(true);
    });
  });

  describe('GET /api/incidents', () => {
    it('should retrieve incidents list with authentication', async () => {
      const response = await request(apiUrl)
        .get('/api/incidents')
        .set(authHeader())
        .expect(200);

      expect(response.body).toBeDefined();
      expect(Array.isArray(response.body) || typeof response.body === 'object').toBe(true);
    });

    it('should support query parameters for filtering', async () => {
      const response = await request(apiUrl)
        .get('/api/incidents')
        .query({ severity: 4 })
        .set(authHeader())
        .expect(200);

      expect(response.body).toBeDefined();
    });
  });

  describe('GET /api/incidents/:id', () => {
    it('should retrieve a specific incident by id', async () => {
      // First create an incident
      const newIncident = createMockIncident();
      const createResponse = await request(apiUrl)
        .post('/api/incidents')
        .set(authHeader())
        .send(newIncident)
        .expect(201);

      const incidentId = createResponse.body.id;

      // Then retrieve it
      const response = await request(apiUrl)
        .get(`/api/incidents/${incidentId}`)
        .set(authHeader())
        .expect(200);

      expect(response.body).toMatchObject({
        id: incidentId,
        type: newIncident.type,
        text: newIncident.text,
      });
    });

    it('should return 404 for non-existent incident', async () => {
      const response = await request(apiUrl)
        .get('/api/incidents/non-existent-id')
        .set(authHeader())
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });
});