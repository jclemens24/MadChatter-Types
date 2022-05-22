import { useState, useCallback } from 'react';
import axios from 'axios';

export const useHttp = () => {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const sendRequest = useCallback(
		async (
			url: string,
			method = 'GET',
			headers = {},
			body: Record<string, unknown> | null | FormData = null
		) => {
			try {
				setLoading(true);
				const res = await axios({
					method: method,
					url: url,
					headers: headers,
					data: body,
				});

				const data = await res.data;
				if (res.data.status === 'fail' || res.data.status === 'error') {
					throw new Error(
						res.data.message ||
							'Something went wrong. Please try your request again'
					);
				}
				setLoading(false);
				return data;
			} catch (err: unknown) {
				setLoading(false);
			}
		},
		[]
	);

	const clearError = () => {
		setError(null);
	};

	return { loading, error, sendRequest, clearError };
};
