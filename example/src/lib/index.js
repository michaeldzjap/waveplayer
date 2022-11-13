/**
 * Check if a given node contains a certain class name.
 *
 * @param  {node} node
 * @param  {string} className
 * @returns {boolean}
 */
export const hasClass = (node, className) => {
    if (node.classList) {
        return node.classList.contains(className);
    }

    return !!node.className.match(new RegExp(`(\\s|^)${className}(\\s|$)`));
};

/**
 * Add a class name to a given node.
 *
 * @param  {node} node
 * @param  {string} className
 * @returns {node}
 */
export const addClass = (node, className) => {
    if (node.classList) {
        node.classList.add(className);
    } else if (!hasClass(node, className)) {
        node.className += ` ${className}`;
    }

    return node;
};

/**
 * Remove a class name from a given node.
 *
 * @param  {node} node
 * @param  {string} className
 * @returns {node}
 */
export const removeClass = (node, className) => {
    if (node.classList) {
        node.classList.remove(className);
    } else if (hasClass(node, className)) {
        node.className = node.className.replace(new RegExp(`(\\s|^)${className}(\\s|$)`), ' ');
    }

    return node;
};

/**
 * Toggle between to given classes.
 *
 * @param  {node} node
 * @param  {string} firstClass
 * @param  {string} secondClass
 * @returns {void}
 */
export const toggleClass = (node, firstClass, secondClass) => {
    if (hasClass(node, firstClass)) {
        addClass(removeClass(node, firstClass), secondClass);
    } else {
        addClass(removeClass(node, secondClass), firstClass);
    }
};
