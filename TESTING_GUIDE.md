# Quick Reference Guide - Testing

## Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- tests/controllers/v1/auth/login.controller.test.ts

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests matching a pattern
npm test -- --testNamePattern="should login successfully"

# Run tests for specific describe block
npm test -- --testNamePattern="login - Success Cases"
```

## Test File Structure

```
tests/
├── setup.ts                          # Global test configuration
├── controllers/
│   └── v1/
│       └── auth/
│           ├── login.controller.test.ts    # Main test file
│           ├── README.md                    # Documentation
│           └── FUTURE_TESTS.md             # Future test ideas
└── ...
```

## Writing New Tests

### Basic Test Template

```typescript
describe("Feature Name", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRequest = {
      body: {},
      // ... other properties
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();
  });

  it("should do something specific", async () => {
    // Arrange
    const mockData = {
      /* test data */
    };
    (SomeModel.findOne as jest.Mock).mockResolvedValue(mockData);

    // Act
    await someFunction(mockRequest, mockResponse, mockNext);

    // Assert
    expect(SomeModel.findOne).toHaveBeenCalledWith(/* expected args */);
    expect(mockResponse.status).toHaveBeenCalledWith(200);
  });
});
```

## Common Jest Matchers

```typescript
// Equality
expect(value).toBe(expected); // Strict equality (===)
expect(value).toEqual(expected); // Deep equality

// Truthiness
expect(value).toBeTruthy();
expect(value).toBeFalsy();
expect(value).toBeNull();
expect(value).toBeUndefined();
expect(value).toBeDefined();

// Numbers
expect(value).toBeGreaterThan(3);
expect(value).toBeLessThan(5);
expect(value).toBeCloseTo(0.3);

// Strings
expect(string).toMatch(/pattern/);
expect(string).toContain("substring");

// Arrays
expect(array).toContain(item);
expect(array).toHaveLength(3);
expect(array).toEqual(expect.arrayContaining([item1, item2]));

// Objects
expect(object).toHaveProperty("key");
expect(object).toMatchObject({ key: value });
expect(object).toEqual(expect.objectContaining({ key: value }));

// Functions
expect(fn).toHaveBeenCalled();
expect(fn).toHaveBeenCalledTimes(2);
expect(fn).toHaveBeenCalledWith(arg1, arg2);
expect(fn).toHaveReturnedWith(value);

// Async
await expect(promise).resolves.toBe(value);
await expect(promise).rejects.toThrow(Error);

// Instances
expect(value).toBeInstanceOf(Class);
```

## Mocking Guide

### Mock Functions

```typescript
const mockFn = jest.fn();
const mockFn = jest.fn(() => "return value");
const mockFn = jest.fn().mockReturnValue("value");
const mockFn = jest.fn().mockResolvedValue("async value");
const mockFn = jest.fn().mockRejectedValue(new Error("error"));
```

### Mock Modules

```typescript
// Auto-mock entire module
jest.mock("@/models");

// Mock with implementation
jest.mock("@/utils/apiResponse", () => {
  return jest.fn().mockImplementation(() => ({
    send: jest.fn(),
  }));
});

// Mock specific exports
jest.mock("@/utils/helper", () => ({
  someFunction: jest.fn(),
  otherFunction: jest.fn(),
}));
```

### Mock Implementations

```typescript
// One-time return value
mockFn.mockReturnValueOnce("first call");
mockFn.mockReturnValueOnce("second call");

// Different values for different calls
mockFn
  .mockReturnValueOnce("first")
  .mockReturnValueOnce("second")
  .mockReturnValue("default");

// Implementation
mockFn.mockImplementation((arg) => arg * 2);

// Reset mocks
mockFn.mockReset(); // Reset calls and implementation
mockFn.mockClear(); // Clear calls only
jest.clearAllMocks(); // Clear all mocks
```

## Debugging Tests

### Run Specific Test

```bash
# Run single test file
npm test -- login.controller.test.ts

# Run tests matching name
npm test -- -t "should login successfully"
```

### Debug Output

```typescript
// Console log in tests (visible when test fails)
console.log('Debug info:', someValue);

// Use --verbose flag
npm test -- --verbose

// Show all console output
npm test -- --silent=false
```

### VSCode Debugging

Add to `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Jest: Current File",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": ["${fileBasename}", "--config", "jest.config.js"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

## Coverage Reports

### Generate Coverage

```bash
npm run test:coverage
```

### View HTML Report

After running coverage:

```bash
open coverage/lcov-report/index.html
```

### Coverage Thresholds

Add to `jest.config.js`:

```javascript
coverageThreshold: {
  global: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80,
  },
},
```

## Best Practices

### DO's ✅

- **Clear test names**: Describe what is being tested
- **One assertion concept per test**: Test one thing at a time
- **Use beforeEach**: Reset state before each test
- **Mock external dependencies**: Isolate unit under test
- **Test both success and failure**: Cover all code paths
- **Use descriptive variables**: Make tests readable
- **Follow AAA pattern**: Arrange, Act, Assert

### DON'Ts ❌

- **Don't test implementation details**: Test behavior, not internals
- **Don't share state between tests**: Each test should be independent
- **Don't use real external services**: Mock databases, APIs, etc.
- **Don't write overly complex tests**: Simple is better
- **Don't skip assertions**: Always verify expected behavior
- **Don't hardcode dates/times**: Use relative dates or freeze time

## Common Issues

### Issue: Tests timeout

```typescript
// Solution: Increase timeout
jest.setTimeout(10000);

// Or per test
it("should do something", async () => {
  // test code
}, 10000);
```

### Issue: Async tests not waiting

```typescript
// Wrong ❌
it("should work", () => {
  someAsyncFunction();
  expect(result).toBe(expected);
});

// Right ✅
it("should work", async () => {
  await someAsyncFunction();
  expect(result).toBe(expected);
});
```

### Issue: Mocks not clearing

```typescript
// Add to beforeEach
beforeEach(() => {
  jest.clearAllMocks();
});

// Or use resetMocks in jest config
{
  resetMocks: true,
  restoreMocks: true,
}
```

## Continuous Integration

### GitHub Actions Example

```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: "18"
      - run: npm install
      - run: npm test
      - run: npm run test:coverage
```

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library](https://testing-library.com/)
- [Jest Cheat Sheet](https://github.com/sapegin/jest-cheat-sheet)
