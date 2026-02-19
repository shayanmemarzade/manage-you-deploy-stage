'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { setDocuments, addDocument, setCurrentDocument, updateDocument } from '@/store/reducer/documents';
import { Document as DocumentType } from '@/api/types';
import { FiUpload } from "react-icons/fi";
import Navbar from '@/components/common/Navbar';
import SearchFilterBar from '@/components/documents/SearchFilterBar';
import DocumentGrid from '@/components/documents/DocumentGrid';
import { documentApi } from '@/api/modules/document';
import UpgradeModal, { FREE_UPLOAD_LIMIT } from '@/components/subscription/UpgradeModal';


type SortOption = 'az' | 'za' | 'expiry';

export default function DocumentsPage() {
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    const [activeTab, setActiveTab] = useState('Document'); // 'Document' or 'Favorites'
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [sortOption, setSortOption] = useState<SortOption>('az');
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    // Get documents directly from the Redux store
    const { documents } = useSelector((state: RootState) => state.documents);

    // Get user to check subscription status
    const user = useSelector((state: RootState) => state.auth.user);
    const accountDetails = user?.account_details;

    const hasActiveSubscription = useMemo(() => {
        if (!accountDetails) return false;
        if (accountDetails.subscription_id === null) return false;
        const now = Math.floor(Date.now() / 1000);
        // subscription_end_date null means perpetual (or not yet set) — treat as active
        if (accountDetails.subscription_end_date === null) return true;
        return accountDetails.subscription_end_date > now;
    }, [accountDetails]);

    const canUpload = hasActiveSubscription || documents.length < FREE_UPLOAD_LIMIT;

    const allTags = useMemo(() => {
        const tags = documents.flatMap(doc => doc.document_tags?.map(tag => tag.name) || []);
        return [...new Set(tags)]; // Returns a unique array of tag names
    }, [documents]);

    // This memoized value filters by tab AND search query
    const filteredDocuments = useMemo(() => {
        let docs = documents;

        // --- Filtering ---
        // 1. First, filter by the active tab
        if (activeTab === 'Favorites') {
            docs = docs.filter(doc => doc.favorite === 1);
        }

        // 2. filter the result by the search query
        if (searchQuery) {
            docs = docs.filter(doc =>
                doc.title.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // 3. Filter by selected tags
        if (selectedTags.length > 0) {
            docs = docs.filter(doc =>
                doc.document_tags?.some(tag => selectedTags.includes(tag.name))
            );
        }

        // --- Sorting ---
        // Create a new array to avoid mutating the original
        const sortedDocs = [...docs];

        switch (sortOption) {
            case 'za':
                sortedDocs.sort((a, b) => b.title.localeCompare(a.title));
                break;
            case 'expiry':
                sortedDocs.sort((a, b) => {
                    if (!a.expiry_date) return 1; // Docs with no expiry date go to the end
                    if (!b.expiry_date) return -1;
                    return new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime();
                });
                break;
            case 'az':
            default:
                sortedDocs.sort((a, b) => a.title.localeCompare(b.title));
                break;
        }

        return sortedDocs;

        // return docs;
    }, [documents, activeTab, searchQuery, selectedTags, sortOption]); // Re-runs only when documents / activeTab / search bar changes

    // TODO: Fetch real documents from your API
    useEffect(() => {
        documentApi.getDocuments().then(res => {
            console.log("****************** documents *************")
            console.log(res.documents);
            console.log("****************** documents *************")
            if (res.documents) {
                dispatch(setDocuments(res.documents));
            }
        }).catch(console.error);
    }, []);

    const handleUpload = useCallback(async (file: any) => {
        setIsLoading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', file.name); // Per Jira, only name is required initially
        formData.append('size', file?.size);

        try {
            const res = await documentApi.uploadDocument(formData);
            // On success, redirect to the detail screen for the new document
            // Add the new document to the global store
            dispatch(addDocument(res.document));
            // Set it as the current document to be viewed
            dispatch(setCurrentDocument(res.document));
            // Navigate to the detail page
            router.push(`/individual-dashboard/documents/${res.document.id}`);
            //
        } catch (error) {
            console.error('Upload failed:', error);
            // TODO: Show an error message to the user
        } finally {
            setIsLoading(false);
        }
    }, [router, dispatch]);

    const handleToggleFavorite = async (documentId: number, currentStatus: number) => {
        // Determine the new status to send to the backend
        const newStatus = currentStatus === 1 ? 0 : 1;

        // 1. Optimistic UI Update: This makes the UI feel instant.
        dispatch(updateDocument({ id: documentId, favorite: newStatus }));

        // 2. Prepare FormData for the API call
        const formData = new FormData();
        formData.append('document_id', documentId.toString());
        formData.append('favorite', newStatus.toString());

        // 3. Call the backend API
        try {
            await documentApi.updateDocument(formData);
        } catch (error) {
            console.error("Failed to update favorite status:", error);

            // 4. Rollback on Failure: If the API call fails, revert the UI change.
            dispatch(updateDocument({ id: documentId, favorite: currentStatus }));

            // TODO: Show an error message to the user
        }
    };

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            if (!canUpload) {
                setShowUpgradeModal(true);
                return;
            }
            handleUpload(acceptedFiles[0]);
        }
    }, [handleUpload, canUpload]);

    // noClick prevents opening file dialog on clicking the drop zone
    const { getRootProps, getInputProps, isDragActive, open } = useDropzone({ onDrop, noClick: true });

    // Handle clicking a document in the grid
    const handleDocumentClick = (doc: DocumentType) => {
        dispatch(setCurrentDocument(doc));
        router.push(`/individual-dashboard/documents/${doc.id}`);
    };

    return (
        <div className="min-h-screen bg-linkWater">

            {/* Upgrade modal – shown when free upload limit is reached */}
            <UpgradeModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                documentCount={documents.length}
            />

            {isLoading && (
                <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
                    <div className="flex flex-col items-center bg-white p-8 rounded-lg shadow-xl">
                        {/* Spinner */}
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
                        <p className="text-lg font-semibold text-gray-800">Uploading Document...</p>
                        <p className="text-sm text-gray-500">Please wait a moment.</p>
                    </div>
                </div>
            )}


            <Navbar />

            <div className="bg-white shadow-sm">
                <div className=" py-4 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                    <h1 className="text-xl font-semibold text-gray-900">Documents</h1>
                    <button
                        onClick={() => {
                            if (!canUpload) {
                                setShowUpgradeModal(true);
                                return;
                            }
                            open();
                        }}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-normal rounded-md shadow-sm text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <FiUpload className="mr-2" /> Upload Document
                    </button>
                </div>
            </div>

            {/* Main content area with drag-and-drop functionality */}
            <main className="" {...getRootProps()}>
                <input {...getInputProps()} />

                {/* Drag Active Overlay */}
                {isDragActive && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-blue-500 bg-opacity-70">
                        <p className="text-2xl font-bold text-white">
                            Drop the file to upload
                        </p>
                    </div>
                )}

                {/* Header Section */}

                <div className="p-8">
                    <div className="bg-white border border-black12opacity rounded-md p-6">
                        {/* Filter and Search Bar */}
                        <SearchFilterBar
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                            allTags={allTags}
                            selectedTags={selectedTags}
                            setSelectedTags={setSelectedTags}
                            sortOption={sortOption}
                            setSortOption={setSortOption}
                        />

                        {/* Documents Grid */}
                        <DocumentGrid documents={filteredDocuments} onDocumentClick={handleDocumentClick} handleToggleFavorite={handleToggleFavorite} />
                    </div>
                </div>
            </main>
        </div>
    );
}