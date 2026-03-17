import Link from "next/link";
import { supabase } from "@/lib/supabase";

type ShopPageProps = {
  searchParams?: Promise<{ category?: string }>;
};

const categories = ["all", "home decor", "pets", "jewellery", "apparel"];

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const selectedCategory = params?.category || "all";

  let query = supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (selectedCategory !== "all") {
    query = query.eq("category", selectedCategory);
  }

  const { data: products, error } = await query;

  if (error) {
    return <div className="p-6">Failed to load products.</div>;
  }

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-semibold mb-8">Shop</h1>

      <div className="flex flex-wrap gap-3 mb-8">
        {categories.map((category) => (
          <Link
            key={category}
            href={
              category === "all"
                ? "/shop"
                : `/shop?category=${encodeURIComponent(category)}`
            }
            className={`border rounded-full px-4 py-2 ${
              selectedCategory === category ? "font-semibold" : ""
            }`}
          >
            {category}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products?.map((product) => (
          <Link key={product.id} href={`/shop/${product.slug}`}>
            <div className="border rounded-xl p-4 cursor-pointer hover:shadow-md transition">
              {product.image_url && (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-64 object-cover rounded-lg"
                />
              )}

              <h2 className="mt-4 text-lg font-semibold">{product.name}</h2>
              <p className="text-sm text-gray-600">{product.description}</p>
              <p className="text-sm text-gray-500 mt-1">{product.category}</p>
              <p className="mt-2 font-medium">${product.price}</p>

              {product.discount_value && product.discount_type && (
                <p className="text-sm text-green-700 mt-1">
                  Discount: {product.discount_value}
                  {product.discount_type === "percentage" ? "%" : "$"} off
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}