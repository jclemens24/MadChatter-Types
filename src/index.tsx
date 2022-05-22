import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './app/store';
import App from './App';
import { initializeUserCheck } from './features/auth/authSlice';
import './index.css';

const user = JSON.parse(localStorage.getItem('user') as any);
if (user) {
	store.dispatch(initializeUserCheck(user));
}

// store.dispatch(
// 	initializeUserCheck(JSON.parse(localStorage.getItem('user') as string))
// );

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);

root.render(
	<React.StrictMode>
		<Provider store={store}>
			<App />
		</Provider>
	</React.StrictMode>
);
