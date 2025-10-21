/**
 * Test Data Fixtures
 * 
 * Centralized test data for E2E tests.
 * Adjust and expand based on your testing needs.
 */

export const testUsers = {
    valid: {
        email: 'test@example.com',
        password: 'Test123456!',
    },
    invalid: {
        email: 'invalid@example.com',
        password: 'wrongpassword',
    },
};

export const testFlashcards = {
    valid: {
        question: 'What is React?',
        answer: 'A JavaScript library for building user interfaces',
    },
    empty: {
        question: '',
        answer: '',
    },
};

export const testGenerationInput = {
    short: 'React is a JavaScript library.',
    medium: `
    React is a JavaScript library for building user interfaces.
    It was developed by Facebook and is now maintained by Meta and a community of developers.
    React uses a component-based architecture and virtual DOM for efficient rendering.
  `,
    long: `
    React is a JavaScript library for building user interfaces.
    It was developed by Facebook and is now maintained by Meta and a community of developers.
    React uses a component-based architecture where UIs are composed of reusable components.
    The library implements a virtual DOM which optimizes rendering performance.
    React supports both class-based and functional components with hooks.
    It has a rich ecosystem with tools like React Router for navigation and Redux for state management.
  `,
};

