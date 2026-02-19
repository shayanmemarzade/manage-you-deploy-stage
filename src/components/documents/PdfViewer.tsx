// src/components/documents/PdfViewer.tsx

'use client';

import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// THIS IS THE CRITICAL CHANGE for the worker file
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
).toString();

interface PdfViewerProps {
    filePath: string;
    title: string;
}

export default function PdfViewer({ filePath, title }: PdfViewerProps) {
    const [numPages, setNumPages] = useState<number | null>(null);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
        setNumPages(numPages);
    }

    return (
        <div className="w-full h-full overflow-y-auto">
            <Document file={filePath} onLoadSuccess={onDocumentLoadSuccess} onLoadError={console.error}>
                {Array.from({ length: numPages || 0 }, (_, index) => (
                    <Page
                        key={`page_${index + 1}`}
                        pageNumber={index + 1}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                    />
                ))}
            </Document>
        </div>
    );
}