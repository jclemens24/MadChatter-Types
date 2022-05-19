import './UsersNearby.css';
import { AddCircle } from '@mui/icons-material';
import {
	addAFriend,
	userToken,
	authorizedUser,
	User,
} from '../features/auth/authSlice';
import { useAppDispatch, useAppSelector } from '../app/hooks';

interface UsersNearbyProps {
	key: User['_id'];
	user: User;
}

const UsersNearby = (props: UsersNearbyProps) => {
	const token = useAppSelector(userToken);
	const authUser = useAppSelector(authorizedUser);
	const dispatch = useAppDispatch();
	const handleAddFriend = async (id: string) => {
		if (token) {
			dispatch(addAFriend({ id, userId: authUser._id, token }));
		}
	};

	return (
		<li className='friendsNearbyList'>
			<img
				className='friendsNearbyImg'
				src={`http://localhost:8000/${props.user.profilePic}`}
				alt=''
			/>
			<h4>
				{props.user.firstName} {props.user.lastName}
			</h4>
			<AddCircle
				className='add_icon'
				onClick={handleAddFriend.bind(null, props.user._id)}
			/>
		</li>
	);
};

export default UsersNearby;
