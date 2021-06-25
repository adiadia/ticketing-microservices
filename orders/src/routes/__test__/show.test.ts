import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';

it('fetches the order', async () => {
	// Create a ticket
	const ticket = Ticket.build({
		title: 'concert',
		price: 20,
	});
	await ticket.save();
	const user = global.signin();

	// make a request to build an order with the ticket
	const { body: order } = await request(app)
		.post('/api/orders')
		.set('Cookie', user)
		.send({ ticketId: ticket.id })
		.expect(201);
	// make request to fetch the order
	const { body: fetchOder } = await request(app)
		.get(`/api/orders/${order.id}`)
		.set('Cookie', user)
		.send()
		.expect(200);

	expect(fetchOder.id).toEqual(order.id);
});

it('return an error if user tried to fetch another user data', async () => {
	// Create a ticket
	const ticket = Ticket.build({
		title: 'concert',
		price: 20,
	});
	await ticket.save();
	const user = global.signin();

	// make a request to build an order with the ticket
	const { body: order } = await request(app)
		.post('/api/orders')
		.set('Cookie', user)
		.send({ ticketId: ticket.id })
		.expect(201);
	// make request to fetch the order
	const { body: fetchOder } = await request(app)
		.get(`/api/orders/${order.id}`)
		.set('Cookie', global.signin())
		.send()
		.expect(401);
});
