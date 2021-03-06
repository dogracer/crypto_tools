// import { expect, test } from '@jest/globals';
import { unitTestWrapper } from '../../tests/utils.test';
import { loadCostBasisExample_, loadFMVExample_ } from './examples';

/**
 * jest unit tests for examples
 *
 */
describe('Examples unit tests', testExamples());

function testExamples(): unitTestWrapper {
    return (): void => {
        if (typeof ScriptApp === 'undefined') {
            // jest unit test
            test('Test example 1 fails during local execution', () => {
                expect(loadCostBasisExample_()).toBe(null);
            });
            test('Test example 2 fails during local execution', () => {
                expect(loadFMVExample_()).toBe(null);
            });
        }
    };
}
