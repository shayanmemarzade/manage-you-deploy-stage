import React from 'react';
import { FaArrowRight } from 'react-icons/fa';

interface HeaderProps {
    cols: number;

    description: string;

    linkText?: string;

    emptySectionButtonclick: any
}

const EmptyTeamRow: React.FC<HeaderProps> = ({
    cols,
    description,
    linkText,
    emptySectionButtonclick
}) => {
    return (
        <tr>
            <td colSpan={cols} className="text-center px-6 py-12">
                <div className="inline-block">
                    <p className="text-lightBlack max-w-md text-sm mb-6">
                        {description}
                    </p>
                    {linkText && <div className="flex justify-center">
                        <button
                            onClick={emptySectionButtonclick}
                            className="text-sm px-4 py-1 text-primary font-medium hover:font-semibold flex items-center space-x-2"
                        >
                            <span>{linkText}</span>
                            <FaArrowRight />
                        </button>
                    </div>}
                </div>
            </td>
        </tr>
    );
};

export default EmptyTeamRow;