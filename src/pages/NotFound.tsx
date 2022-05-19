import React from 'react';
import NotFoundImg from '../UI/NotFoundImg';

const NotFound = () => {
	return (
		<div style={{ textAlign: 'center' }} className='not_found'>
			<h1 style={{ paddingTop: '2rem' }}>Page Not Found!</h1>
			<NotFoundImg />
		</div>
	);
};

export default NotFound;
