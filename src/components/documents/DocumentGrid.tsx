import React from 'react';
import DocumentCard from './DocumentCard'

interface DocumentGridProps {
    documents: any[];

    onDocumentClick: any;

    handleToggleFavorite: any
}

export default function DocumentGrid({ documents, onDocumentClick, handleToggleFavorite }: DocumentGridProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {documents.map(doc => (
                <DocumentCard key={doc.id} document={doc} onDocumentClick={onDocumentClick} handleToggleFavorite={handleToggleFavorite} />
            ))}
        </div>
    );
}