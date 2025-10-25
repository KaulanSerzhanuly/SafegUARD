"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const test_config_1 = require("./helpers/test-config");
describe('Incidents API', () => {
    const apiUrl = test_config_1.TEST_CONFIG.apiUrl;
    describe('Authentication', () => {
        it('should return 401 for unauthenticated requests', async () => {
            const response = await (0, supertest_1.default)(apiUrl)
                .get('/api/incidents')
                .expect(401);
            expect((0, test_config_1.isUnauthorized)(response)).toBe(true);
        });
        it('should return 401 for requests with invalid token', async () => {
            const response = await (0, supertest_1.default)(apiUrl)
                .get('/api/incidents')
                .set((0, test_config_1.authHeader)('invalid-token'))
                .expect(401);
            expect((0, test_config_1.isUnauthorized)(response)).toBe(true);
        });
    });
    describe('POST /api/incidents', () => {
        it('should create a new incident with valid data', async () => {
            const newIncident = (0, test_config_1.createMockIncident)();
            const response = await (0, supertest_1.default)(apiUrl)
                .post('/api/incidents')
                .set((0, test_config_1.authHeader)())
                .send(newIncident)
                .expect(201);
            expect((0, test_config_1.isSuccessfulCreation)(response)).toBe(true);
            expect(response.body).toMatchObject({
                type: newIncident.type,
                text: newIncident.text,
                severity: newIncident.severity,
            });
        });
        it('should create incident with different severity levels', async () => {
            const severityLevels = [1, 2, 3, 4, 5];
            for (const severity of severityLevels) {
                const incident = (0, test_config_1.createMockIncident)({ severity });
                const response = await (0, supertest_1.default)(apiUrl)
                    .post('/api/incidents')
                    .set((0, test_config_1.authHeader)())
                    .send(incident)
                    .expect(201);
                expect((0, test_config_1.isSuccessfulCreation)(response)).toBe(true);
                expect(response.body.severity).toBe(severity);
            }
        });
        it('should create incident with different types', async () => {
            const types = ['theft', 'assault', 'harassment', 'suspicious', 'other'];
            for (const type of types) {
                const incident = (0, test_config_1.createMockIncident)({ type });
                const response = await (0, supertest_1.default)(apiUrl)
                    .post('/api/incidents')
                    .set((0, test_config_1.authHeader)())
                    .send(incident)
                    .expect(201);
                expect((0, test_config_1.isSuccessfulCreation)(response)).toBe(true);
                expect(response.body.type).toBe(type);
            }
        });
        it('should reject incident without required fields', async () => {
            const invalidIncident = {
                type: 'theft',
                // Missing text, location, and severity
            };
            const response = await (0, supertest_1.default)(apiUrl)
                .post('/api/incidents')
                .set((0, test_config_1.authHeader)())
                .send(invalidIncident)
                .expect(400);
            expect((0, test_config_1.isValidationError)(response)).toBe(true);
        });
        it('should reject incident with invalid location', async () => {
            const invalidIncident = (0, test_config_1.createMockIncident)({
                location: { lat: 200, lng: 300 }, // Invalid coordinates
            });
            const response = await (0, supertest_1.default)(apiUrl)
                .post('/api/incidents')
                .set((0, test_config_1.authHeader)())
                .send(invalidIncident)
                .expect(400);
            expect((0, test_config_1.isValidationError)(response)).toBe(true);
        });
        it('should reject incident with invalid severity', async () => {
            const invalidIncident = (0, test_config_1.createMockIncident)({
                severity: 10, // Out of range
            });
            const response = await (0, supertest_1.default)(apiUrl)
                .post('/api/incidents')
                .set((0, test_config_1.authHeader)())
                .send(invalidIncident)
                .expect(400);
            expect((0, test_config_1.isValidationError)(response)).toBe(true);
        });
        it('should reject incident without authentication', async () => {
            const newIncident = (0, test_config_1.createMockIncident)();
            const response = await (0, supertest_1.default)(apiUrl)
                .post('/api/incidents')
                .send(newIncident)
                .expect(401);
            expect((0, test_config_1.isUnauthorized)(response)).toBe(true);
        });
    });
    describe('GET /api/incidents', () => {
        it('should retrieve incidents list with authentication', async () => {
            const response = await (0, supertest_1.default)(apiUrl)
                .get('/api/incidents')
                .set((0, test_config_1.authHeader)())
                .expect(200);
            expect(response.body).toBeDefined();
            expect(Array.isArray(response.body) || typeof response.body === 'object').toBe(true);
        });
        it('should support query parameters for filtering', async () => {
            const response = await (0, supertest_1.default)(apiUrl)
                .get('/api/incidents')
                .query({ severity: 4 })
                .set((0, test_config_1.authHeader)())
                .expect(200);
            expect(response.body).toBeDefined();
        });
    });
    describe('GET /api/incidents/:id', () => {
        it('should retrieve a specific incident by id', async () => {
            // First create an incident
            const newIncident = (0, test_config_1.createMockIncident)();
            const createResponse = await (0, supertest_1.default)(apiUrl)
                .post('/api/incidents')
                .set((0, test_config_1.authHeader)())
                .send(newIncident)
                .expect(201);
            const incidentId = createResponse.body.id;
            // Then retrieve it
            const response = await (0, supertest_1.default)(apiUrl)
                .get(`/api/incidents/${incidentId}`)
                .set((0, test_config_1.authHeader)())
                .expect(200);
            expect(response.body).toMatchObject({
                id: incidentId,
                type: newIncident.type,
                text: newIncident.text,
            });
        });
        it('should return 404 for non-existent incident', async () => {
            const response = await (0, supertest_1.default)(apiUrl)
                .get('/api/incidents/non-existent-id')
                .set((0, test_config_1.authHeader)())
                .expect(404);
            expect(response.body).toHaveProperty('error');
        });
    });
});
//# sourceMappingURL=incidents.e2e.test.js.map