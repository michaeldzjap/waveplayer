/**
 * @class
 * @classdesc HTTP error class.
 */
class HttpError extends Error {
    /**
     * The HTTP error status code.
     *
     * @var {number}
     */
    public status: Readonly<number>;

    /**
     * Create a new HTTP error instance.
     *
     * @param {number} status
     * @param {string} message
     */
    constructor(status: number, message: string) {
        super(message);

        this.status = status;
    }
}

export default HttpError;
