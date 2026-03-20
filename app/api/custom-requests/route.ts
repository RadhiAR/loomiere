import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(req: NextRequest) {
    try {
        const idsParam = req.nextUrl.searchParams.get("ids") || "";
        const ids = idsParam
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);

        if (!ids.length) {
            return NextResponse.json({ items: [] });
        }

        const { data, error } = await supabase
            .from("custom_requests")
            .select(
                "request_id, first_name, last_name, email, product_type, description, measurements, notes, photo_url, status, created_at, updated_at"
            )
            .in("request_id", ids)
            .order("created_at", { ascending: false });

        if (error) {
            return NextResponse.json({ message: error.message }, { status: 500 });
        }

        return NextResponse.json({ items: data || [] });
    } catch (error) {
        return NextResponse.json(
            {
                message:
                    error instanceof Error ? error.message : "Failed to load custom requests.",
            },
            { status: 500 }
        );
    }
}