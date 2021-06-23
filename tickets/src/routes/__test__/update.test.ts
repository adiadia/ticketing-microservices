import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';

it('return a 404 if the provided id does not exits', async () => {
	const id = new mongoose.Types.ObjectId().toHexString();
	await request(app)
		.put(`/api/tickets/${id}`)
		.set('Cookie', global.signin())
		.send({
			title: 'Title',
			price: 20,
		})
		.expect(404);
});

it('return a 401 if the user is not authenticated', async () => {
	const id = new mongoose.Types.ObjectId().toHexString();
	await request(app)
		.put(`/api/tickets/${id}`)
		.send({
			title: 'Title',
			price: 20,
		})
		.expect(401);
});

it('return a 401 if the user does not own the ticket', async () => {
	const response = await request(app)
		.post(`/api/tickets`)
		.set('Cookie', global.signin())
		.send({
			title: 'Title',
			price: 20,
		});
	await request(app)
		.put(`/api/tickets/${response.body.id}`)
		.set('Cookie', global.signin())
		.send({
			title: 'Update Title',
			price: 30,
		})
		.expect(401);
});

it('return a 400 if user provide an invalid title or price', async () => {
	const cookie = global.signin();
	const response = await request(app)
		.post(`/api/tickets`)
		.set('Cookie', cookie)
		.send({
			title: 'Title',
			price: 20,
		});

	await request(app)
		.put(`/api/tickets/${response.body.id}`)
		.set('Cookie', cookie)
		.send({
			title: '',
			price: 20,
		})
		.expect(400);

	await request(app)
		.put(`/api/tickets/${response.body.id}`)
		.set('Cookie', cookie)
		.send({
			title: 'Updated Title',
			price: -20,
		})
		.expect(400);
});

it('update the ticket provided valid inputs', async () => {
	const cookie = global.signin();
	const response = await request(app)
		.post(`/api/tickets`)
		.set('Cookie', cookie)
		.send({
			title: 'Title',
			price: 20,
		});
	await request(app)
		.put(`/api/tickets/${response.body.id}`)
		.set('Cookie', cookie)
		.send({
			title: 'Updated Title',
			price: 30,
		})
		.expect(200);

	const ticketResponse = await request(app)
		.get(`/api/tickets/${response.body.id}`)
		.send();

	expect(ticketResponse.body.title).toEqual('Updated Title');
	expect(ticketResponse.body.price).toEqual(30);
});
