import React from 'react';
import { format } from 'timeago.js';
import Reactions, { reactionEmoji } from './Reactions';
import { User } from '../features/auth/authSlice';
import { Post } from '../features/post/postSlice';
import './PostComments.css';

export interface Comments {
	comments: {
		readonly _id: string;
		readonly post: Post;
		readonly user: User;
		comment: string;
		createdAt: Date;
		updatedAt: Date;
		reactions: typeof reactionEmoji;
	};
}

export default function PostComments(props: Comments) {
	return (
		<React.Fragment>
			<li className='comment'>
				<div className='message'>
					<h5>
						{props.comments.user.firstName} {props.comments.user.lastName}
					</h5>
					<div className='commentTop'>
						<img
							className='commentImg'
							src={`http://localhost:8000/${props.comments.user.profilePic}`}
							alt=''
						/>
						<p className='commentText'>{props.comments.comment}</p>
					</div>
					<div className='commentBottom'>
						<Reactions
							reactions={props.comments.reactions}
							id={props.comments._id}
						/>
						<div className='commentBottomRight'>
							<span>{format(props.comments.createdAt)}</span>
						</div>
					</div>
				</div>
			</li>
		</React.Fragment>
	);
}
