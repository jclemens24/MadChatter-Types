import {
	createSlice,
	createSelector,
	createAsyncThunk,
} from '@reduxjs/toolkit';
import axios from 'axios';
import { RootState } from '../../app/store';
import { User, AppError } from '../auth/authSlice';
import { Post } from '../post/postSlice';

interface FriendState {
	friendProfile: User;
	friendPosts: Post[];
	error: boolean;
	errorMessage: string | undefined | AppError;
	status: 'idle' | 'success' | 'failed' | 'pending';
}

const initialFriendState = {
	friendProfile: null,
	friendPosts: [],
	error: false,
	errorMessage: undefined,
	status: 'idle',
} as unknown as FriendState;

const friendSlice = createSlice({
	name: 'friend',
	initialState: initialFriendState,
	reducers: {
		clearFriendsProfileData() {
			return initialFriendState;
		},
		acknowledgeError(state) {
			state.error = false;
		},
		deleteAPost(state, action) {
			const foundPost = state.friendPosts.find(
				post => post._id === action.payload
			);
			if (foundPost) {
				state.friendPosts = state.friendPosts.filter(
					post => post._id !== foundPost._id
				);
			}
		},
		reactionAdded(state, action) {
			const { _id, reaction } = action.payload;
			const comments = state.friendPosts.flatMap(post => post.comments);
			const foundComment = comments.find(comment => comment._id === _id);
			if (foundComment) {
				foundComment.reactions[reaction]++;
			}
		},
	},
	extraReducers: builder => {
		builder.addCase(getFriendsProfileData.fulfilled, (state, action) => {
			state.status = 'success';
			const { posts, user } = action.payload;
			state.friendPosts = posts;
			state.friendProfile = user;
		});
		builder.addCase(getFriendsProfileData.pending, state => {
			state.status = 'pending';
		});
		builder.addCase(getFriendsProfileData.rejected, (state, action) => {
			state.status = 'failed';
			state.error = true;
			state.errorMessage = action.payload?.errorMessage;
		});
		builder.addCase(likeAFriendsPost.fulfilled, (state, action) => {
			state.status = 'success';
			const { post, user } = action.payload;
			const foundPost = state.friendPosts.find(p => p._id === post._id);
			if (foundPost) {
				foundPost.likes.push(user);
			}
		});
		builder.addCase(likeAFriendsPost.pending, state => {
			state.status = 'pending';
		});
		builder.addCase(likeAFriendsPost.rejected, (state, action) => {
			state.status = 'failed';
			state.error = true;
			state.errorMessage = action.payload?.errorMessage;
		});
		builder.addCase(dislikeAFriendsPost.fulfilled, (state, action) => {
			state.status = 'success';
			const { post, user } = action.payload;
			const foundPost = state.friendPosts.find(p => p._id === post._id);
			if (foundPost) {
				foundPost.likes = foundPost.likes.filter(person => person !== user);
			}
		});
		builder.addCase(dislikeAFriendsPost.pending, state => {
			state.status = 'pending';
		});
		builder.addCase(dislikeAFriendsPost.rejected, (state, action) => {
			state.status = 'failed';
			state.error = true;
			state.errorMessage = action.payload?.errorMessage;
		});
		builder.addCase(commentOnAFriendsPost.fulfilled, (state, action) => {
			state.status = 'success';
			const { comment } = action.payload;
			const foundPost = state.friendPosts.find(
				post => post._id === comment.post
			);
			if (foundPost) {
				foundPost.comments.push(comment);
			}
		});
		builder.addCase(commentOnAFriendsPost.pending, state => {
			state.status = 'pending';
		});
		builder.addCase(commentOnAFriendsPost.rejected, (state, action) => {
			state.status = 'failed';
			state.error = true;
			state.errorMessage = action.payload?.errorMessage;
		});
		builder.addCase(makeAPostOnFriendsWall.fulfilled, (state, action) => {
			state.status = 'success';
			const { post } = action.payload;
			state.friendPosts.push(post);
		});
	},
});

export const getFriendsProfileData = createAsyncThunk<
	Record<string, any>,
	{ token: string; userId: string },
	{ rejectValue: AppError }
