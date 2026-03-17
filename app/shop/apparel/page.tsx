"use client";

import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import BackButton from "@/components/BackButton";
import ProductGrid from "@/components/ProductGrid";
import ShopToolbar from "@/components/ShopToolbar";
import { getDbProductsByCategory, type ShopProduct } from "@/lib/db-products";

export default function ShopApparelPage() {
    const [baseProducts, setBaseProducts] = useState<ShopProduct[]>([]);
    const [products, setProducts] = useState<ShopProduct[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            const data = await getDbProductsByCategory("apparel");
            setBaseProducts(data);
            setProducts(data);
            setLoading(false);
        }

        load();
    }, []);

    const apparelTypes = useMemo(
        () => ["Tops", "Dresses", "Scarves", "Sweaters"],
        []
    );
    const colors = useMemo(
        () => ["Cream", "Sand", "Rose", "Black", "White", "Pink", "Beige"],
        []
    );

    return (
        <main className="min-h-screen bg-[#fbfbf9] text-[#1f1a17]">
            <Navbar theme="light" />

            <div className="mx-auto max-w-[1180px] px-6 pb-16 pt-24">
                <BackButton href="/" label="Home" />

                <div className="mt-6">
                    <p className="text-[12px] uppercase tracking-[0.28em] text-black/45">
                        LOOMEIRA
                    </p>
                    <h1 className="mt-3 text-5xl italic tracking-[-0.03em]">
                        Shop Apparel <span className="text-black/35 text-3xl">({products.length})</span>
                    </h1>
                    <p className="mt-4 max-w-xl text-lg text-black/65">
                        Tops, dresses, scarves, sweaters & more.
                    </p>
                </div>

                <div className="mt-10">
                    <ShopToolbar
                        products={baseProducts}
                        types={apparelTypes}
                        colors={colors}
                        onChange={setProducts}
                    />
                </div>

                <div className="mt-10">
                    {loading ? (
                        <p className="text-black/50">Loading products...</p>
                    ) : (
                        <ProductGrid products={products} />
                    )}
                </div>
            </div>
        </main>
    );
}