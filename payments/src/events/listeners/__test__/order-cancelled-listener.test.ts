import { Order } from '../../../models/order';
import { natsWrapper } from '../../../nats-wrapper';
import { orderCancelledListerner } from '../order-cancelled-listener';
import mongoose from 'mongoose';
import { OrderCancelledEvent, OrderStatus } from '@sgtickets/common';
import { Message } from 'node-nats-streaming';

const setup = async () => {
	const listener = new orderCancelledListerner(natsWrapper.client);
	const order = await Order.build({
		id: new mongoose.Types.ObjectId().toHexString(),
		price: 20,
		status: OrderStatus.Created,
		userId: new mongoose.Types.ObjectId().toHexString(),
		version: 0,
	});
	await order.save();

	const data: OrderCancelledEvent['data'] = {
		id: order.id,
		version: 1,
		ticket: {
			id: new mongoose.Types.ObjectId().toHexString(),
		},
	};
	// @ts-ignore
	const msg: Message = {
		ack: jest.fn(),
	};
	return { listener, order, data, msg };
};

it('updates the status of the order', async () => {
	const { listener, order, data, msg } = await setup();
	await listener.onMessage(data, msg);
	const updatedOrder = await Order.findById(order.id);
	expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('ack the message', async () => {
	const { listener, order, data, msg } = await setup();
	await listener.onMessage(data, msg);
	expect(msg.ack).toHaveBeenCalled();
});