>('friend/getFriendsProfileData', async ({ token, userId }, thunkAPI) => {
	const controller = new AbortController();
	const res = await axios({
		method: 'GET',
		url: `${process.env.REACT_APP_BACKEND_URL}/users/${userId}/profile/friends`,
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});
	thunkAPI.signal.addEventListener('abort', () => {
		controller.abort();
		return thunkAPI.rejectWithValue({ errorMessage: 'Request Aborted' });
	});
	const data = await res.data;
	if (res.data.status === 'error' || res.data.status === 'fail') {
		return thunkAPI.rejectWithValue(res.data.message);
	}
	return data;
});

export const likeAFriendsPost = createAsyncThunk<
	Record<string, any>,
	{ token: string; postId: string },
	{ rejectValue: AppError }
>('friend/likeAFriendsPost', async ({ token, postId }, thunkAPI) => {
	const controller = new AbortController();
	const res = await axios({
		method: 'PUT',
		url: `${process.env.REACT_APP_BACKEND_URL}/posts/${postId}/like`,
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});
	thunkAPI.signal.addEventListener('abort', () => {
		controller.abort();
		return thunkAPI.rejectWithValue({ errorMessage: 'Request Aborted!' });
	});
	const data = await res.data;
	if (res.data.status === 'error' || res.data.status === 'fail') {
		return thunkAPI.rejectWithValue(res.data.message);
	}
	return data;
});

export const dislikeAFriendsPost = createAsyncThunk<
	Record<string, any>,
	{ token: string; postId: string },
	{ rejectValue: AppError }
>('friend/dislikeAFriendsPost', async ({ token, postId }, thunkAPI) => {
	const controller = new AbortController();
	const res = await axios({
		method: 'PUT',
		url: `${process.env.REACT_APP_BACKEND_URL}/posts/${postId}/dislike`,
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});
	thunkAPI.signal.addEventListener('abort', () => {
		controller.abort();
		return thunkAPI.rejectWithValue({ errorMessage: 'Request Aborted!' });
	});
	const data = await res.data;
	if (res.data.status === 'error' || res.data.status === 'fail') {
		return thunkAPI.rejectWithValue({ errorMessage: res.data.message });
	}
	return data;
});

export const commentOnAFriendsPost = createAsyncThunk<
	Record<string, any>,
	{ token: string; postId: string; comment: string },
	{ rejectValue: AppError }
>(
	'friend/commentOnAFriendsPost',
	async ({ token, postId, comment }, thunkAPI) => {
		const controller = new AbortController();
		const res = await axios({
			method: 'POST',
			url: `${process.env.REACT_APP_BACKEND_URL}/posts/${postId}/comments`,
			headers: {
				Authorization: `Bearer ${token}`,
			},
			data: {
				comment,
			},
		});
		thunkAPI.signal.addEventListener('abort', () => {
			controller.abort();
			return thunkAPI.rejectWithValue({ errorMessage: 'Request Aborted!' });
		});
		const data = await res.data;
		if (res.data.status === 'error' || res.data.status === 'fail') {
			return thunkAPI.rejectWithValue(res.data.message);
		}
		return data;
	}
);

export const makeAPostOnFriendsWall = createAsyncThunk<
	Record<string, any>,
	{ token: string; formData: FormData },
	{ rejectValue: AppError }
>('friend/makeAPostOnFriendsWall', async ({ token, formData }, thunkAPI) => {
	const res = await axios({
		method: 'POST',
		url: `${process.env.REACT_APP_BACKEND_URL}/posts`,
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		},
		data: formData,
	});
	const data = await res.data;
	if (res.data.status === 'error' || res.data.status === 'fail') {
		return thunkAPI.rejectWithValue(res.data.message);
	}
	return data;
});

export const friendState = (state: RootState) => state.friend.status;
export const friendError = (state: RootState) => state.friend.error;
export const friendErrorMessage = (state: RootState) =>
	state.friend.errorMessage;
export const friend = (state: RootState) => state.friend.friendProfile;
export const friendsPosts = (state: RootState) => state.friend.friendPosts;
export const selectFriendPostId = (state: RootState, postId: Post['_id']) =>
	postId;
export const selectCurrentFriendPost = createSelector(
	[friendsPosts, selectFriendPostId, (state: RootState, postId) => postId],
	(posts, postId) => posts.find(post => post._id === postId)
);
export const selectFriendPostComment = createSelector(
	[
		friendsPosts,
		selectFriendPostId,
		(state: RootState, posts, postId) => postId,
	],
	(posts, postId) =>
		posts.flatMap(p =>
			p.comments.filter(comment => comment.post['_id'] === postId)
		)
);

export const friendAction = friendSlice.actions;
export default friendSlice.reducer;
