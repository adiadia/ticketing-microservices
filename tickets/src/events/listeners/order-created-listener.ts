import {
	Listener,
	OrderCancelledEvent,
	OrderCreatedEvent,
	Subjects,
} from '@sgtickets/common';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../models/ticket';
import { queueGroupName } from './queue-group-name';
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-pulisher';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
	subject: Subjects.OrderCreated = Subjects.OrderCreated;
	queueGroupName = queueGroupName;

	async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
		const ticket = await Ticket.findById(data.ticket.id);
		if (!ticket) {
			throw new Error('Ticket not found');
		}

		ticket.set({ orderId: data.id });
		await ticket.save();
		await new TicketUpdatedPublisher(this.client).publish({
			id: ticket.id,
			price: ticket.price,
			//@ts-ignore
			title: ticket.title,
			userId: ticket.userId,
			orderId: ticket.orderId,
			version: ticket.version,
		});

		msg.ack();
	}
}
