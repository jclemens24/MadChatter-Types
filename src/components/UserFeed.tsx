import Posts from './Posts';
import Share from './Share';
import './UserFeed.css';
import { useAppSelector } from '../app/hooks';
import { authorizedUser, User } from '../features/auth/authSlice';

interface UserFeedProps {
	user: User;
}

const UserFeed = (props: UserFeedProps) => {
	const authUser = useAppSelector(authorizedUser);
	const posts = useAppSelector(state => state.post.posts);

	return (
		<div className='feed'>
			<div className='feed__wrapper'>
				{props.user._id === authUser._id && props.user.firstName && (
					<Share user={props.user} />
				)}
				{posts?.map(p => (
					<Posts key={p._id} user={props.user} postId={p._id} />
				))}
			</div>
		</div>
	);
};

export default UserFeed;
