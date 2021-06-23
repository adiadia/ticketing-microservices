import nats from 'node-nats-streaming';
import { randomBytes } from 'crypto';
import { TicketCreatedPublisher } from './event/ticket-created-publisher';
console.clear();
const stan = nats.connect('ticketing', randomBytes(4).toString('hex'), {
	url: 'http://localhost:4422',
});

stan.on('connect', async () => {
	console.log('Publisher connect to NATS');
	try{const publisher = new TicketCreatedPublisher(stan);
	await publisher.publish({
		id: '123',
		title: "title",
		price: 20
	});
	}
	catch (err) {
		console.error(err);
		
	}
});
