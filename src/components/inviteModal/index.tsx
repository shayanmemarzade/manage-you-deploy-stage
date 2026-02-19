// components/InviteModal.jsx
import { useCallback, useEffect, useState } from 'react';
import { PiUserPlusLight } from 'react-icons/pi';
import inviteEmailSvg from "@/assets/svgs/inviteEmail.svg";
import inviteLinkSvg from "@/assets/svgs/inviteLink.svg";
import { AiOutlinePlus } from 'react-icons/ai';
import { FiCopy } from 'react-icons/fi';
import { GoDotFill } from 'react-icons/go';
import { FaArrowRight } from 'react-icons/fa6';
import { EnrollType } from './enrollType';
import { inviteApi } from '@/api/modules/invitation';
import { CgSpinner } from 'react-icons/cg';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { userApi } from '@/api/modules/users';
import { authApi } from '@/api/modules/auth';
import { inviteLinkResponse } from '@/api/types';
import { BsFillQuestionCircleFill } from 'react-icons/bs';

const InviteModal = ({ isOpen, onClose, getAccessList }) => {
    const [emails, setEmails] = useState<any>([]);
    const [currentEmail, setCurrentEmail] = useState('');
    const [invitationType, setInvitationType] = useState('moderated');
    const [invitationLink, setInvitationLink] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const [buttonText, setButtonText] = useState("Copy Link");

    const { user } = useSelector((state: RootState) => state.auth);
    const { accessList } = useSelector((state: RootState) => state.invitees);

    const [showModeratedTooltip, setShowModeratedTooltip] = useState(false);
    const [showUnmoderatedTooltip, setShowUnmoderatedTooltip] = useState(false);



    const getExpirationDate = () => {
        // Get the current date
        const currentDate = new Date();

        // Add 10 days to the current date
        const futureDate = new Date(currentDate.setDate(currentDate.getDate() + 10));

        // Format the date to 'YYYY-MM-DD HH:MM:SS'
        const year = futureDate.getFullYear();
        const month = (futureDate.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed
        const day = futureDate.getDate().toString().padStart(2, '0');
        const hours = futureDate.getHours().toString().padStart(2, '0');
        const minutes = futureDate.getMinutes().toString().padStart(2, '0');
        const seconds = futureDate.getSeconds().toString().padStart(2, '0');

        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }

    const fetchInviteLink = useCallback(async (invitationTypeLatest: string) => {

        try {
            setIsLoading(true)

            const params = {
                "invite_method": "link",
                "moderation": invitationTypeLatest == "moderated" ? 1 : 0,
                "email_domain_restriction": "digitaltenn.com",
                "expiration_date": getExpirationDate(),
                "license_count": "0"
            }

            if (user && user.account_details !== null && user.account_details.licenses_count !== null) {
                params.license_count = user.account_details.licenses_count.toString()
            }

            const res: inviteLinkResponse = await inviteApi.createInvitationByLink(params)


            console.log("*************** invite link res ***************")
            console.log(res)
            console.log("*************** invite link res ***************")

            setInvitationLink(res.data.link)
            setIsLoading(false)

        } catch (err: any) {
            console.log(err)
        } finally {
            setIsLoading(false);
        }
    }, [
        invitationType,
        user
    ]);


    useEffect(() => {
        setEmails([])

        if (invitationLink == "") {
            fetchInviteLink(invitationType)
        }
    }, [isOpen, invitationLink, fetchInviteLink]);


    const handleAddEmail = () => {
        if (currentEmail && currentEmail.includes('@')) {
            setEmails([...emails, currentEmail]);
            setCurrentEmail('');
        }
    };

    const handleRemoveEmail = (emailToRemove) => {
        setEmails(emails.filter(email => email !== emailToRemove));
    };

    if (!isOpen) return null;

    const handleEmailInvitation = async () => {

        if (!emails) {
            return
        }

        try {
            setIsLoading(true)
            // const response = await authApi.login(formData);
            // const apiEmailFormat: inviteByEmail = emails.map(email => ({ email }));

            await inviteApi.createInvitationByEmail({
                "invite_method": "email",
                "emails": emails.map(email => ({ email }))
            })

            getAccessList()

        } catch (err: any) {
            console.log(err)
        } finally {
            setIsLoading(false);
        }
    }

    const handleCopyLink = async () => {
        if (!invitationLink) {
            console.warn("No invitation link to copy.");
            return;
        }

        try {
            await navigator.clipboard.writeText(invitationLink);
            setButtonText("Copied!");
            setTimeout(() => {
                setButtonText("Copy Link");
            }, 2000); // Reset button text after 2 seconds
        } catch (err) {
            console.error("Failed to copy link: ", err);
            setButtonText("Copy Failed");
            // Optionally, provide more user-friendly error feedback to the user
            setTimeout(() => {
                setButtonText("Copy Link");
            }, 2000);
        }
    };

    const handleLinkTypeChange = (e) => {
        setInvitationType(e)
        fetchInviteLink(e)
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Overlay with blur effect */}
            <div
                className="absolute inset-0 bg-gray-600 bg-opacity-50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-2xl bg-white rounded-md shadow-xl py-4">
                {/* Header */}
                <div className="flex justify-between items-center pb-4">
                    <div className="flex text-black items-center gap-2 px-6">
                        <PiUserPlusLight className="h-5 w-5 text-md" />
                        <h2 className="text-sm">Add Team Members</h2>
                    </div>
                    <div className="flex items-center gap-3 px-6">
                        {accessList && user && (
                            <span className="flex items-center gap-1 border rounded bg-black4opacity border-black12opacity px-3 py-1 text-xs font-medium text-lightBlack">
                                <GoDotFill
                                    className={
                                        user?.account_details?.licenses_count &&
                                            accessList.length < user?.account_details?.licenses_count
                                            ? "text-green-500"
                                            : "text-red-500"
                                    }
                                />
                                {accessList.length} of {user?.account_details?.licenses_count}{" "}
                                seats used
                            </span>
                        )}
                        <button
                            onClick={onClose}
                            className="text-black hover:text-gray-600"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* Enroll Via Invite Section */}
                <div className="pt-4 px-6 bg-linkWater border-t border-black12opacity">
                    <EnrollType
                        heading="Enroll Via Invite"
                        subText="Add people by typing in the email address in the input field below"
                        icon={inviteEmailSvg}
                    />

                    <div className="flex gap-2 mb-4">
                        <input
                            type="email"
                            value={currentEmail}
                            onChange={(e) => setCurrentEmail(e.target.value)}
                            placeholder="Enter a valid email address"
                            className=" text-sm text-black flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            onClick={handleAddEmail}
                            className="bg-white border t shadow-md border-primary text-sm text-primary px-4 py-2 rounded flex items-center space-x-2"
                        >
                            <AiOutlinePlus className="h-5 w-5" />
                            <span className="font-medium">Add Email</span>
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {emails.map((email, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-2 px-3 py-1 rounded-md border rounded bg-black4opacity border-black12opacity font-medium text-lightBlack"
                            >
                                <span className="text-sm">{email}</span>
                                <button
                                    onClick={() => handleRemoveEmail(email)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Enroll Via Link Section */}
                <div className="mb-4 pb-4 pt-4 px-6 bg-linkWater border-b border-black12opacity">
                    <EnrollType
                        heading="Enroll Via Link"
                        subText="Share the provided link with the people you want to invite"
                        icon={inviteLinkSvg}
                    />

                    <div className="flex gap-2 mb-4">
                        <input
                            type="text"
                            value={invitationLink}
                            readOnly
                            className="flex-1 text-sm text-black px-4 py-2 bg-gray-50 border border-gray-300 rounded-md"
                        />
                        <button
                            onClick={handleCopyLink}
                            className="bg-white border t shadow-md border-primary text-sm text-primary px-4 py-2 rounded flex items-center space-x-2"
                        >
                            <FiCopy className="h-4 w-4" />
                            <span className="font-medium">{buttonText}</span>
                        </button>
                    </div>

                    <div className="flex text-black items-center gap-4">
                        <span className="text-sm font-semibold">Invitation type:</span>
                        <label
                            className={`flex items-center gap-2 px-3 py-1 cursor-pointer  ${invitationType === "moderated" &&
                                "border rounded bg-black4opacity border-black12opacity font-medium text-lightBlack"
                                }`}
                        >
                            <input
                                type="radio"
                                name="invitationType"
                                value="moderated"
                                checked={invitationType === "moderated"}
                                onChange={(e) => handleLinkTypeChange(e.target.value)}
                                className="text-blue-600"
                            />
                            <div className="relative flex items-center">
                                <span className="text-sm">Moderated</span>
                                <div
                                    className="relative inline-block ml-3"
                                    onMouseEnter={() => setShowModeratedTooltip(true)}
                                    onMouseLeave={() => setShowModeratedTooltip(false)}
                                >
                                    <BsFillQuestionCircleFill className="h-3.5 w-3.5 text-gray-600" />

                                    {showModeratedTooltip && (
                                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-80 bg-neutral-700 text-white rounded-lg px-3 py-4 shadow-lg z-20">
                                            <p className="font-bold text-sm">
                                                Moderated Invite Links
                                            </p>
                                            <p className="mt-1 font-normal text-xs">
                                                Users who accept this invite will need approval from a
                                                Team Admin before gaining access.
                                            </p>
                                            <div className="absolute left-1/2 top-full transform -translate-x-1/2 h-0 w-0 border-x-[8px] border-x-transparent border-t-[8px] border-t-neutral-700"></div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </label>
                        <label
                            className={`flex items-center gap-2 px-3 py-1 cursor-pointer  ${invitationType === "unmoderated" &&
                                "border rounded bg-black4opacity border-black12opacity font-medium text-lightBlack"
                                }`}
                        >
                            <input
                                type="radio"
                                name="invitationType"
                                value="unmoderated"
                                checked={invitationType === "unmoderated"}
                                onChange={(e) => handleLinkTypeChange(e.target.value)}
                                className="text-blue-600"
                            />
                            <div className="relative flex items-center">
                                <span className="text-sm">Unmoderated</span>
                                <div
                                    className="relative inline-block ml-3"
                                    onMouseEnter={() => setShowUnmoderatedTooltip(true)}
                                    onMouseLeave={() => setShowUnmoderatedTooltip(false)}
                                >
                                    <BsFillQuestionCircleFill className="h-3.5 w-3.5 text-gray-600" />

                                    {showUnmoderatedTooltip && (
                                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-80 bg-neutral-700 text-white rounded-lg px-3 py-4 shadow-lg z-20">
                                            <p className="font-bold text-sm">
                                                Unmoderated Invite Links
                                            </p>
                                            <p className="mt-1 font-normal text-xs">
                                                Users who accept this will be automatically granted
                                                access to the Team account - no admin approval needed.
                                            </p>
                                            {/* Step 4: Arrow is now perfectly centered within the tooltip body */}
                                            <div className="absolute left-1/2 top-full transform -translate-x-1/2 h-0 w-0 border-x-[8px] border-x-transparent border-t-[8px] border-t-neutral-700"></div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-4  px-6">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-lightBlack text-sm border rounded border-black12opacity hover:bg-gray-100"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => handleEmailInvitation()}
                        disabled={emails.length === 0}
                        className="bg-primary border shadow-md text-sm text-white px-4 py-2 rounded flex items-center space-x-2 hover:bg-blue-700 disabled:bg-blue-400"
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center gap-2">
                                Send Invitations{" "}
                                <CgSpinner className="animate-spin h-5 w-5" />
                            </div>
                        ) : (
                            <>
                                <span className="font-medium">Send Invitations</span>
                                <FaArrowRight className="h-4 w-4" />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InviteModal;