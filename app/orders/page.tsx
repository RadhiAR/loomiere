"use client";

import { useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import BackButton from "@/components/BackButton";

type OrderStatus = "current" | "cancelled" | "delivered";

type Order = {
    id: string;
    date: string;
    status: OrderStatus;
    total: number;
    items: number;
    productSummary: string;
};

const demoOrders: Order[] = [
    {
        id: "LMR-240101",
        date: "2026-02-12",
        status: "current",
        total: 89.99,
        items: 2,
        productSummary: "Hand-knit scarf, coaster set",
    },
    {
        id: "LMR-240102",
        date: "2026-01-20",
        status: "delivered",
        total: 54.5,
        items: 1,
        productSummary: "Crochet top",
    },
    {
        id: "LMR-240103",
        date: "2025-11-08",
        status: "cancelled",
        total: 120.0,
        items: 3,
        productSummary: "Pet sweater, beanie, coaster set",
    },
    {
        id: "LMR-240104",
        date: "2025-09-16",
        status: "delivered",
        total: 199.99,
        items: 4,
        productSummary: "Custom cardigan order",
    },
    {
        id: "LMR-240105",
        date: "2025-06-04",
        status: "delivered",
        total: 39.99,
        items: 1,
        productSummary: "Knitted coaster bundle",
    },
];

function statusLabel(status: OrderStatus) {
    if (status === "current") return "Current";
    if (status === "cancelled") return "Cancelled";
    return "Delivered";
}

function statusBadgeClass(status: OrderStatus) {
    if (status === "current") {
        return "bg-[#fff1f7] text-[#c8487d] border-[#f5c2d8]";
    }
    if (status === "cancelled") {
        return "bg-[#fff4f4] text-[#c05b5b] border-[#efcaca]";
    }
    return "bg-[#f4fff8] text-[#4d8b68] border-[#cce8d7]";
}

function isWithinMonths(dateString: string, months: number) {
    const now = new Date();
    const date = new Date(dateString);
    const threshold = new Date(now);
    threshold.setMonth(now.getMonth() - months);
    return date >= threshold;
}

export default function OrdersPage() {
    const [orderNumber, setOrderNumber] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all");
    const [timeFilter, setTimeFilter] = useState<
        "3months" | "6months" | "1year" | "yearRange"
    >("3months");
    const [startYear, setStartYear] = useState("2025");
    const [endYear, setEndYear] = useState("2026");

    const filteredOrders = useMemo(() => {
        let results = [...demoOrders];

        if (orderNumber.trim()) {
            const term = orderNumber.trim().toLowerCase();
            results = results.filter((order) => order.id.toLowerCase().includes(term));
        }

        if (statusFilter !== "all") {
            results = results.filter((order) => order.status === statusFilter);
        }

        if (timeFilter === "3months") {
            results = results.filter((order) => isWithinMonths(order.date, 3));
        }

        if (timeFilter === "6months") {
            results = results.filter((order) => isWithinMonths(order.date, 6));
        }

        if (timeFilter === "1year") {
            results = results.filter((order) => isWithinMonths(order.date, 12));
        }

        if (timeFilter === "yearRange") {
            const fromYear = Number(startYear);
            const toYear = Number(endYear);

            if (!Number.isNaN(fromYear) && !Number.isNaN(toYear)) {
                results = results.filter((order) => {
                    const year = new Date(order.date).getFullYear();
                    return year >= fromYear && year <= toYear;
                });
            }
        }

        return results.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
    }, [orderNumber, statusFilter, timeFilter, startYear, endYear]);

    return (
        <main className="min-h-screen bg-[#fff4f8]">
            <div className="relative">
                <Navbar brand="LOOMIÈRE" theme="light" />
                <div className="fixed top-6 left-6 z-[9999] pointer-events-auto">
                    <BackButton theme="light" href="/" label="Home" />
                </div>
                <div className="h-24" />
            </div>

            <section className="mx-auto max-w-7xl px-6 py-12">
                <h1 className="text-4xl font-light italic text-black/90">My Orders</h1>
                <p className="mt-3 text-sm text-black/60">
                    Look up an order by order number or browse all your previously placed orders.
                </p>

                <div className="mt-10 rounded-[28px] border border-[#f2cddd] bg-[#ffe9f2] p-6 shadow-sm">
                    <div className="grid gap-4 lg:grid-cols-[1.2fr_0.9fr_0.9fr]">
                        <div>
                            <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-black/45">
                                Order Number Lookup
                            </label>
                            <input
                                value={orderNumber}
                                onChange={(e) => setOrderNumber(e.target.value)}
                                placeholder="Enter order number, for example LMR-240101"
                                className="w-full rounded-xl border border-[#efc5d7] bg-white px-4 py-3 text-sm text-black/85 outline-none focus:border-[#d86b98]"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-black/45">
                                Filter by Status
                            </label>
                            <select
                                value={statusFilter}
                                onChange={(e) =>
                                    setStatusFilter(e.target.value as "all" | OrderStatus)
                                }
                                className="w-full rounded-xl border border-[#efc5d7] bg-white px-4 py-3 text-sm text-black/85 outline-none focus:border-[#d86b98]"
                            >
                                <option value="all">All Orders</option>
                                <option value="current">Current Orders</option>
                                <option value="cancelled">Cancelled Orders</option>
                                <option value="delivered">Orders Delivered</option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-black/45">
                                Sort by Time
                            </label>
                            <select
                                value={timeFilter}
                                onChange={(e) =>
                                    setTimeFilter(
                                        e.target.value as
                                        | "3months"
                                        | "6months"
                                        | "1year"
                                        | "yearRange"
                                    )
                                }
                                className="w-full rounded-xl border border-[#efc5d7] bg-white px-4 py-3 text-sm text-black/85 outline-none focus:border-[#d86b98]"
                            >
                                <option value="3months">Last 3 Months</option>
                                <option value="6months">Last 6 Months</option>
                                <option value="1year">Last Year</option>
                                <option value="yearRange">Year Range</option>
                            </select>
                        </div>
                    </div>

                    {timeFilter === "yearRange" && (
                        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:max-w-md">
                            <div>
                                <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-black/45">
                                    Start Year
                                </label>
                                <input
                                    value={startYear}
                                    onChange={(e) => setStartYear(e.target.value)}
                                    placeholder="2025"
                                    className="w-full rounded-xl border border-[#efc5d7] bg-white px-4 py-3 text-sm text-black/85 outline-none focus:border-[#d86b98]"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-black/45">
                                    End Year
                                </label>
                                <input
                                    value={endYear}
                                    onChange={(e) => setEndYear(e.target.value)}
                                    placeholder="2026"
                                    className="w-full rounded-xl border border-[#efc5d7] bg-white px-4 py-3 text-sm text-black/85 outline-none focus:border-[#d86b98]"
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-8">
                    <div className="mb-4 text-sm text-black/55">
                        {filteredOrders.length} order{filteredOrders.length === 1 ? "" : "s"} found
                    </div>

                    <div className="grid gap-5">
                        {filteredOrders.length === 0 ? (
                            <div className="rounded-[24px] border border-[#f2cddd] bg-white px-6 py-10 text-center text-sm text-black/55 shadow-sm">
                                No orders matched your filters.
                            </div>
                        ) : (
                            filteredOrders.map((order) => (
                                <div
                                    key={order.id}
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
                                                {order.productSummary}
                                            </div>
                                        </div>

                                        <div className="grid gap-3 text-sm text-black/70 md:min-w-[220px]">
                                            <div>
                                                <div className="text-xs uppercase tracking-[0.18em] text-black/45">
                                                    Date
                                                </div>
                                                <div className="mt-1">
                                                    {new Date(order.date).toLocaleDateString()}
                                                </div>
                                            </div>

                                            <div>
                                                <div className="text-xs uppercase tracking-[0.18em] text-black/45">
                                                    Total
                                                </div>
                                                <div className="mt-1">${order.total.toFixed(2)}</div>
                                            </div>

                                            <div>
                                                <div className="text-xs uppercase tracking-[0.18em] text-black/45">
                                                    Quantity
                                                </div>
                                                <div className="mt-1">{order.items} item(s)</div>
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
                                                        {statusLabel(order.status)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </section>
        </main>
    );
}