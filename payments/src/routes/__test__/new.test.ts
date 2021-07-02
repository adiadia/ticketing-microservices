import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { OrderStatus } from '@sgtickets/common';
import { Order } from '../../models/order';
import { stripe } from '../../stripe';

it('retuns a 404 when purchasing an order that does not exit', async () => {
	await request(app)
		.post('/api/payments')
		.set('Cookie', global.signin())
		.send({
			token: 'adadfagfadf',
			orderId: new mongoose.Types.ObjectId().toHexString(),
		})
		.expect(404);
});

it('retuns a 401 when purchasing an order that doesnt belong the user ', async () => {
	const order = Order.build({
		id: mongoose.Types.ObjectId().toHexString(),
		userId: new mongoose.Types.ObjectId().toHexString(),
		version: 0,
		price: 20,
		status: OrderStatus.Created,
	});
	await order.save();
	await request(app)
		.post('/api/payments')
		.set('Cookie', global.signin())
		.send({
			token: 'adadfagfadf',
			orderId: order.id,
		})
		.expect(401);
});

it('retuns a 400 when purchasing cancelled order', async () => {
	const userId = new mongoose.Types.ObjectId().toHexString();
	const order = Order.build({
		id: mongoose.Types.ObjectId().toHexString(),
		userId,
		version: 0,
		price: 20,
		status: OrderStatus.Cancelled,
	});
	await order.save();
	await request(app)
		.post('/api/payments')
		.set('Cookie', global.signin(userId))
		.send({
			token: 'adadfagfadf',
			orderId: order.id,
		})
		.expect(400);
});

it('returns a 204 with valid inputs', async () => {
	const userId = new mongoose.Types.ObjectId().toHexString();
	const order = Order.build({
		id: mongoose.Types.ObjectId().toHexString(),
		userId,
		version: 0,
		price: 20,
		status: OrderStatus.Cancelled,
	});
	await order.save();

	await request(app)
		.post('/api/payments')
		.set('Cookie', global.signin(userId))
		.send({
			token: 'tok_visa',
			orderId: order.id,
		})
		.expect(201);
	const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];
	expect(chargeOptions.source).toEqual('tok_visa');
	expect(chargeOptions.amount).toEqual(20 * 100);
	expect(chargeOptions.currency).toEqual('usd');
});
