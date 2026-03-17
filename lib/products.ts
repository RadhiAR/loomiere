export type Category = "apparel" | "home" | "pet" | "jewellery";

export type Product = {
    slug: string;
    name: string;
    price: number; // USD
    imageUrl: string; // from /public
    category: Category;
    description?: string;
};

export const PRODUCTS: Product[] = [
    // APPAREL
    {
        slug: "ribbed-top-sand",
        name: "Ribbed Top — Sand",
        price: 74,
        imageUrl: "/products/top-sand.jpg",
        category: "apparel",
        description: "A refined everyday piece — breathable, soft, and flattering."
    },
    {
        slug: "chunky-scarf-cream",
        name: "Chunky Scarf — Cream",
        price: 68,
        imageUrl: "/products/scarf-cream.jpg",
        category: "apparel",
        description: "Soft, cozy and sculpted in texture. Handmade with premium yarn."
    },

    // HOME
    {
        slug: "crochet-coasters-set-4",
        name: "Coasters (Set of 4)",
        price: 28,
        imageUrl: "/products/coasters-4.jpg",
        category: "home",
        description: "Durable, washable, elevated — made for everyday tables."
    },
    {
        slug: "textured-throw-pillow",
        name: "Textured Throw Pillow",
        price: 54,
        imageUrl: "/products/pillow.jpg",
        category: "home",
        description: "Handcrafted texture for a warm, modern interior."
    },

    // PET
    {
        slug: "dog-sweater-rose",
        name: "Dog Sweater — Rose",
        price: 42,
        imageUrl: "/products/dog-sweater.jpg",
        category: "pet",
        description: "Cozy knitwear for pups — soft fit, warm feel."
    },
    {
        slug: "dog-collar-knit",
        name: "Dog Collar — Knit Detail",
        price: 22,
        imageUrl: "/products/dog-collar.jpg",
        category: "pet",
        description: "Comfort-first collar with handmade detailing."
    },

    // JEWELLERY
    {
        slug: "handcrafted-earrings-pearl",
        name: "Handcrafted Earrings — Pearl",
        price: 38,
        imageUrl: "/products/earrings.jpg",
        category: "jewellery",
        description: "Lightweight, elegant, handcrafted finish."
    },
    {
        slug: "handcrafted-bracelet-gold",
        name: "Handcrafted Bracelet — Gold",
        price: 44,
        imageUrl: "/products/bracelet.jpg",
        category: "jewellery",
        description: "Minimal statement piece — refined and timeless."
    }
];

export function getProductBySlug(slug: string): Product | undefined {
    return PRODUCTS.find((p) => p.slug === slug);
}

export function getProductsByCategory(category: Category): Product[] {
    return PRODUCTS.filter((p) => p.category === category);
}