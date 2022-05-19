import React from 'react';
import './TopBar.css';
import { PersonOutlineOutlined } from '@mui/icons-material';
import {
	SearchOutlined,
	NotificationsActiveOutlined,
	ChatOutlined,
	Logout,
} from '@mui/icons-material';
import { NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import { useAppSelector } from '../app/hooks';
import { AnyAction, ThunkDispatch } from '@reduxjs/toolkit';
import { RootState } from '../app/store';

const TopBar = (): JSX.Element => {
	const isLoggedIn = useAppSelector(state => state.auth.isLoggedIn);
	const userId = useAppSelector(state => state.auth.user) ?? null;
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const [searchParams, setSearchParams] = useSearchParams();

	const handleLogout = async () => {
		(dispatch as ThunkDispatch<RootState, unknown, AnyAction>)(logout());
		navigate('/');
	};

	const handleSearchInput = (
		event: React.FormEvent<HTMLInputElement>
	): void => {
		const filter = event.currentTarget.value;
		if (filter) {
			setSearchParams({ filter });
		} else {
			setSearchParams({});
		}
	};

	const handleSearch = async (
		event: React.FormEvent<HTMLFormElement>
	): Promise<void> => {
		event.preventDefault();
		const query = searchParams.get('filter');
	};

	return (
		<div className='topbar__container'>
			<div className='topbar__left'>
				<NavLink to={'/'} style={{ textDecoration: 'none' }}>
					<span className='logo'>Mad Chatter</span>
				</NavLink>
			</div>
			{isLoggedIn && (
				<div className='topbar__center'>
					<form onSubmit={handleSearch}>
						<div className='search'>
							<SearchOutlined className='search__icon'></SearchOutlined>
							<input
								placeholder='Search for friends, posts, or videos'
								className='search__input'
								onChange={handleSearchInput}
								value={searchParams.get('filter') || ''}
							/>
						</div>
					</form>
				</div>
			)}
			{isLoggedIn && (
				<div className='topbar__right'>
					<div className='topbar__links'>
						<NavLink
							className='topbar__link'
							style={({ isActive }) => ({
								textDecoration: isActive ? 'underline' : '',
							})}
							to={`${userId}/profile`}>
							Home
						</NavLink>
						<NavLink
							style={({ isActive }) => ({
								textDecoration: isActive ? 'underline' : '',
							})}
							className='topbar__link'
							to={`/feed`}>
							Timeline
						</NavLink>
					</div>
					<div className='topbar__icons'>
						<div className='topbar__icon--item'>
							<PersonOutlineOutlined />
						</div>
						<div className='topbar__icon--item'>
							<ChatOutlined />
							<span className='topbar__icon--badge'>2</span>
						</div>
						<div className='topbar__icon--item'>
							<NotificationsActiveOutlined />
							<span className='topbar__icon--badge'>1</span>
						</div>
						<div className='topbar__icon--item'>
							<Logout onClick={handleLogout} />
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default TopBar;
