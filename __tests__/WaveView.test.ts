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

        const container = document.querySelector<HTMLDivElement>('#container');

        if (!container) return;

        const view = new WaveView([], { container });

        expect(view).toBeInstanceOf(WaveView);
    });

    it('throws an error for a non existing container element', () => {
        expect(() => {
            return new WaveView([], { container: 'foo' });
        }).toThrow('Container element could not be located.');
    });

    [
        { label: 'responsive', options: { responsive: true }, expected: '100%' },
        { label: 'fixed', options: { responsive: false }, expected: '512px' },
    ].forEach(({ label, options, expected }) => {
        it(`it uses a ${label} width for the wave view container element`, () => {
            document.body.innerHTML = '<div id="container"></div>';

            const view = new WaveView([], { container: '#container', ...options });
            const waveContainer = view.container.querySelector<HTMLDivElement>('.waveplayer-waveform-container');

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

    it('gets and sets the waveform progress', () => {
        document.body.innerHTML = '<div id="container"></div>';

        const view = new WaveView([], { container: '#container' });

        expect(view.progress).toBe(0);

        view.progress = 1.5;

        expect(view.progress).toBe(1);

        view.progress = -0.5;

        expect(view.progress).toBe(0);
    });

    it('gets and sets the container element', () => {
        document.body.innerHTML = '<div id="first-container"></div><div id="second-container"></div>';

        const view = new WaveView([], { container: '#first-container' });

        expect(view.container).toHaveAttribute('id', 'first-container');

        view.container = '#second-container';

        expect(view.container).toHaveAttribute('id', 'second-container');
    });

    it('gets and sets the waveform width', () => {
        document.body.innerHTML = '<div id="container"></div>';

        const view = new WaveView([], { container: '#container', responsive: false });
        const waveContainer = view.container.querySelector<HTMLDivElement>('.waveplayer-waveform-container');

        expect(view.width).toBe(512);
        expect(waveContainer).toHaveStyle({ width: '512px' });

        view.width = 256;

        expect(view.width).toBe(256);
        expect(waveContainer).toHaveStyle({ width: '256px' });
    });

    it('gets and sets the waveform height', () => {
        document.body.innerHTML = '<div id="container"></div>';

        const view = new WaveView([], { container: '#container' });
        const waveContainer = view.container.querySelector<HTMLDivElement>('.waveplayer-waveform-container');

        expect(view.height).toBe(128);
        expect(waveContainer).toHaveStyle({ height: '128px' });

        view.height = 64;

        expect(view.height).toBe(64);
        expect(waveContainer).toHaveStyle({ height: '64px' });
    });

    it('gets and sets the waveform responsive flag', () => {
        document.body.innerHTML = '<div id="container"></div>';

        const view = new WaveView([], { container: '#container' });

        expect(view.responsive).toBeTruthy();

        view.responsive = false;

        expect(view.responsive).toBeFalsy();
    });

    it('gets and sets the waveform gradient', () => {
        document.body.innerHTML = '<div id="container"></div>';

        const view = new WaveView([], { container: '#container' });

        expect(view.gradient).toBeTruthy();

        view.gradient = false;

        expect(view.gradient).toBeFalsy();
    });
});
