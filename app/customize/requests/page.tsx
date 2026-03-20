"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import BackButton from "@/components/BackButton";
import { readTrackedRequestIds } from "@/lib/custom-request-tracker";

type RequestItem = {
    request_id: string | null;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    product_type: string | null;
    description: string | null;
    measurements: string | null;
    notes: string | null;
    photo_url: string | null;
    status: string | null;
    created_at: string | null;
    updated_at: string | null;
};

export default function CustomizeRequestsPage() {
    const searchParams = useSearchParams();
    const submittedId = searchParams.get("submitted") || "";

    const [items, setItems] = useState<RequestItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [pageMessage, setPageMessage] = useState("");

    useEffect(() => {
        async function loadRequests() {
            try {
                const ids = readTrackedRequestIds();

                if (!ids.length) {
                    setItems([]);
                    setPageMessage("No saved requests found in this browser yet.");
                    return;
                }

                const res = await fetch(`/api/custom-requests?ids=${encodeURIComponent(ids.join(","))}`);
                const data = await res.json().catch(() => null);

                if (!res.ok) {
                    throw new Error(data?.message || "Failed to load requests.");
                }

                setItems(data?.items || []);
            } catch (error: any) {
                setPageMessage(error?.message || "Failed to load requests.");
            } finally {
                setLoading(false);
            }
        }

        loadRequests();
    }, []);

    return (
        <main className="min-h-screen bg-[#f9eff4] text-black">
            <section className="mx-auto max-w-[1500px] px-4 pb-16 pt-6 sm:px-6 lg:px-8">
                <div className="pointer-events-none absolute inset-x-0 top-6 z-20 flex items-start justify-between px-4 sm:px-6 lg:px-8">
                    <div className="pointer-events-auto">
                        <BackButton href="/customize" label="Customize" theme="light" />
                    </div>
                    <div className="pointer-events-auto">
                        <Navbar theme="light" />
                    </div>
                </div>

                <div className="mx-auto max-w-6xl pt-28">
                    <div className="mb-8 text-center">
                        <div className="text-xs uppercase tracking-[0.35em] text-black/45">
                            LOOMIÈRE CUSTOM REQUESTS
                        </div>
                        <h1 className="mt-4 text-4xl italic tracking-tight sm:text-5xl">
                            Your Submitted Requests
                        </h1>
                        <p className="mx-auto mt-4 max-w-3xl text-base leading-8 text-black/65">
                            Track every request submitted from this browser.
                        </p>

                        {submittedId ? (
                            <div className="mx-auto mt-6 inline-flex rounded-full border border-[#efc5d7] bg-white px-5 py-3 text-sm text-black/75">
                                Request submitted successfully — ID: <span className="ml-2 font-semibold">{submittedId}</span>
                            </div>
                        ) : null}
                    </div>

                    {loading ? (
                        <div className="rounded-[28px] border border-[#efc5d7] bg-white/75 p-10 text-center text-black/55 shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
                            Loading requests...
                        </div>
                    ) : pageMessage && !items.length ? (
                        <div className="rounded-[28px] border border-[#efc5d7] bg-white/75 p-10 text-center text-black/55 shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
                            {pageMessage}
                        </div>
                    ) : (
                        <div className="grid gap-6 lg:grid-cols-2">
                            {items.map((item) => (
                                <div
                                    key={item.request_id || Math.random()}
                                    className="rounded-[28px] border border-[#efc5d7] bg-white/80 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.06)]"
                                >
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <div>
                                            <div className="text-xs uppercase tracking-[0.25em] text-black/45">
                                                {item.request_id || "Pending ID"}
                                            </div>
                                            <div className="mt-2 text-xl font-medium text-black/85">
                                                {[item.first_name, item.last_name].filter(Boolean).join(" ")}
                                            </div>
                                            <div className="mt-1 text-sm text-black/55">{item.email || "No email"}</div>
                                        </div>

                                        <span className="inline-flex rounded-full bg-[#ef5f9a] px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-white">
                                            {item.status || "submitted"}
                                        </span>
                                    </div>

                                    {item.photo_url ? (
                                        <img
                                            src={item.photo_url}
                                            alt={item.request_id || "Request image"}
                                            className="mt-5 h-auto w-full rounded-[24px] border border-[#efc5d7] bg-white object-cover"
                                        />
                                    ) : null}

                                    <div className="mt-5 grid gap-4">
                                        <DetailBlock label="Product Type" value={item.product_type} />
                                        <DetailBlock label="Description" value={item.description} />
                                        <DetailBlock label="Measurements" value={item.measurements} />
                                        <DetailBlock label="Notes" value={item.notes} />
                                    </div>

                                    <div className="mt-5 rounded-[24px] border border-[#efc5d7] bg-[#fff9fc] p-4 text-sm leading-7 text-black/60">
                                        <strong className="text-black/75">Created:</strong> {formatDate(item.created_at)}
                                        <br />
                                        <strong className="text-black/75">Last Updated:</strong> {formatDate(item.updated_at)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}

function DetailBlock({
    label,
    value,
}: {
    label: string;
    value: string | null | undefined;
}) {
    return (
        <div>
            <div className="mb-2 text-xs uppercase tracking-[0.24em] text-black/45">
                {label}
            </div>
            <div className="rounded-[24px] border border-[#efc5d7] bg-[#fff9fc] px-4 py-4 text-sm leading-7 text-black/65">
                {value?.trim() ? value : "Not provided"}
            </div>
        </div>
    );
}

function formatDate(value: string | null) {
    if (!value) return "N/A";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "N/A";
    return date.toLocaleString();
}