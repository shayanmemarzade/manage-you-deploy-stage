// src/api/modules/users.ts
import { URL_SUBSCRIPTION } from '../endpoints';
import { apiService } from '../services';
import { createSubscription } from '../types';

export const subscriptionApi = {
    new: (subscriptionData: createSubscription) =>
        apiService.post(URL_SUBSCRIPTION, subscriptionData),
};
