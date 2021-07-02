import {
	BadRequestError,
	NotAuthorizedError,
	NotFoundError,
	OrderStatus,
	requireAuth,
	validateRequest,
} from '@sgtickets/common';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { Order } from '../models/order';
import { stripe } from '../stripe';
import { Payment } from '../models/payment';
import { PaymentCreatedPublisher } from '../events/publishers/payment-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.post(
	'/api/payments',
	requireAuth,
	[body('token').not().isEmpty(), body('orderId').not().isEmpty()],
	validateRequest,
	async (req: Request, res: Response) => {
		const { token, orderId } = req.body;
		console.log(token, orderId, 'aditya');
		const order = await Order.findById(orderId);
		if (!order) {
			throw new NotFoundError();
		}

		if (order.userId !== req.currentUser!.id) {
			throw new NotAuthorizedError();
		}

		if (order.status === OrderStatus.Cancelled) {
			throw new BadRequestError('Can not pay for an cancelled order');
		}
		// @ts-ignore
		const charge = await stripe.charges.create({
			currency: 'usd',
			amount: order.price * 100,
			source: token,
			description: 'just for test',
		});

		const payment = Payment.build({
			orderId,
			stripeId: charge.id,
		});

		await payment.save();
		new PaymentCreatedPublisher(natsWrapper.client).publish({
			id: payment.id,
			orderId: payment.orderId,
			stripeId: payment.stripeId,
		});

		res.status(201).send({ id: payment.id });
	}
);

export { router as createChargeRouter };
