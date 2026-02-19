
interface HeaderProps {
    filters: any;
    setActiveFilter: any,
    activeFilter: any
}

export const FilterRow: React.FC<HeaderProps> = ({
    filters,
    setActiveFilter,
    activeFilter
}) => {
    return (
        <div className="flex items-center justify-between pb-4">
            <h2 className="text-xl font-semibold text-gray-800">User Details</h2>

            <div className="flex items-center space-x-2">
                <span className="font-semibold text-lightBlack text-sm mr-2">Filter by:</span>

                <span className="border bg-black4opacity rounded-md border-black12opacity p-0.5">
                    {filters.map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={`px-3 py-2 rounded-md font-medium text-sm transition-colors duration-200 ${activeFilter === filter
                                ? 'bg-primary text-white'
                                : 'text-lightBlack hover:bg-gray-100'}`}>
                            {filter}
                        </button>
                    ))}
                </span>
            </div>
        </div>

    );
};