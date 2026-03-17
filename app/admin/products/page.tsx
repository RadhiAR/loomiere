import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default async function AdminProductsPage() {
    const { data: products, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        return <div className="p-6">Failed to load admin products.</div>;
    }

    return (
        <main className="max-w-6xl mx-auto px-6 py-10">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-semibold">Admin Products</h1>
                <Link
                    href="/admin/products/new"
                    className="border rounded-xl px-4 py-2"
                >
                    Add Product
                </Link>
            </div>

            <div className="space-y-4">
                {products?.map((product) => (
                    <div
                        key={product.id}
                        className="border rounded-xl p-4 flex items-center justify-between"
                    >
                        <div>
                            <h2 className="font-semibold">{product.name}</h2>
                            <p className="text-sm text-gray-600">{product.slug}</p>
                            <p className="text-sm text-gray-600">
                                ${product.price} | Stock: {product.stock}
                            </p>
                        </div>

                        <div className="text-sm">
                            {product.is_active ? "Active" : "Inactive"}
                        </div>
                    </div>
                ))}
            </div>
        </main>
    );
}