import { supabase } from "@/lib/supabase";
import type { Product } from "@/lib/products";

type CategoryPageKey = "apparel" | "home" | "pet" | "jewellery";

type DbRow = {
  id: string;
  slug: string;
  name: string;
  price: number;
  image_url: string | null;
  category: string | null;
  description: string | null;
  created_at?: string | null;
  discount_value?: number | null;
  discount_type?: string | null;
  media_urls?: string[] | null;
  media_types?: string[] | null;
  ready_to_ship_date?: string | null;
};

function getCategoryAliases(category: CategoryPageKey): string[] {
  if (category === "home") return ["home", "home decor"];
  if (category === "pet") return ["pet", "pets"];
  return [category];
}

export type ShopProduct = Product & {
  id?: string;
  createdAt?: string | null;
  discountValue?: number | null;
  discountType?: string | null;
  mediaUrls?: string[];
  mediaTypes?: string[];
  readyToShipDate?: string | null;
};

function normalizeCategory(category: string | null): Product["category"] {
  const value = (category || "").toLowerCase();

  if (value === "home decor") return "home";
  if (value === "pets") return "pet";
  if (value === "home") return "home";
  if (value === "pet") return "pet";
  if (value === "apparel") return "apparel";
  return "jewellery";
}

function mapRowToProduct(row: DbRow): ShopProduct {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    price: Number(row.price),
    imageUrl: row.image_url || row.media_urls?.[0] || "/products/placeholder.jpg",
    category: normalizeCategory(row.category),
    description: row.description || "",
    createdAt: row.created_at || null,
    discountValue: row.discount_value ?? null,
    discountType: row.discount_type ?? null,
    mediaUrls: row.media_urls || [],
    mediaTypes: row.media_types || [],
    readyToShipDate: row.ready_to_ship_date || null,
  };
}

export async function getDbProductsByCategory(
  category: CategoryPageKey
): Promise<ShopProduct[]> {
  const aliases = getCategoryAliases(category);

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .in("category", aliases)
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("Failed to fetch category products:", error?.message);
    return [];
  }

  return data.map(mapRowToProduct);
}

export async function getDbProductBySlug(
  slug: string
): Promise<ShopProduct | null> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return mapRowToProduct(data);
}