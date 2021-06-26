import {
	Listener,
	OrderCancelledEvent,
	OrderCreatedEvent,
	Subjects,
} from '@sgtickets/common';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../models/ticket';
import { queueGroupName } from './listeners/queue-group-name';
import { TicketUpdatedPublisher } from './publishers/ticket-updated-pulisher';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
	subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
	queueGroupName = queueGroupName;

	async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
		const ticket = await Ticket.findById(data.ticket.id);
		if (!ticket) {
			throw new Error('Ticket not found');
		}
		ticket.set({ orderId: undefined });
		await ticket.save();
		await new TicketUpdatedPublisher(this.client).publish({
			id: ticket.id,
			orderId: ticket.orderId,
			userId: ticket.userId,
			// @ts-ignore
			title: ticket.title,
			price: ticket.price,
			version: ticket.version,
		});
		msg.ack();
	}
}
