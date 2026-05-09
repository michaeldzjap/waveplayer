declare class HttpError extends Error {
	status: Readonly<number>;
	constructor(status: number, message: string);
}
export default HttpError;
