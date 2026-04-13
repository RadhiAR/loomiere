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

type AssigneeFilterValue = "all" | "me" | "unassigned" | string;

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
    const [currentAdminValue, setCurrentAdminValue] = useState("");
    const [assigneeFilter, setAssigneeFilter] = useState<AssigneeFilterValue>("all");

    const [requestIdSearch, setRequestIdSearch] = useState("");
    const [productTypeFilter, setProductTypeFilter] = useState("all");
    const [createdOnFilter, setCreatedOnFilter] = useState("");
    const [submittedBySearch, setSubmittedBySearch] = useState("");
    const [assignedUserSearch, setAssignedUserSearch] = useState("");

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

            const cleanedOptions = options.filter((item) => item.value);
            setAdminAssignees(cleanedOptions);

            const activeAdminKey = window.localStorage.getItem("loomiere_admin_key") || "";
            if (activeAdminKey && Array.isArray(parsed)) {
                const activeAdmin = parsed.find((item: any) => item?.id === activeAdminKey);
                const activeValue = activeAdmin?.username || activeAdmin?.email || "";
                setCurrentAdminValue(activeValue);
            }
        } catch {
            setAdminAssignees([]);
            setCurrentAdminValue("");
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

    const productTypeOptions = useMemo(() => {
        const unique = Array.from(
            new Set(
                items
                    .map((item) => (item.product_type || "").trim())
                    .filter(Boolean)
            )
        ).sort((a, b) => a.localeCompare(b));

        return unique;
    }, [items]);

    const filteredItems = useMemo(() => {
        let result = items;

        if (isAdmin) {
            if (assigneeFilter === "me") {
                result = result.filter((item) => (item.assignee || "") === currentAdminValue);
            } else if (assigneeFilter === "unassigned") {
                result = result.filter((item) => !(item.assignee || "").trim());
            } else if (assigneeFilter !== "all") {
                result = result.filter((item) => (item.assignee || "") === assigneeFilter);
            }

            const requestIdQuery = requestIdSearch.trim().toLowerCase();
            if (requestIdQuery) {
                result = result.filter((item) =>
                    (item.request_id || "").toLowerCase().includes(requestIdQuery)
                );
            }

            if (productTypeFilter !== "all") {
                result = result.filter(
                    (item) =>
                        (item.product_type || "").trim().toLowerCase() ===
                        productTypeFilter.toLowerCase()
                );
            }

            if (createdOnFilter) {
                result = result.filter((item) => {
                    if (!item.created_at) return false;
                    const date = new Date(item.created_at);
                    if (Number.isNaN(date.getTime())) return false;
                    const yyyy = date.getFullYear();
                    const mm = String(date.getMonth() + 1).padStart(2, "0");
                    const dd = String(date.getDate()).padStart(2, "0");
                    return `${yyyy}-${mm}-${dd}` === createdOnFilter;
                });
            }

            const submittedNameQuery = submittedBySearch.trim().toLowerCase();
            if (submittedNameQuery) {
                result = result.filter((item) => {
                    const fullName = [item.first_name, item.last_name]
                        .filter(Boolean)
                        .join(" ")
                        .trim()
                        .toLowerCase();

                    return fullName.includes(submittedNameQuery);
                });
            }

            const assignedUserQuery = assignedUserSearch.trim().toLowerCase();
            if (assignedUserQuery) {
                result = result.filter((item) =>
                    (item.assignee || "").toLowerCase().includes(assignedUserQuery)
                );
            }
        }

        return result;
    }, [
        items,
        isAdmin,
        assigneeFilter,
        currentAdminValue,
        requestIdSearch,
        productTypeFilter,
        createdOnFilter,
        submittedBySearch,
        assignedUserSearch,
    ]);

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
                            LOOMEIRA CUSTOM REQUESTS
                        </div>

                        <h1 className="mt-4 text-4xl italic tracking-tight sm:text-5xl">
                            {headingText}
                        </h1>

                        <p className="mx-auto mt-4 max-w-4xl text-base leading-8 text-black/65">
                            {isAdmin
                                ? "This page contains all the requests submitted by Loomeira shoppers for their desired products. Every submitted request appears here, and a user can assign a ticket to their own user name, begin working on it, and connect with the shopper through Loomeira MILAN to continue the conversation."
                                : "Track every request submitted from this browser."}
                        </p>

                        {submittedId ? (
                            <div className="mx-auto mt-6 max-w-4xl rounded-[22px] border border-[#efc5d7] bg-white px-5 py-4 text-sm leading-7 text-black/75 shadow-[0_16px_40px_rgba(0,0,0,0.05)]">
                                <span className="font-semibold text-[#d94b8f]">
                                    A confirmation email has been sent to your email.
                                </span>{" "}
                                A Loomeirite will reach out shortly if there are any questions.
                                <span className="block pt-1">
                                    Your request has been submitted successfully with request ID:{" "}
                                    <span className="font-semibold">{submittedId}</span>
                                </span>
                            </div>
                        ) : null}
                    </div>

                    {isAdmin && !loading && items.length ? (
                        <div className="mb-6 rounded-[24px] border border-[#efc5d7] bg-white/80 px-5 py-4 shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
                            <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
                                <div className="text-sm text-black/60">
                                    Total requests:{" "}
                                    <span className="font-semibold text-black/85">{filteredItems.length}</span>
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

                            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                                <div className="flex flex-col gap-1">
                                    <label className="text-[11px] uppercase tracking-[0.18em] text-black/45">
                                        LMRA Number
                                    </label>
                                    <input
                                        type="text"
                                        value={requestIdSearch}
                                        onChange={(e) => setRequestIdSearch(e.target.value)}
                                        placeholder="Search LMRA number"
                                        className="rounded-full border border-[#efc5d7] bg-white px-4 py-2.5 text-sm text-black/70 outline-none placeholder:text-black/35 focus:border-[#d86b98]"
                                    />
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="text-[11px] uppercase tracking-[0.18em] text-black/45">
                                        Product Type
                                    </label>
                                    <select
                                        value={productTypeFilter}
                                        onChange={(e) => setProductTypeFilter(e.target.value)}
                                        className="rounded-full border border-[#efc5d7] bg-white px-4 py-2.5 text-sm text-black/70 outline-none focus:border-[#d86b98]"
                                    >
                                        <option value="all">All</option>
                                        {productTypeOptions.map((type) => (
                                            <option key={type} value={type}>
                                                {type}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="text-[11px] uppercase tracking-[0.18em] text-black/45">
                                        Created On
                                    </label>
                                    <input
                                        type="date"
                                        value={createdOnFilter}
                                        onChange={(e) => setCreatedOnFilter(e.target.value)}
                                        className="rounded-full border border-[#efc5d7] bg-white px-4 py-2.5 text-sm text-black/70 outline-none focus:border-[#d86b98]"
                                    />
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="text-[11px] uppercase tracking-[0.18em] text-black/45">
                                        Assigned To
                                    </label>
                                    <select
                                        value={assigneeFilter}
                                        onChange={(e) => setAssigneeFilter(e.target.value)}
                                        className="rounded-full border border-[#efc5d7] bg-white px-4 py-2.5 text-sm text-black/70 outline-none focus:border-[#d86b98]"
                                    >
                                        <option value="all">All</option>
                                        <option value="me">Assigned to me</option>
                                        <option value="unassigned">Unassigned</option>
                                        {adminAssignees.map((admin) => (
                                            <option key={admin.value} value={admin.value}>
                                                {admin.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="text-[11px] uppercase tracking-[0.18em] text-black/45">
                                        Submitted User Name
                                    </label>
                                    <input
                                        type="text"
                                        value={submittedBySearch}
                                        onChange={(e) => setSubmittedBySearch(e.target.value)}
                                        placeholder="Search submitted user"
                                        className="rounded-full border border-[#efc5d7] bg-white px-4 py-2.5 text-sm text-black/70 outline-none placeholder:text-black/35 focus:border-[#d86b98]"
                                    />
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="text-[11px] uppercase tracking-[0.18em] text-black/45">
                                        Assigned User Name
                                    </label>
                                    <input
                                        type="text"
                                        value={assignedUserSearch}
                                        onChange={(e) => setAssignedUserSearch(e.target.value)}
                                        placeholder="Search assigned user"
                                        className="rounded-full border border-[#efc5d7] bg-white px-4 py-2.5 text-sm text-black/70 outline-none placeholder:text-black/35 focus:border-[#d86b98]"
                                    />
                                </div>
                            </div>
                        </div>
                    ) : null}

                    {loading ? (
                        <div className="rounded-[28px] border border-[#efc5d7] bg-white/75 p-10 text-center text-black/55 shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
                            Loading requests...
                        </div>
                    ) : pageMessage && !filteredItems.length ? (
                        <div className="rounded-[28px] border border-[#efc5d7] bg-white/75 p-10 text-center text-black/55 shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
                            {pageMessage}
                        </div>
                    ) : filteredItems.length === 0 ? (
                        <div className="rounded-[28px] border border-[#efc5d7] bg-white/75 p-10 text-center text-black/55 shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
                            No requests found for this assignee filter.
                        </div>
                    ) : (
                        <div
                            className={
                                viewMode === "grid"
                                    ? "grid gap-5 md:grid-cols-2 xl:grid-cols-3"
                                    : "grid gap-3"
                            }
                        >
                            {filteredItems.map((item) =>
                                viewMode === "list" ? (
                                    <div
                                        key={item.request_id || Math.random()}
                                        className="cursor-pointer rounded-[20px] border border-[#efc5d7] bg-white/90 px-4 py-4 shadow-[0_10px_28px_rgba(0,0,0,0.04)] transition hover:-translate-y-[1px] hover:bg-[#fff9fc] hover:shadow-[0_14px_34px_rgba(0,0,0,0.06)]"
                                    >
                                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex min-w-0 flex-col gap-2 lg:flex-row lg:items-center lg:gap-4">
                                                    <div className="truncate text-[11px] uppercase tracking-[0.22em] text-black/45 lg:max-w-[290px]">
                                                        {item.request_id || "Pending ID"}
                                                    </div>

                                                    <div className="truncate text-base font-medium leading-6 text-black/85">
                                                        {[item.first_name, item.last_name].filter(Boolean).join(" ") || "Unnamed request"}
                                                    </div>

                                                    <div className="truncate text-sm text-black/55">
                                                        {item.email || "No email"}
                                                    </div>

                                                    <div className="truncate text-sm text-black/55">
                                                        {item.product_type || "No product type"}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-3 lg:justify-end">
                                                <div className="text-xs text-black/50">
                                                    <span className="font-medium text-black/70">Updated:</span>{" "}
                                                    {formatDate(item.updated_at)}
                                                </div>

                                                {isAdmin ? (
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
                                                        className="rounded-full border border-[#efc5d7] bg-white px-3 py-2 text-xs text-black/75 outline-none focus:border-[#d86b98]"
                                                    >
                                                        <option value="">Unassigned</option>
                                                        {adminAssignees.map((admin) => (
                                                            <option key={admin.value} value={admin.value}>
                                                                {admin.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                ) : null}

                                                <span className="inline-flex shrink-0 rounded-full bg-[#ef5f9a] px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-white">
                                                    {item.status || "submitted"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        key={item.request_id || Math.random()}
                                        className="rounded-[24px] border border-[#efc5d7] bg-white/85 p-5 shadow-[0_14px_34px_rgba(0,0,0,0.05)]"
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
                                                    className="h-[220px] w-full rounded-[18px] border border-[#efc5d7] bg-white object-cover"
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
                                )
                            )}
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