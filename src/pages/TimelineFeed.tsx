import React, { useEffect, useState } from 'react';
import Feed from '../components/Feed';
import Share from '../components/Share';
import './TimelineFeed.css';
import { useAppSelector } from '../app/hooks';
import { useHttp } from '../hooks/useHttp';
import LoadingSpinner from '../UI/LoadingSpinner';
import ErrorModal from '../UI/ErrorModal';
import { userToken, authorizedUser } from '../features/auth/authSlice';
import { Post } from '../features/post/postSlice';

const TimelineFeed = () => {
	const token = useAppSelector(userToken);
	const authUser = useAppSelector(authorizedUser);
	const [allPosts, setAllPosts] = useState<Post[]>([]);
	const { loading, error, sendRequest, clearError } = useHttp();

	useEffect(() => {
		const fetchAllPosts = async () => {
			const res = await sendRequest(`http://localhost:8000/api/posts`, 'GET', {
				Authorization: `Bearer ${token}`,
			});
			setAllPosts(
				res.posts.sort(
					(a: Post, b: Post) =>
						new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
				)
			);
		};
		fetchAllPosts();
	}, [sendRequest, token]);

	useEffect(() => {
		const storage = JSON.parse(localStorage.getItem('feed') as string);
		if (storage) setAllPosts(storage);
	}, []);

	if (loading) {
		return <LoadingSpinner asOverlay />;
	}
	if (error) {
		return <ErrorModal error={error} onClear={clearError} />;
	}
	return (
		<React.Fragment>
			<div className='timeline__feed'>
				<div className='timeline__feed__wrapper'>
					{authUser._id && authUser.firstName && <Share user={authUser} />}
					{allPosts?.map(p => (
						<Feed key={p._id} post={p} user={p.toUser} />
					))}
				</div>
			</div>
		</React.Fragment>
	);
};

export default TimelineFeed;
