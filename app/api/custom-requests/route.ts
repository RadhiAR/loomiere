import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const SELECT_FIELDS =
    "request_id, first_name, last_name, email, product_type, description, measurements, notes, photo_url, status, assignee, created_at, updated_at";

export async function GET(req: NextRequest) {
    try {
        const scope = req.nextUrl.searchParams.get("scope") || "";
        const idsParam = req.nextUrl.searchParams.get("ids") || "";

        if (scope === "all") {
            const { data, error } = await supabase
                .from("custom_requests")
                .select(SELECT_FIELDS)
                .order("created_at", { ascending: false });

            if (error) {
                return NextResponse.json({ message: error.message }, { status: 500 });
            }

            return NextResponse.json({ items: data || [] });
        }

        const ids = idsParam
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);

        if (!ids.length) {
            return NextResponse.json({ items: [] });
        }

        const { data, error } = await supabase
            .from("custom_requests")
            .select(SELECT_FIELDS)
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

export async function PATCH(req: NextRequest) {
    try {
        const body = await req.json();
        const requestId = String(body?.requestId || "").trim();
        const assignee = String(body?.assignee || "").trim();

        if (!requestId) {
            return NextResponse.json({ message: "Request ID is required." }, { status: 400 });
        }

        const { data, error } = await supabase
            .from("custom_requests")
            .update({
                assignee: assignee || null,
                updated_at: new Date().toISOString(),
            })
            .eq("request_id", requestId)
            .select(SELECT_FIELDS)
            .single();

        if (error) {
            return NextResponse.json({ message: error.message }, { status: 500 });
        }

        return NextResponse.json({ item: data });
    } catch (error) {
        return NextResponse.json(
            {
                message:
                    error instanceof Error ? error.message : "Failed to update request.",
            },
            { status: 500 }
        );
    }
}