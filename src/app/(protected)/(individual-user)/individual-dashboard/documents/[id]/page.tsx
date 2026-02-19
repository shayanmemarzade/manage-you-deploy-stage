'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { updateDocument } from '@/store/reducer/documents';
import { Document as DocumentType } from '@/api/types';
import Link from 'next/link';
import DatePicker from "react-datepicker"; // Import the component
import "react-datepicker/dist/react-datepicker.css"; // Import the styles

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import Datepicker, { type DateValueType } from "react-tailwindcss-datepicker";

// API module (assuming you have this)
import { documentApi } from '@/api/modules/document';

// Components
import Navbar from '@/components/common/Navbar';

// Icons
import { FiX, FiPlus, FiShare } from "react-icons/fi";
import { toast } from 'sonner';
import dynamic from 'next/dynamic';

// Setup for PDF.js worker
const PdfViewer = dynamic(() => import('@/components/documents/PdfViewer'), {
    ssr: false,
});

const parseISODateToLocalDate = (dateString: string): Date | null => {
    if (!dateString) return null;
    const [year, month, day] = dateString.split('-').map(Number);
    if (!year || !month || !day) return null;
    return new Date(year, month - 1, day);
};


export default function DocumentDetailPage() {
    const router = useRouter();
    const params = useParams();
    const documentId = params.id as string;
    const dispatch = useDispatch<AppDispatch>();

    // Get the current document from the Redux store
    const { currentDocument } = useSelector((state: RootState) => state.documents);
    const user = useSelector((state: RootState) => state.auth.user);

    const [formData, setFormData] = useState<DocumentType | null>(currentDocument);
    const [isLoading, setIsLoading] = useState(!currentDocument);
    const [error, setError] = useState<string | null>(null);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
    const [tagInput, setTagInput] = useState('');
    const [numPages, setNumPages] = useState<number | null>(null);
    const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    console.log("*************** currentDocument ******************")
    console.log(currentDocument)
    console.log("****************** currentDocument ******************")
    const [dateValue, setDateValue] = useState<DateValueType>({
        startDate: null,
        endDate: null
    });

    // Effect to fetch document if it's not in the store (e.g., page refresh)
    // Effect to fetch or set document data
    useEffect(() => {
        // This condition prevents resetting the form while the user is typing
        if (currentDocument && currentDocument.id.toString() === documentId) {
            // Only set the form data if it hasn't been set yet or if the doc ID changes
            if (!formData || formData.id !== currentDocument.id) {
                const formattedDoc = {
                    ...currentDocument,
                    expiry_date: currentDocument.expiry_date
                        ? new Date(currentDocument.expiry_date).toISOString().split('T')[0]
                        : '',
                };
                setFormData(formattedDoc);
            }
            setIsLoading(false);
        } else {
            // Fallback for page refresh when currentDocument is not in Redux state yet
            setIsLoading(true);
        }
    }, [documentId, currentDocument, dispatch]); // formData is needed in dependency array now

    useEffect(() => {
        if (!formData) return;

        const parsedDate = parseISODateToLocalDate(formData.expiry_date || '');
        setDateValue({
            startDate: parsedDate,
            endDate: parsedDate,
        });
    }, [formData?.id, formData?.expiry_date]);

    // ✨ Auto-Save Effect ✨
    useEffect(() => {
        // Don't save on initial load or if data is missing
        if (!formData || !currentDocument) {
            return;
        }

        // Clear previous timeout if it exists
        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }

        // Set a new timeout
        debounceTimeout.current = setTimeout(() => {
            // Check if the data has actually changed from what's in Redux before saving
            const hasChanged = formData.title !== currentDocument.title ||
                formData.description !== currentDocument.description ||
                formData.expiry_date !== currentDocument.expiry_date;

            if (hasChanged) {
                handleUpdateDocument(formData);
            }
        }, 2000); // 2-second debounce delay

        // Cleanup function to clear timeout on component unmount
        return () => {
            if (debounceTimeout.current) {
                clearTimeout(debounceTimeout.current);
            }
        };
        // This effect runs ONLY when the user types in these specific fields
    }, [formData?.title, formData?.description, formData?.expiry_date]);

    // const DocumentPreview = () => {
    const DocumentPreview = useCallback(() => {
        if (!formData) return null;

        const fileType = formData.file_type.toLowerCase();
        const filePath = formData.file_path;

        const baseImageClass = "w-full object-contain";
        // const imageClass = isInModal ? "max-h-[80vh]" : "max-h-[calc(70vh-2rem)]"; // Adjust height for modal vs. inline
        const imageClass = "max-h-[calc(78vh-2rem)]";

        if (['png', 'jpg', 'jpeg', 'gif'].includes(fileType)) {
            return (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={filePath} alt={formData.title} className={`${baseImageClass} ${imageClass}`} />
            );
        }

        if (fileType === 'pdf') {
            // Render the dynamically imported component for PDFs
            return <PdfViewer filePath={filePath} title={formData.title} />;
        }

        return <p>Preview not available for this file type ({fileType}).</p>;
    }, [formData?.file_path, formData?.file_type]);  // Dependencies for memoization


    // --- Form Handlers (they now update local state, triggering the auto-save effect) ---
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (formData) setFormData({ ...formData, [name]: value });
    };

    const handleAddTag = () => {
        // Use a safe check for tagInput and formData
        if (tagInput && formData) {

            // Define the existing tags, defaulting to an empty array if document_tags is missing
            const existingTags = formData.document_tags || [];

            // Check if the tag already exists (using the safe existingTags array)
            if (!existingTags.some(tag => tag.name === tagInput.trim())) {
                const newTag = { id: Date.now(), name: tagInput.trim() }; // Use temporary ID

                // Prepare the new state object
                const updatedFormData = {
                    ...formData,
                    // FIX: Safely spread existingTags (which is guaranteed to be an array)
                    document_tags: [...existingTags, newTag],
                };

                // Update local state
                setFormData(updatedFormData);
                setTagInput('');

                // Trigger the API call immediately with the new data
                handleUpdateDocument(updatedFormData);
            }
        }
    };

    const handleRemoveTag = (tagToRemove: { slug?: string; name: string }) => {
        // Guard clause for safety
        if (!formData) return;

        // Filter out the tag that needs to be removed.
        const newTags = formData.document_tags.filter(
            (existingTag) => existingTag.name !== tagToRemove.name
        );

        const updatedFormData = {
            ...formData,
            document_tags: newTags,
        };

        // Update the local UI state immediately with the correct data
        setFormData(updatedFormData);
        // Send the correctly filtered data to the backend
        handleUpdateDocument(updatedFormData);
    };

    if (isLoading) return <div>Loading document...</div>;
    if (error) return <div>{error}</div>;
    if (!formData) return <div>Document not found.</div>;

    const getSaveStatusText = () => {
        switch (saveStatus) {
            case 'saving': return 'Saving...';
            case 'saved': return 'Saved ✔️';
            default: return 'Changes are saved automatically';
        }
    };

    const handleUpdateDocument = async (updatedData: DocumentType) => {
        if (!updatedData) return;

        setSaveStatus('saving');

        const formData = new FormData();

        // Append all the necessary fields, mirroring your RN app
        formData.append('document_id', updatedData.id.toString());
        formData.append('title', updatedData.title);
        formData.append('description', updatedData.description || '');

        // Handle expiration date
        if (updatedData.expiry_date) {
            formData.append('expiry_date', updatedData.expiry_date);
            formData.append('no_expiration', '0');
        } else {
            formData.append('expiry_date', '');
            formData.append('no_expiration', '1');
        }

        // Append tags
        if (updatedData.document_tags && updatedData.document_tags.length > 0) {
            updatedData.document_tags.forEach(tag => {
                // The backend expects an array, so we use the [] syntax
                formData.append('document_tags[]', tag.name);
            });
        }

        try {
            // Assume the update function is documentApi.updateDocuments
            const res = await documentApi.updateDocument(formData);

            // On success, update the Redux store with the fresh data from the backend
            if (res.document) {
                const newDoc = Array.isArray(res.document) ? res.document[0] : res.document;
                dispatch(updateDocument(newDoc));
            }

            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 2000); // Reset indicator
        } catch (err) {
            console.error('Auto-save failed:', err);
            setSaveStatus('idle'); // Or an 'error' state
            // TODO: Show an error toast to the user
        }
    };

    const handleShareDocument = async () => {
        const sharerName = user
            ? `${user.first_name} ${user.last_name.toUpperCase()}`
            : 'A user';
        const shareText = `Hi There,

${sharerName} has shared 1 document with you. You can download the document by clicking on the link below.

${formData.file_path}

Thank You,
Manage You
Your Certification and Document Wallet
www.manageyouapp.com`;
        try {
            await navigator.clipboard.writeText(shareText);
            toast.success('Share link copied to clipboard');
        } catch {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = shareText;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            toast.success('Share link copied to clipboard');
        }
    };

    return (
        <div className="min-h-screen bg-linkWater">
            <Navbar />

            {/* Header section similar to the dashboard */}
            <div className="bg-white shadow-sm">
                <div className="py-4 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                    <h1 className="text-xl font-semibold">
                        <Link href="/individual-dashboard" className="text-gray-500 hover:text-primary hover:underline">
                            Documents
                        </Link>
                        <span className="mx-2 text-gray-400">&gt;</span>
                        <span className="text-gray-900">{formData.title}</span>
                    </h1>
                    <div className="text-sm font-medium text-gray-500">{getSaveStatusText()}</div>
                </div>
            </div>

            {/* Main Content Area */}
            <main className="p-4 sm:p-6 lg:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Side: Document Preview */}
                    <div className="bg-white border border-black12opacity rounded-md p-4 flex items-center justify-center min-h-[70vh]">
                        <DocumentPreview />
                    </div>

                    {/* Right Side: Document Details Form */}
                    <div className="bg-white border border-black12opacity rounded-md p-6">
                        <form onSubmit={(e) => { e.preventDefault(); }}>
                            <div className="space-y-6">
                                {/* Document Name */}
                                <div>
                                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">Document Name</label>
                                    <input
                                        type="text"
                                        name="title"
                                        id="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="expiry_date" className="block text-sm font-medium text-gray-700">Expiration Date</label>
                                    <Datepicker
                                        value={dateValue}
                                        displayFormat="MM-DD-YYYY"
                                        onChange={newValue => {
                                            setDateValue(newValue);
                                            const isoDate =
                                                newValue?.startDate instanceof Date
                                                    ? newValue.startDate.toISOString().split('T')[0]
                                                    : newValue?.startDate ?? '';
                                            if (formData) {
                                                setFormData({ ...formData, expiry_date: isoDate });
                                            }
                                        }}
                                        minDate={new Date()}
                                        useRange={false}
                                        asSingle={true} />
                                    {/* <DatePicker
                                        id="expiry_date"
                                        selected={formData.expiry_date ? new Date(formData.expiry_date) : null}
                                        onChange={(date: Date | null) => {
                                            // Format the date back to 'YYYY-MM-DD' for your state
                                            const isoDate = date ? date.toISOString().split('T')[0] : '';
                                            console.log(isoDate)
                                            if (formData) {
                                                setFormData({ ...formData, expiry_date: isoDate });
                                            }
                                        }}
                                        dateFormat="MM-dd-yyyy" // Set your desired display format
                                        placeholderText="MM-DD-YYYY"
                                        className="mt-1 block w-full px-3 text-gray-700 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        wrapperClassName="w-full"
                                    /> */}
                                </div>

                                {/* Tags */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Tags</label>
                                    <div className="flex items-center mt-1 gap-2">
                                        <input
                                            type="text"
                                            value={tagInput}
                                            onChange={(e) => setTagInput(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                                            className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-700 placeholder-gray-500 focus:z-10 focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                                            placeholder="Add a tag and press Enter"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddTag}
                                            className="-ml-px inline-flex items-center whitespace-nowrap rounded-md border border-primary bg-white px-4 py-2 text-sm font-medium text-primary hover:bg-blue-50 focus:z-10 focus:border-primary focus:outline-none focus:ring-primary"
                                        >
                                            <FiPlus className="-ml-1 mr-2 h-5 w-5" />
                                            Add Tag
                                        </button>
                                    </div>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {/* Ensure formData.document_tags exists and is an array before mapping */}
                                        {Array.isArray(formData.document_tags) && formData.document_tags.map(tag => (
                                            <span key={tag.name} className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                                                {tag.name}
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveTag(tag)}
                                                    className="ml-2 flex-shrink-0 rounded-full p-0.5 text-blue-500 hover:bg-blue-200 hover:text-blue-700 focus:outline-none"
                                                >
                                                    {/* Screen reader text for accessibility */}
                                                    <span className="sr-only">Remove {tag.name}</span>
                                                    <FiX className="h-4 w-4" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Note / Description */}
                                <div>
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Note</label>
                                    <textarea
                                        name="description"
                                        id="description"
                                        rows={4}
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    />
                                </div>

                                <button
                                    type="button"
                                    onClick={handleShareDocument}
                                    className="-ml-px inline-flex items-center whitespace-nowrap rounded-md border border-primary bg-white px-4 py-2 text-sm font-medium text-primary hover:bg-blue-50 focus:z-10 focus:border-primary focus:outline-none focus:ring-primary"
                                >
                                    <FiShare className="-ml-1 mr-2 h-5 w-5" />
                                    Share Document
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}