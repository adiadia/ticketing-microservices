import { OrderCreatedListener } from '../order-created-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/ticket';
import { OrderCreatedEvent, OrderStatus } from '@sgtickets/common';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';

const setup = async () => {
	const listener = new OrderCreatedListener(natsWrapper.client);

	const ticket = Ticket.build({
		title: 'movie',
		price: 40,
		userId: 'No user id',
	});
	await ticket.save();

	const data: OrderCreatedEvent['data'] = {
		id: mongoose.Types.ObjectId().toHexString(),
		version: 0,
		status: OrderStatus.Created,
		userId: mongoose.Types.ObjectId().toHexString(),
		expiresAt: 'adafd',
		ticket: {
			id: ticket.id,
			price: ticket.price,
		},
	};

	// @ts-ignore
	const msg: Message = {
		ack: jest.fn(),
	};

	return { ticket, data, listener, msg };
};

it('sets the userId of the ticekt', async () => {
	const { listener, ticket, data, msg } = await setup();
	await listener.onMessage(data, msg);
	const updatedTicket = await Ticket.findById(ticket.id);
	expect(updatedTicket!.orderId).toEqual(data.id);
});

it('ack the message', async () => {
	const { listener, data, msg } = await setup();
	await listener.onMessage(data, msg);
	expect(msg.ack).toHaveBeenCalled();
});

it('publishes a ticket updated event', async () => {
	const { listener, ticket, data, msg } = await setup();
	await listener.onMessage(data, msg);
	expect(natsWrapper.client.publish).toHaveBeenCalled();
	const ticketUpdatedData = JSON.parse(
		(natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
	);
	expect(data.id).toEqual(ticketUpdatedData.orderId);
});
