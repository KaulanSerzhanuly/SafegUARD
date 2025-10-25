# E2E Test Suite Documentation

## Overview

This directory contains end-to-end (E2E) tests for the CampusSafe backend API. The tests are written using Jest and Supertest to verify API endpoints work correctly.

## Structure

```
test/
├── helpers/
│   ├── test-config.ts      # Shared configuration and utilities
│   └── test-setup.ts       # Test lifecycle management
├── incidents.e2e.test.ts   # Incidents API tests
├── buddy.e2e.test.ts       # Buddy System API tests
└── README.md               # This file
```

## Setup

### Prerequisites

1. Node.js 18 or higher
2. Firebase emulators running (or deployed backend)
3. Environment variables configured (optional)

### Installation

```bash
cd functions
npm install
```

### Configuration

The test suite uses environment variables for configuration:

- `API_URL`: The base URL for the API (default: `http://localhost:5001/your-project-id/us-central1/api`)
- `TEST_AUTH_TOKEN`: Authentication token for tests (default: `dummy-token`)

You can set these in a `.env` file or export them:

```bash
export API_URL="http://localhost:5001/my-project/us-central1/api"
export TEST_AUTH_TOKEN="your-test-token"
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run specific test file
```bash
npm test incidents.e2e.test.ts
npm test buddy.e2e.test.ts
```

### Run tests in watch mode
```bash
npm test -- --watch
```

### Run tests with coverage
```bash
npm test -- --coverage
```

## Test Files

### incidents.e2e.test.ts

Tests for the Incidents API endpoints:

- **Authentication Tests**
  - Verifies 401 responses for unauthenticated requests
  - Tests invalid token handling

- **POST /api/incidents**
  - Creates incidents with valid data
  - Tests different severity levels (1-5)
  - Tests different incident types (theft, assault, harassment, etc.)
  - Validates required fields
  - Validates location coordinates
  - Validates severity range

- **GET /api/incidents**
  - Retrieves incidents list
  - Tests query parameter filtering

- **GET /api/incidents/:id**
  - Retrieves specific incident by ID
  - Tests 404 for non-existent incidents

### buddy.e2e.test.ts

Tests for the Buddy System API endpoints:

- **Authentication Tests**
  - Verifies 401 responses for unauthenticated requests
  - Tests invalid token handling

- **POST /api/buddy/sessions**
  - Creates buddy sessions with valid data
  - Tests multiple participants
  - Tests different check-in intervals
  - Validates minimum 2 participants
  - Validates required fields
  - Validates check-in interval range

- **GET /api/buddy/sessions**
  - Retrieves sessions list
  - Tests participant filtering

- **GET /api/buddy/sessions/:id**
  - Retrieves specific session by ID
  - Tests 404 for non-existent sessions

- **POST /api/buddy/sessions/:id/check-in**
  - Tests participant check-in functionality
  - Validates authentication

- **DELETE /api/buddy/sessions/:id**
  - Tests ending buddy sessions
  - Tests 404 for non-existent sessions

## Helper Utilities

### test-config.ts

Provides shared configuration and utilities:

- `TEST_CONFIG`: Environment-based configuration object
- `createMockIncident()`: Factory for creating test incident data
- `createMockBuddySession()`: Factory for creating test buddy session data
- `authHeader()`: Helper to create authorization headers
- `isSuccessfulCreation()`: Validates 201 responses with ID
- `isUnauthorized()`: Validates 401 responses
- `isValidationError()`: Validates 400 responses

**Example Usage:**
```typescript
import { createMockIncident, authHeader } from './helpers/test-config';

const incident = createMockIncident({ severity: 5 });
const response = await request(apiUrl)
  .post('/api/incidents')
  .set(authHeader())
  .send(incident);
```

### test-setup.ts

Provides test lifecycle management:

- `registerIncident()`: Register created incidents for cleanup
- `registerBuddySession()`: Register created sessions for cleanup
- `cleanupTestResources()`: Clean up all registered resources
- `waitFor()`: Wait for async conditions with timeout
- `retryWithBackoff()`: Retry operations with exponential backoff
- `setupTestEnvironment()`: Global setup function
- `teardownTestEnvironment()`: Global teardown function
- `generateTestId()`: Generate unique test identifiers
- `sleep()`: Async sleep utility

**Example Usage:**
```typescript
import { setupTestEnvironment, teardownTestEnvironment } from './helpers/test-setup';

beforeAll(async () => {
  await setupTestEnvironment();
});

afterAll(async () => {
  await teardownTestEnvironment();
});
```

## Best Practices

### 1. Use Factory Functions

Always use factory functions from `test-config.ts` to create test data:

```typescript
// Good
const incident = createMockIncident({ severity: 5 });

// Avoid
const incident = {
  type: 'theft',
  text: 'Test',
  location: { lat: 37.422, lng: -122.084 },
  severity: 5
};
```

### 2. Clean Up Resources

Register created resources for cleanup:

```typescript
const response = await request(apiUrl)
  .post('/api/incidents')
  .set(authHeader())
  .send(newIncident);

registerIncident(response.body.id);
```

### 3. Use Helper Validators

Use validation helpers instead of raw assertions:

```typescript
// Good
expect(isSuccessfulCreation(response)).toBe(true);

// Avoid
expect(response.status).toBe(201);
expect(response.body).toHaveProperty('id');
```

### 4. Test Edge Cases

Always test:
- Valid data scenarios
- Invalid data scenarios
- Missing required fields
- Out-of-range values
- Authentication failures
- Non-existent resources (404s)

### 5. Organize Tests with describe()

Group related tests using `describe()` blocks:

```typescript
describe('POST /api/incidents', () => {
  it('should create incident with valid data', async () => {
    // test code
  });
  
  it('should reject invalid data', async () => {
    // test code
  });
});
```

## Troubleshooting

### Tests Failing with Connection Errors

1. Ensure Firebase emulators are running:
   ```bash
   npm run emu
   ```

2. Verify the API_URL is correct in your environment

### Authentication Errors

1. Check that AUTH_TOKEN is set correctly
2. Verify the auth middleware is configured properly
3. For real tests, generate a valid Firebase auth token

### Timeout Errors

1. Increase Jest timeout in `package.json`:
   ```json
   "jest": {
     "testTimeout": 30000
   }
   ```

2. Or set timeout per test:
   ```typescript
   it('slow test', async () => {
     // test code
   }, 30000);
   ```

## Future Improvements

- [ ] Add integration with Firebase Auth for real token generation
- [ ] Implement actual resource cleanup in `cleanupTestResources()`
- [ ] Add tests for alerts API endpoints
- [ ] Add tests for routes API endpoints
- [ ] Add tests for risk assessment endpoints
- [ ] Add performance/load testing
- [ ] Add test data seeding utilities
- [ ] Add snapshot testing for API responses
- [ ] Add contract testing with Pact
- [ ] Add CI/CD integration examples

## Contributing

When adding new tests:

1. Follow the existing structure and patterns
2. Use helper utilities from `test-config.ts` and `test-setup.ts`
3. Add comprehensive test coverage (happy path + edge cases)
4. Update this README with new test descriptions
5. Ensure all tests pass before committing

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Firebase Testing Guide](https://firebase.google.com/docs/emulator-suite)