import { configureStore } from '@reduxjs/toolkit';
import authReducer, { tokenRefreshed, logout } from './authSlice';

export const store = configureStore({
  reducer: { auth: authReducer },
});

window.addEventListener('token-refreshed', (e) => store.dispatch(tokenRefreshed(e.detail)));
window.addEventListener('auth-expired', () => store.dispatch(logout()));
