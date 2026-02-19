// store/reducer/auth.ts
import { accessList, accountDetails, inviteData, inviteLinks } from '@/api/types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';


const initialState: inviteData = {
    accessList: null,
    inviteLinks: null,
    accountDetails: null
};

const inviteesSlice = createSlice({
    name: 'invitees',
    initialState,
    reducers: {
        clearInviteeData(state) {
            state.accessList = null;
            state.inviteLinks = null;
            state.accountDetails = null;
        },
        setAccessList(state, action: PayloadAction<accessList[] | null>) {
            state.accessList = action.payload;
        },
        setInviteLinks(state, action: PayloadAction<inviteLinks[] | null>) {
            state.inviteLinks = action.payload;
        },
        setAccountDetails(state, action: PayloadAction<accountDetails | null>) {
            state.accountDetails = action.payload;
        },
    },
});

export const { clearInviteeData, setAccessList, setInviteLinks, setAccountDetails } = inviteesSlice.actions;
export default inviteesSlice.reducer;
