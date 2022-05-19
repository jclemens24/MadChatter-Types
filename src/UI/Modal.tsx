import './Modal.css';
import React from 'react';
import ReactDOM from 'react-dom';
import Backdrop from './Backdrop';
import { CSSTransition } from 'react-transition-group';

interface ModalProps {
	className?: string;
	style?: React.CSSProperties;
	header?: string;
	onSubmit?: (event: React.FormEvent) => Promise<void>;
	contentClass?: string;
	children?: React.ReactNode;
	footer?: JSX.Element;
	footerClass?: string;
	show?: boolean;
	onCancel?: () => void;
}

const ModalOverlay = (props: ModalProps) => {
	const content = (
		<div className={`modal ${props.className}`} style={props.style}>
			<header className={`modal__header ${props.className}`}>
				<h2>{props.header}</h2>
			</header>
			<form
				onSubmit={
					props.onSubmit ? props.onSubmit : event => event.preventDefault()
				}>
				<div className={`modal__content ${props.contentClass}`}>
					{props.children}
				</div>
				<footer className={`modal__footer ${props.footerClass}`}>
					{props.footer}
				</footer>
			</form>
		</div>
	);

	return ReactDOM.createPortal(
		content,
		document.getElementById('modal') as HTMLDivElement
	);
};

export default function Modal(props: ModalProps): JSX.Element {
	const wrapper: React.RefObject<CSSTransition<HTMLElement>> =
		React.createRef();
	return (
		<React.Fragment>
			{props.show && <Backdrop onClick={props.onCancel} />}
			<CSSTransition
				in={props.show}
				mountOnEnter
				unmountOnExit
				timeout={200}
				classNames='modal'
				ref={wrapper}>
				<ModalOverlay {...props} />
			</CSSTransition>
		</React.Fragment>
	);
}
