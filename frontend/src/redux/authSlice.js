import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authApi } from '../api/endpoints';
import { setAccessToken } from '../api/client';

const initialState = {
  user: null,
  accessToken: null,
  status: 'idle',
  error: null,
};

export const login = createAsyncThunk('auth/login', async (creds) => {
  const data = await authApi.login(creds);
  return data;
});

export const register = createAsyncThunk('auth/register', async (body) => {
  const data = await authApi.register(body);
  return data;
});

export const bootstrapAuth = createAsyncThunk('auth/bootstrap', async (_, { rejectWithValue }) => {
  try {
    const { accessToken } = await authApi.refresh();
    setAccessToken(accessToken);
    const { user } = await authApi.me();
    return { user, accessToken };
  } catch (e) {
    return rejectWithValue('no session');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    tokenRefreshed(state, action) { state.accessToken = action.payload; },
    logout(state) {
      state.user = null;
      state.accessToken = null;
      state.status = 'idle';
      setAccessToken(null);
    },
  },
  extraReducers: (b) => {
    const onAuthed = (state, action) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.status = 'authenticated';
      state.error = null;
      setAccessToken(action.payload.accessToken);
    };
    b.addCase(login.pending, (s) => { s.status = 'loading'; s.error = null; });
    b.addCase(login.fulfilled, onAuthed);
    b.addCase(login.rejected, (s) => { s.status = 'error'; s.error = 'Invalid email or password'; });
    b.addCase(register.pending, (s) => { s.status = 'loading'; s.error = null; });
    b.addCase(register.fulfilled, onAuthed);
    b.addCase(register.rejected, (s) => { s.status = 'error'; s.error = 'Could not create account'; });
    b.addCase(bootstrapAuth.fulfilled, onAuthed);
    b.addCase(bootstrapAuth.rejected, (s) => { s.status = 'idle'; });
  },
});

export const { tokenRefreshed, logout } = authSlice.actions;
export const selectAuth = (s) => s.auth;
export const selectIsAuthenticated = (s) => s.auth.status === 'authenticated';
export default authSlice.reducer;
