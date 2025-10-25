/**
 * Test setup and teardown utilities
 * Provides lifecycle hooks for test suites
 */
import { TEST_CONFIG } from './test-config';

// Store created resources for cleanup
interface TestResources {
  incidents: string[];
  buddySessions: string[];
}

const testResources: TestResources = {
  incidents: [],
  buddySessions: [],
};

/**
 * Register a created incident for cleanup
 */
export const registerIncident = (id: string): void => {
  testResources.incidents.push(id);
};

/**
 * Register a created buddy session for cleanup
 */
export const registerBuddySession = (id: string): void => {
  testResources.buddySessions.push(id);
};

/**
 * Clean up all registered test resources
 * Call this in afterAll() or afterEach() hooks
 */
export const cleanupTestResources = async (): Promise<void> => {
  // Note: Implement actual cleanup logic based on your API
  // This is a placeholder that shows the pattern
  
  console.log(`Cleaning up ${testResources.incidents.length} incidents`);
  console.log(`Cleaning up ${testResources.buddySessions.length} buddy sessions`);
  
  // Reset the arrays
  testResources.incidents = [];
  testResources.buddySessions = [];
};

/**
 * Wait for a condition to be true with timeout
 * Useful for testing async operations
 */
export const waitFor = async (
  condition: () => boolean | Promise<boolean>,
  timeout: number = 5000,
  interval: number = 100
): Promise<void> => {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return;
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  
  throw new Error(`Timeout waiting for condition after ${timeout}ms`);
};

/**
 * Retry a function with exponential backoff
 * Useful for flaky network operations
 */
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> => {
  let lastError: Error | undefined;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, i);
        console.log(`Retry ${i + 1}/${maxRetries} after ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError || new Error('Retry failed');
};

/**
 * Setup function to run before all tests
 * Verifies the API is accessible
 */
export const setupTestEnvironment = async (): Promise<void> => {
  console.log('Setting up test environment...');
  console.log(`API URL: ${TEST_CONFIG.apiUrl}`);
  
  // Add any global setup logic here
  // For example, verify the API is running
};

/**
 * Teardown function to run after all tests
 * Cleans up any remaining resources
 */
export const teardownTestEnvironment = async (): Promise<void> => {
  console.log('Tearing down test environment...');
  await cleanupTestResources();
};

/**
 * Generate a unique test identifier
 * Useful for creating unique test data
 */
export const generateTestId = (prefix: string = 'test'): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Sleep for a specified duration
 * Useful for testing time-based features
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};