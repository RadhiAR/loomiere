"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import BackButton from "@/components/BackButton";
import { supabase } from "@/lib/supabase";

type SupabaseOrderRow = Record<string, any>;

type NormalizedOrder = {
    id: string;
    status: string;
    date: string | null;
    total: number;
    quantity: number;
    summary: string;
};

function getString(value: unknown): string {
    if (typeof value === "string") return value;
    if (typeof value === "number") return String(value);
    return "";
}

function getNumber(value: unknown): number {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string") {
        const cleaned = value.replace(/[^0-9.-]/g, "");
        const parsed = Number(cleaned);
        return Number.isFinite(parsed) ? parsed : 0;
    }
    return 0;
}

function normalizeStatus(value: unknown): string {
    return getString(value).trim().toLowerCase();
}

function formatDate(dateValue: string | null) {
    if (!dateValue) return "—";
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString();
}

function formatCurrency(amount: number) {
    return `$${amount.toFixed(2)}`;
}

function extractSummaryFromItems(items: unknown): string {
    if (!Array.isArray(items) || items.length === 0) return "";

    const names = items
        .map((item) => {
            if (typeof item === "string") return item;

            if (item && typeof item === "object") {
                return (
                    getString((item as any).product_name) ||
                    getString((item as any).name) ||
                    getString((item as any).title)
                );
            }

            return "";
        })
        .filter(Boolean);

    return names.join(", ");
}

function extractQuantityFromItems(items: unknown): number {
    if (!Array.isArray(items) || items.length === 0) return 0;

    const totalQty = items.reduce((sum, item) => {
        if (item && typeof item === "object") {
            const qty =
                getNumber((item as any).quantity) ||
                getNumber((item as any).qty) ||
                1;
            return sum + qty;
        }

        return sum + 1;
    }, 0);

    return totalQty;
}

function normalizeOrder(row: SupabaseOrderRow): NormalizedOrder {
    const itemsArray = row.items ?? row.order_items ?? row.products ?? null;

    const id =
        getString(row.order_number) ||
        getString(row.order_id) ||
        getString(row.id) ||
        "—";

    const status =
        normalizeStatus(row.status) ||
        normalizeStatus(row.order_status) ||
        normalizeStatus(row.fulfillment_status);

    const date =
        getString(row.created_at) ||
        getString(row.order_date) ||
        getString(row.date) ||
        getString(row.updated_at) ||
        null;

    const total =
        getNumber(row.total_amount) ||
        getNumber(row.total) ||
        getNumber(row.amount) ||
        getNumber(row.grand_total) ||
        getNumber(row.final_total);

    const quantity =
        getNumber(row.quantity) ||
        getNumber(row.items_count) ||
        getNumber(row.item_count) ||
        extractQuantityFromItems(itemsArray);

    const summary =
        getString(row.product_summary) ||
        getString(row.items_summary) ||
        getString(row.summary) ||
        getString(row.product_name) ||
        getString(row.product_names) ||
        extractSummaryFromItems(itemsArray) ||
        "Order items";

    return {
        id,
        status,
        date,
        total,
        quantity,
        summary,
    };
}

function statusBadgeClass(status: string) {
    if (status === "current" || status === "processing" || status === "active") {
        return "bg-[#fff1f7] text-[#c8487d] border-[#f5c2d8]";
    }

    if (status === "cancelled" || status === "canceled") {
        return "bg-[#fff4f4] text-[#c05b5b] border-[#efcaca]";
    }

    if (status === "returned") {
        return "bg-[#fff8f1] text-[#b27034] border-[#f1d6b9]";
    }

    return "bg-[#f4fff8] text-[#4d8b68] border-[#cce8d7]";
}

function prettyStatus(status: string) {
    if (status === "current") return "Current";
    if (status === "processing") return "Processing";
    if (status === "active") return "Active";
    if (status === "cancelled") return "Cancelled";
    if (status === "canceled") return "Canceled";
    if (status === "returned") return "Returned";
    if (!status) return "Unknown";
    return status.charAt(0).toUpperCase() + status.slice(1);
}

