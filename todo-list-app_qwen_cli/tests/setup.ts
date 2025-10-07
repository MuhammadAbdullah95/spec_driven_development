// Vitest setup file
// This file can be used to set up global test configurations, mocks, etc.

// Example: Mock localStorage for tests
Object.defineProperty(window, 'localStorage', {
  value: (function() {
    let store: { [key: string]: string } = {};
    return {
      getItem: function(key: string) {
        return store[key] || null;
      },
      setItem: function(key: string, value: string) {
        store[key] = value.toString();
      },
      removeItem: function(key: string) {
        delete store[key];
      },
      clear: function() {
        store = {};
      }
    };
  })(),
  writable: true
});

// Example: Mock matchMedia for theme testing
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});