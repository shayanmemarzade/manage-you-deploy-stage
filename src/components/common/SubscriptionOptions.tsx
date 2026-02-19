interface OptionProps {
    title: string;
    description: string;
    onClick: () => void;
    iconPath: string;
    active: boolean
}

const SubscriptionOptions: React.FC<OptionProps> = ({
    title,
    description,
    iconPath,
    onClick,
    active
}) => {
    return (
        <div className="max-w-2xl mx-auto space-y-4">
            {/* Individual Plan Card */}
            <div
                onClick={onClick}
                // className="group border border-blue-100 p-4 rounded-lg hover:border-primary cursor-pointer transition-all flex items-center justify-between bg-white"
                className={`group border p-4 rounded-lg cursor-pointer transition-all flex items-center justify-between bg-white
                ${active ? 'border-primary' : 'border-blue-100 hover:border-blue-400'}`}
            >
                <div className="flex items-center space-x-4">
                    <div className="bg-blue-50 p-3 rounded-lg">
                        <svg
                            className="w-6 h-6 text-blue-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path d={iconPath} />
                        </svg>
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-800">{title}</h3>
                        <p className="text-gray-500 text-sm">
                            {description}
                        </p>
                    </div>
                </div>

                <div className="flex-shrink-0">
                    <div className={`w-6 h-6 border-2 rounded-full flex items-center justify-center transition-colors
                        ${active
                            ? 'border-primary'
                            : 'border-linkWater group-hover:border-primary'
                        }`}
                    >
                        <div className={`w-3.5 h-3.5 rounded-full transition-colors
                            ${active
                                ? 'bg-primary'
                                : 'bg-linkWater group-hover:bg-primary'
                            }`}
                        />
                    </div>
                </div>
            </div>

        </div>
    );
};

export default SubscriptionOptions;