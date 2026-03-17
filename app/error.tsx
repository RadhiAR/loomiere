"use client";

import { useEffect } from "react";

export default function GlobalError({
    error,
    reset
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        const msg = (error?.message || "").toLowerCase();

        const isChunkError =
            msg.includes("chunkloaderror") ||
            msg.includes("loading chunk") ||
            msg.includes("_next/static/chunks") ||
            msg.includes("failed to fetch dynamically imported module");

        // In dev, this is typically HMR/chunk mismatch after being idle/sleep.
        // Best UX: auto-refresh to fetch the new chunks.
        if (isChunkError) {
            const t = setTimeout(() => {
                window.location.reload();
            }, 400);

            return () => clearTimeout(t);
        }
    }, [error]);

    // Fallback UI for other errors
    return (
        <html>
            <body className="min-h-screen bg-white">
                <div className="mx-auto max-w-3xl px-6 py-20">
                    <h1 className="text-2xl font-semibold">Something went wrong</h1>
                    <p className="mt-3 text-sm text-black/70">
                        Try reloading the page. If the issue continues, please let us know.
                    </p>

                    <div className="mt-8 flex gap-3">
                        <button
                            onClick={() => window.location.reload()}
                            className="rounded-full bg-black px-5 py-2 text-sm text-white"
                        >
                            Reload
                        </button>

                        <button
                            onClick={() => reset()}
                            className="rounded-full border border-black/15 px-5 py-2 text-sm"
                        >
                            Try Again
                        </button>
                    </div>

                    <pre className="mt-10 overflow-auto rounded-xl bg-black/5 p-4 text-xs text-black/70">
                        {error?.message}
                    </pre>
                </div>
            </body>
        </html>
    );
}