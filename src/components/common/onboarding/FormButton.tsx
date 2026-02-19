import { CgSpinner } from 'react-icons/cg';

interface ButtonProps {
    label: string;
    // variant?: 'primary' | 'secondary';
    isLoading: boolean;

    isdisabled?: boolean
}

export const FormButton: React.FC<ButtonProps> = ({
    label,
    // variant = 'primary',
    isLoading,
    isdisabled = false,
}) => {
    return (
        <button
            type="submit"
            disabled={isLoading || isdisabled}
            // className="w-full bg-primary text-sm text-white py-3 rounded-[0.3vw] mb-4 hover:bg-primary-700 transition-colors"
            className="w-full bg-primary text-sm text-white py-3 rounded-[0.3vw] hover:bg-primary-700 transition-colors mb-1 inline-flex items-center justify-center"
        >
            {isLoading ? (
                <CgSpinner className="animate-spin h-5 w-5 mx-auto" />
            ) : (
                label
            )}
        </button>

    );
};