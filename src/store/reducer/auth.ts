// store/reducer/auth.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, AuthState, AccountDetails, Token, UserResponse } from '@/api/types';
import Cookies from 'js-cookie';

const initialState: AuthState = {
  user: null,
  accessToken: null,
  userTypeToken: null, // Corresponds to user_info_token in sample response
  subscription: null,
  isAuthenticated: false
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthData(state) {
      state.user = null;
      state.accessToken = null;
      state.subscription = null;
      state.isAuthenticated = false

      // Clear cookies
      Cookies.remove('token');
      Cookies.remove('userType');
      localStorage.removeItem('token');
      localStorage.removeItem('userToken');
      localStorage.removeItem('accountId');
    },
    setUser(state, action: PayloadAction<UserResponse | null>) {
      const userPayload = action.payload;
      if (userPayload?.account_details) {

        localStorage.setItem('accountId', userPayload.account_details.id.toString());

        // Store user type in cookie for middleware access
        const userType = userPayload.account_details.account_type_access || 'INDIVIDUAL';
        Cookies.set('userType', userType, {
          expires: 100, // 100 days
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        });
      } else if (!userPayload) {
        // If payload is null, clear relevant storage
        localStorage.removeItem('accountId');
        Cookies.remove('userType');
      }

      state.user = userPayload;
      state.isAuthenticated = !!userPayload;
    },
    setAccessToken(state, action: PayloadAction<string | null>) {
      state.accessToken = action.payload;

      // Set token in both cookie and localStorage
      if (action.payload) {
        Cookies.set('token', action.payload, {
          expires: 100, // 100 days
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        });
        localStorage.setItem('token', action.payload);
      } else {
        Cookies.remove('token');
        localStorage.removeItem('token');
      }
    },
    setUserTypeToken(state, action: PayloadAction<string | null>) {
      state.userTypeToken = action.payload;

      // Set token in both cookie and localStorage
      if (action.payload) {
        Cookies.set('userToken', action.payload, {
          expires: 100, // 100 days
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        });
        localStorage.setItem('userToken', action.payload);
      } else {
        Cookies.remove('userToken');
        localStorage.removeItem('userToken');
      }
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;

      // Clear cookies and localStorage
      Cookies.remove('token');
      Cookies.remove('userType');
      Cookies.remove('userToken');
      localStorage.removeItem('token');
      localStorage.removeItem('userToken');
      localStorage.removeItem('accountId');
    },
    setSubscription(state, action: PayloadAction<any | null>) {
      if (action.payload.account_id) {
        localStorage.setItem('accountId', action.payload.account_id);
      }
      state.subscription = action.payload;
    },
  },
});

export const { clearAuthData, setUser, setAccessToken, setUserTypeToken, setSubscription, logout } = authSlice.actions;
export default authSlice.reducer;
