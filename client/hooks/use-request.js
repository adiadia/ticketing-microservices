import axios from 'axios';
import { useState } from 'react';

export default ({ url, method, body, onSuccess }) => {
	const [error, setError] = useState(null);
	const doRequest = async () => {
		try {
			setError(null);
			const response = await axios[method](url, body);
			if (onSuccess) {
				onSuccess(response.data);
			}
			return response.data;
		} catch (err) {
			setError(
				<div className='alert alert-danger'>
					<h4>Opps.....</h4>
					<ul className='my-0'>
						{err?.response?.data?.errors &&
							err.response.data.errors.map((er) => (
								<li key={er.message}>{er.message}</li>
							))}
					</ul>
				</div>
			);
		}
	};

	return { doRequest, error };
};
