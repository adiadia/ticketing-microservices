import { Ticket } from '../ticket';

it('implement optimistic concurrency control', async (done) => {
	//@ts-ignore
	const ticket = Ticket.build({
		title: 'concert',
		price: 5,
		userId: '123',
	});
	await ticket.save();

	const firstIntance = await Ticket.findById(ticket.id);
	const secondInstance = await Ticket.findById(ticket.id);

	firstIntance!.set({ price: 10 });
	secondInstance!.set({ price: 10 });

	await firstIntance!.save();
	try {
		await secondInstance!.save();
	} catch (err) {
		return done();
	}
	throw new Error('Should not reach this point');
});

it('increments the version number on multiple saves', async () => {
	const ticket = Ticket.build({
		title: 'concert',
		price: 123,
		userId: '123',
	});
	await ticket.save();
	expect(ticket.version).toEqual(0);
	await ticket.save();
	expect(ticket.version).toEqual(1);
});
