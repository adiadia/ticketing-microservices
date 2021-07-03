import { useEffect, useState } from 'react';
import StripeCheckout from 'react-stripe-checkout';
import useRequest from '../../hooks/use-request';
import Router from 'next/router';
const OrderShow = ({ order, currentUser }) => {
	const [timeLeft, setTimeLeft] = useState(0);
	const { doRequest, error } = useRequest({
		url: 'api/payments',
		method: 'post',
		body: {
			orderId: orderId,
		},
		onSuccess: (payment) => Router.push('/orders'),
	});
	useEffect(() => {
		const findTimeLet = () => {
			const msLeft = new Date(order.expiresAt) - new Date();
			setTimeLeft(Math.round(msLeft / 1000));
		};
		findTimeLet();
		const timeId = setInterval(findTimeLet, 1000);
		return () => {
			clearInterval(timeId);
		};
	}, [order]);

	if (timeLeft < 0) {
		return <div> Order Expired</div>;
	}

	return (
		<div>
			{timeLeft} seconds until order expire
			<StripeCheckout
				token={({ id }) => doRequest({ token: id })}
				stripeKey='pk_test_51J8ie8SBKXlb8Zl872dYvUKq8pIxE7D6rXhCAy2lPADAjrFVHwEcRX4XFfQxo0W8KsUVXbak5DaM0f0gwAlUlbvt003DGbvZ6L'
				amount={order.ticker.price * 100}
				email={currentUser.email}
			/>
			{error}
		</div>
	);
};
OrderShow.getInitialProps = async (context, client) => {
	const { orderId } = context.query;
	const { data } = await client.get(`/api/orders/${orderId}`);
	return { order: data };
};
export default OrderShow;
