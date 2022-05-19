import './ErrorModal.css';
import Modal from './Modal';

type ErrorModalProps = {
	onClear: () => void;
	error: string | undefined;
};

const ErrorModal = (props: ErrorModalProps) => {
	return (
		<Modal
			onCancel={props.onClear}
			header='An Error Occurred!'
			show={!!props.error}
			footer={<button onClick={props.onClear}>Okay</button>}>
			<p>{props.error}</p>
		</Modal>
	);
};

export default ErrorModal;
