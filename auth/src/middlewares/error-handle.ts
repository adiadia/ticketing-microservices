import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../error/custom-error';
export const errorHandle = (
	err: Error,
	req: Request,
	res: Response,
	next: NextFunction
) => {
	if (err instanceof CustomError) {
		return res.status(err.statusCode).send({ errors: err.serializeErrors() });
	}

	res.status(400).send({
		message: 'Invalid request',
	});
};
