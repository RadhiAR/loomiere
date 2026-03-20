import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const adminKey = process.env.ADMIN_DASHBOARD_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

function isAuthorized(req: NextRequest) {
    const incomingKey = req.headers.get("x-admin-key");
    return !!adminKey && incomingKey === adminKey;
}

export async function GET(req: NextRequest) {
    try {
        if (!isAuthorized(req)) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status");
        const search = (searchParams.get("search") || "").trim();

        let query = supabase
            .from("custom_requests")
            .select("*")
            .order("created_at", { ascending: false });

        if (status && status !== "all") {
            query = query.eq("status", status);
        }

        if (search) {
            query = query.or(
                [
                    `request_id.ilike.%${search}%`,
                    `first_name.ilike.%${search}%`,
                    `last_name.ilike.%${search}%`,
                    `email.ilike.%${search}%`,
                    `product_type.ilike.%${search}%`,
                    `description.ilike.%${search}%`,
                ].join(",")
            );
        }

        const { data, error } = await query;

        if (error) {
            return NextResponse.json({ message: error.message }, { status: 500 });
        }

        return NextResponse.json({ items: data || [] });
    } catch (error) {
        return NextResponse.json(
            { message: error instanceof Error ? error.message : "Failed to load requests." },
            { status: 500 }
        );
    }
}

export async function PATCH(req: NextRequest) {
    try {
        if (!isAuthorized(req)) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const id = body?.id;

        if (!id) {
            return NextResponse.json({ message: "Missing request id." }, { status: 400 });
        }

        const updates: Record<string, string | null> = {};

        if (typeof body.status === "string") {
            updates.status = body.status;
        }

        if (typeof body.admin_notes === "string") {
            updates.admin_notes = body.admin_notes;
        }

        if (typeof body.quoted_price === "string") {
            updates.quoted_price = body.quoted_price;
        }

        const { data, error } = await supabase
            .from("custom_requests")
            .update(updates)
            .eq("id", id)
            .select("*")
            .single();

        if (error) {
            return NextResponse.json({ message: error.message }, { status: 500 });
        }

        return NextResponse.json({ item: data });
    } catch (error) {
        return NextResponse.json(
            { message: error instanceof Error ? error.message : "Failed to update request." },
            { status: 500 }
        );
    }
}