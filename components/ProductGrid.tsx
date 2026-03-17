import { Product } from "@/lib/products";
import ProductCard from "./ProductCard";

type Props = {
    products: Product[];
};

export default function ProductGrid({ products }: Props) {
    return (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((p) => (
                <ProductCard key={p.slug} product={p} />

            ))}
        </div>
    );
}