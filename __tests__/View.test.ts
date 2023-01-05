import '@testing-library/jest-dom';

import View from '../src/View';

describe('View', () => {
    it('creates a new instance when referencing an existing container element', () => {
        document.body.innerHTML = '<div id="container"></div>';

        const view = new View([], { container: '#container' });

        expect(view).toBeInstanceOf(View);
    });

    it('creates a new instance for an existing container element', () => {
        document.body.innerHTML = '<div id="container"></div>';

        const container = document.querySelector<HTMLDivElement>('#container');

        if (!container) return;

        const view = new View([], { container });

        expect(view).toBeInstanceOf(View);
    });

    it('throws an error for a non existing container element', () => {
        expect(() => {
            return new View([], { container: 'foo' });
        }).toThrow('Container element could not be located.');
    });

    [
        { label: 'responsive', options: { responsive: true }, expected: '100%' },
        { label: 'fixed', options: { responsive: false }, expected: '512px' },
    ].forEach(({ label, options, expected }) => {
        it(`it uses a ${label} width for the view container element`, () => {
            document.body.innerHTML = '<div id="container"></div>';

            const view = new View([], { container: '#container', ...options });
            const waveContainer = view.container.querySelector<HTMLDivElement>('.waveplayer-waveform-container');

            expect(waveContainer).toHaveStyle({ width: expected });
        });
    });

    it('gets and sets the waveform amplitude data', () => {
        document.body.innerHTML = '<div id="container"></div>';

        let data: number[] = [];
        const view = new View(data, { container: '#container' });

        expect(view.data).toBe(data);

        data = [0, 0.5, 1];

        view.data = data;

        expect(view.data).toBe(data);
    });

    it('gets and sets the waveform progress', () => {
        document.body.innerHTML = '<div id="container"></div>';

        const view = new View([], { container: '#container' });

        expect(view.progress).toBe(0);

        view.progress = 1.5;

        expect(view.progress).toBe(1);

        view.progress = -0.5;

        expect(view.progress).toBe(0);
    });

    it('gets and sets the container element', () => {
        document.body.innerHTML = '<div id="first-container"></div><div id="second-container"></div>';

        const view = new View([], { container: '#first-container' });

        expect(view.container).toHaveAttribute('id', 'first-container');

        view.container = '#second-container';

        expect(view.container).toHaveAttribute('id', 'second-container');
    });

    it('gets and sets the waveform width', () => {
        document.body.innerHTML = '<div id="container"></div>';

        const view = new View([], { container: '#container', responsive: false });
        const waveContainer = view.container.querySelector<HTMLDivElement>('.waveplayer-waveform-container');

        expect(view.width).toBe(512);
        expect(waveContainer).toHaveStyle({ width: '512px' });

        view.width = 256;

        expect(view.width).toBe(256);
        expect(waveContainer).toHaveStyle({ width: '256px' });
    });

    it('gets and sets the waveform height', () => {
        document.body.innerHTML = '<div id="container"></div>';

        const view = new View([], { container: '#container' });
        const waveContainer = view.container.querySelector<HTMLDivElement>('.waveplayer-waveform-container');

        expect(view.height).toBe(128);
        expect(waveContainer).toHaveStyle({ height: '128px' });

        view.height = 64;

        expect(view.height).toBe(64);
        expect(waveContainer).toHaveStyle({ height: '64px' });
    });

    it('gets and sets the waveform bar width', () => {
        document.body.innerHTML = '<div id="container"></div>';

        const view = new View([], { container: '#container' });

        expect(view.barWidth).toBe(4);

        view.barWidth = 10;

        expect(view.barWidth).toBe(10);
    });

    it('gets and sets the waveform bar gap', () => {
        document.body.innerHTML = '<div id="container"></div>';

        const view = new View([], { container: '#container' });

        expect(view.barGap).toBe(1);

        view.barGap = 2;

        expect(view.barGap).toBe(2);
    });

    it('gets and sets the waveform responsive flag', () => {
        document.body.innerHTML = '<div id="container"></div>';

        const view = new View([], { container: '#container' });

        expect(view.responsive).toBeTruthy();

        view.responsive = false;

        expect(view.responsive).toBeFalsy();
    });

    it('gets and sets the waveform gradient', () => {
        document.body.innerHTML = '<div id="container"></div>';

        const view = new View([], { container: '#container' });

        expect(view.gradient).toBeTruthy();

        view.gradient = false;

        expect(view.gradient).toBeFalsy();
    });

    it('gets and sets the waveform interact flag', () => {
        document.body.innerHTML = '<div id="container"></div>';

        const view = new View([], { container: '#container' });

        expect(view.interact).toBeTruthy();

        view.interact = false;

        expect(view.interact).toBeFalsy();
    });

    it('gets and sets the waveform redraw flag', () => {
        document.body.innerHTML = '<div id="container"></div>';

        const view = new View([], { container: '#container' });

        expect(view.redraw).toBeTruthy();

        view.redraw = false;

        expect(view.redraw).toBeFalsy();
    });

    it('draws the correct number of bars on the canvas', () => {
        document.body.innerHTML = '<div id="container"></div>';

        const view = new View(new Array(800).fill(1), { container: '#container' });
        const waveContainer = view.container.querySelector<HTMLDivElement>('.waveplayer-waveform-container');

        if (!waveContainer) return;

        const canvas = waveContainer.firstElementChild;

        if (!canvas) return;

        Object.defineProperty(document.body, 'clientWidth', { value: window.innerWidth, configurable: true });
        Object.defineProperty(document.body.querySelector<HTMLDivElement>('#container'), 'clientWidth', {
            value: view.width,
            configurable: true,
        });
        Object.defineProperty(waveContainer, 'clientWidth', { value: view.width, configurable: true });
        Object.defineProperty(canvas, 'clientWidth', { value: view.width, configurable: true });

        view.progress = 0.5;

        const context = (canvas as HTMLCanvasElement).getContext('2d');

        if (!context) return;

        const spy = jest.spyOn(context, 'fillRect');

        view.draw();

        expect(spy).toHaveBeenCalledTimes(Math.floor(view.width / (view.barWidth + view.barGap)));

        spy.mockRestore();
    });

    jest.useFakeTimers();

    it('redraws the waveform on the canvas when resizing the viewport', () => {
        document.body.innerHTML = '<div id="container"></div>';

        const view = new View([], { container: '#container' });
        const spy = jest.spyOn(view, 'draw');

        window.innerWidth = 512;
        window.dispatchEvent(new Event('resize'));

        jest.runAllTimers();

        expect(spy).toHaveBeenCalled();

        spy.mockRestore();
    });

    it('removes an existing resize handler before adding a new one', () => {
        document.body.innerHTML = '<div id="container"></div>';

        const view = new View([], { container: '#container' });
        const spy = jest.spyOn(window, 'removeEventListener');

        view.responsive = true;

        expect(spy).toHaveBeenCalled();

        spy.mockRestore();
    });

    it('removes an existing click handler before adding a new one', () => {
        document.body.innerHTML = '<div id="container"></div>';

        const view = new View([], { container: '#container' });
        const canvas = view.container.querySelector<HTMLCanvasElement>('canvas');

        if (!canvas) return;

        const spy = jest.spyOn(canvas, 'removeEventListener');

        view.interact = true;

        expect(spy).toHaveBeenCalled();

        spy.mockRestore();
    });

    it('clears the canvas and redraws the waveform when clicking on the waveform', () => {
        document.body.innerHTML = '<div id="container"></div>';

        const view = new View(new Array(800).fill(1), {
            container: '#container',
        });
        const waveContainer = view.container.querySelector<HTMLDivElement>('.waveplayer-waveform-container');

        if (!waveContainer) return;

        const canvas = waveContainer.firstElementChild;

        if (!canvas) return;

        Object.defineProperty(document.body, 'clientWidth', { value: window.innerWidth, configurable: true });
        Object.defineProperty(document.body.querySelector<HTMLDivElement>('#container'), 'clientWidth', {
            value: view.width,
            configurable: true,
        });
        Object.defineProperty(waveContainer, 'clientWidth', { value: view.width, configurable: true });
        Object.defineProperty(canvas, 'clientWidth', { value: view.width, configurable: true });

        const spies = [jest.spyOn(view, 'clear'), jest.spyOn(view as any, 'drawBars')];

        canvas.dispatchEvent(new Event('click'));

        spies.forEach((spy) => {
            expect(spy).toHaveBeenCalled();

            spy.mockRestore();
        });
    });

    it('removes the event handlers and waveform container when destroying a view instance', () => {
        document.body.innerHTML = '<div id="container"></div>';

        const view = new View([], { container: '#container' });
        const canvas = view.container.querySelector<HTMLCanvasElement>('canvas');

        if (!canvas) return;

        const spies = [jest.spyOn(window, 'removeEventListener'), jest.spyOn(canvas, 'removeEventListener')];

        view.destroy();

        const waveContainer = view.container.querySelector<HTMLDivElement>('.waveplayer-waveform-container');

        spies.forEach((spy) => {
            expect(spy).toHaveBeenCalled();

            spy.mockRestore();
        });

        expect(waveContainer).toBe(null);
    });
});
