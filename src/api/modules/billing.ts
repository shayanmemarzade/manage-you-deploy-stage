import { URL_BILLING } from '../endpoints';
import { apiService } from '../services';
import { createBilling } from '../types';

export const billingApi = {
    createBilling: (billingData: createBilling) =>
        apiService.post(URL_BILLING, billingData),
};
