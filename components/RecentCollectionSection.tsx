import Link from "next/link";
import { supabase } from "@/lib/supabase";

type ProductItem = {
    id?: string | number;
    slug?: string;
    name: string;
    price: number;
    image_url?: string | null;
    category?: string | null;
};

export default async function RecentCollectionSection() {
    const { data: products, error } = await supabase
        .from("products")
        .select("id, slug, name, price, image_url, category, created_at")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(4);

    if (error || !products || products.length === 0) {
        return null;
    }

    return (
        <section className="bg-[#f8f3ef] px-6 py-16 md:px-10 lg:px-16">
            <div className="mx-auto max-w-7xl">
                <div className="mb-10 text-center">
                    <p className="mb-3 text-[11px] uppercase tracking-[0.35em] text-black/55">
                        New
                    </p>
                    <h2 className="text-3xl font-light tracking-[0.04em] text-black md:text-5xl">
                        Trending Now
                    </h2>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
                    {products.map((product: ProductItem) => {
                        const href = product.category
                            ? `/shop?category=${encodeURIComponent(product.category)}`
                            : "/shop";

                        return (
                            <Link
                                key={String(product.id ?? product.slug ?? product.name)}
                                href={href}
                                className="group block"
                            >
                                <div className="overflow-hidden bg-[#ece7e2]">
                                    {product.image_url ? (
                                        <img
                                            src={product.image_url}
                                            alt={product.name}
                                            className="h-[420px] w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                                        />
                                    ) : (
                                        <div className="flex h-[420px] items-center justify-center text-sm text-black/40">
                                            No image
                                        </div>
                                    )}
                                </div>

                                <div className="pt-5">
                                    <h3 className="text-lg font-light tracking-[0.01em] text-black">
                                        {product.name}
                                    </h3>
                                    <p className="mt-2 text-base text-black/65">
                                        ${Number(product.price).toFixed(2)}
                                    </p>
                                </div>
                            </Link>
                        );
                    })}
                </div>

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