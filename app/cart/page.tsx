"use client";

import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import BackButton from "@/components/BackButton";
import type { CartItem } from "@/lib/cart";
import { readCart, writeCart } from "@/lib/cart";

function formatUSD(n: number) {
    return `$${n.toFixed(2)}`;
}

export default function CartPage() {
    const [items, setItems] = useState<CartItem[]>([]);

    useEffect(() => {
        setItems(readCart());
    }, []);

    const subtotal = useMemo(() => {
        return items.reduce((sum, it) => sum + it.price * it.qty, 0);
    }, [items]);

    function removeItem(id: string) {
        const next = items.filter((x) => x.id !== id);
        setItems(next);
        writeCart(next);
    }

    function updateQty(id: string, qty: number) {
        const q = Math.max(1, Number(qty) || 1);
        const next = items.map((x) => (x.id === id ? { ...x, qty: q } : x));
        setItems(next);
        writeCart(next);
    }

    function clearCart() {
        setItems([]);
        writeCart([]);
    }

    return (
        <main className="min-h-screen bg-white">
            <div className="relative">
                <Navbar brand="LOOMIÈRE" theme="light" />
                <div className="absolute top-6 left-6 z-40">
                    <BackButton theme="light" href="/" label="Home" />
                </div>
                <div className="h-24" />
            </div>

            <section className="mx-auto max-w-6xl px-6 py-10">
                <h1 className="text-4xl font-light italic text-black/90">Cart</h1>
                <p className="mt-3 text-sm text-black/60">
                    Items you added to cart will show here.
                </p>

                {items.length === 0 ? (
                    <div className="mt-10 rounded-2xl border border-black/10 p-8 text-sm text-black/60">
                        Your cart is empty.
                    </div>
                ) : (
                    <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_320px]">
                        <div className="space-y-6">
                            {items.map((it) => (
                                <div
                                    key={it.id}
                                    className="grid gap-5 rounded-2xl border border-black/10 bg-white p-4 shadow-sm sm:grid-cols-[110px_1fr]"
                                >
                                    <div className="overflow-hidden rounded-xl border border-black/5">
                                        <img
                                            src={it.imageUrl}
                                            alt={it.name}
                                            className="h-[110px] w-full object-cover"
                                        />
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <div className="flex flex-wrap items-start justify-between gap-3">
                                            <div>
                                                <div className="text-lg font-medium text-black/90">
                                                    {it.name}
                                                </div>
                                                <div className="mt-1 text-sm text-black/60">
                                                    Colour:{" "}
                                                    <span className="font-semibold">{it.color}</span>
                                                </div>
                                                {it.customization?.description && (
                                                    <div className="mt-1 text-sm text-black/60">
                                                        Customization:{" "}
                                                        <span className="font-semibold">
                                                            {it.customization.description}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="text-right">
                                                <div className="text-sm text-black/60">
                                                    Price:{" "}
                                                    <span className="font-semibold">
                                                        {formatUSD(it.price)}
                                                    </span>
                                                </div>
                                                <div className="mt-1 text-sm text-black/60">
                                                    Line total:{" "}
                                                    <span className="font-semibold">
                                                        {formatUSD(it.price * it.qty)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                            <div className="flex items-center gap-3">
                                                <label className="text-xs uppercase tracking-[0.18em] text-black/50">
                                                    Qty
                                                </label>
                                                <input
                                                    type="number"
                                                    min={1}
                                                    value={it.qty}
                                                    onChange={(e) =>
                                                        updateQty(it.id, Number(e.target.value))
                                                    }
                                                    className="w-24 rounded-xl border border-black/10 p-2 text-sm outline-none focus:border-black/25"
                                                />
                                            </div>

                                            <button
                                                onClick={() => removeItem(it.id)}
                                                className="inline-flex items-center justify-center rounded-full border border-black/15 bg-white px-5 py-2 text-xs uppercase tracking-[0.18em] text-black/70 transition hover:bg-black/5"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <button
                                onClick={clearCart}
                                className="inline-flex items-center justify-center rounded-full border border-black/15 bg-white px-6 py-2 text-xs uppercase tracking-[0.18em] text-black/70 transition hover:bg-black/5"
                            >
                                Clear cart
                            </button>
                        </div>

                        <div className="h-fit rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
                            <div className="text-xs uppercase tracking-[0.22em] text-black/50">
                                Summary
                            </div>

                            <div className="mt-4 flex items-center justify-between text-sm text-black/70">
                                <span>Subtotal</span>
                                <span className="font-semibold">{formatUSD(subtotal)}</span>
                            </div>

                            <div className="mt-4 border-t border-black/10 pt-4 flex items-center justify-between">
                                <span className="text-sm text-black/70">Total</span>
                                <span className="text-lg font-semibold text-black/90">
                                    {formatUSD(subtotal)}
                                </span>
                            </div>

                            <div className="mt-5 text-xs text-black/45">
                                Taxes/shipping can be calculated later.
                            </div>
                        </div>
                    </div>
                )}
            </section>
        </main>
    );
}