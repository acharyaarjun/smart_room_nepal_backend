// Jest setup file
// Add any global test configurations here

// Increase timeout for async operations
jest.setTimeout(10000);

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Uncomment to suppress console logs during tests
  // log: jest.fn(),
  // error: jest.fn(),
  // warn: jest.fn(),
};
