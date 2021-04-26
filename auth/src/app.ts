import express from 'express';
import { json } from 'body-parser';
import { currentuserRouter } from './routes/current-user';
import { signinRouter } from './routes/signin';
import { signupRouter } from './routes/signup';
import { signoutRouter } from './routes/signout';
import { errorHandle } from './middlewares/error-handle';
import { NotFound } from './error/not-found';
import 'express-async-errors';
import cookieSession from 'cookie-session';
const cors = require('cors');

const app = express();
app.set('trust proxy', true);
app.use(cors({ origin: '*' }));
app.use(json());
app.use(
	cookieSession({
		signed: false,
		secure: process.env.NODE_ENV !== 'test',
	})
);
app.use(currentuserRouter);
app.use(signinRouter);
app.use(signupRouter);
app.use(signoutRouter);

app.all('*', async () => {
	throw new NotFound();
});
app.use(errorHandle);

export { app };
