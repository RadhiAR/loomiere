import Navbar from "@/components/Navbar";
import ProductGrid from "@/components/ProductGrid";
import { PRODUCTS } from "@/lib/products";

export default function ShopPage() {
    return (
        <main className="min-h-screen bg-white">
            {/* Light theme navbar on white background */}
            <div className="relative">
                <Navbar brand="LOOMIÈRE" theme="light" />
                {/* Spacer so content doesn't hide behind absolute navbar */}
                <div className="h-24" />
            </div>

            <section className="mx-auto max-w-6xl px-6 py-10">
                <div className="flex items-end justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-light italic leading-tight">Shop</h1>
                        <p className="mt-3 max-w-xl text-sm text-black/60">
                            A curated selection of handmade pieces — accessories, home, and essentials.
                        </p>
                    </div>

                    <div className="hidden text-xs uppercase tracking-[0.22em] text-black/50 sm:block">
                        {PRODUCTS.length} items
                    </div>
                </div>

                <div className="mt-10">
                    <ProductGrid products={PRODUCTS} />
                </div>
            </section>
        </main>
    );
}