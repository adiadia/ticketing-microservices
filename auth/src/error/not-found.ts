import { CustomError } from './custom-error';

export class NotFound extends CustomError {
	statusCode = 404;
	constructor() {
		super('Route Not found');
		Object.setPrototypeOf(this, NotFound.prototype);
	}

	serializeErrors() {
		return [{ message: 'Not Found' }];
	}
}
