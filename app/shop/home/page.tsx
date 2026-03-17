"use client";

import { useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import BackButton from "@/components/BackButton";
import ProductGrid from "@/components/ProductGrid";
import ShopToolbar from "@/components/ShopToolbar";
import { getProductsByCategory } from "@/lib/products";

export default function ShopHomePage() {
    const baseProducts = useMemo(() => getProductsByCategory("home"), []);
    const [products, setProducts] = useState(baseProducts);

    const homeTypes = ["Coasters", "Throw Pillows", "Curtains", "Decor"];
    const colors = ["Cream", "Beige", "Sand", "White", "Brown", "Pink", "Sage"];

    return (
        <main className="min-h-screen bg-white">
            <div className="relative">
                <Navbar brand="LOOMIÈRE" theme="light" />

                <div className="fixed top-6 left-6 z-[9999] pointer-events-auto">
                    <BackButton theme="light" href="/" label="Home" />
                </div>

                <div className="h-24" />
            </div>

            <section className="mx-auto max-w-6xl px-6 py-12">
                <div className="flex items-end justify-between gap-6">
                    <div>
                        <h1 className="text-5xl font-light italic text-black/90">
                            Shop Home{" "}
                            <span className="text-lg not-italic text-black/45">
                                ({products.length})
                            </span>
                        </h1>
                        <p className="mt-3 text-sm text-black/60">
                            Coasters, decor, curtains & cozy essentials.
                        </p>
                    </div>
                </div>

                <ShopToolbar
                    products={baseProducts}
                    types={homeTypes}
                    colors={colors}
                    onChange={setProducts}
                />

                <div className="mt-10">
                    <ProductGrid products={products} />
                </div>
            </section>
        </main>
    );
}