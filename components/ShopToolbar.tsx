"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/lib/products";

type SortKey = "relevance" | "priceLow" | "priceHigh" | "newest" | "best";

type Props = {
    products: Product[];
    // For Apparel page: pass available types like ["Tops", "Dresses", "Scarves", "Sweaters"]
    types?: string[];
    // For any page: pass available colors like ["Cream", "Sand", "Rose"]
    colors?: string[];

    onChange: (filteredAndSorted: Product[]) => void;
};

export default function ShopToolbar({ products, types = [], colors = [], onChange }: Props) {
    const [open, setOpen] = useState(false);

    const [selectedColor, setSelectedColor] = useState<string>("All");
    const [selectedType, setSelectedType] = useState<string>("All");
    const [priceMin, setPriceMin] = useState<string>("");
    const [priceMax, setPriceMax] = useState<string>("");

    const [sort, setSort] = useState<SortKey>("relevance");

    const priceRange = useMemo(() => {
        const prices = products.map((p) => Number(p.price || 0)).filter((n) => !Number.isNaN(n));
        const min = prices.length ? Math.min(...prices) : 0;
        const max = prices.length ? Math.max(...prices) : 0;
        return { min, max };
    }, [products]);

    function apply() {
        const min = priceMin.trim() === "" ? undefined : Number(priceMin);
        const max = priceMax.trim() === "" ? undefined : Number(priceMax);

        let list = [...products];

        // Color filter (expects product.color or product.tags contain the color)
        if (selectedColor !== "All") {
            list = list.filter((p: any) => {
                const c = (p.color || "").toLowerCase();
                const tags = (p.tags || []).join(" ").toLowerCase();
                return c === selectedColor.toLowerCase() || tags.includes(selectedColor.toLowerCase());
            });
        }

        // Type filter (expects product.type or categorySubtype or tags)
        if (selectedType !== "All") {
            list = list.filter((p: any) => {
                const t = (p.type || p.subtype || "").toLowerCase();
                const tags = (p.tags || []).join(" ").toLowerCase();
                return t === selectedType.toLowerCase() || tags.includes(selectedType.toLowerCase());
            });
        }

        // Price filter
        if (min !== undefined && !Number.isNaN(min)) list = list.filter((p) => Number(p.price) >= min);
        if (max !== undefined && !Number.isNaN(max)) list = list.filter((p) => Number(p.price) <= max);

        // Sorting
        if (sort === "priceLow") list.sort((a, b) => Number(a.price) - Number(b.price));
        if (sort === "priceHigh") list.sort((a, b) => Number(b.price) - Number(a.price));
        if (sort === "newest") list.sort((a: any, b: any) => Number(b.createdAt || 0) - Number(a.createdAt || 0));
        if (sort === "best") list.sort((a: any, b: any) => Number(b.sales || 0) - Number(a.sales || 0));
        // relevance = keep original order

        onChange(list);
        setOpen(false);
    }

    function clearAll() {
        setSelectedColor("All");
        setSelectedType("All");
        setPriceMin("");
        setPriceMax("");
        setSort("relevance");
        onChange([...products]);
        setOpen(false);
    }

    const pill =
        "inline-flex items-center gap-2 rounded-full border border-black/15 bg-white px-5 py-2 text-xs uppercase tracking-[0.22em] text-black/70 hover:bg-black/5 transition";

    return (
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* LEFT: Filter button */}
            <div className="relative">
                <button className={pill} onClick={() => setOpen((v) => !v)}>
                    Filters <span className="opacity-70">▾</span>
                </button>

                {open && (
                    <div className="absolute left-0 mt-3 w-[320px] rounded-2xl border border-black/10 bg-white p-5 shadow-xl z-50">
                        <div className="text-xs uppercase tracking-[0.22em] text-black/50">
                            Refine
                        </div>

                        {/* Color */}
                        <div className="mt-4">
                            <label className="block text-xs uppercase tracking-[0.18em] text-black/50">
                                Colour
                            </label>
                            <select
                                className="mt-2 w-full rounded-xl border border-black/10 p-3 text-sm outline-none focus:border-black/25"
                                value={selectedColor}
                                onChange={(e) => setSelectedColor(e.target.value)}
                            >
                                <option>All</option>
                                {colors.map((c) => (
                                    <option key={c} value={c}>
                                        {c}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Type */}
                        <div className="mt-4">
                            <label className="block text-xs uppercase tracking-[0.18em] text-black/50">
                                Type
                            </label>
                            <select
                                className="mt-2 w-full rounded-xl border border-black/10 p-3 text-sm outline-none focus:border-black/25"
                                value={selectedType}
                                onChange={(e) => setSelectedType(e.target.value)}
                            >
                                <option>All</option>
                                {types.map((t) => (
                                    <option key={t} value={t}>
                                        {t}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Price */}
                        <div className="mt-4">
                            <label className="block text-xs uppercase tracking-[0.18em] text-black/50">
                                Price range
                            </label>
                            <div className="mt-2 grid grid-cols-2 gap-3">
                                <input
                                    placeholder={`Min (${priceRange.min})`}
                                    value={priceMin}
                                    onChange={(e) => setPriceMin(e.target.value)}
                                    className="w-full rounded-xl border border-black/10 p-3 text-sm outline-none focus:border-black/25"
                                />
                                <input
                                    placeholder={`Max (${priceRange.max})`}
                                    value={priceMax}
                                    onChange={(e) => setPriceMax(e.target.value)}
                                    className="w-full rounded-xl border border-black/10 p-3 text-sm outline-none focus:border-black/25"
                                />
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="mt-5 flex items-center justify-between gap-3">
                            <button
                                onClick={clearAll}
                                className="rounded-full border border-black/15 px-4 py-2 text-xs uppercase tracking-[0.18em] text-black/60 hover:bg-black/5 transition"
                            >
                                Clear
                            </button>
                            <button
                                onClick={apply}
                                className="rounded-full bg-[#e84a93] px-5 py-2 text-xs uppercase tracking-[0.18em] text-white hover:bg-[#d63c7f] transition"
                            >
                                Apply
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* RIGHT: Sort */}
            <div className="flex items-center gap-3">
                <div className="text-xs uppercase tracking-[0.22em] text-black/50">
                    Sort by
                </div>
                <select
                    className="rounded-full border border-black/15 bg-white px-5 py-2 text-xs uppercase tracking-[0.22em] text-black/70 hover:bg-black/5 transition"
                    value={sort}
                    onChange={(e) => {
                        setSort(e.target.value as SortKey);
                        // Apply immediately on sort change
                        setTimeout(() => apply(), 0);
                    }}
                >
                    <option value="relevance">Relevance</option>
                    <option value="priceLow">Price: Low → High</option>
                    <option value="priceHigh">Price: High → Low</option>
                    <option value="newest">Newest arrivals</option>
                    <option value="best">Best sellers</option>
                </select>
            </div>
        </div>
    );
}