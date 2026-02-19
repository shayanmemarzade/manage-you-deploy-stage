import Image from "next/image";
import logoImage from '@/assets/images/logo.png';

interface HeaderProps {
    title: string;
    // variant?: 'primary' | 'secondary';
    description: string
}

export const FormHeader: React.FC<HeaderProps> = ({
    title,
    // variant = 'primary',
    description
}) => {
    return (
        <>
            <div className="mb-6">
                <Image
                    aria-hidden
                    src={logoImage}
                    alt="logo icon"
                    width={150}
                    height={150}
                />
                {/* <div className="w-16 h-16 bg-black/5 rounded-sm flex items-center justify-center">
                    <Image
                        aria-hidden
                        src={logoImage}
                        alt="logo icon"
                        width={40}
                        height={40}
                    />
                </div> */}
            </div>

            <h1 className="text-2xl font-normal mb-2 text-black">{title}</h1>

            <p className="text-black/60 text-base font-thin mb-8 text-left max-w-md ">
                {description}
            </p>
        </>

    );
};