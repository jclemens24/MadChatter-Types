import React, { useEffect, useState } from 'react';
import { useHttp } from '../hooks/useHttp';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../app/hooks';
import PhotoItem from '../components/PhotoItem';
import PhotoModal from '../UI/PhotoModal';
import './Photos.css';
import LoadingSpinner from '../UI/LoadingSpinner';
import ErrorModal from '../UI/ErrorModal';
import { userToken, authorizedUser } from '../features/auth/authSlice';

export default function Photos() {
	const { userId } = useParams();
	const navigate = useNavigate();
	const [modalOpen, setModalOpen] = useState(true);
	const [photos, setPhotos] = useState<string[]>([]);
	const token = useAppSelector(userToken);
	const authUser = useAppSelector(authorizedUser);
	const { loading, error, sendRequest, clearError } = useHttp();

	useEffect(() => {
		const fetchPhotos = async () => {
			const res = await sendRequest(
				`http://localhost:8000/api/users/${userId}/photos`,
				'GET',
				{ Authorization: `Bearer ${token}` }
			);
			setPhotos(res.photos.photos);
		};
		fetchPhotos();
	}, [sendRequest, token, userId]);

	const closeModal = () => {
		setModalOpen(prevState => {
			return !prevState;
		});
		navigate(`/${authUser._id}/profile`);
	};

	if (loading) {
		return <LoadingSpinner asOverlay></LoadingSpinner>;
	}

	if (error) {
		return <ErrorModal error={error} onClear={clearError} />;
	}

	return (
		<PhotoModal show={modalOpen} onClear={closeModal}>
			<ul className='photo-list'>
				{photos?.map(pic => (
					<PhotoItem key={pic} photo={pic} onClear={closeModal} />
				))}
			</ul>
		</PhotoModal>
	);
}
