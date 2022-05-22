import React, { useEffect } from 'react';
import LeftBar from '../components/LeftBar';
import RightBar from '../components/RightBar';
import FriendUserFeed from '../components/FriendUserFeed';
import './Profile.css';
import { Outlet, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import LoadingSpinner from '../UI/LoadingSpinner';
import ErrorModal from '../UI/ErrorModal';
import {
	friendAction,
	getFriendsProfileData,
} from '../features/friends/friendSlice';
import { userToken } from '../features/auth/authSlice';

const FriendProfile = () => {
	const status = useAppSelector(state => state.friend.status);
	const error = useAppSelector(state => state.friend.error);
	const errorMessage = useAppSelector(state => state.friend.errorMessage);
	const userId = useParams().userId;
	const token = useAppSelector(userToken);
	const dispatch = useAppDispatch();

	useEffect(() => {
		if (token && userId) {
			dispatch(getFriendsProfileData({ token, userId })).unwrap();
		}

		return () => {
			dispatch(friendAction.clearFriendsProfileData());
		};
	}, [userId, token, dispatch]);

	const clearError = () => {
		dispatch(friendAction.acknowledgeError());
	};

	const friendsData = useAppSelector(state => state.friend.friendProfile);

	while (status === 'idle') {
		return <LoadingSpinner asOverlay />;
	}
	if (error) {
		return <ErrorModal error={errorMessage} onClear={clearError} />;
	}

	if (status === 'success') {
		return (
			<React.Fragment>
				<div className='profile'>
					<LeftBar user={friendsData} />
					<div className='profile__right'>
						<div className='profile__top'>
							<div className='profile__cover-pic'>
								<img
									className='profile__cover-image'
									src={`$http://localhost:8000/${friendsData.coverPic}`}
									alt={`${friendsData.firstName} profile`}
								/>
								<img
									className='profile__user-image'
									src={`http://localhost:8000/${friendsData.profilePic}`}
									alt=''
								/>
							</div>
							<div className='profile__info'>
								<h4 className='profile__info--name'>{`${friendsData.firstName} ${friendsData.lastName}`}</h4>
								<span className='profile__info--desc'>
									{friendsData.catchPhrase}
								</span>
							</div>
						</div>
						<div className='profile__right--bottom'>
							<FriendUserFeed user={friendsData} />
							<RightBar user={friendsData} />
						</div>
					</div>
					<Outlet />
				</div>
			</React.Fragment>
		);
	} else {
		return <LoadingSpinner asOverlay />;
	}
};

export default FriendProfile;
