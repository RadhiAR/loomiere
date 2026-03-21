"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import BackButton from "@/components/BackButton";
import { readTrackedRequestIds } from "@/lib/custom-request-tracker";
import { isAdminSessionActive } from "@/lib/admin-session";

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
    assignee: string | null;
    created_at: string | null;
    updated_at: string | null;
};

type ViewMode = "grid" | "list";

type AdminUserOption = {
    label: string;
    value: string;
};

const ADMIN_USERS_KEY = "loomiere_admin_users_v1";

export default function CustomizeRequestsPage() {
    const searchParams = useSearchParams();
    const submittedId = searchParams.get("submitted") || "";
    const isAdmin = isAdminSessionActive();

    const [items, setItems] = useState<RequestItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [pageMessage, setPageMessage] = useState("");
    const [viewMode, setViewMode] = useState<ViewMode>("grid");
    const [savingAssigneeId, setSavingAssigneeId] = useState<string>("");
    const [adminAssignees, setAdminAssignees] = useState<AdminUserOption[]>([]);

    useEffect(() => {
        if (typeof window === "undefined") return;

        try {
            const raw = window.localStorage.getItem(ADMIN_USERS_KEY);
            const parsed = raw ? JSON.parse(raw) : [];
            const options = Array.isArray(parsed)
                ? parsed.map((item: any) => ({
                    value: item?.username || item?.email || "",
                    label:
                        [item?.firstName, item?.lastName].filter(Boolean).join(" ").trim() ||
                        item?.username ||
                        item?.email ||
                        "Admin",
                }))
                : [];

            setAdminAssignees(options.filter((item) => item.value));
        } catch {
            setAdminAssignees([]);
        }
    }, []);

    async function loadRequests() {
        try {
            setLoading(true);
            setPageMessage("");

            const ids = isAdmin ? [] : readTrackedRequestIds();
            const query = isAdmin
                ? "/api/custom-requests?scope=all"
                : `/api/custom-requests?ids=${encodeURIComponent(ids.join(","))}`;

            if (!isAdmin && !ids.length) {
                setItems([]);
                setPageMessage("No saved requests found in this browser yet.");
                return;
            }

            const res = await fetch(query);
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

    useEffect(() => {
        loadRequests();
    }, [isAdmin]);

    async function handleAssigneeChange(requestId: string, assignee: string) {
        try {
            setSavingAssigneeId(requestId);

            const res = await fetch("/api/custom-requests", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    requestId,
                    assignee,
                }),
            });

            const data = await res.json().catch(() => null);

            if (!res.ok) {
                throw new Error(data?.message || "Failed to update assignee.");
            }

            setItems((prev) =>
                prev.map((item) =>
                    item.request_id === requestId
                        ? {
                            ...item,
                            assignee,
                            updated_at: new Date().toISOString(),
                        }
                        : item
                )
            );
        } catch (error: any) {
            setPageMessage(error?.message || "Failed to update assignee.");
        } finally {
            setSavingAssigneeId("");
        }
    }

    const headingText = useMemo(() => {
        return isAdmin ? "Submitted Requests" : "Your Submitted Requests";
    }, [isAdmin]);

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

                <div className="mx-auto max-w-7xl pt-28">
                    <div className="mb-8 text-center">
                        <div className="text-xs uppercase tracking-[0.35em] text-black/45">
                            LOOMIÈRE CUSTOM REQUESTS
                        </div>
                        <h1 className="mt-4 text-4xl italic tracking-tight sm:text-5xl">
                            {headingText}
                        </h1>
                        <p className="mx-auto mt-4 max-w-3xl text-base leading-8 text-black/65">
                            {isAdmin
                                ? "Manage all submitted requests, switch views, and assign an owner to each request."
                                : "Track every request submitted from this browser."}
                        </p>

                        {submittedId ? (
                            <div className="mx-auto mt-6 inline-flex rounded-full border border-[#efc5d7] bg-white px-5 py-3 text-sm text-black/75">
                                Request submitted successfully — ID:
                                <span className="ml-2 font-semibold">{submittedId}</span>
                            </div>
                        ) : null}
                    </div>

                    {isAdmin && !loading && items.length ? (
                        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-[24px] border border-[#efc5d7] bg-white/80 px-5 py-4 shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
                            <div className="text-sm text-black/60">
                                Total requests: <span className="font-semibold text-black/85">{items.length}</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setViewMode("grid")}
                                    className={`rounded-full px-4 py-2 text-xs uppercase tracking-[0.18em] transition ${viewMode === "grid"
                                            ? "bg-[#ef5f9a] text-white"
                                            : "border border-[#efc5d7] bg-white text-black/65"
                                        }`}
                                >
                                    Grid View
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setViewMode("list")}
                                    className={`rounded-full px-4 py-2 text-xs uppercase tracking-[0.18em] transition ${viewMode === "list"
                                            ? "bg-[#ef5f9a] text-white"
                                            : "border border-[#efc5d7] bg-white text-black/65"
                                        }`}
                                >
                                    List View
                                </button>
                            </div>
                        </div>
                    ) : null}

                    {loading ? (
                        <div className="rounded-[28px] border border-[#efc5d7] bg-white/75 p-10 text-center text-black/55 shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
                            Loading requests...
                        </div>
                    ) : pageMessage && !items.length ? (
                        <div className="rounded-[28px] border border-[#efc5d7] bg-white/75 p-10 text-center text-black/55 shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
                            {pageMessage}
                        </div>
                    ) : (
                        <div
                            className={
                                viewMode === "grid"
                                    ? "grid gap-5 md:grid-cols-2 xl:grid-cols-3"
                                    : "grid gap-4"
                            }
                        >
                            {items.map((item) => (
                                <div
                                    key={item.request_id || Math.random()}
                                    className={`rounded-[24px] border border-[#efc5d7] bg-white/85 shadow-[0_14px_34px_rgba(0,0,0,0.05)] ${viewMode === "list" ? "p-4" : "p-5"
                                        }`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <div className="truncate text-[11px] uppercase tracking-[0.24em] text-black/45">
                                                {item.request_id || "Pending ID"}
                                            </div>
                                            <div className="mt-2 text-lg font-medium leading-7 text-black/85">
                                                {[item.first_name, item.last_name].filter(Boolean).join(" ")}
                                            </div>
                                            <div className="mt-1 truncate text-sm text-black/55">
                                                {item.email || "No email"}
                                            </div>
                                        </div>

                                        <span className="inline-flex shrink-0 rounded-full bg-[#ef5f9a] px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-white">
                                            {item.status || "submitted"}
                                        </span>
                                    </div>

                                    <div className="mt-4 grid gap-4">
                                        {item.photo_url ? (
                                            <img
                                                src={item.photo_url}
                                                alt={item.request_id || "Request image"}
                                                className={`w-full rounded-[18px] border border-[#efc5d7] bg-white object-cover ${viewMode === "list" ? "h-[180px]" : "h-[220px]"
                                                    }`}
                                            />
                                        ) : null}

                                        <div className="grid gap-3">
                                            <CompactDetail label="Product Type" value={item.product_type} />
                                            <CompactDetail label="Description" value={item.description} clamp />
                                            <CompactDetail label="Measurements" value={item.measurements} clamp />
                                            <CompactDetail label="Notes" value={item.notes} clamp />
                                        </div>

                                        <div className="grid gap-3 rounded-[18px] border border-[#efc5d7] bg-[#fff9fc] p-4 text-sm text-black/65">
                                            <div>
                                                <span className="font-medium text-black/75">Created:</span>{" "}
                                                {formatDate(item.created_at)}
                                            </div>
                                            <div>
                                                <span className="font-medium text-black/75">Updated:</span>{" "}
                                                {formatDate(item.updated_at)}
                                            </div>

                                            {isAdmin ? (
                                                <div className="pt-1">
                                                    <div className="mb-2 text-[11px] uppercase tracking-[0.18em] text-black/45">
                                                        Assignee
                                                    </div>
                                                    <select
                                                        value={item.assignee || ""}
                                                        onChange={(e) =>
                                                            handleAssigneeChange(
                                                                item.request_id || "",
                                                                e.target.value
                                                            )
                                                        }
                                                        disabled={
                                                            savingAssigneeId === item.request_id ||
                                                            !item.request_id
                                                        }
                                                        className="w-full rounded-xl border border-[#efc5d7] bg-white px-3 py-3 text-sm text-black/75 outline-none focus:border-[#d86b98]"
                                                    >
                                                        <option value="">Unassigned</option>
                                                        {adminAssignees.map((admin) => (
                                                            <option key={admin.value} value={admin.value}>
                                                                {admin.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            ) : null}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {pageMessage && items.length ? (
                        <div className="mt-6 rounded-[20px] border border-[#efc5d7] bg-white px-4 py-3 text-sm text-[#b24878]">
                            {pageMessage}
                        </div>
                    ) : null}
                </div>
            </section>
        </main>
    );
}

function CompactDetail({
    label,
    value,
    clamp = false,
}: {
    label: string;
    value: string | null | undefined;
    clamp?: boolean;
}) {
    const content = value?.trim() ? value : "Not provided";

    return (
        <div>
            <div className="mb-1 text-[11px] uppercase tracking-[0.2em] text-black/45">
                {label}
            </div>
            <div
                className={`rounded-[18px] border border-[#efc5d7] bg-[#fff9fc] px-4 py-3 text-sm leading-6 text-black/65 ${clamp ? "line-clamp-3 overflow-hidden" : ""
                    }`}
            >
                {content}
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