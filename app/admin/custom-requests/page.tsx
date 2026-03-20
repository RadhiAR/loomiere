"use client";

import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import BackButton from "@/components/BackButton";
import {
    disableAdminSession,
    enableAdminSession,
    readAdminKey,
    saveAdminKey,
} from "@/lib/admin-session";

type CustomRequest = {
    id: number;
    request_id: string | null;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    phone: string | null;
    zipcode: string | null;
    product_type: string | null;
    description: string | null;
    measurements: string | null;
    notes: string | null;
    photo_url: string | null;
    photo_path: string | null;
    status: string | null;
    admin_notes: string | null;
    quoted_price: string | null;
    created_at: string | null;
    updated_at: string | null;
};

const STATUS_OPTIONS = [
    "submitted",
    "reviewing",
    "quoted",
    "in-progress",
    "completed",
    "cancelled",
];

export default function AdminCustomRequestsPage() {
    const [adminKey, setAdminKey] = useState("");
    const [savedKey, setSavedKey] = useState("");
    const [requests, setRequests] = useState<CustomRequest[]>([]);
    const [loading, setLoading] = useState(false);
    const [pageMessage, setPageMessage] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState<CustomRequest | null>(null);
    const [saving, setSaving] = useState(false);

    const [editStatus, setEditStatus] = useState("submitted");
    const [editPrice, setEditPrice] = useState("");
    const [editAdminNotes, setEditAdminNotes] = useState("");

    useEffect(() => {
        const existing = readAdminKey();
        if (existing) {
            setAdminKey(existing);
            setSavedKey(existing);
        }
    }, []);

    useEffect(() => {
        if (!selected) return;
        setEditStatus(selected.status || "submitted");
        setEditPrice(selected.quoted_price || "");
        setEditAdminNotes(selected.admin_notes || "");
    }, [selected]);

    async function loadRequests(keyOverride?: string) {
        const keyToUse = keyOverride || savedKey || adminKey;

        if (!keyToUse.trim()) {
            setPageMessage("Enter admin key first.");
            return;
        }

        setLoading(true);
        setPageMessage("");

        try {
            const params = new URLSearchParams();
            if (statusFilter !== "all") params.set("status", statusFilter);
            if (search.trim()) params.set("search", search.trim());

            const res = await fetch(`/api/admin/custom-requests?${params.toString()}`, {
                headers: {
                    "x-admin-key": keyToUse,
                },
            });

            const data = await res.json().catch(() => null);

            if (!res.ok) {
                throw new Error(data?.message || "Failed to load requests.");
            }

            saveAdminKey(keyToUse.trim());
            setSavedKey(keyToUse.trim());
            enableAdminSession();

            setRequests(data?.items || []);
            if (selected) {
                const nextSelected = (data?.items || []).find((item: CustomRequest) => item.id === selected.id);
                setSelected(nextSelected || null);
            }
        } catch (error: any) {
            setPageMessage(error?.message || "Failed to load requests.");
        } finally {
            setLoading(false);
        }
    }

    function handleSaveAdminKey() {
        if (!adminKey.trim()) {
            setPageMessage("Please enter admin key.");
            return;
        }

        saveAdminKey(adminKey.trim());
        setSavedKey(adminKey.trim());
        setPageMessage("Admin key saved in this browser.");
    }

    function clearAdminAccess() {
        disableAdminSession();
        setAdminKey("");
        setSavedKey("");
        setRequests([]);
        setSelected(null);
        setPageMessage("Admin access cleared.");
    }

    async function saveChanges() {
        if (!selected) return;
        const keyToUse = savedKey || adminKey;

        if (!keyToUse.trim()) {
            setPageMessage("Missing admin key.");
            return;
        }

        setSaving(true);
        setPageMessage("");

        try {
            const res = await fetch("/api/admin/custom-requests", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "x-admin-key": keyToUse,
                },
                body: JSON.stringify({
                    id: selected.id,
                    status: editStatus,
                    quoted_price: editPrice,
                    admin_notes: editAdminNotes,
                }),
            });

            const data = await res.json().catch(() => null);

            if (!res.ok) {
                throw new Error(data?.message || "Failed to save changes.");
            }

            const updated = data?.item as CustomRequest;

            setRequests((prev) =>
                prev.map((item) => (item.id === updated.id ? updated : item))
            );
            setSelected(updated);
            setPageMessage(`Saved ${updated.request_id || "request"} successfully.`);
        } catch (error: any) {
            setPageMessage(error?.message || "Failed to save changes.");
        } finally {
            setSaving(false);
        }
    }

    const stats = useMemo(() => {
        return {
            total: requests.length,
            submitted: requests.filter((item) => item.status === "submitted").length,
            reviewing: requests.filter((item) => item.status === "reviewing").length,
            inProgress: requests.filter((item) => item.status === "in-progress").length,
            completed: requests.filter((item) => item.status === "completed").length,
        };
    }, [requests]);

    return (
        <main className="min-h-screen bg-[#f9eff4] text-black">
            <section className="mx-auto max-w-[1600px] px-4 pb-16 pt-6 sm:px-6 lg:px-8">
                <div className="pointer-events-none absolute inset-x-0 top-6 z-20 flex items-start justify-between px-4 sm:px-6 lg:px-8">
                    <div className="pointer-events-auto">
                        <BackButton href="/" label="Home" theme="light" />
                    </div>
                    <div className="pointer-events-auto">
                        <Navbar theme="light" />
                    </div>
                </div>

                <div className="mx-auto max-w-7xl pt-28">
                    <div className="mb-8 text-center">
                        <div className="text-xs uppercase tracking-[0.35em] text-black/45">
                            Loomière Admin
                        </div>
                        <h1 className="mt-4 text-4xl italic tracking-tight sm:text-5xl">
                            Custom Requests Dashboard
                        </h1>
                        <p className="mx-auto mt-4 max-w-3xl text-base leading-8 text-black/65">
                            Review incoming LMRA requests, update statuses, add internal notes,
                            and track quotes in one place.
                        </p>
                    </div>

                    <div className="mb-6 rounded-[28px] border border-[#efc5d7] bg-white/75 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
                        <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr_auto_auto]">
                            <input
                                type="password"
                                value={adminKey}
                                onChange={(e) => setAdminKey(e.target.value)}
                                placeholder="Enter admin dashboard key"
                                className="h-14 rounded-full border border-[#efc5d7] bg-white px-5 text-sm outline-none focus:border-[#d86b98]"
                            />

                            <button
                                type="button"
                                onClick={handleSaveAdminKey}
                                className="h-14 rounded-full bg-[#ef5f9a] px-6 text-xs uppercase tracking-[0.22em] text-white transition hover:bg-[#de4d8b]"
                            >
                                Save Key
                            </button>

                            <button
                                type="button"
                                onClick={() => loadRequests()}
                                className="h-14 rounded-full border border-[#efc5d7] bg-white px-6 text-xs uppercase tracking-[0.22em] text-black/75 transition hover:bg-[#ffe3ee]"
                            >
                                {loading ? "Loading..." : "Load Requests"}
                            </button>

                            <button
                                type="button"
                                onClick={clearAdminAccess}
                                className="h-14 rounded-full border border-[#efc5d7] bg-white px-6 text-xs uppercase tracking-[0.22em] text-black/75 transition hover:bg-[#ffe3ee]"
                            >
                                Clear Admin
                            </button>
                        </div>

                        {pageMessage ? (
                            <div className="mt-4 rounded-2xl border border-[#efc5d7] bg-[#fff7fb] px-4 py-3 text-sm text-black/70">
                                {pageMessage}
                            </div>
                        ) : null}
                    </div>

                    <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                        <StatCard label="Total" value={String(stats.total)} />
                        <StatCard label="Submitted" value={String(stats.submitted)} />
                        <StatCard label="Reviewing" value={String(stats.reviewing)} />
                        <StatCard label="In Progress" value={String(stats.inProgress)} />
                        <StatCard label="Completed" value={String(stats.completed)} />
                    </div>

                    <div className="mb-6 rounded-[28px] border border-[#efc5d7] bg-white/75 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
                        <div className="grid gap-4 lg:grid-cols-[220px_1fr_auto]">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="h-14 rounded-full border border-[#efc5d7] bg-white px-5 text-sm outline-none focus:border-[#d86b98]"
                            >
                                <option value="all">All statuses</option>
                                {STATUS_OPTIONS.map((item) => (
                                    <option key={item} value={item}>
                                        {item}
                                    </option>
                                ))}
                            </select>

                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by LMRA id, name, email, type, or description"
                                className="h-14 rounded-full border border-[#efc5d7] bg-white px-5 text-sm outline-none focus:border-[#d86b98]"
                            />

                            <button
                                type="button"
                                onClick={() => loadRequests()}
                                className="h-14 rounded-full bg-[#ef5f9a] px-6 text-xs uppercase tracking-[0.22em] text-white transition hover:bg-[#de4d8b]"
                            >
                                Apply Filters
                            </button>
                        </div>
                    </div>

                    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                        <div className="rounded-[28px] border border-[#efc5d7] bg-white/75 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-lg uppercase tracking-[0.24em] text-black/55">
                                    Requests
                                </h2>
                                <div className="text-sm text-black/45">{requests.length} loaded</div>
                            </div>

                            <div className="space-y-4">
                                {requests.length === 0 ? (
                                    <div className="rounded-3xl border border-dashed border-[#efc5d7] bg-[#fff9fc] px-5 py-12 text-center text-black/45">
                                        No requests yet. Load your dashboard to see submissions.
                                    </div>
                                ) : (
                                    requests.map((item) => {
                                        const active = selected?.id === item.id;

                                        return (
                                            <button
                                                key={item.id}
                                                type="button"
                                                onClick={() => setSelected(item)}
                                                className={`w-full rounded-[26px] border p-5 text-left transition ${active
                                                        ? "border-[#e7649f] bg-[#fff1f7] shadow-[0_10px_30px_rgba(231,100,159,0.12)]"
                                                        : "border-[#efc5d7] bg-white hover:bg-[#fff7fb]"
                                                    }`}
                                            >
                                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                                    <div>
                                                        <div className="text-xs uppercase tracking-[0.25em] text-black/45">
                                                            {item.request_id || "Pending ID"}
                                                        </div>
                                                        <div className="mt-2 text-lg font-medium text-black/85">
                                                            {[item.first_name, item.last_name].filter(Boolean).join(" ")}
                                                        </div>
                                                        <div className="mt-1 text-sm text-black/55">
                                                            {item.email || "No email"} · {item.product_type || "No type"}
                                                        </div>
                                                    </div>

                                                    <span className="inline-flex rounded-full bg-[#ef5f9a] px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-white">
                                                        {item.status || "submitted"}
                                                    </span>
                                                </div>

                                                <div className="mt-4 line-clamp-2 text-sm leading-7 text-black/65">
                                                    {item.description || "No description provided."}
                                                </div>

                                                <div className="mt-4 text-xs uppercase tracking-[0.22em] text-black/35">
                                                    Submitted {formatDate(item.created_at)}
                                                </div>
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        <div className="rounded-[28px] border border-[#efc5d7] bg-white/75 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
                            {!selected ? (
                                <div className="flex min-h-[500px] items-center justify-center rounded-[24px] border border-dashed border-[#efc5d7] bg-[#fff9fc] px-6 text-center text-black/45">
                                    Select a request from the left to review details.
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div>
                                        <div className="text-xs uppercase tracking-[0.25em] text-black/45">
                                            {selected.request_id || "Pending ID"}
                                        </div>
                                        <h2 className="mt-2 text-2xl font-medium text-black/85">
                                            {[selected.first_name, selected.last_name].filter(Boolean).join(" ")}
                                        </h2>
                                        <div className="mt-2 text-sm leading-7 text-black/60">
                                            {selected.email || "No email"}<br />
                                            {selected.phone || "No phone"}<br />
                                            Zipcode: {selected.zipcode || "N/A"}
                                        </div>
                                    </div>

                                    {selected.photo_url ? (
                                        <div>
                                            <div className="mb-3 text-xs uppercase tracking-[0.24em] text-black/45">
                                                Uploaded reference
                                            </div>
                                            <img
                                                src={selected.photo_url}
                                                alt={selected.request_id || "Custom request image"}
                                                className="h-auto w-full rounded-[24px] border border-[#efc5d7] bg-white object-cover"
                                            />
                                        </div>
                                    ) : null}

                                    <DetailBlock label="Product Type" value={selected.product_type} />
                                    <DetailBlock label="Description" value={selected.description} />
                                    <DetailBlock label="Measurements" value={selected.measurements} />
                                    <DetailBlock label="Customer Notes" value={selected.notes} />

                                    <div className="grid gap-4">
                                        <div>
                                            <label className="mb-2 block text-xs uppercase tracking-[0.24em] text-black/45">
                                                Status
                                            </label>
                                            <select
                                                value={editStatus}
                                                onChange={(e) => setEditStatus(e.target.value)}
                                                className="h-14 w-full rounded-2xl border border-[#efc5d7] bg-white px-4 text-sm outline-none focus:border-[#d86b98]"
                                            >
                                                {STATUS_OPTIONS.map((item) => (
                                                    <option key={item} value={item}>
                                                        {item}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="mb-2 block text-xs uppercase tracking-[0.24em] text-black/45">
                                                Quoted Price
                                            </label>
                                            <input
                                                value={editPrice}
                                                onChange={(e) => setEditPrice(e.target.value)}
                                                placeholder="Example: $120"
                                                className="h-14 w-full rounded-2xl border border-[#efc5d7] bg-white px-4 text-sm outline-none focus:border-[#d86b98]"
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-2 block text-xs uppercase tracking-[0.24em] text-black/45">
                                                Admin Notes
                                            </label>
                                            <textarea
                                                value={editAdminNotes}
                                                onChange={(e) => setEditAdminNotes(e.target.value)}
                                                placeholder="Internal notes, follow-up plan, yarn details, production timeline..."
                                                rows={6}
                                                className="w-full rounded-[24px] border border-[#efc5d7] bg-white px-4 py-4 text-sm outline-none focus:border-[#d86b98]"
                                            />
                                        </div>

                                        <button
                                            type="button"
                                            onClick={saveChanges}
                                            disabled={saving}
                                            className="h-14 rounded-full bg-[#ef5f9a] px-6 text-xs uppercase tracking-[0.22em] text-white transition hover:bg-[#de4d8b] disabled:cursor-not-allowed disabled:opacity-70"
                                        >
                                            {saving ? "Saving..." : "Save Changes"}
                                        </button>
                                    </div>

                                    <div className="rounded-[24px] border border-[#efc5d7] bg-[#fff9fc] p-4 text-sm leading-7 text-black/60">
                                        <strong className="text-black/75">Created:</strong> {formatDate(selected.created_at)}
                                        <br />
                                        <strong className="text-black/75">Last Updated:</strong> {formatDate(selected.updated_at)}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}

function StatCard({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-[24px] border border-[#efc5d7] bg-white/75 p-5 text-center shadow-[0_16px_40px_rgba(0,0,0,0.05)]">
            <div className="text-xs uppercase tracking-[0.24em] text-black/45">{label}</div>
            <div className="mt-3 text-3xl font-medium italic text-black/85">{value}</div>
        </div>
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