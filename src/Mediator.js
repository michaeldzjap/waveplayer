class Mediator {

    /**
     * The topics to subscribe to.
     *
     * @var {Object}
     */
    _topics;

    constructor() {
        this._topics = {};
    }

    /**
     * Subscribe to the given topic with the given callback.
     *
     * @param  {string} topic
     * @param  {Function} callback
     * @returns {boolean}
     */
    on(topic, callback) {
        if (!this._topics.hasOwnProperty(topic)) {
            this._topics[topic] = [];
        }
        this._topics[topic].push(callback);

        return true;
    }

    /**
     * Unsubscibe the given callback from the given topic.
     *
     * @param  {string} topic
     * @param  {Function} callback
     * @returns {boolean}
     */
    un(topic, callback = null) {
        // If the topic does not exist, return early
        if (!this._topics.hasOwnProperty(topic)) {
            return false;
        }

        // If a callback is provided, unsubscribe it, but keep the topic and any
        // other callbacks currently registered
        if (callback) {
            for (let i = 0; i < this._topics[topic].length; i++) {
                if (this._topics[topic][i] === callback) {
                    this._topics[topic].splice(i, 1);
                    return true;
                }
            }

            // A callback was provided, but was not previously registered
            return false;
        }

        // Delete the whole topic
        delete this._topics[topic];

        return true;
    }

    /**
     * Unsubscribe from all topic.
     *
     * @returns {void}
     */
    unAll() {
        this._topics = null;
    }

    /**
     * Fire an event and evaluate any registered callbacks in response.
     *
     * @param  {string} topic
     * @param  {mixed} args
     * @returns {boolean}
     */
    fire(topic, ...args) {
        if (!this._topics.hasOwnProperty(topic)) {
            return false;
        }

        for (let i = 0; i < this._topics[topic].length; i++) {
            this._topics[topic][i].apply(null, args);
        }

        return true;
    }

}

export default Mediator;
