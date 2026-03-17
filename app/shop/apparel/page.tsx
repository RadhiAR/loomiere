"use client";

import { useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import BackButton from "@/components/BackButton";
import ProductGrid from "@/components/ProductGrid";
import ShopToolbar from "@/components/ShopToolbar";
import { getProductsByCategory } from "@/lib/products";

export default function ShopApparelPage() {
    const baseProducts = useMemo(() => getProductsByCategory("apparel"), []);
    const [products, setProducts] = useState(baseProducts);

    // You can edit these lists anytime (these are the filter options shown)
    const apparelTypes = ["Tops", "Dresses", "Scarves", "Sweaters"];
    const colors = ["Cream", "Sand", "Rose", "Black", "White", "Pink", "Beige"];

    return (
        <main className="min-h-screen bg-white">
            <div className="relative">
                <Navbar brand="LOOMIÈRE" theme="light" />

                {/* HOME back to landing */}
                <div className="fixed top-6 left-6 z-[9999] pointer-events-auto">
                    <BackButton theme="light" href="/" label="Home" />
                </div>

                <div className="h-24" />
            </div>

            <section className="mx-auto max-w-6xl px-6 py-12">
                {/* Title + count */}
                <div className="flex items-end justify-between gap-6">
                    <div>
                        <h1 className="text-5xl font-light italic text-black/90">
                            Shop Apparel{" "}
                            <span className="text-lg not-italic text-black/45">
                                ({products.length})
                            </span>
                        </h1>
                        <p className="mt-3 text-sm text-black/60">
                            Tops, dresses, scarves, sweaters & more.
                        </p>
                    </div>
                </div>

                {/* Filter + Sort row */}
                <ShopToolbar
                    products={baseProducts}
                    types={apparelTypes}
                    colors={colors}
                    onChange={setProducts}
                />

                {/* Grid */}
                <div className="mt-10">
                    <ProductGrid products={products} />
                </div>
            </section>
        </main>
    );
}