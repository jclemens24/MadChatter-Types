import {
	createSlice,
	PayloadAction,
	createAsyncThunk,
	ThunkAction,
	AnyAction,
	createSelector,
} from '@reduxjs/toolkit';
import axios from 'axios';
import { RootState } from '../../app/store';
import { postActions, PostState } from '../post/postSlice';

export interface User {
	readonly _id: string;
	firstName: string;
	lastName: string;
	email: string;
	password: string;
	profilePic: string;
	coverPic: string;
	followers: User[];
	following: User[];
	location: {
		coordinates: [number, number];
		city: string;
		state: string;
	};
	photos: string[];
	birthYear: number;
	catchPhrase: string;
}

export type APIResponseData<T> = {
	[K in keyof T]: T[K];
};

export interface AppError {
	errorMessage: string;
}

export interface AuthState {
	user: User;
	token: string | null;
	isLoggedIn: boolean;
	status: 'idle' | 'pending' | 'success' | 'failed';
	errorMessage: string | undefined;
}

const initialAuthState = {
	user: null,
	token: null,
	isLoggedIn: false,
	status: 'idle',
	errorMessage: undefined,
} as unknown as AuthState;

const authSlice = createSlice({
	name: 'auth',
	initialState: initialAuthState,
	reducers: {
		unfollow(state, action: PayloadAction<Pick<User, '_id' | 'following'>>) {
			const { _id } = action.payload;
			const friends = state.user.following.find(friend => friend._id === _id);

			if (friends) {
				state.user.following = state.user.following.filter(
					friend => friend._id !== _id
				);
			}
		},
		follow(state, action) {
			state.user.following.push(action.payload);
		},
		setProfilePic(state, action) {
			state.user.profilePic = action.payload;
		},
		updatePhotos(state, action) {
			state.user.photos.push(...action.payload.photos);
		},
		deleteAPhoto(state, action) {
			state.user.photos = state.user.photos.filter(
				(pic: string) => pic !== action.payload.photo
			);
		},
		updateCoverPic(state, action) {
			state.user.coverPic = action.payload;
		},
		acknowledgeError(state) {
			state.status = 'idle';
		},
		logout() {
			return initialAuthState;
		},
	},
	extraReducers: builder => {
		builder.addCase(initializeUserCheck.fulfilled, (state, action) => {
			state.user = action.payload.data.user;
			state.token = action.payload.token;
			state.isLoggedIn = true;
			state.status = 'success';
			if (state.user === null) {
				return initialAuthState;
			}
		});
		builder.addCase(initializeUserCheck.pending, state => {
			state.status = 'pending';
		});
		builder.addCase(initializeUserCheck.rejected, (state, action) => {
			state.status = 'failed';
			state.errorMessage = action.payload as string;
			state.isLoggedIn = false;
		});
		builder.addCase(login.fulfilled, (state, action) => {
			state.status = 'success';
			state.token = action.payload.token;
			state.user = action.payload.user;
			state.isLoggedIn = true;
		});
		builder.addCase(login.pending, state => {
			state.status = 'pending';
		});
		builder.addCase(login.rejected, (state, action) => {
			state.status = 'failed';
			state.errorMessage = action.payload?.errorMessage;
			state.isLoggedIn = false;
			state.token = null;
		});
		builder.addCase(register.fulfilled, (state, action) => {
			state.status = 'success';
			const { token, user } = action.payload;
			state.token = token;
			state.user = user;
			state.isLoggedIn = true;
		});
		builder.addCase(register.pending, state => {
			state.status = 'pending';
		});
		builder.addCase(register.rejected, (state, action) => {
			state.status = 'failed';
			state.errorMessage = action.payload?.errorMessage;
			state.isLoggedIn = false;
		});
		builder.addCase(addAFriend.fulfilled, (state, action) => {
			state.status = 'success';
			state.user.following.push(action.payload.user);
		});
		builder.addCase(addAFriend.pending, state => {
			state.status = 'pending';
		});
		builder.addCase(addAFriend.rejected, (state, action) => {
			state.status = 'failed';
			state.errorMessage = action.payload?.errorMessage;
		});
		builder.addCase(unfollowAFriend.fulfilled, (state, action) => {
			state.status = 'success';
			state.user.following = state.user.following.filter(
				friend => friend._id !== action.payload.user._id
			);
		});
		builder.addCase(unfollowAFriend.pending, state => {
			state.status = 'pending';
		});
		builder.addCase(unfollowAFriend.rejected, (state, action) => {
			state.status = 'failed';
			state.errorMessage = action.payload?.errorMessage;
		});
	},
});

