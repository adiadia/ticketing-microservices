import { natsWrapper } from '../../../nats-wrapper';
import { OrderCreatedListener } from '../order-created-listener';
import mongoose from 'mongoose';
import { OrderCreatedEvent, OrderStatus } from '@sgtickets/common';
import { Order } from '../../../models/order';

const setup = async () => {
	const listener = new OrderCreatedListener(natsWrapper.client);
	const data: OrderCreatedEvent['data'] = {
		id: new mongoose.Types.ObjectId().toHexString(),
		version: 0,
		expiresAt: 'adffd',
		status: OrderStatus.Created,
		userId: new mongoose.Types.ObjectId().toHexString(),
		ticket: {
			id: new mongoose.Types.ObjectId().toHexString(),
			price: 10,
		},
	};

	//@ts-ignore
	const msg: Message = {
		ack: jest.fn(),
	};

	return { listener, msg, data };
};

it('replicates the order info', async () => {
	const { listener, msg, data } = await setup();
	await listener.onMessage(data, msg);
	const order = await Order.findById(data.id);
	expect(order!.price).toEqual(data.ticket.price);
});

it('acks the message', async () => {
	const { listener, msg, data } = await setup();
	await listener.onMessage(data, msg);
	msg.ack();
	expect(msg.ack).toHaveBeenCalled();
});
