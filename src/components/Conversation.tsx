import React from 'react';
import { User } from '../features/auth/authSlice';
import './Conversation.css';

interface ConversationProps {
	conversation: {
		_id: string;
		members: User[];
	};
	user: User;
}

export default function Conversation(props: ConversationProps) {
	return (
		<>
			{props.conversation.members.map(
				mem =>
					mem._id !== props.user._id && (
						<div key={mem._id} className='conversation'>
							<img
								className='conversationImg'
								src={`http://localhost:8000/${mem.profilePic}`}
								alt={`${mem.firstName} `}
							/>
							<span className='conversationName'>{mem.firstName}</span>
						</div>
					)
			)}
		</>
	);
}
