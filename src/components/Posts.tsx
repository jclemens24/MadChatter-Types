import React, { useEffect, useState, useRef } from 'react';
import { MoreVert, ThumbUp, ThumbDown } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { format } from 'timeago.js';
import ErrorModal from '../UI/ErrorModal';
import PostComments from './PostComments';
import { userToken, authorizedUser, User } from '../features/auth/authSlice';
import {
	postActions,
	deleteAPost,
	postError,
	postErrorMessage,
	selectPostId,
	commentOnAPost,
} from '../features/post/postSlice';
import InputEmojiWithRef from 'react-input-emoji';
import { likeAPost, dislikeAPost, Post } from '../features/post/postSlice';
import './Posts.css';

interface PostProps {
	user: User;
	key: Post['_id'];
	postId: Post['_id'];
}

const Posts = (props: PostProps) => {
	const post = useAppSelector(state =>
		state.post.posts.find(p => p._id === props.postId)
	);
	const [numOfLikes, setNumOfLikes] = useState(post?.likes.length);
	const [isLiked, setIsLiked] = useState<boolean | null>(null);
	const [showDropdown, setShowDropdown] = useState(false);
	const [showCommentDropdown, setShowCommentDropdown] = useState(false);
	const [text, setText] = useState<string>('');
	const token = useAppSelector(userToken);
	const authUser = useAppSelector(authorizedUser);
	const postId = useAppSelector(state => selectPostId(state, props.postId));
	const error = useAppSelector(postError);
	const errorMessage = useAppSelector(postErrorMessage);
	const dispatch = useAppDispatch();
	const postComment = useRef();

	useEffect(() => {
		if (post) {
			setNumOfLikes(post.likes.length);
		}
	}, [post, post?.likes]);

	useEffect(() => {
		if (post) {
			post.likes.some(person => person === authUser._id)
				? setIsLiked(true)
				: setIsLiked(false);
		}
	}, [post, authUser._id]);

	const clearError = () => {
		dispatch(postActions.acknowledgeError());
	};

	const likeHandler = async () => {
		if (token) {
			await dispatch(likeAPost({ token, postId: postId }))
				.unwrap()
				.then(data => {
					setIsLiked(true);
					if (data.likes) {
						setNumOfLikes(data.likes.length);
					}
					setNumOfLikes(prevState => {
						return prevState === undefined ? 0 : prevState++;
					});
				});
		}
	};

	const dislikeHandler = async () => {
		if (token) {
			await dispatch(dislikeAPost({ token, postId: postId }))
				.unwrap()
				.then(data => {
					setIsLiked(false);
					if (data.likes) {
						setNumOfLikes(data.likes.length);
					}
					setNumOfLikes(prevState => {
						return prevState === undefined ? 0 : prevState--;
					});
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
		dispatch(deleteAPost(postId));
	};

	const handleOnEnter = async (text: string) => {
		if (token) {
			setText(text);
			dispatch(
				commentOnAPost({
					token,
					postId,
					comment: text,
				})
			)
				.unwrap()
				.then(() => {
					setText('');
				});
		}
	};

	if (error && errorMessage) {
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
						{authUser._id === props.user._id && showDropdown && (
							<div style={{ display: 'block' }} className='dropdown-content'>
								<span onClick={handleDeletePost} className='dropdown-option'>
									Delete
								</span>
							</div>
						)}
					</div>
				</div>
				<div className='postCenter'>
					<span className='postText'>{post?.desc}</span>
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
							onClick={likeHandler}
						/>
						<ThumbDown
							className={!isLiked ? 'likeIcon liked' : 'likeIcon'}
							onClick={dislikeHandler}
						/>
						<span className='postLikeCounter'>{numOfLikes} people like it</span>
					</div>
					<div className='postBottomRight'>
						<span onClick={handleCommentClick} className='postCommentText'>
							{post!.comments?.length === 0
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
							post!.comments.map(comment => (
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
								onEnter={handleOnEnter}
								onChange={setText}
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

export default Posts;
