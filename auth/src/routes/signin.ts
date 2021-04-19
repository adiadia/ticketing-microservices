import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { ValidationRequest } from '../middlewares/validation-request';
import { BadRequestError } from '../error/bad-request-error';
import { User } from '../model/user';
import { Password } from '../service/password';
import jwt from 'jsonwebtoken';
import 'express-async-errors';
const router = express.Router();

router.post(
	'/api/users/signin',
	[
		body('email').isEmail().withMessage('Email must be valid'),
		body('password')
			.trim()
			.isLength({ min: 4, max: 20 })
			.withMessage('Password must be between 4 and 20 length'),
	],
	ValidationRequest,
	async (req: Request, res: Response) => {
		const { email, password } = req.body;
		const existingUser = await User.findOne({ email });
		if (!existingUser) {
			throw new BadRequestError('Invalid credentials');
		}
		const checkPassword = await Password.compare(
			existingUser.password,
			password
		);
		if (!checkPassword) {
			throw new BadRequestError('Invalid credentials');
		}
		const userJwt = jwt.sign(
			{
				id: existingUser.id,
				email: existingUser.email,
			},
			process.env.JWT_KEY!
		);

		req.session = {
			jwt: userJwt,
		};

		res.status(200).send(existingUser);
	}
);

export { router as signinRouter };
