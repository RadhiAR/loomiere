"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

type ProductItem = {
    id?: string | number;
    slug?: string;
    name: string;
    price: number;
    image_url?: string | null;
    category?: string | null;
};

function getCategoryHref(category?: string | null) {
    const normalized = (category || "").trim().toLowerCase();

    if (normalized === "apparel") return "#apparel";
    if (normalized === "pet" || normalized === "pets") return "#pet";
    if (normalized === "jewellery") return "#jewellery";
    if (normalized === "home" || normalized === "home decor") return "#home";

    return "#apparel";
}

export default function RecentCollectionSection() {
    const [products, setProducts] = useState<ProductItem[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchProducts = async () => {
            const { data } = await supabase
                .from("products")
                .select("id, slug, name, price, image_url, category, created_at")
                .eq("is_active", true)
                .order("created_at", { ascending: false })
                .limit(12);

            if (data) setProducts(data);
        };

        fetchProducts();
    }, []);

    const scroll = (direction: "left" | "right") => {
        if (!scrollRef.current) return;

        const scrollAmount = 400;
        scrollRef.current.scrollBy({
            left: direction === "left" ? -scrollAmount : scrollAmount,
            behavior: "smooth",
        });
    };

    if (!products.length) return null;

    return (
        <section className="relative bg-[#fdf6f8] px-6 pb-16 pt-4 md:px-10 md:pb-16 md:pt-2 lg:px-16">
            <div className="mx-auto max-w-[1400px]">
                <div className="mb-8 text-center">
                    <p className="mb-2 text-[11px] uppercase tracking-[0.35em] text-black/55">
                        New
                    </p>
                    <h2 className="text-3xl font-light tracking-[0.02em] text-black md:text-5xl">
                        Trending Now
                    </h2>
                </div>

                <button
                    onClick={() => scroll("left")}
                    className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full border border-[#e4d6dc] bg-white/90 p-3 shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition hover:bg-white"
                    aria-label="Scroll left"
                >
                    ←
                </button>

                <button
                    onClick={() => scroll("right")}
                    className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full border border-[#e4d6dc] bg-white/90 p-3 shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition hover:bg-white"
                    aria-label="Scroll right"
                >
                    →
                </button>

                <div
                    ref={scrollRef}
                    className="flex gap-6 overflow-x-auto scroll-smooth no-scrollbar"
                >
                    {products.map((product) => {
                        const href = getCategoryHref(product.category);

                        return (
                            <Link
                                key={String(product.id)}
                                href={href}
                                className="min-w-[260px] max-w-[260px] flex-shrink-0"
                            >
                                <div className="overflow-hidden rounded-[24px] bg-[#f7eef2]">
                                    {product.image_url ? (
                                        <img
                                            src={product.image_url}
                                            alt={product.name}
                                            className="h-[360px] w-full object-cover transition duration-500 hover:scale-[1.02]"
                                        />
                                    ) : (
                                        <div className="flex h-[360px] items-center justify-center text-sm text-black/40">
                                            No image
                                        </div>
                                    )}
                                </div>

                                <div className="pt-4">
                                    <p className="text-[11px] uppercase tracking-[0.24em] text-black/45">
                                        {product.category || "Collection"}
                                    </p>
                                    <h3 className="mt-2 text-base font-light text-black">
                                        {product.name}
                                    </h3>
                                    <p className="mt-1 text-sm text-black/65">
                                        ${Number(product.price).toFixed(2)}
                                    </p>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}