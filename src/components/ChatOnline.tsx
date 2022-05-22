import React, { useEffect, useState } from 'react';
import { userToken, User } from '../features/auth/authSlice';
import { useAppSelector } from '../app/hooks';
import axios from 'axios';
import './ChatOnline.css';
import { Chat } from '../pages/Messenger';

interface ChatOnlineProps {
	user: User;
	onlineUsers: User['_id'][];
	setCurrentChat: React.Dispatch<Chat | undefined>;
}

export default function ChatOnline(props: ChatOnlineProps) {
	const [friends, setFriends] = useState<User[]>();
	const [onlineFriends, setOnlineFriends] = useState<User[] | null>(null);
	const token = useAppSelector(userToken);

	useEffect(() => {
		setFriends(props.user.following);

		if (friends) {
			setOnlineFriends(
				friends.filter((friend: User) => props.onlineUsers.includes(friend._id))
			);
		}

		return () => {
			setFriends([]);
			setOnlineFriends([]);
		};
	}, [friends, props.onlineUsers, props.user.following]);

	const handleClick = async (friend: User) => {
		try {
			const res = await axios({
				method: 'GET',
				url: `http://localhost:8000/api/conversations/${friend._id}`,
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			const data = await res.data;
			if (res.data.status === 'fail' || res.data.status === 'error') {
				throw new Error(res.data.message);
			}
			props.setCurrentChat(data.conversations);
		} catch (err: unknown) {
			if (typeof err === 'string') {
				console.log(err.toUpperCase());
			} else if (err instanceof Error) {
				console.log(err.message);
			}
		}
	};

	return (
		<div className='chatOnline'>
			{onlineFriends &&
				onlineFriends.map(friend => (
					<div className='chatOnlineFriend' onClick={() => handleClick(friend)}>
						<div className='chatOnlineImgContainer'>
							<img className='chatOnlineImg' src={friend?.profilePic} alt='' />
							<div className='chatOnlineBadge'></div>
						</div>
						<span className='chatOnlineName'>{friend?.firstName}</span>
					</div>
				))}
		</div>
	);
}
