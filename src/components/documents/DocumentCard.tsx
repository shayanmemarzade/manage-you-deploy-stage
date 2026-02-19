import React from 'react';
import { FaHeart, FaRegHeart } from "react-icons/fa";

// It's good practice to define a type for your data
export interface Document {
    id: number;
    title: string;
    expiry_date: string | null;
    document_tags: any[]; // Or define a Tag type
    thumbnail: string;

    file_path: string;

    favorite: number;
}

interface DocumentCardProps {
    document: Document;

    onDocumentClick: any;

    handleToggleFavorite: any;
}

const PLACEHOLDER = 'https://placehold.co/600x400/E2E8F0/4A5568?text=Document';
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png'];

function isImagePath(path: string): boolean {
    return IMAGE_EXTENSIONS.some(ext => path.toLowerCase().endsWith(ext));
}

function getDocumentImage(doc: Document): string {
    if (doc.thumbnail && isImagePath(doc.thumbnail)) return doc.thumbnail;
    if (doc.file_path && isImagePath(doc.file_path)) return doc.file_path;
    return PLACEHOLDER;
}

export default function DocumentCard({ document, onDocumentClick, handleToggleFavorite }: DocumentCardProps) {
    // Provide a fallback for a null expiry date
    let expiryText = 'No expiration date';
    if (document.expiry_date) {
        // Split 'YYYY-MM-DD' into an array [YYYY, MM, DD]
        const [year, month, day] = document.expiry_date.split('-');
        // Reassemble in the desired 'MM-DD-YYYY' format
        expiryText = `Expiration: ${month}-${day}-${year}`;
    }

    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        e.currentTarget.src = 'https://placehold.co/600x400/E2E8F0/4A5568?text=Document';
    };

    return (
        <div onClick={() => onDocumentClick(document)}
            className="bg-blackSqueezeLight cursor-pointer rounded-xl shadow-sm overflow-hidden group  hover:shadow-xl transition-shadow duration-300 border border-blackSqueeze p-4">
            {/* Image container with padding and a light background to match the design */}
            <div className="p-4 bg-white flex justify-center items-center h-40">
                {/* Replaced Next/Image with a standard img tag for compatibility */}
                <img
                    src={getDocumentImage(document)}
                    alt={document.title}
                    className="object-contain h-full w-full"
                    onError={handleImageError}
                />
            </div>

            {/* Content section */}
            <div className="pt-4">
                <div className="flex justify-between items-start gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">{document.title}</h3>

                    {/* Favorite Button */}
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation(); // Prevents the card's main click event
                            handleToggleFavorite(document.id, document.favorite);
                        }}
                        className="p-1 text-gray-400 rounded-full hover:bg-primary-100 hover:text-primary focus:outline-none"
                        aria-label="Toggle Favorite"
                    >
                        {document.favorite === 1 ? (
                            <FaHeart className="w-5 h-5 text-primary" />
                        ) : (
                            <FaRegHeart className="w-5 h-5" />
                        )}
                    </button>
                </div>

                <p className="text-sm text-gray-600 mb-4">{expiryText}</p>
                <div className="flex flex-wrap gap-2">
                    {document.document_tags && document.document_tags.map(tag => (
                        <span
                            key={tag.name}
                            className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-full"
                        >
                            {tag.name}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}