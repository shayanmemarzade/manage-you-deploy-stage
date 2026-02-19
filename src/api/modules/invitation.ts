import { URL_INVITE, URL_INVITE_ACCEPT, URL_INVITE_ACTION } from '../endpoints';
import { apiService } from '../services';
import { inviteByEmail, inviteByLink, acceptInvite, actionInvite } from '../types';

export const inviteApi = {
    getInviteesList: () =>
        apiService.get(URL_INVITE),

    createInvitationByEmail: (data: inviteByEmail) =>
        apiService.post(URL_INVITE, data),

    createInvitationByLink: (data: inviteByLink) =>
        apiService.post(URL_INVITE, data),

    acceptInvite: (data: acceptInvite) =>
        apiService.post(URL_INVITE_ACCEPT, data),

    actionInvite: (data: actionInvite) =>
        apiService.post(URL_INVITE_ACTION, data),
};
