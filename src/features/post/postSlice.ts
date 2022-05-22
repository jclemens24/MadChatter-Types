import {
	createSlice,
	createAsyncThunk,
	PayloadAction,
	createSelector,
	ThunkAction,
	AnyAction,
} from '@reduxjs/toolkit';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { User, AppError, APIResponseData } from '../auth/authSlice';
import { reactionEmoji } from '../../components/Reactions';
import { RootState } from '../../app/store';

type Reactions<T> = T extends Record<string, unknown>
	? {
			[K in keyof T]: T[K];
	  }
	: never;

export type ServerData = {
	post: Post;
	user: User['_id'];
	likes?: Post['likes'];
};

export interface Comment {
	readonly _id: string;
	comment: string;
	post: Post;
	user: User;
	reactions: Reactions<typeof reactionEmoji>;
	createdAt: Date;
	updatedAt: Date;
}

export interface Post {
	readonly _id: string;
	desc: string;
	image?: string;
	likes: User['_id'][];
	createdAt: Date;
	updatedAt: Date;
	toUser: User;
	fromUser: User;
	comments: Comment[];
}

export interface PostState {
	posts: Post[];
	status: 'idle' | 'pending' | 'success' | 'failed';
	errorMessage: string | undefined;
	error: boolean;
	timelineFeed: any[];
}

const initialPostState: PostState = {
	posts: [],
	status: 'idle',
	errorMessage: undefined,
	error: false,
	timelineFeed: [],
};

const postSlice = createSlice({
	name: 'post',
	initialState: initialPostState,
	reducers: {
		setPosts(state, action) {
			state.posts.push(...action.payload.posts);
			state.posts.sort(
				(a, b) =>
					new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
			);
		},
		clearPosts() {
			return initialPostState;
		},
		deletePost(state, action: PayloadAction<Partial<Post>>) {
			const { _id } = action.payload;
			state.posts = state.posts.filter(post => post._id !== _id);
		},
		acknowledgeError(state) {
			state.error = false;
			state.errorMessage = '';
		},
		reactionAdded(state, action) {
			const { _id, reaction } = action.payload;
			const comments = state.posts.flatMap(post => post.comments);
			const foundComment = comments.find(comment => comment._id === _id);
			if (foundComment) {
				foundComment.reactions[reaction]++;
			}
		},
	},
	extraReducers: builder => {
		builder.addCase(makeAPost.fulfilled, (state, action) => {
			state.status = 'success';
			state.posts.push(...action.payload.posts);
			state.posts.sort(
				(a, b) =>
					new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
			);
		});
		builder.addCase(makeAPost.pending, state => {
			state.status = 'pending';
		});
		builder.addCase(makeAPost.rejected, (state, action) => {
			state.status = 'failed';
			state.errorMessage = action.payload?.errorMessage;
			state.error = true;
		});
		builder.addCase(likeAPost.fulfilled, (state, action) => {
			state.status = 'success';
			const { post, user } = action.payload;
			const foundPost = state.posts.find(p => p._id === post._id);
			if (foundPost) foundPost.likes.push(user);
		});
		builder.addCase(likeAPost.pending, state => {
			state.status = 'pending';
		});
		builder.addCase(likeAPost.rejected, (state, action) => {
			state.status = 'failed';
			state.errorMessage = action.payload?.errorMessage;
			state.error = true;
		});
		builder.addCase(dislikeAPost.fulfilled, (state, action) => {
			state.status = 'success';
			const { post, user } = action.payload;
			const foundPost = state.posts.find(p => p._id === post._id);
			if (foundPost) {
				foundPost.likes = foundPost.likes.filter(person => person !== user);
			}
		});
		builder.addCase(dislikeAPost.pending, state => {
			state.status = 'pending';
		});
		builder.addCase(dislikeAPost.rejected, (state, action) => {
			state.status = 'failed';
			state.errorMessage = action.payload?.errorMessage;
			state.error = true;
		});
		builder.addCase(commentOnAPost.fulfilled, (state, action) => {
			state.status = 'success';
			const { comment } = action.payload;
			const postId = comment.post;
			const foundPost = state.posts.find(post => post._id === postId);
			if (foundPost) foundPost.comments.push(comment);
		});
		builder.addCase(commentOnAPost.pending, state => {
			state.status = 'pending';
		});
		builder.addCase(commentOnAPost.rejected, (state, action) => {
			state.status = 'failed';
			state.errorMessage = action.payload?.errorMessage;
			state.error = true;
		});
		builder.addCase(getTimelineFeedPosts.fulfilled, (state, action) => {
			state.status = 'success';
			state.timelineFeed.push(...action.payload);
			state.timelineFeed = state.timelineFeed.sort(
				(a, b) =>
					new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
			);
		});
	},
});

