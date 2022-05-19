import React from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { Remove, Add } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import './RightBar.css';
import Online from './Online';
import {
	addAFriend,
	unfollowAFriend,
	userToken,
	authorizedUser,
	User,
} from '../features/auth/authSlice';

interface RightBarProps {
	user: User;
}

const RightBar = (props: RightBarProps) => {
	const authUser = useAppSelector(authorizedUser);
	const token = useAppSelector(userToken);
	const dispatch = useAppDispatch();

	const handleFollowClick = async (id: string) => {
		const alreadyFriended = authUser.following.find(
			friend => friend._id === id
		);
		if (alreadyFriended && token) {
			dispatch(unfollowAFriend({ id, userId: authUser._id, token }));
		} else {
			if (token) {
				dispatch(addAFriend({ id, userId: authUser._id, token }));
			}
		}
	};

	const ProfileRightBar = () => {
		return (
			<React.Fragment>
				<h4 className='rightbar__title'>User Info</h4>
				<div className='rightbar__info'>
					<div className='rightbar__info--item'>
						<span className='rightbar__info--key'>Age:</span>
						<span className='rightbar__info--value'>
							{(new Date().getFullYear() - props.user.birthYear).toLocaleString(
								'en-US'
							)}
						</span>
					</div>
					<div className='rightbar__info--item'>
						<span className='rightbar__info--key'>City:</span>
						<span className='rightbar__info--value'>
							{props.user.location.city}, {props.user.location.state}
						</span>
					</div>
					<div className='rightbar__info--item'>
						<span className='rightbar__info--key'>From:</span>
						<span className='rightbar__info--value'>Ohio</span>
					</div>
					<div className='rightbar__info--item'>
						<span className='rightbar__info--key'>Relationship Status:</span>
						<span className='rightbar__info--value'>In a relationship</span>
					</div>
				</div>
				<h4 className='rightbar__title'>
					{props.user._id === authUser._id
						? 'Your Friends'
						: `${props.user.firstName}'s friends`}
				</h4>
				<div className='friendsContainer'>
					{props.user.following?.length === 0 ? (
						<div className='rightbar__followings'>
							<p>No friends added yet</p>
						</div>
					) : (
						props.user.following?.map(friend => (
							<div key={friend._id} className='rightbar__followings'>
								<div className='rightbar__following'>
									<Link to={`/${friend._id}/friend/profile`}>
										<img
											src={
												friend.profilePic.startsWith('https')
													? `${friend.profilePic}`
													: `http://localhost:8000/${friend.profilePic}`
											}
											alt={`${friend.firstName}`}
											className='rightbar__following--img'
										/>
									</Link>
									<button
										className='btn btn__follow'
										onClick={handleFollowClick.bind(null, friend._id)}>
										{authUser.following.some(
											person => person._id === friend._id
										)
											? 'Unfollow'
											: 'Follow'}
										{authUser.following.some(
											person => person._id === friend._id
										) ? (
											<Remove />
										) : (
											<Add />
										)}
									</button>
									<span className='rightbar__following--name'>{`${friend.firstName} ${friend.lastName}`}</span>
								</div>
							</div>
						))
					)}
				</div>
				<h4 className='rightbar__title'>Online Friends</h4>
				<ul className='rightbar__friendlist'>
					{props.user.following &&
						props.user.following.map(person => (
							<Online key={person._id} user={person} />
						))}
				</ul>
			</React.Fragment>
		);
	};

	return (
		<div className='rightbar'>
			<div className='rightbar__wrapper'>
				<ProfileRightBar />
			</div>
		</div>
	);
};

export default RightBar;
