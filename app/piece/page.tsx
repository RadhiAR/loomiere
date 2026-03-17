import Navbar from "@/components/Navbar";
import BackButton from "@/components/BackButton";
import ProductActions from "@/components/ProductActions";
import { getProductBySlug } from "@/lib/products";
import { getDbProductBySlug } from "@/lib/db-products";

type PiecePageProps = {
    searchParams: Promise<{ slug?: string }>;
};

export default async function PiecePage({ searchParams }: PiecePageProps) {
    const params = await searchParams;
    const slug = params?.slug;

    const dbProduct = slug ? await getDbProductBySlug(slug) : null;
    const staticProduct = slug ? getProductBySlug(slug) : undefined;
    const product = dbProduct ?? staticProduct;

    if (!product) {
        return (
            <main className="min-h-screen bg-[#fbfbf9] text-[#1f1a17]">
                <Navbar theme="light" />
                <div className="mx-auto max-w-[1180px] px-6 pb-16 pt-24">
                    <BackButton href="/" label="Home" />
                    <div className="mt-20 max-w-xl">
                        <h1 className="text-5xl italic tracking-[-0.03em]">
                            Product not found
                        </h1>
                        <p className="mt-4 text-lg text-black/55">
                            Please go back and open a product again.
                        </p>
                    </div>
                </div>
            </main>
        );
    }

    const mediaUrls =
        "mediaUrls" in product && Array.isArray(product.mediaUrls)
            ? product.mediaUrls
            : [];
    const mediaTypes =
        "mediaTypes" in product && Array.isArray(product.mediaTypes)
            ? product.mediaTypes
            : [];
    const discountValue =
        "discountValue" in product ? product.discountValue : null;
    const discountType =
        "discountType" in product ? product.discountType : null;
    const readyToShipDate =
        "readyToShipDate" in product ? product.readyToShipDate : null;

    return (
        <main className="min-h-screen bg-[#fbfbf9] text-[#1f1a17]">
            <Navbar theme="light" />

            <div className="mx-auto max-w-[1180px] px-6 pb-16 pt-24">
                <BackButton href="/" label="Home" />

                <div className="mt-8 grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
                    <div className="space-y-4">
                        {mediaUrls.length > 0 ? (
                            mediaUrls.map((url, index) => {
                                const type = mediaTypes[index];

                                if (type === "video") {
                                    return (
                                        <video
                                            key={`${url}-${index}`}
                                            src={url}
                                            controls
                                            className="w-full rounded-[28px] border border-black/10 bg-white object-cover"
                                        />
                                    );
                                }

                                return (
                                    <img
                                        key={`${url}-${index}`}
                                        src={url}
                                        alt={product.name}
                                        className="w-full rounded-[28px] border border-black/10 bg-white object-cover"
                                    />
                                );
                            })
                        ) : (
                            <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-full rounded-[28px] border border-black/10 bg-white object-cover"
                            />
                        )}
                    </div>

                    <div className="max-w-xl">
                        <p className="text-[12px] uppercase tracking-[0.28em] text-black/45">
                            LOOMIÈRE
                        </p>

                        <h1 className="mt-3 text-5xl italic tracking-[-0.03em]">
                            {product.name}
                        </h1>

                        <p className="mt-5 text-2xl">${product.price}</p>

                        {product.description ? (
                            <p className="mt-5 text-lg leading-8 text-black/65">
                                {product.description}
                            </p>
                        ) : null}

                        {discountValue && discountType ? (
                            <p className="mt-4 text-base text-[#d94b93]">
                                Discount: {discountValue}
                                {discountType === "percentage" ? "%" : "$"} off
                            </p>
                        ) : null}

                        {readyToShipDate ? (
                            <p className="mt-2 text-sm text-black/50">
                                Ready to ship: {readyToShipDate}
                            </p>
                        ) : null}

                        <div className="mt-8">
                            <ProductActions product={product} />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}