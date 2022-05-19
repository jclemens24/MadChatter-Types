import './Reactions.css';
import { useAppDispatch } from '../app/hooks';
import { friendAction } from '../features/friends/friendSlice';
import { postActions } from '../features/post/postSlice';

export const reactionEmoji = {
	thumbsUp: '👍',
	heart: '💖',
	rocket: '🚀',
	eyes: '👀',
	lol: '😂',
	hooray: '🎉',
	angryFace: '😡',
	sadFace: '😢',
} as const;

interface Reaction {
	reactions: typeof reactionEmoji;
	id: string;
}

export default function Reactions(props: Reaction) {
	const dispatch = useAppDispatch();

	const reactionButtons: JSX.Element[] = Object.entries(reactionEmoji).map(
		([key, value]) => {
			return (
				<button
					key={key}
					type='button'
					className='reaction-button'
					onClick={() =>
						dispatch(
							postActions.reactionAdded({
								_id: props.id,
								reaction: key,
							})
						) &&
						dispatch(
							friendAction.reactionAdded({
								_id: props.id,
								reaction: key,
							})
						)
					}>
					{value} {props.reactions[key]}
				</button>
			);
		}
	);
	return <div>{reactionButtons}</div>;
}
