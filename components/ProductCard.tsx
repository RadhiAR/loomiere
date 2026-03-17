"use client";

import type { Product } from "@/lib/products";

export default function ProductCard({ product }: { product: Product }) {
    // ✅ Product opens in new tab
    // Using query param because you said you don’t have [slug] pages.
    const productUrl = `/piece?slug=${product.slug}`;

    return (
        <a
            href={productUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-2xl border border-black/10 bg-white p-4 shadow-sm transition hover:shadow-md"
        >
            <div className="overflow-hidden rounded-2xl border border-black/5">
                <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-64 w-full object-cover"
                />
            </div>

            <div className="mt-4">
                <div className="text-lg font-medium text-black/90">{product.name}</div>
                <div className="mt-1 text-sm text-black/60">${product.price}</div>

                <div className="mt-3 text-xs uppercase tracking-[0.18em] text-black/50">
                    Open ↗
                </div>
            </div>
        </a>
    );
}