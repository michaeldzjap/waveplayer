import '@testing-library/jest-dom';

import WaveView from '../src/WaveView';

describe('WaveView', () => {
    it('creates a new instance when referencing an existing container element', () => {
        document.body.innerHTML = '<div id="container"></div>';

        const view = new WaveView([], { container: '#container' });

        expect(view).toBeInstanceOf(WaveView);
    });

    it('creates a new instance for an existing container element', () => {
        document.body.innerHTML = '<div id="container"></div>';

        const container = document.querySelector('#container') as HTMLDivElement;
        const view = new WaveView([], { container });

        expect(view).toBeInstanceOf(WaveView);
    });

    it('throws an error for a non existing container element', () => {
        expect(() => {
            return new WaveView([], { container: 'foo' });
        }).toThrow('Container element could not located.');
    });

    it('throws an error for an invalid container element', () => {
        document.body.innerHTML = '<input id="container">';

        const container = document.querySelector('#container') as HTMLInputElement;

        expect(() => {
            return new WaveView([], { container });
        }).toThrow('Container element is invalid.');
    });

    it('returns the container element', () => {
        document.body.innerHTML = '<div id="container"></div>';

        const view = new WaveView([], { container: '#container' });

        expect(view.container).toBeInstanceOf(HTMLDivElement);
    });

    [
        { label: 'responsive', options: { responsive: true }, expected: '100%' },
        { label: 'fixed', options: { responsive: false }, expected: '512px' },
    ].forEach(({ label, options, expected }) => {
        it(`it uses a ${label} width for the wave view container element`, () => {
            document.body.innerHTML = '<div id="container"></div>';

            const view = new WaveView([], { container: '#container', ...options });
            const waveContainer = view.container.querySelector('.waveform-container');

            expect(waveContainer).toHaveStyle({ width: expected });
        });
    });

    it('gets and sets the waveform amplitude data', () => {
        document.body.innerHTML = '<div id="container"></div>';

        let data: number[] = [];
        const view = new WaveView(data, { container: '#container' });

        expect(view.data).toBe(data);

        data = [0, 0.5, 1];

        view.data = data;

        expect(view.data).toBe(data);
    });

    it('gets and sets the progress', () => {
        document.body.innerHTML = '<div id="container"></div>';

        const view = new WaveView([], { container: '#container' });

        expect(view.progress).toBe(0);

        view.progress = 1.5;

        expect(view.progress).toBe(1);

        view.progress = -0.5;

        expect(view.progress).toBe(0);
    });
});