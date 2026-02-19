import { useState, useRef, useEffect } from 'react';
import { FiSearch } from 'react-icons/fi';
import { MdOutlineTune } from "react-icons/md";
import { BiSortDown } from "react-icons/bi";

type SortOption = 'az' | 'za' | 'expiry';

interface SearchFilterBarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    allTags: string[];
    selectedTags: string[];
    setSelectedTags: (tags: string[] | ((prev: string[]) => string[])) => void;
    sortOption: SortOption;
    setSortOption: (option: SortOption) => void;
}

// A map to hold the display text for our sort options
const sortOptionsMap: { [key in SortOption]: string } = {
    az: 'Ascending (A-Z)',
    za: 'Descending (Z-A)',
    expiry: 'Expiration Date',
};

export default function SearchFilterBar({
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    allTags,
    selectedTags,
    setSelectedTags,
    sortOption,
    setSortOption
}: SearchFilterBarProps) {
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isSortOpen, setIsSortOpen] = useState(false);
    const filterRef = useRef<HTMLDivElement>(null);
    const tabs = ['Favorites', 'Document'];
    const sortRef = useRef<HTMLDivElement>(null);

    const handleTagToggle = (tagName: string) => {
        setSelectedTags(prev =>
            prev.includes(tagName)
                ? prev.filter(t => t !== tagName)
                : [...prev, tagName]
        );
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
                setIsFilterOpen(false);
            }

            if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
                setIsSortOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSortSelect = (option: SortOption) => {
        setSortOption(option);
        setIsSortOpen(false); // Close dropdown on selection
    };

    return (
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            {/* Tabs */}
            <div className="flex items-center border border-black12opacity rounded-md overflow-hidden">
                {tabs.map((tab, index) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-2 text-sm font-bold
                            ${index > 0 ? 'border-l border-black12opacity' : ''}
                            ${activeTab === tab
                                ? 'bg-primary text-white'
                                : 'bg-white text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="flex w-full md:w-auto items-center gap-2">

                {/* Sort Button and Dropdown */}
                <div className="relative" ref={sortRef}>
                    <button
                        onClick={() => setIsSortOpen(!isSortOpen)}
                        className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                    >
                        <BiSortDown className="h-5 w-5 mr-2 text-black50opacity" />
                        <span className="text-black50opacity">Sort</span>
                    </button>

                    {isSortOpen && (
                        <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                            <div className="p-2">
                                {(Object.keys(sortOptionsMap) as SortOption[]).map(key => (
                                    <button
                                        key={key}
                                        onClick={() => handleSortSelect(key)}
                                        className={`w-full text-left px-3 py-2 text-sm rounded-md ${sortOption === key
                                            ? 'bg-primary text-white'
                                            : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                    >
                                        {sortOptionsMap[key]}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Filter Button and Popover */}
                <div className="relative" ref={filterRef}> {/* <-- The ANCHOR for the popover */}
                    <button
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                    >
                        <MdOutlineTune className="h-5 w-5 mr-2 text-black50opacity" />
                        <span className="text-black50opacity">Filter</span>
                        {selectedTags.length > 0 && (
                            <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-primary rounded-full">
                                {selectedTags.length}
                            </span>
                        )}
                    </button>

                    {/* Filter Popover */}
                    {isFilterOpen && (
                        <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-10"> {/* <-- The POPOVER itself */}
                            <div className="p-4 border-b">
                                <h4 className="text-sm font-semibold text-gray-800">Filter by Tag</h4>
                            </div>
                            <div className="p-4 max-h-60 overflow-y-auto">
                                {allTags.length > 0 ? (
                                    allTags.map(tag => (
                                        <label key={tag} className="flex items-center space-x-3 cursor-pointer p-1 rounded hover:bg-gray-100">
                                            <input
                                                type="checkbox"
                                                checked={selectedTags.includes(tag)}
                                                onChange={() => handleTagToggle(tag)}
                                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                            />
                                            <span className="text-sm text-gray-700">{tag}</span>
                                        </label>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500">No tags available.</p>
                                )}
                            </div>
                            {selectedTags.length > 0 && (
                                <div className="p-2 border-t bg-gray-50 rounded-b-md">
                                    <button
                                        onClick={() => {
                                            setSelectedTags([]);
                                            setIsFilterOpen(false); // Close popover after clearing
                                        }}
                                        className="w-full text-center text-sm text-primary hover:underline"
                                    >
                                        Clear All Filters
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Search Input */}
                <div className="relative flex-grow">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiSearch className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by name..."
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
                    />
                </div>
            </div>
        </div>
    );
}