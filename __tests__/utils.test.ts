import '@testing-library/jest-dom';

import { style, average } from '../src/utils';

describe('utils', () => {
    describe('style', () => {
        it('sets the CSS style properties for a given HTML element', () => {
            const element = document.createElement('div');

            style(element, { position: 'absolute' });

            expect(element).toHaveStyle({ position: 'absolute' });
            expect(element).not.toHaveStyle({ top: '0' });
        });
    });

    describe('average', () => {
        [
            { start: 0, end: 2, expected: 0.5 },
            { start: 1, end: 3, expected: 0.5 },
            { start: 2, end: 4, expected: 0.5 },
        ].forEach(({ start, end, expected }) => {
            it(`computes the average from ${start} to ${end} of a range of values`, () => {
                expect(average([-0.5, 0.5, 0.5, -0.5], start, end)).toBe(expected);
            });
        });
    });
});
