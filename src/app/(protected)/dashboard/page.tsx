'use client';
import React, { useCallback, useEffect, useState } from 'react';
import { FilterRow } from '@/components/common/dashboard/FilterRow';
import { HeaderRow } from '@/components/common/dashboard/Headerrow';
import { UserTable } from '@/components/common/dashboard/UserTable';
import Navbar from '@/components/common/Navbar';
import { UserTableInvited } from '@/components/common/dashboard/UserTableInvited';
import InviteModal from '@/components/inviteModal';
import { inviteApi } from '@/api/modules/invitation';
import { setAccessList, setAccountDetails, setInviteLinks } from '@/store/reducer/inviteesList';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useAppDispatch } from '@/store/hooks';
import { accessList } from '@/api/types'


const UserManagement = () => {

    const dispatch = useAppDispatch();

    const cancelBtnLabel = 'Cancel Invite'
    const revokeBtnLabel = 'Revoke Access'
    const approveBtnLabel = 'Approve'
    const denyBtnLabel = 'Deny'
    const reactivateBtnLabel = 'Reactivate User'

    const filters = ['Active', 'Seeking Approval', 'Invited', 'Inactive'];
    const [activeFilter, setActiveFilter] = useState('Active');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { user } = useSelector((state: RootState) => state.auth);
    const { accessList } = useSelector((state: RootState) => state.invitees);

    const [activeUsers, setActiveUsers] = useState<accessList[] | null>(null);
    const [seekingApprovalUsers, setSeekingApprovalUsers] = useState<accessList[] | null>(null);
    const [invitedUsers, setInvitedUsers] = useState<accessList[] | null>(null);
    const [inactiveUsers, setInactiveUsers] = useState<accessList[] | null>(null);
    const [actionBtnLoading, setActionBtnLoading] = useState<boolean>(false);


    console.log(activeFilter)

    const getAccessList = useCallback(async () => {
        try {
            // const response = await authApi.login(formData);
            const res = await inviteApi.getInviteesList()
            dispatch(setAccessList(res.accessList));
            dispatch(setInviteLinks(res.inviteLinks));
            dispatch(setAccountDetails(res.accountDetails));

        } catch (err: any) {
            console.log(err)
        }
    }, [dispatch])

    // Function to categorize users
    const categorizeUsers = (accessList: accessList[]) => {
        const activeUsers: accessList[] = accessList.filter(
            user => user.is_approve === 1 && user.status === 1
        );
        setActiveUsers(activeUsers)

        const seekingApprovalUsers: accessList[] = accessList.filter(
            user => user.is_approve === 0 && user.user_id !== null
        );
        setSeekingApprovalUsers(seekingApprovalUsers)

        const invitedUsers: accessList[] = accessList.filter(
            user => user.user_id === null
        );
        setInvitedUsers(invitedUsers)

        const inactiveUsers: accessList[] = accessList.filter(
            user =>
                user.status === 0 &&
                !activeUsers.includes(user) &&
                !seekingApprovalUsers.includes(user) &&
                !invitedUsers.includes(user)
        );
        setInactiveUsers(inactiveUsers)
    };

    useEffect(() => {
        if (accessList) {
            categorizeUsers(accessList)
        }

    }, [accessList]);

    useEffect(() => {

        getAccessList()

    }, [getAccessList]);

    const emptySectionButtonclick = () => {
        // router.push('/profile');
        console.log("button presssed")
    }

    const handleTableActions = async (actionType: string, email: string) => {

        try {
            setActionBtnLoading(true)
            const request_params = {
                "email_address": email,
                "action": actionType === cancelBtnLabel || actionType === denyBtnLabel ? "delete_access"
                    : actionType === approveBtnLabel ? "approve"
                        : actionType === reactivateBtnLabel ? "reativate"
                            : actionType === revokeBtnLabel ? "revoke" : ""
            }
            console.log(actionType)
            inviteApi.actionInvite(request_params)
            getAccessList()

        } catch (err: any) {
            // setError(err.message);
            console.log("Registration erorr")
            console.log(err)
            console.log(err?.message)
            console.log("****************")
            // setApiError("Something went wrong!")
        } finally {
            setActionBtnLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-100">
            <Navbar />

            {/* Main Content */}
            <div className="flex-grow flex-col flex items-center justify-center py-10 px-4">
                {user && <HeaderRow name={user?.first_name + " " + user?.last_name} inviteMembersfunction={setIsModalOpen} />}
                <div className="max-h-[300px] md:max-h-[400px] lg:max-h-[500px] overflow-y-auto w-full max-w-5xl bg-white shadow-md rounded-md p-6">
                    {/* User Details Section */}
                    <div>

                        <FilterRow filters={filters} setActiveFilter={setActiveFilter} activeFilter={activeFilter} />

                        {activeFilter === "Active" ? (
                            <UserTable
                                users={activeUsers}
                                btnLabel={revokeBtnLabel}
                                handleTableActions={handleTableActions}
                                emptySectionButtonclick={setIsModalOpen}
                                emptyDescription="No team members found. Start building your team now!"
                                emptyLinkText="Invite Team Members"
                                isLoading={actionBtnLoading}
                            />
                        ) : activeFilter === "Seeking Approval" ? (
                            <UserTable
                                users={seekingApprovalUsers}
                                approveBtnLabel={approveBtnLabel}
                                handleTableActions={handleTableActions}
                                denyBtnLabel={denyBtnLabel}
                                emptySectionButtonclick={emptySectionButtonclick}
                                emptyDescription="Your current setup allows new users to join your organization automatically. If you'd like more control over who joins your team, you can enable the approval feature."
                                isLoading={actionBtnLoading}
                            />
                        ) : activeFilter === "Inactive" ? (
                            <UserTable
                                users={inactiveUsers}
                                btnLabel={reactivateBtnLabel}
                                handleTableActions={handleTableActions}
                                emptySectionButtonclick={emptySectionButtonclick}
                                emptyDescription="No inactive team memebers. Everyone is currently active!"
                                isLoading={actionBtnLoading}
                            />
                        ) : (
                            <UserTableInvited users={invitedUsers} cancelBtnLabel={cancelBtnLabel} handleTableActions={handleTableActions} emptySectionButtonclick={emptySectionButtonclick}
                                emptyDescription="No pending invites. Send invitations to add more team members!"
                                emptyLinkText="Invite Team Memebers"
                                isLoading={actionBtnLoading}
                            />
                        )}
                    </div>
                </div>
            </div>

            <InviteModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                getAccessList={getAccessList}
            />
        </div >
    );
};

export default UserManagement;