import { CgSpinner } from "react-icons/cg";
import EmptyTeamRow from "./EmptyTeamRow";

interface HeaderProps {
    users: any;

    revokeBtnLabel?: string;
    btnLabel?: string;

    approveBtnLabel?: string;

    denyBtnLabel?: string;

    emptySectionButtonclick: any;

    handleTableActions: any;

    emptyDescription: string;

    emptyLinkText?: string;

    isLoading: boolean;
}

export const UserTable: React.FC<HeaderProps> = ({
    users,
    emptySectionButtonclick,
    revokeBtnLabel,
    btnLabel,
    approveBtnLabel,
    denyBtnLabel,
    handleTableActions,
    emptyDescription,
    emptyLinkText,
    isLoading
}) => {
    return (
        <div className="rounded-md overflow-hidden border border-gray-200">
            <table className="w-full border-collapse">
                <thead className="bg-black4opacity">
                    <tr className="text-lightBlack text-sm">
                        <th className="p-4  text-left font-semibold">First Name</th>
                        <th className="p-4 text-left font-semibold">Last Name</th>
                        <th className="p-4 text-left font-semibold">Email Address</th>
                        {/* <th className="p-4 text-left font-semibold">Phone Number</th> */}
                        <th className="w-1/5 text-left font-semibold">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {(users && users.length > 0) ? users.map((user, index) => (
                        <tr key={index} className="hover:bg-gray-50 text-lightBlack text-sm">
                            <td className="p-4 font-medium">{user.firstName ? user.firstName : " - "}</td>
                            <td className="p-4 font-medium">{user.lastName ? user.lastName : " - "}</td>
                            <td className="p-4 font-medium">{user.email_address}</td>
                            {/* <td className="p-4 font-medium">{user.phoneNumber}</td> */}
                            <td className="py-4 font-medium">
                                {btnLabel && (
                                    <button disabled={isLoading} onClick={() => handleTableActions(btnLabel, user.email_address)} className="bg-primaryLight rounded-md px-4 py-2 text-primary hover:underline">
                                        {isLoading ? (
                                            <div className="flex items-center justify-center gap-2">{btnLabel} <CgSpinner className="animate-spin h-5 w-5" /></div>
                                        ) : (
                                            btnLabel
                                        )}
                                    </button>
                                )}
                                {approveBtnLabel && (
                                    <button disabled={isLoading} onClick={() => handleTableActions(approveBtnLabel, user.email_address)} className="bg-primaryLight rounded-md mr-2 px-4 py-2 text-primary hover:underline">
                                        {isLoading ? (
                                            <div className="flex items-center justify-center gap-2">{approveBtnLabel} <CgSpinner className="animate-spin h-5 w-5" /></div>
                                        ) : (
                                            approveBtnLabel
                                        )}
                                    </button>
                                )}
                                {denyBtnLabel && (
                                    <button disabled={isLoading} onClick={() => handleTableActions(denyBtnLabel, user.email_address)} className="bg-primaryLight rounded-md px-4 py-2 text-primary hover:underline">
                                        {isLoading ? (
                                            <div className="flex items-center justify-center gap-2">{denyBtnLabel} <CgSpinner className="animate-spin h-5 w-5" /></div>
                                        ) : (
                                            denyBtnLabel
                                        )}
                                    </button>
                                )}
                            </td>
                        </tr>
                    )) : (
                        <EmptyTeamRow
                            cols={5}
                            description={emptyDescription}
                            linkText={emptyLinkText}
                            emptySectionButtonclick={emptySectionButtonclick}
                        />
                    )}
                </tbody>
            </table>
        </div>

    );
};