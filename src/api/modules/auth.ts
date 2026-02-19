import { apiService } from '../services';
import { URL_LOGIN, URL_AUTHENTICATE, URL_FORGOT_PASSWORD } from '../endpoints';

export const authApi = {
    login: (credentials: any) =>
        apiService.post(URL_LOGIN, credentials),

    logout: () =>
        apiService.post('/logout'),

    refreshToken: () =>
        apiService.post('/refresh-token'),

    authenticate: () =>
        apiService.get(URL_AUTHENTICATE),

    forgotPassword: (credentials: any) =>
        apiService.post(URL_FORGOT_PASSWORD, credentials),

};