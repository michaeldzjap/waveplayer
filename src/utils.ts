/**
 * Set the CSS styles for the given element.
 *
 * @param {HTMLElement} element
 * @param {Object} styles
 * @returns {HTMLElement}
 */
export const style = (element: HTMLElement, styles: { [name: string]: string }) => {
    for (const key in styles) {
        if (element.style.getPropertyValue(key) !== styles[key]) {
            element.style.setProperty(key, styles[key]);
        }
    }

    return element;
};

/**
 * Compute the average of a range of absolute values.
 *
 * @param {number[]} values
 * @param {number} start
 * @param {number} end
 */
export const average = (values: number[], start: number, end: number): number => {
    let sum = 0;

    for (let i = Math.min(start, end); i < Math.max(start, end); i++) {
        sum += Math.abs(values[i]);
    }

    return sum / Math.abs(start - end);
};
