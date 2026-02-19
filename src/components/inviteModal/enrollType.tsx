import Image from "next/image";

interface HeaderProps {
    heading: string;

    subText: string;

    icon: any;
}

export const EnrollType: React.FC<HeaderProps> = ({
    heading,
    subText,
    icon

}) => {
    return (
        <>
            <div className="flex items-center gap-2 mb-3">
                <Image
                    className="w-5 h-5"
                    src={icon}
                    alt="Invite email"
                />
                <h3 className="text-md text-black font-semibold">{heading}</h3>
            </div>

            <p className="text-sm text-black60opacity mb-4">
                {subText}
            </p>
        </>

    );
};