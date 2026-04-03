import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        if (!body.name || !body.description || !body.category || !body.price) {
            return NextResponse.json(
                { error: "Missing required fields." },
                { status: 400 }
            );
        }

        if (body.description.length > 200) {
            return NextResponse.json(
                { error: "Description must be 200 characters or less." },
                { status: 400 }
            );
        }

        const payload = {
            name: body.name,
            slug: body.slug,
            description: body.description,
            category: body.category,
            price: Number(body.price),
            stock: body.stock ?? 1,
            is_featured: body.is_featured ?? false,
            is_active: body.is_active ?? true,
            image_url: body.image_url ?? null,
            media_urls: body.media_urls ?? [],
            media_types: body.media_types ?? [],
            ready_to_ship_date: body.ready_to_ship_date || null,
            discount_value:
                body.discount_value === null ||
                    body.discount_value === undefined ||
                    body.discount_value === ""
                    ? null
                    : Number(body.discount_value),
            discount_type: body.discount_type || null,
        };

        const { error } = await supabaseAdmin.from("products").insert([payload]);

        if (error) {
            console.error("Product insert failed:", error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Create product route error:", error);

        return NextResponse.json(
            { error: "Something went wrong while creating product." },
            { status: 500 }
        );
    }
}