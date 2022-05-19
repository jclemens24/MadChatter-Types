import './NotFoundImg.css';
import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const NotFoundImg = () => {
	const isActive = useRef<boolean>();

	useEffect(() => {
		isActive.current = true;

		return () => {
			isActive.current = false;
		};
	}, []);
	const navigate = useNavigate();

	const handleOnClick = (): void => {
		navigate('/');
	};
	return (
		<React.Fragment>
			<button className='not_found_btn' onClick={handleOnClick} type='button'>
				Go Back Home
			</button>
			{isActive && (
				<img
					src='http://localhost:8000/page_not_found.png'
					alt='resource not found'
				/>
			)}
		</React.Fragment>
	);
};

export default NotFoundImg;
