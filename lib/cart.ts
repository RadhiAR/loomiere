export type CartItem = {
    id: string; // unique key
    slug: string;
    name: string;
    price: number;
    imageUrl: string;
    qty: number;
    color: string;
    customization?: {
        description: string;
        phone: string;
    };
};

const KEY = "loomiere_cart_v1";

export function readCart(): CartItem[] {
    if (typeof window === "undefined") return [];
    try {
        const raw = window.localStorage.getItem(KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

export function writeCart(items: CartItem[]) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(KEY, JSON.stringify(items));
}

export function addToCart(item: Omit<CartItem, "id">) {
    const cart = readCart();

    // Merge identical item (same product + same color + same customization text/phone)
    const sig = (x: Omit<CartItem, "id">) =>
        JSON.stringify({
            slug: x.slug,
            color: x.color,
            customization: x.customization ?? null
        });

    const idx = cart.findIndex((c) =>
        sig({
            slug: c.slug,
            name: c.name,
            price: c.price,
            imageUrl: c.imageUrl,
            qty: c.qty,
            color: c.color,
            customization: c.customization
        }) === sig(item)
    );

    if (idx >= 0) {
        cart[idx].qty += item.qty;
    } else {
        cart.push({
            ...item,
            id:
                typeof crypto !== "undefined" && "randomUUID" in crypto
                    ? crypto.randomUUID()
                    : `${Date.now()}_${Math.random().toString(16).slice(2)}`
        });
    }

    writeCart(cart);
}