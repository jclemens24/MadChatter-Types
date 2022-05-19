import React from 'react';
import ReactDOM from 'react-dom';
import './Backdrop.css';

interface BackdropProps {
	onClick?: () => void;
}

const Backdrop = (props: BackdropProps): React.ReactPortal => {
	return ReactDOM.createPortal(
		<div id='backdrop' className='backdrop' onClick={props.onClick}></div>,
		document.getElementById('backdrop') as HTMLDivElement
	);
};

export default Backdrop;
