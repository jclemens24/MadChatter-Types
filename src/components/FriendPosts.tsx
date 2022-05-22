import React, { useEffect, useState, useRef } from 'react';
import { MoreVert, ThumbUp, ThumbDown } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { format } from 'timeago.js';
import ErrorModal from '../UI/ErrorModal';
import PostComments from './PostComments';
import { userToken, authorizedUser } from '../features/auth/authSlice';
import InputEmojiWithRef from 'react-input-emoji';
import {
	commentOnAFriendsPost,
	likeAFriendsPost,
	dislikeAFriendsPost,
	selectFriendPostId,
	friendErrorMessage,
	selectCurrentFriendPost,
	friendError,
	friendAction,
} from '../features/friends/friendSlice';
import './Posts.css';

const FriendPosts = props => {
	const token = useAppSelector(userToken);
	const authUser = useAppSelector(authorizedUser);
	const postId = useAppSelector(state =>
		selectFriendPostId(state, props.postId)
	);
	const post = useAppSelector(state => selectCurrentFriendPost(state, postId));
	const [numOfLikes, setNumOfLikes] = useState(post?.likes.length);
	const [isLiked, setIsLiked] = useState<boolean>();
	const [showDropdown, setShowDropdown] = useState(false);
	const [showCommentDropdown, setShowCommentDropdown] = useState(false);
	const [text, setText] = useState('');
	const error = useAppSelector(friendError);
	const errorMessage = useAppSelector(friendErrorMessage);
	const dispatch = useAppDispatch();
	const postComment = useRef();

	useEffect(() => {
		if (post && post.likes?.some(p => p === authUser._id)) setIsLiked(true);
	}, [post, authUser._id]);

	const clearError = () => {
		dispatch(friendAction.acknowledgeError());
	};

	const friendLikeHandler = async () => {
		if (token) {
			await dispatch(likeAFriendsPost({ token, postId }))
				.unwrap()
				.then(data => {
					setNumOfLikes(data.post.likes.length);
					setIsLiked(true);
				});
		}
	};

	const friendDislikeHandler = async () => {
		if (token) {
			await dispatch(dislikeAFriendsPost({ token, postId }))
				.unwrap()
				.then(data => {
					setNumOfLikes(data.post.likes.length ?? 0);
					setIsLiked(false);
				});
		}
	};

	const handleVertOptions = () => {
		setShowDropdown(prevState => {
			return !prevState;
		});
	};

	const handleCommentClick = () => {
		setShowCommentDropdown(prevState => {
			return !prevState;
		});
	};

	const handleDeletePost = async () => {
		dispatch(friendAction.deletePost(props.postId));
	};

	const handleFriendOnEnter = async (text: string) => {
		setText(text);
		if (token) {
			dispatch(commentOnAFriendsPost({ token, postId, comment: text }));
		}
	};

	if (error && typeof errorMessage === 'string') {
		return <ErrorModal error={errorMessage} onClear={clearError} />;
	}
	return (
		<div className='post'>
			<div className='postWrapper'>
				<div className='postTop'>
					<div className='postTopLeft'>
						<Link
							to={
								props.user._id === authUser._id
									? `/${props.user._id}/profile`
									: `/${props.user._id}/profile/friend`
							}>
							{post && post.fromUser.profilePic && (
								<img
									className='postProfileImg'
									src={`http://localhost:8000/${post.fromUser.profilePic}`}
									alt={`${post.fromUser.firstName}`}
								/>
							)}
						</Link>
						<span className='postUsername'>{`${post!.fromUser.firstName} ${
							post!.fromUser.lastName
						}`}</span>
						<span className='postDate'>{format(post!.createdAt)}</span>
					</div>
					<div className='postTopRight dropdown'>
						<MoreVert
							onClick={handleVertOptions}
							style={{ cursor: 'pointer' }}
							focusable='true'
						/>
						{authUser._id === post!.fromUser._id && showDropdown && (
							<div style={{ display: 'block' }} className='dropdown-content'>
								<span onClick={handleDeletePost} className='dropdown-option'>
									Delete
								</span>
							</div>
						)}
					</div>
				</div>
				<div className='postCenter'>
					<span className='postText'>{post!.desc}</span>
					{post!.image && (
						<img
							className='postImg'
							src={`http://localhost:8000/${post!.image}`}
							alt=''
						/>
					)}
				</div>
				<div className='postBottom'>
					<div className='postBottomLeft'>
						<ThumbUp
							className={isLiked ? `likeIcon liked` : 'likeIcon'}
							onClick={friendLikeHandler}
						/>
						<ThumbDown
							className={!isLiked ? 'likeIcon liked' : 'likeIcon'}
							onClick={friendDislikeHandler}
						/>
						<span className='postLikeCounter'>{numOfLikes} people like it</span>
					</div>
					<div className='postBottomRight'>
						<span onClick={handleCommentClick} className='postCommentText'>
							{typeof post!.comments === 'undefined'
								? '0 comments'
								: `${post!.comments.length} comments`}
						</span>
					</div>
				</div>
			</div>
			{showCommentDropdown && (
				<div style={{ display: 'block' }} className='dropdown-comment'>
					<ul className='comments'>
						{post!.comments?.length === 0 ? (
							<span>Be the first to comment</span>
						) : (
							post!.comments?.map(comment => (
								<PostComments
									comments={{
										_id: comment._id,
										post: comment.post,
										user: comment.user,
										reactions: comment.reactions,
										comment: comment.comment,
										createdAt: comment.createdAt,
										updatedAt: comment.updatedAt,
									}}
									key={comment._id}
								/>
							))
						)}
					</ul>
					<div className='commentActions'>
						<form className='leaveAComment'>
							<InputEmojiWithRef
								placeholder={'Leave a comment...'}
								className='shareInput'
								ref={postComment}
								onEnter={handleFriendOnEnter}
								onChange={setText}
								cleanOnEnter='true'
								value={text}
								fontFamily={'Open Sans'}
							/>
						</form>
					</div>
				</div>
			)}
		</div>
	);
};

export default FriendPosts;
