import { Request, Response, NextFunction } from 'express';
import { NotAuthorizedError } from '../error/not-authorized';
import 'express-async-errors';

export const requireAuth = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	if (!req.currentUser) {
		throw new NotAuthorizedError();
	}
	next();
};
