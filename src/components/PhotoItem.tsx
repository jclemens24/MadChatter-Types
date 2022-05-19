import { useState } from 'react';
import Card from '../UI/Card';
import './PhotoItem.css';
import { useHttp } from '../hooks/useHttp';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { useParams } from 'react-router-dom';
import {
	authActions,
	userToken,
	authorizedUser,
} from '../features/auth/authSlice';
import LoadingSpinner from '../UI/LoadingSpinner';
import ErrorModal from '../UI/ErrorModal';

interface PhotoItemProps {
	key: string;
	photo: string;
	onClear: () => void;
}

export default function PhotoItem(props: PhotoItemProps) {
	const token = useAppSelector(userToken);
	const authUser = useAppSelector(authorizedUser);
	const dispatch = useAppDispatch();
	const { userId } = useParams();
	const { loading, error, sendRequest, clearError } = useHttp();
	const [pictureOptions, setPictureOptions] = useState(false);

	const handleProfilePictureSubmit = async () => {
		await sendRequest(
			`http://localhost:8000/api/users/${userId}/photos`,
			'PUT',
			{ Authorization: `Bearer ${token}` },
			{ photo: props.photo }
		);
		dispatch(authActions.setProfilePic(props.photo));
		props.onClear();
	};

	const handleCoverPictureSubmit = async () => {
		await sendRequest(
			`http://localhost:8000/api/users/photos/${props.photo}`,
			'PUT',
			{ Authorization: `Bearer ${token}` }
		);
		dispatch(authActions.updateCoverPic(props.photo));
		props.onClear();
	};

	const handlePictureDelete = async () => {
		await sendRequest(
			`http://localhost:8000/api/users/photos/${props.photo}`,
			'PATCH',
			{ Authorization: `Bearer ${token}` }
		);
		dispatch(authActions.deleteAPhoto(props.photo));
		props.onClear();
	};

	const showDropDownHandler = () => {
		setPictureOptions(prevState => {
			return !prevState;
		});
	};

	if (error) {
		return <ErrorModal error={error} onClear={clearError} />;
	}
	return (
		<li className='photo-item'>
			<Card>
				{loading && <LoadingSpinner />}
				<div className='photo-image'>
					<img
						className='images'
						src={`http://localhost:8000/${props.photo}`}
						alt=''
					/>
				</div>
				{authUser._id === userId && (
					<div className='photo-actions'>
						<button
							type='button'
							className='btn photo-actions'
							onClick={showDropDownHandler}>
							Set As...
						</button>
						<div className='dropdown'>
							{pictureOptions && (
								<div style={{ display: 'block' }} className='dropdown-content'>
									<span
										className='dropdown-option'
										onClick={handleProfilePictureSubmit.bind(
											null,
											props.photo
										)}>
										Profile Picture
									</span>
									<span
										className='dropdown-option'
										onClick={handleCoverPictureSubmit.bind(null, props.photo)}>
										Cover Picture
									</span>
								</div>
							)}
						</div>
						<button
							type='button'
							className='btn photo-actions'
							onClick={handlePictureDelete}>
							Delete
						</button>
					</div>
				)}
			</Card>
		</li>
	);
}
