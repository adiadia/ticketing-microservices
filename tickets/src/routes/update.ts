import express, { Request, Response } from 'express';
import { Ticket } from '../models/ticket';
import { body } from 'express-validator';
import { TicketUpdatedPublisher } from '../events/publishers/ticket-updated-pulisher';
import { natsWrapper } from '../nats-wrapper';
import {
	validateRequest,
	NotFoundError,
	requireAuth,
	NotAuthorizedError,
	BadRequestError,
} from '@sgtickets/common';

const router = express.Router();
router.put(
	'/api/tickets/:id',
	// @ts-ignore
	requireAuth,
	[
		body('title').not().isEmpty().withMessage('Title is required'),
		body('price')
			.isFloat({ gt: 0 })
			.withMessage('Price must be greater than 0'),
	],
	validateRequest,
	async (req: Request, res: Response) => {
		const ticket = await Ticket.findById(req.params.id);

		if (!ticket) {
			throw new NotFoundError();
		}

		if (ticket.orderId) {
			throw new BadRequestError('can not edit a reserved ticket');
		}

		if (req.currentUser?.id !== ticket.userId) {
			throw new NotAuthorizedError();
		}

		ticket.set({
			title: req.body.title,
			price: req.body.price,
		});

		await ticket.save();
		new TicketUpdatedPublisher(natsWrapper.client).publish({
			id: ticket.id,
			price: ticket.price,
			// @ts-ignore
			title: ticket.title,
			userId: ticket.userId,
			version: ticket.version,
		});

		res.send(ticket);
	}
);

export { router as updateTicketRouter };
