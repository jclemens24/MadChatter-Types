import React, { useEffect, useState, useRef } from 'react';
import './Messenger.css';
import axios from 'axios';
import { useSelector } from 'react-redux';
import Message from '../components/Message';
import Conversation from '../components/Conversation';
import ChatOnline from '../components/ChatOnline';
import { useHttp } from '../hooks/useHttp';
import { userToken, authorizedUser, User } from '../features/auth/authSlice';
import LoadingSpinner from '../UI/LoadingSpinner';
import ErrorModal from '../UI/ErrorModal';
import { io, Socket } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';
import { DoneAll } from '@mui/icons-material';

interface Messages {
	readonly _id: string;
	conversationId: string;
	sender: User['_id'];
	text: string;
	createdAt: number;
}

export interface Chat {
	readonly _id: string;
	members: [User, User];
}

interface ServerToClientEvents {
	noArg: () => void;
	basicEmit: (a: number, b: string, c: Buffer) => void;
	withAck: (d: string, callback: (e: number) => void) => void;
	session: ({
		sessionId,
		userId,
	}: {
		sessionId: string;
		userId: string;
	}) => void;
	privateMessage: (data: Record<string, any>) => void;
	on(ev: string, callback: (...args: any[]) => void): void;
}

interface ClientToServerEvents {
	hello: () => void;
	privateMessage: ({
		to,
		content,
		from,
	}: {
		to: User | undefined;
		content: string;
		from: User;
	}) => void;
}

const Messenger = () => {
	const authUser = useSelector(authorizedUser);
	const token = useSelector(userToken);
	const [conversations, setConversations] = useState<Chat[]>([]);
	const [currentChat, setCurrentChat] = useState<Chat>();
	const [messages, setMessages] = useState<any[]>([]);
	const [newMessage, setNewMessage] = useState('');
	const [arrivalMessage, setArrivalMessage] = useState({});
	const [onlineUsers, setOnlineUsers] = useState([]);
	const { loading, error, sendRequest, clearError } = useHttp();
	const socket = useRef<Socket<ServerToClientEvents, ClientToServerEvents>>();
	const scrollRef = useRef<HTMLDivElement>(null);
	const { _id, firstName } = authUser;

	useEffect(() => {
		socket.current = io(`http://localhost:8000`, {
			auth: {
				_id: _id,
				userId: _id,
				username: firstName,
			},
		});

		socket.current.on('session', ({ sessionId, userId }) => {
			if (socket.current) {
				socket.current.auth = { sessionId };

				localStorage.setItem('sessionId', sessionId);

				socket.current.auth.userId = userId;
			}
		});

		socket.current.on('privateMessage', data => {
			setArrivalMessage({
				sender: data.from,
				text: data.content,
				reciever: data.to,
				createdAt: Date.now(),
			});
			setMessages(prevMessages => {
				return [
					...prevMessages,
					{ sender: data.from, text: data.content, createdAt: Date.now() },
				];
			});
		});
		return () => {
			if (socket.current) {
				socket.current.close();
			}
		};
	}, [token, messages, _id, firstName, authUser, arrivalMessage]);

	useEffect(() => {
		const sessionId = localStorage.getItem('sessionId');

		if (socket.current && sessionId) {
			socket.current.auth = { sessionId };
			socket.current.connect();
		}
	}, []);

	useEffect(() => {
		const getConversations = async () => {
			const res = await sendRequest(
				`http://localhost:8000/api/conversations`,
				'GET',
				{
					Authorization: `Bearer ${token}`,
				}
			);
			setConversations(res.conversations);
		};
		getConversations();
	}, [token, sendRequest]);

	const getCurrentChatroom = async (id: string) => {
		const res = await axios({
			url: `http://localhost:8000/api/messages/${id}`,
			method: 'GET',
			headers: { Authorization: `Bearer ${token}` },
		});
		const data = await res.data;
		setMessages(data.messages);
		setCurrentChat(data.messages[0].conversationId);
		if (scrollRef.current) {
			scrollRef.current.scrollIntoView({ behavior: 'smooth' });
		}
	};

	const handleMessageSubmit = async (event: React.MouseEvent) => {
		event.preventDefault();
		const reciever = currentChat!.members.find(
			member => member._id !== authUser._id
		);
		const message = {
			sender: authUser._id,
			text: newMessage,
			conversationId: currentChat!._id,
			reciever: reciever,
		};

		socket.current!.emit('privateMessage', {
			to: reciever,
			content: newMessage,
			from: authUser,
		});

		const res = await sendRequest(
			`http://localhost:8000/api/messages`,
			'POST',
			{
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			message
		);
		setMessages(prevMessages => {
			return [...prevMessages, res.messages];
		});
		setNewMessage('');
	};

	useEffect(() => {
		scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messages]);

	if (loading) {
		return <LoadingSpinner asOverlay />;
	}

	if (error) {
		return <ErrorModal error={error} onClear={clearError} />;
	}

	return (
		<React.Fragment>
			<div className='messenger'>
				<div className='chatMenu'>
					<div className='chatMenuWrapper'>
						<input
							placeholder='Search for friends'
							className='chatMenuInput'
							type='text'
						/>
						{conversations &&
							conversations.map(conv => (
								<div
									key={conv._id}
									onClick={getCurrentChatroom.bind(null, conv._id)}>
									<Conversation conversation={conv} user={authUser} />
								</div>
							))}
					</div>
				</div>
				<div className='chatBox'>
					<div className='chatBoxWrapper'>
						{currentChat ? (
							<>
								<div className='chatBoxTop'>
									{messages.map(m => (
										<div key={uuidv4()} ref={scrollRef!}>
											<Message
												message={m}
												own={authUser._id === m.sender._id ? true : false}
												picture={m.sender}
											/>
										</div>
									))}
									{messages.every(message => message.read === true) && (
										<DoneAll fontSize='small' />
									)}
								</div>
								<div className='chatBoxBottom'>
									<input
										className='chatMessageInput'
										placeholder='Start Typing...'
										onChange={e => setNewMessage(e.target.value)}
										value={newMessage}></input>
									<button
										className='chatSubmitButton'
										onClick={handleMessageSubmit}>
										Send
									</button>
								</div>
							</>
						) : (
							<span className='noConversationText'>
								Open a conversation to start a chat
							</span>
						)}
					</div>
				</div>
				<div className='chatOnline'>
					<div className='chatOnlineWrapper'>
						<ChatOnline
							onlineUsers={onlineUsers}
							user={authUser}
							setCurrentChat={setCurrentChat}
						/>
					</div>
				</div>
			</div>
		</React.Fragment>
	);
};

export default Messenger;
