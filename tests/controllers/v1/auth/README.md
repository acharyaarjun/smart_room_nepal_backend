# Test Suite for Login Controller

This directory contains comprehensive test cases for the login controller functionality.

## Test Coverage

### Success Cases

1. **Regular User Login** - Tests successful login with valid credentials for a regular user
2. **Host User Login** - Tests successful login for HOST role with available credits calculation
3. **Zero Credits Scenario** - Tests HOST login when available credits are exhausted

### Failure Cases

1. **Non-existent User** - Tests error handling when user doesn't exist
2. **Invalid Login Method** - Tests error when user tries to login with wrong method (e.g., Google OAuth account using email/password)
3. **Incorrect Password** - Tests error handling for wrong password
4. **Unverified Email** - Tests blocking login when email is not verified
5. **Disabled Account** - Tests error when account is disabled by admin

### Auth Token Generation Tests

1. **Production Environment** - Tests secure cookie settings in production
2. **Development Environment** - Tests cookie settings in development
3. **Login History** - Tests creation of login history records
4. **Secure Connection** - Tests handling of secure connections via headers

### Edge Cases

1. **No Memberships** - Tests HOST user with default limit (no purchased memberships)
2. **Invalid Membership Data** - Tests handling of memberships with null/undefined limits
3. **Non-HOST Users** - Tests that availableCredits is not included for non-HOST roles

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- tests/controllers/v1/auth/login.controller.test.ts
```

## Test Structure

Each test follows the AAA pattern:

- **Arrange**: Set up test data and mocks
- **Act**: Execute the function being tested
- **Assert**: Verify the expected outcome

## Mocked Dependencies

The following modules are mocked in the tests:

- `@/models` - Database models (User, UserProfile, LoginHistory, Room, Payment, MembershipType)
- `@/utils/apiError` - Error handling utility
- `@/utils/apiResponse` - Response formatting utility
- `@/utils/validateEnv` - Environment variables
- `@/helpers/helper` - Helper functions

## Coverage Goals

- **Statements**: > 90%
- **Branches**: > 85%
- **Functions**: > 90%
- **Lines**: > 90%

## Adding New Tests

When adding new tests:

1. Follow the existing naming convention
2. Group related tests using `describe` blocks
3. Clear all mocks in `beforeEach`
4. Use descriptive test names that explain the scenario
5. Mock only what's necessary for the test
6. Verify both success and error paths
