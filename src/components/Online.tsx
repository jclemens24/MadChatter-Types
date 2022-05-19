import React from 'react';
import { User } from '../features/auth/authSlice';
import './Online.css';

interface OnlineProps {
	user: User;
	key: User['_id'];
}

const Online = (props: OnlineProps) => {
	return (
		<li className='rightbarFriend'>
			<div className='rightbarProfileImgContainer'>
				<img
					className='rightbarProfileImg'
					src={`http://localhost:8000/${props.user.profilePic}`}
					alt=''
				/>
				<span className='rightbarOnline'></span>
			</div>
			<span className='rightbarUsername'>{props.user.firstName}</span>
		</li>
	);
};

export default Online;
