/**
 * Shared test configuration and utilities
 */
import type { Response } from 'supertest';

// Environment-based configuration
export const TEST_CONFIG = {
  apiUrl: process.env.API_URL || 'http://localhost:5001/your-project-id/us-central1/api',
  authToken: process.env.TEST_AUTH_TOKEN || 'dummy-token',
  timeout: 10000,
};

// Type definitions for test data
export interface MockIncident {
  type: string;
  text: string;
  location: { lat: number; lng: number };
  severity: number;
}

export interface MockBuddySession {
  participants: string[];
  checkInIntervalSec: number;
}

// Common test data factories
export const createMockIncident = (overrides: Partial<MockIncident> = {}): MockIncident => ({
  type: 'theft',
  text: 'Test incident description',
  location: { lat: 37.422, lng: -122.084 },
  severity: 4,
  ...overrides,
});

export const createMockBuddySession = (overrides: Partial<MockBuddySession> = {}): MockBuddySession => ({
  participants: ['user1', 'user2'],
  checkInIntervalSec: 300,
  ...overrides,
});

// Helper to create authorization header
export const authHeader = (token: string = TEST_CONFIG.authToken) => ({
  Authorization: `Bearer ${token}`,
});

// Response validation helpers (return boolean for use in tests)
export const isSuccessfulCreation = (response: Response): boolean => {
  return response.status === 201 &&
         response.body &&
         'id' in response.body &&
         !!response.body.id;
};

export const isUnauthorized = (response: Response): boolean => {
  return response.status === 401;
};

export const isValidationError = (response: Response): boolean => {
  return response.status === 400 &&
         response.body &&
         'error' in response.body;
};