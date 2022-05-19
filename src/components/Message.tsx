import './Message.css';
import { format } from 'timeago.js';
import { User } from '../features/auth/authSlice';

interface MessageProps {
	own: boolean;
	message: {
		text: string;
		createdAt: Date;
	};
	picture: User;
}

export default function Message(props: MessageProps) {
	return (
		<div className={props.own ? 'message own' : 'message'}>
			<div className='messageTop'>
				<img
					className='messageImg'
					src={`http://localhost:8000/${props.picture.profilePic}`}
					alt=''
				/>
				<p className='messageText'>{props.message.text}</p>
			</div>
			<div className='messageBottom'>{format(props.message.createdAt)}</div>
		</div>
	);
}
