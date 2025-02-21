/**
 * Check if a given node contains a certain class name.
 *
 * @param {HTMLElement} element
 * @param {string} className
 * @returns {boolean}
 */
export const hasClass = (element: HTMLElement, className: string): boolean => {
	if (element.classList) {
		return element.classList.contains(className);
	}

	return !!element.className.match(new RegExp(`(\\s|^)${className}(\\s|$)`));
};

/**
 * Add a class name to a given node.
 *
 * @param {HTMLElement} element
 * @param {string} className
 * @returns {HTMLElement}
 */
export const addClass = (
	element: HTMLElement,
	className: string,
): HTMLElement => {
	if (element.classList) {
		element.classList.add(className);
	} else if (!hasClass(element, className)) {
		element.className += ` ${className}`;
	}

	return element;
};

/**
 * Remove a class name from a given node.
 *
 * @param {HTMLElement} element
 * @param {string} className
 * @returns {HTMLElement}
 */
export const removeClass = (
	element: HTMLElement,
	className: string,
): HTMLElement => {
	if (element.classList) {
		element.classList.remove(className);
	} else if (hasClass(element, className)) {
		element.className = element.className.replace(
			new RegExp(`(\\s|^)${className}(\\s|$)`),
			' ',
		);
	}

	return element;
};

/**
 * Toggle between to given classes.
 *
 * @param {HTMLElement} element
 * @param {string} firstClass
 * @param {string} secondClass
 * @returns {void}
 */
export const toggleClass = (
	element: HTMLElement,
	firstClass: string,
	secondClass: string,
): void => {
	if (hasClass(element, firstClass)) {
		addClass(removeClass(element, firstClass), secondClass);
	} else {
		addClass(removeClass(element, secondClass), firstClass);
	}
};
