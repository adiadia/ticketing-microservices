import nats from 'node-nats-streaming';
import { TicketCreatedListener } from './event/ticket-created-listener';

console.clear();
const stan = nats.connect('ticketing', '123', {
	url: 'http://localhost:4222',
});

stan.on('connect', () => {
	console.log('Listen connected to NATS');
	stan.on('close', () => {
		console.log('Nats Connection close');
		process.exit();
	});
	new TicketCreatedListener(stan).listen();
});

process.on('SIGINT', () => stan.close());
process.on('SIGTERM', () => stan.close());
