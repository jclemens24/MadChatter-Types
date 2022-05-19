import './LoadingSpinner.css';
import * as React from 'react';

interface SpinnerProps {
	asOverlay?: boolean;
}

const LoadingSpinner = ({ asOverlay }: SpinnerProps): JSX.Element => {
	return (
		<div
			className={`${asOverlay && 'loading-spinner__overlay'}`}
			style={{ textAlign: 'center' }}>
			<div className='lds-dual-ring'></div>
		</div>
	);
};

export default LoadingSpinner;
