"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sleep = exports.generateTestId = exports.teardownTestEnvironment = exports.setupTestEnvironment = exports.retryWithBackoff = exports.waitFor = exports.cleanupTestResources = exports.registerBuddySession = exports.registerIncident = void 0;
/**
 * Test setup and teardown utilities
 * Provides lifecycle hooks for test suites
 */
const test_config_1 = require("./test-config");
const testResources = {
    incidents: [],
    buddySessions: [],
};
/**
 * Register a created incident for cleanup
 */
const registerIncident = (id) => {
    testResources.incidents.push(id);
};
exports.registerIncident = registerIncident;
/**
 * Register a created buddy session for cleanup
 */
const registerBuddySession = (id) => {
    testResources.buddySessions.push(id);
};
exports.registerBuddySession = registerBuddySession;
/**
 * Clean up all registered test resources
 * Call this in afterAll() or afterEach() hooks
 */
const cleanupTestResources = async () => {
    // Note: Implement actual cleanup logic based on your API
    // This is a placeholder that shows the pattern
    console.log(`Cleaning up ${testResources.incidents.length} incidents`);
    console.log(`Cleaning up ${testResources.buddySessions.length} buddy sessions`);
    // Reset the arrays
    testResources.incidents = [];
    testResources.buddySessions = [];
};
exports.cleanupTestResources = cleanupTestResources;
/**
 * Wait for a condition to be true with timeout
 * Useful for testing async operations
 */
const waitFor = async (condition, timeout = 5000, interval = 100) => {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
        if (await condition()) {
            return;
        }
        await new Promise(resolve => setTimeout(resolve, interval));
    }
    throw new Error(`Timeout waiting for condition after ${timeout}ms`);
};
exports.waitFor = waitFor;
/**
 * Retry a function with exponential backoff
 * Useful for flaky network operations
 */
const retryWithBackoff = async (fn, maxRetries = 3, initialDelay = 1000) => {
    let lastError;
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        }
        catch (error) {
            lastError = error;
            if (i < maxRetries - 1) {
                const delay = initialDelay * Math.pow(2, i);
                console.log(`Retry ${i + 1}/${maxRetries} after ${delay}ms`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    throw lastError || new Error('Retry failed');
};
exports.retryWithBackoff = retryWithBackoff;
/**
 * Setup function to run before all tests
 * Verifies the API is accessible
 */
const setupTestEnvironment = async () => {
    console.log('Setting up test environment...');
    console.log(`API URL: ${test_config_1.TEST_CONFIG.apiUrl}`);
    // Add any global setup logic here
    // For example, verify the API is running
};
exports.setupTestEnvironment = setupTestEnvironment;
/**
 * Teardown function to run after all tests
 * Cleans up any remaining resources
 */
const teardownTestEnvironment = async () => {
    console.log('Tearing down test environment...');
    await (0, exports.cleanupTestResources)();
};
exports.teardownTestEnvironment = teardownTestEnvironment;
/**
 * Generate a unique test identifier
 * Useful for creating unique test data
 */
const generateTestId = (prefix = 'test') => {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
exports.generateTestId = generateTestId;
/**
 * Sleep for a specified duration
 * Useful for testing time-based features
 */
const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};
exports.sleep = sleep;
//# sourceMappingURL=test-setup.js.map