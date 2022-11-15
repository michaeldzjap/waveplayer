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
