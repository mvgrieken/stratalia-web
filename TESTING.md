# Stratalia Testing Guide

## Overview
This document explains how to run tests for the Stratalia application, including unit tests, integration tests, and end-to-end tests.

## Test Types

### 1. Unit Tests
- **Location**: `src/__tests__/`
- **Framework**: Vitest
- **Purpose**: Test individual functions and components
- **Coverage**: Business logic, utilities, helper functions

### 2. Integration Tests
- **Location**: `src/__tests__/api-integration.test.ts`
- **Framework**: Vitest
- **Purpose**: Test API endpoints and database interactions
- **Coverage**: API routes, database queries, external service integration

### 3. End-to-End Tests
- **Location**: `src/__tests__/search.e2e.test.tsx`
- **Framework**: Vitest + React Testing Library
- **Purpose**: Test complete user workflows
- **Coverage**: Frontend components, user interactions, full application flow

## Running Tests

### Prerequisites
```bash
# Install dependencies
npm install

# Set up environment variables
cp env.example .env.local
# Edit .env.local with your test configuration
```

### Local Testing

#### 1. Run All Tests
```bash
npm test
```

#### 2. Run Specific Test Types
```bash
# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# End-to-end tests only
npm run test:e2e
```

#### 3. Run Tests in Watch Mode
```bash
npm run test:watch
```

#### 4. Run Tests with Coverage
```bash
npm run test:coverage
```

### CI/CD Testing

#### 1. GitHub Actions
```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:ci
```

#### 2. Vercel Integration
Tests run automatically on every deployment:
- **Preview deployments**: Run full test suite
- **Production deployments**: Run critical tests only

## Test Configuration

### 1. Vitest Configuration
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    globals: true,
  },
});
```

### 2. Test Setup
```typescript
// src/__tests__/setup.ts
import '@testing-library/jest-dom';

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
```

## Integration Tests

### 1. API Endpoint Tests
```typescript
// Test health endpoint
it('should return healthy status', async () => {
  const response = await fetch('/api/health');
  expect(response.status).toBe(200);
  const data = await response.json();
  expect(data.status).toBe('ok');
});
```

### 2. Database Integration Tests
```typescript
// Test database queries
it('should search for words', async () => {
  const response = await fetch('/api/words/search?query=skeer');
  expect(response.status).toBe(200);
  const data = await response.json();
  expect(Array.isArray(data)).toBe(true);
});
```

### 3. Authentication Tests
```typescript
// Test RLS policies
it('should respect user permissions', async () => {
  const response = await fetch('/api/words/daily');
  expect(response.status).toBe(200);
  // Verify only SELECT operations are allowed
});
```

## End-to-End Tests

### 1. Component Tests
```typescript
// Test search functionality
it('should search and display results', async () => {
  render(<SearchClient />);
  const input = screen.getByPlaceholderText('Zoek een woord...');
  fireEvent.change(input, { target: { value: 'skeer' } });
  fireEvent.click(screen.getByRole('button', { name: 'Zoeken' }));
  
  await waitFor(() => {
    expect(screen.getByText('skeer')).toBeInTheDocument();
  });
});
```

### 2. User Workflow Tests
```typescript
// Test complete user journey
it('should complete search workflow', async () => {
  // 1. Load search page
  // 2. Enter search term
  // 3. Submit search
  // 4. View results
  // 5. Interact with results
});
```

## Test Data Management

### 1. Mock Data
```typescript
// Mock API responses
const mockSearchResults = [
  {
    id: '1',
    word: 'skeer',
    meaning: 'arm, blut',
    example: 'Ik ben skeer deze maand'
  }
];
```

### 2. Test Database
- Use separate test database
- Reset data between tests
- Use fixtures for consistent test data

### 3. Environment Isolation
```typescript
// Test environment setup
beforeAll(async () => {
  // Set up test database
  // Load test fixtures
});

afterAll(async () => {
  // Clean up test data
  // Close connections
});
```

## Performance Testing

### 1. API Response Times
```typescript
it('should respond within time limits', async () => {
  const startTime = Date.now();
  const response = await fetch('/api/words/search?query=test');
  const endTime = Date.now();
  
  expect(response.status).toBe(200);
  expect(endTime - startTime).toBeLessThan(2000); // 2 seconds max
});
```

### 2. Load Testing
```bash
# Use tools like Artillery or k6
npm run test:load
```

## Security Testing

### 1. RLS Policy Tests
```typescript
it('should prevent unauthorized access', async () => {
  // Test that anon users can only SELECT
  // Test that mutations are blocked
});
```

### 2. Input Validation Tests
```typescript
it('should validate input parameters', async () => {
  const response = await fetch('/api/words/search');
  expect(response.status).toBe(400);
  expect(response.json().error).toBe('Query parameter is required');
});
```

## Debugging Tests

### 1. Test Debugging
```bash
# Run specific test with verbose output
npm test -- --reporter=verbose api-integration.test.ts

# Run tests in debug mode
npm run test:debug
```

### 2. Test Logs
```typescript
// Add logging to tests
console.log('Test data:', data);
console.log('Response status:', response.status);
```

### 3. Test Isolation
```typescript
// Ensure tests don't interfere with each other
beforeEach(() => {
  // Reset state
  // Clear mocks
});
```

## Best Practices

### 1. Test Structure
- **Arrange**: Set up test data and conditions
- **Act**: Execute the code being tested
- **Assert**: Verify the expected outcome

### 2. Test Naming
```typescript
// Good: Descriptive test names
it('should return search results when query matches existing words', () => {});

// Bad: Vague test names
it('should work', () => {});
```

### 3. Test Independence
- Each test should be independent
- Tests should not depend on other tests
- Use proper setup and teardown

### 4. Mock External Dependencies
```typescript
// Mock external services
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve({ data: mockData, error: null }))
        }))
      }))
    }))
  }))
}));
```

## Continuous Integration

### 1. Pre-commit Hooks
```bash
# Run tests before commit
npm run test:pre-commit
```

### 2. Pull Request Checks
- All tests must pass
- Coverage must meet minimum threshold
- No linting errors

### 3. Deployment Gates
- Critical tests must pass
- Performance tests must meet benchmarks
- Security tests must pass

## Troubleshooting

### 1. Common Issues
- **Environment variables**: Ensure test env vars are set
- **Database connections**: Check test database is accessible
- **Async operations**: Use proper async/await patterns

### 2. Test Failures
- Check test logs for detailed error messages
- Verify test data and mocks
- Ensure proper cleanup between tests

### 3. Performance Issues
- Monitor test execution time
- Optimize slow tests
- Use parallel test execution where possible

## Contact Information

For testing issues or questions:
- **Test Framework**: Vitest documentation
- **Testing Library**: React Testing Library docs
- **Application Issues**: Check test logs and CI/CD pipeline
