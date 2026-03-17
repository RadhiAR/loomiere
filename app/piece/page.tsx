import Navbar from "@/components/Navbar";
import BackButton from "@/components/BackButton";
import ProductActions from "@/components/ProductActions";
import { getProductBySlug } from "@/lib/products";

export default function PiecePage({
    searchParams
}: {
    searchParams: { slug?: string };
}) {
    const slug = searchParams?.slug;
    const product = slug ? getProductBySlug(slug) : undefined;

    if (!product) {
        return (
            <main className="min-h-screen bg-white">
                <div className="relative">
                    <Navbar brand="LOOMIÈRE" theme="light" />
                    <div className="absolute top-6 left-6 z-40">
                        <BackButton theme="light" href="/" label="Home" />
                    </div>
                    <div className="h-24" />
                </div>

                <section className="mx-auto max-w-4xl px-6 py-14">
                    <h1 className="text-2xl font-light italic text-black/90">
                        Product not found
                    </h1>
                    <p className="mt-3 text-sm text-black/60">
                        Please go back and open a product again.
                    </p>
                </section>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-white">
            <div className="relative">
                <Navbar brand="LOOMIÈRE" theme="light" />
                <div className="absolute top-6 left-6 z-40">
                    <BackButton theme="light" href="/" label="Home" />
                </div>
                <div className="h-24" />
            </div>

            <section className="mx-auto max-w-5xl px-6 py-12">
                <div className="grid gap-10 md:grid-cols-2">
                    {/* Image */}
                    <div className="overflow-hidden rounded-2xl border border-black/10 bg-white">
                        <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="h-[520px] w-full object-cover"
                        />
                    </div>

                    {/* Details */}
                    <div>
                        <div className="text-xs uppercase tracking-[0.22em] text-black/50">
                            LOOMIÈRE
                        </div>

                        <h1 className="mt-3 text-4xl font-light italic text-black/90">
                            {product.name}
                        </h1>

                        <div className="mt-3 text-lg text-black/70">${product.price}</div>

                        {product.description && (
                            <p className="mt-6 text-sm leading-6 text-black/65">
                                {product.description}
                            </p>
                        )}

                        <ProductActions
                            slug={product.slug}
                            name={product.name}
                            price={product.price}
                            imageUrl={product.imageUrl}
                        />
                    </div>
                </div>
            </section>
        </main>
    );
}