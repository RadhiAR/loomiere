"use client";

import { useMemo, useState } from "react";
import { addToCart } from "@/lib/cart";

type Props = {
    slug: string;
    name: string;
    price: number;
    imageUrl: string;
};

export default function ProductActions({ slug, name, price, imageUrl }: Props) {
    const colorOptions = useMemo(
        () => [
            "Blush Pink",
            "Rose",
            "Peach",
            "Ivory",
            "Cream",
            "Sand",
            "Sage",
            "Sky Blue",
            "Lavender",
            "Charcoal",
            "Black"
        ],
        []
    );

    const [color, setColor] = useState(colorOptions[0]);
    const [qty, setQty] = useState(1);

    const [customizeOpen, setCustomizeOpen] = useState(false);
    const [customDesc, setCustomDesc] = useState("");
    const [phone, setPhone] = useState("");

    const [toast, setToast] = useState<string | null>(null);

    function showToast(msg: string) {
        setToast(msg);
        window.setTimeout(() => setToast(null), 1800);
    }

    function handleAddToCart(withCustomization: boolean) {
        addToCart({
            slug,
            name,
            price,
            imageUrl,
            qty,
            color,
            customization:
                withCustomization && customizeOpen && customDesc.trim() && phone.trim()
                    ? { description: customDesc.trim(), phone: phone.trim() }
                    : undefined
        });

        showToast("Added to cart ✅");
    }

    return (
        <div className="mt-10">
            {/* Always visible controls */}
            <div className="grid gap-5 sm:grid-cols-2">
                {/* Color */}
                <div>
                    <label className="text-xs uppercase tracking-[0.18em] text-black/60">
                        Choose Colour
                    </label>
                    <select
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="mt-2 w-full rounded-xl border border-black/10 bg-white p-3 text-sm outline-none focus:border-black/25"
                    >
                        {colorOptions.map((c) => (
                            <option key={c} value={c}>
                                {c}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Quantity */}
                <div>
                    <label className="text-xs uppercase tracking-[0.18em] text-black/60">
                        Quantity
                    </label>
                    <input
                        type="number"
                        min={1}
                        value={qty}
                        onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
                        className="mt-2 w-full rounded-xl border border-black/10 bg-white p-3 text-sm outline-none focus:border-black/25"
                    />
                </div>
            </div>

            {/* Buttons */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                    type="button"
                    onClick={() => handleAddToCart(false)}
                    className="inline-flex flex-1 items-center justify-center rounded-full bg-[#e84a93] px-6 py-3 text-xs uppercase tracking-[0.18em] text-white transition hover:bg-[#d63c7f]"
                >
                    Add to Cart
                </button>

                <button
                    type="button"
                    onClick={() => setCustomizeOpen((v) => !v)}
                    className="inline-flex flex-1 items-center justify-center rounded-full border border-black/15 bg-white px-6 py-3 text-xs uppercase tracking-[0.18em] text-black/70 transition hover:bg-black/5"
                >
                    Customize
                </button>
            </div>

            {/* Customize section (only appears when Customize clicked) */}
            {customizeOpen && (
                <div className="mt-6 rounded-2xl border border-black/10 bg-white p-6">
                    <div className="text-xs uppercase tracking-[0.22em] text-black/50">
                        Customization Details
                    </div>

                    <div className="mt-4 space-y-5">
                        <div>
                            <label className="text-xs uppercase tracking-[0.18em] text-black/60">
                                Description of customization
                            </label>
                            <textarea
                                value={customDesc}
                                onChange={(e) => setCustomDesc(e.target.value)}
                                rows={4}
                                className="mt-2 w-full rounded-xl border border-black/10 bg-white p-3 text-sm outline-none focus:border-black/25"
                                placeholder="Example: make it longer by 2 inches, add sleeves, change neckline, add initials, etc."
                            />
                        </div>

                        <div>
                            <label className="text-xs uppercase tracking-[0.18em] text-black/60">
                                Contact number to reach out to
                            </label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="mt-2 w-full rounded-xl border border-black/10 bg-white p-3 text-sm outline-none focus:border-black/25"
                                placeholder="(xxx) xxx-xxxx"
                            />
                            <div className="mt-2 text-xs text-black/45">
                                Add a valid number so we can confirm details.
                            </div>
                        </div>

                        {/* Add to cart WITH customization */}
                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={() => handleAddToCart(true)}
                                className="inline-flex items-center justify-center rounded-full bg-[#e84a93] px-6 py-3 text-xs uppercase tracking-[0.18em] text-white transition hover:bg-[#d63c7f]"
                            >
                                Add Customized Item to Cart
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast */}
            {toast && (
                <div className="mt-4 rounded-xl border border-black/10 bg-black/5 p-3 text-sm text-black/70">
                    {toast}
                </div>
            )}
        </div>
    );
}