import React from 'react';
import Backdrop from './Backdrop';
import ReactDOM from 'react-dom';
import './PhotoModal.css';

interface PhotoModalProps {
	show: boolean;
	children: React.ReactNode;
	onClear: () => void;
}

const Overlay = (props: PhotoModalProps) => {
	const content = (
		<div className='wrapper'>
			<button className='modalWrapperBtn' onClick={props.onClear}>
				&times;
			</button>
			<div className='photo--modal'>{props.children}</div>
		</div>
	);
	return ReactDOM.createPortal(
		content,
		document.getElementById('modal') as HTMLDivElement
	);
};

export default function PhotoModal(props: PhotoModalProps) {
	return (
		<React.Fragment>
			{props.show && <Backdrop onClick={props.onClear} />}
			<Overlay {...props} />
		</React.Fragment>
	);
}
