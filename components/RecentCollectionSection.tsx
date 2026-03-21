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
                .limit(12); // 🔥 more products

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
        <section className="bg-[#f8f3ef] px-6 py-16 md:px-10 lg:px-16 relative">
            <div className="mx-auto max-w-7xl">
                {/* Heading */}
                <div className="mb-10 text-center">
                    <p className="mb-3 text-[11px] uppercase tracking-[0.35em] text-black/55">
                        New
                    </p>
                    <h2 className="text-3xl font-light tracking-[0.04em] text-black md:text-5xl">
                        Trending Now
                    </h2>
                </div>

                {/* Arrows */}
                <button
                    onClick={() => scroll("left")}
                    className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full border bg-white p-3 shadow hover:bg-black hover:text-white"
                >
                    ←
                </button>

                <button
                    onClick={() => scroll("right")}
                    className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full border bg-white p-3 shadow hover:bg-black hover:text-white"
                >
                    →
                </button>

                {/* Scroll Container */}
                <div
                    ref={scrollRef}
                    className="flex gap-6 overflow-x-auto scroll-smooth no-scrollbar"
                >
                    {products.map((product) => {
                        const href = product.category
                            ? `/shop?category=${encodeURIComponent(product.category)}`
                            : "/shop";

                        return (
                            <Link
                                key={String(product.id)}
                                href={href}
                                className="min-w-[260px] max-w-[260px] flex-shrink-0"
                            >
                                <div className="overflow-hidden bg-[#ece7e2]">
                                    {product.image_url ? (
                                        <img
                                            src={product.image_url}
                                            alt={product.name}
                                            className="h-[360px] w-full object-cover transition duration-500 hover:scale-[1.02]"
                                        />
                                    ) : (
                                        <div className="h-[360px] flex items-center justify-center text-sm text-black/40">
                                            No image
                                        </div>
                                    )}
                                </div>

                                <div className="pt-4">
                                    <h3 className="text-base font-light text-black">
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

                {/* Button */}
                <div className="mt-10 text-center">
                    <Link
                        href="/shop"
                        className="inline-flex rounded-full border border-black px-8 py-3 text-sm uppercase tracking-[0.24em] text-black transition hover:bg-black hover:text-white"
                    >
                        Shop Now
                    </Link>
                </div>
            </div>
        </section>
    );
}