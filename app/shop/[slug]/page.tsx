import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";

type ProductDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { slug } = await params;

  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error || !product) {
    notFound();
  }

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <div className="grid md:grid-cols-2 gap-10">
        <div className="space-y-4">
          {product.media_urls?.length > 0 ? (
            product.media_urls.map((url: string, index: number) => {
              const type = product.media_types?.[index];

              if (type === "video") {
                return (
                  <video
                    key={url}
                    src={url}
                    controls
                    className="w-full rounded-2xl"
                  />
                );
              }

              return (
                <img
                  key={url}
                  src={url}
                  alt={product.name}
                  className="w-full rounded-2xl object-cover"
                />
              );
            })
          ) : product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full rounded-2xl object-cover"
            />
          ) : (
            <div className="w-full h-[500px] rounded-2xl bg-gray-100" />
          )}
        </div>

        <div>
          <p className="text-sm uppercase tracking-wide text-gray-500">
            {product.category}
          </p>

          <h1 className="text-3xl font-semibold mt-2">{product.name}</h1>

          <p className="mt-4 text-gray-600">{product.description}</p>

          <p className="mt-6 text-2xl font-medium">${product.price}</p>

          {product.discount_value && product.discount_type && (
            <p className="mt-2 text-green-700">
              Discount: {product.discount_value}
              {product.discount_type === "percentage" ? "%" : "$"} off
            </p>
          )}

          {product.ready_to_ship_date && (
            <p className="mt-4 text-sm text-gray-600">
              Ready to ship: {product.ready_to_ship_date}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}