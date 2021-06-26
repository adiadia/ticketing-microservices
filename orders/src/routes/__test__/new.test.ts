import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { Order, OrderStatus } from '../../models/order';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';

it('return error if ticket does not exits', async () => {
	const ticketId = mongoose.Types.ObjectId();
	await request(app)
		.post('/api/orders')
		.set('Cookie', global.signin())
		.send({ ticketId })
		.expect(404);
});

it('return error if ticket already reserved', async () => {
	const ticket = Ticket.build({
		id: mongoose.Types.ObjectId().toHexString(),
		title: 'Movie',
		price: 20,
	});
	await ticket.save();
	const order = Order.build({
		ticket,
		userId: 'adafdatest',
		status: OrderStatus.AwaitingPayment,
		expiresAt: new Date(),
	});
	await order.save();
	await request(app)
		.post('/api/orders')
		.set('Cookie', global.signin())
		.send({ ticketId: ticket.id })
		.expect(400);
});

it('reserved a ticket', async () => {
	const ticket = Ticket.build({
		id: mongoose.Types.ObjectId().toHexString(),
		title: 'Movie',
		price: 20,
	});
	await ticket.save();
	await request(app)
		.post('/api/orders')
		.set('Cookie', global.signin())
		.send({ ticketId: ticket.id })
		.expect(201);
});

it('emits an order created event', async () => {
	const ticket = Ticket.build({
		id: mongoose.Types.ObjectId().toHexString(),
		title: 'Movie',
		price: 20,
	});
	await ticket.save();
	await request(app)
		.post('/api/orders')
		.set('Cookie', global.signin())
		.send({ ticketId: ticket.id })
		.expect(201);
	expect(natsWrapper.client.publish).toHaveBeenCalled();
});
