import '@testing-library/jest-dom';

import { style } from '../src/utils';

describe('utils', () => {
    describe('style', () => {
        it('sets the CSS style properties for a given HTML element', () => {
            const element = document.createElement('div');

            style(element, { position: 'absolute' });

            expect(element).toHaveStyle({ position: 'absolute' });
            expect(element).not.toHaveStyle({ top: '0' });
        });
    });
});
