import { body, validationResult } from 'express-validator';
import { RequestValidationError } from '../error/request-validation-error';
import { Request, Response, NextFunction } from 'express';
export const ValidationRequest = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		throw new RequestValidationError(errors.array());
	}
	next();
};