export default function ReturnedOrdersPage() {
    const [orders, setOrders] = useState<NormalizedOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let isMounted = true;

        async function loadOrders() {
            setLoading(true);
            setError("");

            const { data, error } = await supabase.from("orders").select("*");

            if (!isMounted) return;

            if (error) {
                setError(error.message || "Failed to load returned orders.");
                setOrders([]);
                setLoading(false);
                return;
            }

            const normalized = Array.isArray(data)
                ? data.map(normalizeOrder)
                : [];

            const filtered = normalized
                .filter((order) => order.status === "returned")
                .sort((a, b) => {
                    const aTime = a.date ? new Date(a.date).getTime() : 0;
                    const bTime = b.date ? new Date(b.date).getTime() : 0;
                    return bTime - aTime;
                });

            setOrders(filtered);
            setLoading(false);
        }

        loadOrders();

        return () => {
            isMounted = false;
        };
    }, []);

    const headingText = useMemo(() => {
        if (loading) return "Loading returned orders...";
        if (error) return "We couldn’t load your returned orders right now.";
        if (orders.length === 0) return "No returned orders found yet.";
        return `${orders.length} returned order${orders.length === 1 ? "" : "s"} found`;
    }, [loading, error, orders.length]);

    return (
        <main className="min-h-screen bg-[#fff4f8]">
            <div className="relative">
                <Navbar brand="LOOMIÈRE" theme="light" />
                <div className="fixed left-6 top-6 z-[9999] pointer-events-auto">
                    <BackButton theme="light" href="/orders" label="Orders" />
                </div>
                <div className="h-24" />
            </div>

            <section className="mx-auto max-w-7xl px-6 py-12">
                <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                    <div>
                        <h1 className="text-4xl font-light italic text-black/90">
                            Returned Orders
                        </h1>
                        <p className="mt-3 text-sm text-black/60">
                            Live returned orders synced from your Loomeira database.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Link
                            href="/orders/current"
                            className="rounded-full border border-[#f0c8d9] bg-white px-4 py-2 text-xs font-medium uppercase tracking-[0.16em] text-black/70 transition hover:border-[#d86b98] hover:text-[#c8487d]"
                        >
                            Current
                        </Link>
                        <Link
                            href="/orders/cancelled"
                            className="rounded-full border border-[#f0c8d9] bg-white px-4 py-2 text-xs font-medium uppercase tracking-[0.16em] text-black/70 transition hover:border-[#d86b98] hover:text-[#c8487d]"
                        >
                            Cancelled
                        </Link>
                        <Link
                            href="/orders/returned"
                            className="rounded-full border border-[#d86b98] bg-[#e84a8d] px-4 py-2 text-xs font-medium uppercase tracking-[0.16em] text-white"
                        >
                            Returned
                        </Link>
                    </div>
                </div>

                <div className="mt-8 text-sm text-black/55">{headingText}</div>

                {loading ? (
                    <div className="mt-5 rounded-[24px] border border-[#f2cddd] bg-white px-6 py-10 text-sm text-black/55 shadow-sm">
                        Loading orders from Supabase...
                    </div>
                ) : error ? (
                    <div className="mt-5 rounded-[24px] border border-[#f4caca] bg-white px-6 py-10 text-sm text-[#b35b5b] shadow-sm">
                        {error}
                    </div>
                ) : orders.length === 0 ? (
                    <div className="mt-5 rounded-[24px] border border-[#f2cddd] bg-white px-6 py-10 text-sm text-black/55 shadow-sm">
                        No returned orders are available yet.
                    </div>
                ) : (
                    <div className="mt-5 grid gap-5">
                        {orders.map((order) => (
                            <div
                                key={`${order.id}-${order.date ?? "nodate"}`}
                                className="rounded-[24px] border border-[#f2cddd] bg-white p-6 shadow-sm"
                            >
                                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                    <div>
                                        <div className="text-xs uppercase tracking-[0.18em] text-black/45">
                                            Order Number
                                        </div>
                                        <div className="mt-1 text-lg font-medium text-black/90">
                                            {order.id}
                                        </div>

                                        <div className="mt-4 text-xs uppercase tracking-[0.18em] text-black/45">
                                            Items
                                        </div>
                                        <div className="mt-1 text-sm text-black/70">
                                            {order.summary}
                                        </div>
                                    </div>

                                    <div className="grid gap-3 text-sm text-black/70 md:min-w-[220px]">
                                        <div>
                                            <div className="text-xs uppercase tracking-[0.18em] text-black/45">
                                                Date
                                            </div>
                                            <div className="mt-1">
                                                {formatDate(order.date)}
                                            </div>
                                        </div>

                                        <div>
                                            <div className="text-xs uppercase tracking-[0.18em] text-black/45">
                                                Total
                                            </div>
                                            <div className="mt-1">
                                                {formatCurrency(order.total)}
                                            </div>
                                        </div>

                                        <div>
                                            <div className="text-xs uppercase tracking-[0.18em] text-black/45">
                                                Quantity
                                            </div>
                                            <div className="mt-1">
                                                {order.quantity} item(s)
                                            </div>
                                        </div>

                                        <div>
                                            <div className="text-xs uppercase tracking-[0.18em] text-black/45">
                                                Status
                                            </div>
                                            <div className="mt-2">
                                                <span
                                                    className={`inline-flex rounded-full border px-3 py-1 text-xs uppercase tracking-[0.14em] ${statusBadgeClass(
                                                        order.status
                                                    )}`}
                                                >
                                                    {prettyStatus(order.status)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}