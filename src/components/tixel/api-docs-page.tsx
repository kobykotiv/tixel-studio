
"use client";

import { Header } from '@/components/tixel/header';
import { ApiDocs } from '@/components/tixel/api-docs';

export function ApiDocsPage() {
    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            <Header />
            <main className="flex-1">
                <ApiDocs />
            </main>
        </div>
    );
}
