import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import TopBar from './components/TopBar';
import LoadingSpinner from './UI/LoadingSpinner';

const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const Profile = React.lazy(() => import('./pages/Profile'));
const Photos = React.lazy(() => import('./pages/Photos'));
const Messenger = React.lazy(() => import('./pages/Messenger'));
const FriendProfile = React.lazy(() => import('./pages/FriendProfile'));
const TimelineFeed = React.lazy(() => import('./pages/TimelineFeed'));
const NotFound = React.lazy(() => import('./pages/NotFound'));

function App() {
	const [loginMode, setLoginMode] = useState<boolean>(false);

	const switchLoginMode = () => {
		setLoginMode(prevState => {
			return !prevState;
		});
	};
	return (
		<div className='App'>
			<BrowserRouter>
				<TopBar />
				<Routes>
					<Route
						path='/'
						element={
							loginMode ? (
								<React.Suspense fallback={<LoadingSpinner></LoadingSpinner>}>
									<Login onSwitch={switchLoginMode} />
								</React.Suspense>
							) : (
								<React.Suspense fallback={<LoadingSpinner></LoadingSpinner>}>
									<Register onSwitch={switchLoginMode} />
								</React.Suspense>
							)
						}
					/>
					<Route
						path='/:userId/profile'
						element={
							<React.Suspense fallback={<LoadingSpinner></LoadingSpinner>}>
								<Profile />
							</React.Suspense>
						}>
						<Route
							path='photos'
							element={
								<React.Suspense fallback={<LoadingSpinner></LoadingSpinner>}>
									<Photos />
								</React.Suspense>
							}
						/>
					</Route>
					<Route
						path='/:userId/friend/profile'
						element={
							<React.Suspense fallback={<LoadingSpinner />}>
								<FriendProfile />
							</React.Suspense>
						}>
						<Route
							path='photos'
							element={
								<React.Suspense fallback={<LoadingSpinner />}>
									<Photos />
								</React.Suspense>
							}
						/>
					</Route>
					<Route
						path='/messenger'
						element={
							<React.Suspense fallback={<LoadingSpinner></LoadingSpinner>}>
								<Messenger />
							</React.Suspense>
						}
					/>

					<Route
						path='/feed'
						element={
							<React.Suspense fallback={<LoadingSpinner></LoadingSpinner>}>
								<TimelineFeed />
							</React.Suspense>
						}
					/>
					<Route
						path='*'
						element={
							<React.Suspense fallback={<LoadingSpinner></LoadingSpinner>}>
								{' '}
								<NotFound />
							</React.Suspense>
						}
					/>
				</Routes>
			</BrowserRouter>
		</div>
	);
}

export default App;
