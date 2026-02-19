// src/api/modules/users.ts
import { URL_REGISTER } from '../endpoints';
import { apiService } from '../services';
import { UserCreateParams } from '../types';

export const userApi = {
    create: (userData: UserCreateParams) =>
        apiService.post(URL_REGISTER, userData),

    //   update: (userId: string, userData: UserUpdateParams) =>
    //     apiService.put(`/users/${userId}`, userData),

    //   delete: (userId: string) =>
    //     apiService.delete(`/users/${userId}`),

    //   getProfile: () =>
    //     apiService.get('/users/profile'),
};

// src/api/modules/auth.ts
// export const authApi = {
//     login: (credentials) =>
//         apiService.post('/login', credentials),

//     logout: () =>
//         apiService.post('/logout'),

//     refreshToken: () =>
//         apiService.post('/refresh-token'),
// };