export const makeAPost = createAsyncThunk<
	APIResponseData<PostState>,
	{ token: string; formData: FormData },
	{ rejectValue: AppError }
>('post/makeAPost', async ({ token, formData }, thunkApi) => {
	const res: AxiosRequestConfig = await axios({
		method: 'POST',
		url: `http://localhost:8000/api/posts`,
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		},
		data: formData,
	});
	if (res.data.status === 'fail' || res.data.status === 'error') {
		return thunkApi.rejectWithValue({
			errorMessage: await res.data.message,
		} as AppError);
	}
	return (await res.data) as APIResponseData<PostState>;
});

export const likeAPost = createAsyncThunk<
	APIResponseData<ServerData>,
	{ token: string; postId: Post['_id'] },
	{ rejectValue: AppError }
>('post/likeAPost', async ({ token, postId }, thunkApi) => {
	const res = await axios({
		method: 'PUT',
		url: `http://localhost:8000/api/posts/${postId}/like`,
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});
	const data = (await res.data) as APIResponseData<ServerData>;
	if (res.data.status === 'error' || res.data.status === 'fail') {
		return thunkApi.rejectWithValue(res.data.message);
	}
	return data;
});

export const dislikeAPost = createAsyncThunk<
	APIResponseData<ServerData>,
	{ token: string; postId: Post['_id'] },
	{ rejectValue: AppError }
>('post/dislikeAPost', async ({ token, postId }, thunkApi) => {
	const res = await axios({
		method: 'PUT',
		url: `http://localhost:8000/api/posts/${postId}/dislike`,
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});
	const data = (await res.data) as APIResponseData<ServerData>;
	if (res.data.status === 'error' || res.data.status === 'fail') {
		return thunkApi.rejectWithValue(res.data.message);
	}
	return data;
});

export const commentOnAPost = createAsyncThunk<
	Record<string, any>,
	{ token: string; postId: Post['_id']; comment: string },
	{ rejectValue: AppError }
>('post/commentOnAPost', async ({ token, postId, comment }, thunkApi) => {
	const response: Response = await fetch(
		`http://localhost:8000/api/posts/${postId}/comments`,
		{
			method: 'post',
			headers: {
				authorization: `Bearer ${token}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ comment: comment }),
		}
	);

	const data = await response.json();

	if (!response.ok) {
		return thunkApi.rejectWithValue({ errorMessage: data.message });
	}

	return data as Record<string, any>;
});

export const getPostComments = createAsyncThunk<
	APIResponseData<Post>,
	{ token: string; postId: Post['_id'] },
	{ rejectValue: AppError }
>('post/getPostComments', async ({ token, postId }, thunkApi) => {
	const res = await axios({
		method: 'GET',
		url: `http://localhost:8000/api/posts/${postId}/comments`,
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});
	const data = (await res.data) as APIResponseData<Post>;
	if (res.data.status === 'error' || res.data.status === 'fail') {
		return thunkApi.rejectWithValue(res.data.message);
	}
	return data;
});

export const getTimelineFeedPosts = createAsyncThunk(
	'post/getTimelineFeedPosts',
	async ({ token }: { token: string }, thunkApi) => {
		const res = await axios({
			method: 'GET',
			url: `http://localhost:8000/api/posts`,
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});
		const data = await res.data;
		return data;
	}
);

export const postError = (state: RootState) => state.post.error;
export const postErrorMessage = (state: RootState) => state.post.errorMessage;
export const postStatus = (state: RootState) => state.post.status;
export const selectAllPosts = (state: RootState) => state.post.posts;
export const selectPostId = (state: RootState, postId: Post['_id']) => postId;
export const selectPostComments = createSelector(
	[selectAllPosts, selectPostId, (state: RootState, posts, postId) => postId],
	(posts, postId) =>
		posts.flatMap(post =>
			post.comments.filter(comment => comment._id === postId)
		)
);

export const deleteAPost = (
	postId: string
): ThunkAction<void, RootState, unknown, AnyAction> => {
	return async (dispatch, getState) => {
		const postToDelete = async () => {
			const state = getState();
			const res = await axios({
				method: 'DELETE',
				url: `http://localhost:8000/api/posts/${postId}`,
				headers: {
					Authorization: `Bearer ${state.auth.token}`,
				},
			});
			if (res.data.status === 'error' || res.data.status === 'fail') {
				throw new Error(res.data.message);
			}
		};
		try {
			await postToDelete();
			dispatch(postActions.deletePost({ _id: postId }));
		} catch (err: unknown) {
			if (err instanceof Error) {
				throw new Error(err.message);
			}
			if (typeof err === 'string') {
				throw new Error(err);
			}
		}
	};
};

export const postActions = postSlice.actions;
export default postSlice.reducer;
