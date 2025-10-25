"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidationError = exports.isUnauthorized = exports.isSuccessfulCreation = exports.authHeader = exports.createMockBuddySession = exports.createMockIncident = exports.TEST_CONFIG = void 0;
// Environment-based configuration
exports.TEST_CONFIG = {
    apiUrl: process.env.API_URL || 'http://localhost:5001/your-project-id/us-central1/api',
    authToken: process.env.TEST_AUTH_TOKEN || 'dummy-token',
    timeout: 10000,
};
// Common test data factories
const createMockIncident = (overrides = {}) => (Object.assign({ type: 'theft', text: 'Test incident description', location: { lat: 37.422, lng: -122.084 }, severity: 4 }, overrides));
exports.createMockIncident = createMockIncident;
const createMockBuddySession = (overrides = {}) => (Object.assign({ participants: ['user1', 'user2'], checkInIntervalSec: 300 }, overrides));
exports.createMockBuddySession = createMockBuddySession;
// Helper to create authorization header
const authHeader = (token = exports.TEST_CONFIG.authToken) => ({
    Authorization: `Bearer ${token}`,
});
exports.authHeader = authHeader;
// Response validation helpers (return boolean for use in tests)
const isSuccessfulCreation = (response) => {
    return response.status === 201 &&
        response.body &&
        'id' in response.body &&
        !!response.body.id;
};
exports.isSuccessfulCreation = isSuccessfulCreation;
const isUnauthorized = (response) => {
    return response.status === 401;
};
exports.isUnauthorized = isUnauthorized;
const isValidationError = (response) => {
    return response.status === 400 &&
        response.body &&
        'error' in response.body;
};
exports.isValidationError = isValidationError;
//# sourceMappingURL=test-config.js.map