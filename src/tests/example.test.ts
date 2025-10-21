/**
 * Example Unit Test
 * 
 * This is a simple example test demonstrating Vitest usage.
 * Delete this file when you start writing real tests.
 */

import { describe, it, expect, vi } from 'vitest';

describe('Example Test Suite', () => {
    it('should pass a basic assertion', () => {
        expect(true).toBe(true);
    });

    it('should demonstrate mock functions', () => {
        const mockFn = vi.fn((x: number) => x * 2);

        const result = mockFn(5);

        expect(result).toBe(10);
        expect(mockFn).toHaveBeenCalledWith(5);
        expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should demonstrate async testing', async () => {
        const promise = Promise.resolve('test data');

        await expect(promise).resolves.toBe('test data');
    });

    it('should demonstrate inline snapshots', () => {
        const data = {
            name: '10xCards',
            version: '1.0.0',
            features: ['flashcards', 'AI generation'],
        };

        expect(data).toMatchInlineSnapshot(`
      {
        "features": [
          "flashcards",
          "AI generation",
        ],
        "name": "10xCards",
        "version": "1.0.0",
      }
    `);
    });
});

