import { Document, DocumentsState } from '@/api/types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState: DocumentsState = {
    documents: [],
    currentDocument: null,
};

const documentsSlice = createSlice({
    name: 'documents',
    initialState,
    reducers: {
        // Sets the entire list of documents, e.g., on initial load
        setDocuments(state, action: PayloadAction<Document[]>) {
            state.documents = action.payload;
        },
        // Adds a new document to the list, e.g., after an upload
        addDocument(state, action: PayloadAction<Document>) {
            // Avoid adding duplicates if the document is already there
            if (!state.documents.find(doc => doc.id === action.payload.id)) {
                state.documents.unshift(action.payload); // Add to the beginning of the list
            }
        },
        // Updates an existing document in the list and the current document
        updateDocument(state, action: PayloadAction<Partial<Document> & { id: number }>) {
            const index = state.documents.findIndex(doc => doc.id === action.payload.id);
            if (index !== -1) {
                // Merge the existing document with the payload
                state.documents[index] = { ...state.documents[index], ...action.payload };
            }
            // Also update currentDocument if it's the one being edited
            if (state.currentDocument && state.currentDocument.id === action.payload.id) {
                state.currentDocument = { ...state.currentDocument, ...action.payload };
            }
        },
        // Sets the currently active document for the detail/preview page
        setCurrentDocument(state, action: PayloadAction<Document | null>) {
            state.currentDocument = action.payload;
        },
    },
});

export const { setDocuments, addDocument, updateDocument, setCurrentDocument } = documentsSlice.actions;
export default documentsSlice.reducer;