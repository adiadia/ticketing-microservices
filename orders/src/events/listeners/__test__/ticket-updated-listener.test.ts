import { natsWrapper } from '../../../nats-wrapper';
import { TicketUpdatedEvent } from '@sgtickets/common';
import { TicketUpdatedListerner } from '../ticket-updated-listener';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../../models/ticket';

const setup = async () => {
	const listener = new TicketUpdatedListerner(natsWrapper.client);
	const ticket = Ticket.build({
		id: mongoose.Types.ObjectId().toHexString(),
		title: 'movie',
		price: 40,
	});

	await ticket.save();
	const data: TicketUpdatedEvent['data'] = {
		id: ticket.id,
		version: ticket.version + 1,
		title: 'new movie',
		price: 999,
		userId: 'ablskdjf',
	};
	// @ts-ignore
	const msg: Message = {
		ack: jest.fn(),
	};
	return { msg, data, ticket, listener };
};

it('finds, updates, and saves a ticekt', async () => {
	const { msg, data, ticket, listener } = await setup();
	await listener.onMessage(data, msg);
	const updatedTicket = await Ticket.findById(ticket.id);
	expect(updatedTicket!.title).toEqual(data.title);
	expect(updatedTicket!.price).toEqual(data.price);
	expect(updatedTicket!.version).toEqual(data.version);
});

it('acks the message', async () => {
	const { msg, data, listener } = await setup();
	await listener.onMessage(data, msg);
	expect(msg.ack).toHaveBeenCalled();
});

it('does not call ack if the event is in the future', async () => {
	const { msg, data, ticket, listener } = await setup();
	data.version = 10;
	try {
		await listener.onMessage(data, msg);
	} catch (err) {}
	expect(msg.ack).not.toHaveBeenCalled();
});