export const initializeUserCheck = createAsyncThunk(
	'auth/initializeUserCheck',
	async ({ token }: { token: string }, thunkApi) => {
		const res = await axios({
			method: 'GET',
			url: 'http://localhost:8000/api/users',
			headers: { Authorization: `Bearer ${token}` },
		});
		const data = await res.data;
		thunkApi.dispatch(postActions.setPosts({ posts: data.posts }));
		return { data, token };
	}
);

export const login = createAsyncThunk<
	Record<string, any>,
	{ email: string; password: string },
	{ rejectValue: AppError }
>('auth/login', async ({ email, password }, thunkApi) => {
	const controller = new AbortController();
	const res = await axios({
		method: 'POST',
		signal: controller.signal,
		url: `http://localhost:8000/api/users/login`,
		headers: {
			'Content-Type': 'application/json',
		},
		data: {
			email,
			password,
		},
	});
	thunkApi.signal.addEventListener('abort', () => {
		controller.abort();
	});
	const data = (await res.data) as APIResponseData<AuthState> & PostState;
	if (res.data.status === 'error' || res.data.status === 'fail') {
		thunkApi.rejectWithValue(res.data.message);
	}

	localStorage.setItem(
		'user',
		JSON.stringify({ token: data.token, userId: data.user._id })
	);
	thunkApi.dispatch(postActions.setPosts({ posts: data.posts }));
	return data;
});

export const register = createAsyncThunk<
	APIResponseData<AuthState>,
	Partial<User> & {
		passwordConfirm: string;
		city: string;
		state: string;
		zip: number;
	},
	{ rejectValue: AppError }
>('auth/register', async (values, thunkApi) => {
	const res = await axios({
		method: 'POST',
		url: `http://localhost:8000/api/users/signup`,
		headers: {
			'Content-Type': 'application/json',
		},
		data: {
			firstName: values.firstName,
			lastName: values.lastName,
			email: values.email,
			password: values.password,
			passwordConfirm: values.passwordConfirm,
			city: values.city,
			state: values.state,
			zip: values.zip,
			birthYear: values.birthYear,
		},
	});

	const data = (await res.data) as APIResponseData<AuthState>;
	if (res.data.status === 'error' || res.data.status === 'fail') {
		return thunkApi.rejectWithValue(res.data.message);
	}
	localStorage.setItem(
		'user',
		JSON.stringify({ token: data.token, userId: data.user._id })
	);
	return data;
});

export const addAFriend = createAsyncThunk<
	APIResponseData<AuthState>,
	{ id: string; userId: string; token: string },
	{ rejectValue: AppError }
>('auth/addAFriend', async ({ id, userId, token }, thunkApi) => {
	const res = await axios({
		method: 'PATCH',
		url: `http://localhost:8000/api/users/${userId}/friends?follow=1`,
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json',
		},
		data: {
			id,
		},
	});
	const data = (await res.data) as APIResponseData<AuthState>;
	if (res.data.status === 'fail' || res.data.status === 'error') {
		return thunkApi.rejectWithValue(res.data.message);
	}
	return data;
});

export const unfollowAFriend = createAsyncThunk<
	APIResponseData<AuthState>,
	{ id: string; userId: string; token: string },
	{ rejectValue: AppError }
>('auth/unfollowAFriend', async ({ id, userId, token }, thunkApi) => {
	const res = await axios({
		method: 'PATCH',
		url: `http://localhost:8000/api/users/${userId}/friends?unfollow=1`,
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json',
		},
		data: {
			id,
		},
	});
	const data = (await res.data) as APIResponseData<AuthState>;
	if (res.data.status === 'error' || res.data.status === 'fail') {
		return thunkApi.rejectWithValue(res.data.message);
	}
	return data;
});

export const logout = (): ThunkAction<void, RootState, unknown, AnyAction> => {
	return async dispatch => {
		localStorage.removeItem('user');
		dispatch(authActions.logout());
		return;
	};
};

export const authorizedUser = (state: RootState) => state.auth.user;
export const userToken = (state: RootState) => state.auth.token;
export const selectAllFriends = (state: RootState) => state.auth.user.following;
export const authStatus = (state: RootState) => state.auth.status;
export const authError = (state: RootState) => state.auth.errorMessage;
export const selectFriendById = createSelector(
	[selectAllFriends, (state: RootState, userId: string) => userId],
	(friends, userId) => friends.find(friend => friend._id === userId)
);
export const {
	follow,
	unfollow,
	setProfilePic,
	updateCoverPic,
	updatePhotos,
	deleteAPhoto,
	acknowledgeError,
} = authSlice.actions;
export const authActions = authSlice.actions;
export default authSlice.reducer;
