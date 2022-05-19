import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import counterReducer from '../features/counter/counterSlice';
import authReducer from '../features/auth/authSlice';
import postReducer from '../features/post/postSlice';
import friendReducer from '../features/friends/friendSlice';

export const store = configureStore({
	reducer: {
		counter: counterReducer,
		auth: authReducer,
		post: postReducer,
		friend: friendReducer,
	},
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
	ReturnType,
	RootState,
	unknown,
	Action<string>
>;
