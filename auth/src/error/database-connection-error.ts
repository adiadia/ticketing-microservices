import { CustomError } from './custom-error';
export class DatabaseConnectionError extends CustomError {
	statusCode = 500;
	reson = 'Error connecting to database';
	constructor() {
		super('Error connecting to db');
		Object.setPrototypeOf(this, DatabaseConnectionError.prototype);
	}
	serializeErrors() {
		return [{ message: this.reson }];
	}
}
