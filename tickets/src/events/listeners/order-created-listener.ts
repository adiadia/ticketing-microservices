import {
	Listener,
	OrderCancelledEvent,
	OrderCreatedEvent,
	Subjects,
} from '@sgtickets/common';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../models/ticket';
import { queueGroupName } from './queue-group-name';

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
		msg.ack();
	}
}
