import { PiUserPlusLight } from "react-icons/pi";

interface HeaderProps {
    name: string;

    inviteMembersfunction: any;
}

export const HeaderRow: React.FC<HeaderProps> = ({
    name,
    inviteMembersfunction

}) => {
    return (
        <div className="flex w-full max-w-5xl justify-between items-center mb-6">
            <h1 className="text-2xl text-black font-semibold">
                Welcome {name}! 👋
            </h1>
            <button onClick={() => inviteMembersfunction(true)} className="bg-white border shadow-md border-primary text-primary font-light px-4 py-2 rounded flex items-center space-x-2">
                <PiUserPlusLight className="h-5 w-5 text-md" />
                <span className='text-sm'>Invite Teams Members</span>
            </button>
        </div>

    );
};