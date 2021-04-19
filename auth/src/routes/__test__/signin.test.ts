import request from 'supertest';
import { app } from '../../app';

it('fails when a email that does not supply', async () => {
	await request(app)
		.post('/api/users/signin')
		.send({
			email: 'test@test.com',
			password: 'password',
		})
		.expect(400);
});

it('when supply incorrect password', async () => {
	await request(app)
		.post('/api/users/signup')
		.send({
			email: 'test@test.com',
			password: 'password',
		})
		.expect(201);
	await request(app)
		.post('/api/users/signin')
		.send({
			email: 'test@test.com',
			password: 'worngpassword',
		})
		.expect(400);
});

it('when successfully login', async () => {
	await request(app)
		.post('/api/users/signup')
		.send({
			email: 'test@test.com',
			password: 'password',
		})
		.expect(201);
	await request(app)
		.post('/api/users/signin')
		.send({
			email: 'test@test.com',
			password: 'password',
		})
		.expect(200);
});

it('sets a cookie after successfull login', async () => {
	await request(app)
		.post('/api/users/signup')
		.send({
			email: 'test@test.com',
			password: 'password',
		})
		.expect(201);
	const response = await request(app)
		.post('/api/users/signin')
		.send({
			email: 'test@test.com',
			password: 'password',
		})
		.expect(200);
	expect(response.get('Set-Cookie')).toBeDefined();
});
