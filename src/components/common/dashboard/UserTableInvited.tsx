import EmptyTeamRow from "./EmptyTeamRow";
import { CgSpinner } from "react-icons/cg";

interface HeaderProps {
    users: any;

    cancelBtnLabel?: string;

    emptySectionButtonclick: any;

    handleTableActions: any;

    emptyDescription: string;

    emptyLinkText: string;

    isLoading: boolean;
}

export const UserTableInvited: React.FC<HeaderProps> = ({
    users,
    emptySectionButtonclick,
    cancelBtnLabel,
    handleTableActions,
    emptyDescription,
    emptyLinkText,
    isLoading
}) => {
    return (
        <table className="w-full">
            <thead className="bg-black4opacity">
                <tr className="border text-lightBlack text-sm">
                    <th className="p-4 w-4/5 text-left font-semibold">Email Address</th>
                    <th className="text-left w-1/5 p-4 font-semibold">Actions</th>
                </tr>
            </thead>
            <tbody>
                {(users && users.length > 0) ? users.map((user, index) => (
                    <tr key={index} className="border hover:bg-gray-50 text-lightBlack text-sm">
                        <td className="p-4 font-medium">{user.email_address}</td>
                        <td className="p-4 text-left font-medium">
                            {cancelBtnLabel && (
                                <button disabled={isLoading} onClick={() => handleTableActions(cancelBtnLabel, user.email_address)} className="bg-primaryLight rounded-md px-4 py-2 text-primary hover:underline">
                                    {isLoading ? (
                                        <div className="flex items-center justify-center gap-2">{cancelBtnLabel} <CgSpinner className="animate-spin h-5 w-5" /></div>
                                    ) : (
                                        cancelBtnLabel
                                    )}
                                </button>
                            )}
                        </td>
                    </tr>
                )) : (
                    <EmptyTeamRow
                        cols={2}
                        description={emptyDescription}
                        linkText={emptyLinkText}
                        emptySectionButtonclick={emptySectionButtonclick}
                    />
                )}
            </tbody>
        </table>

    );
};