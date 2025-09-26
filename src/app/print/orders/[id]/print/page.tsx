
'use client';
import { useEffect } from 'react';

// This page is now a placeholder. The content is injected dynamically.
export default function PrintPlaceholderPage() {
    useEffect(() => {
        // This effect will run after the content has been written by the parent window.
        // It's a good place for any print-specific client-side logic if needed in the future.
    }, []);

    return (
        <div id="print-root">
           {/* Content will be injected here by the parent window that called window.open() */}
        </div>
    );
}
