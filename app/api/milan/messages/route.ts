import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
    try {
        const roomId = req.nextUrl.searchParams.get("roomId")?.trim();

        if (!roomId) {
            return NextResponse.json(
                { error: "roomId is required" },
                { status: 400 }
            );
        }

        const { data, error } = await supabaseAdmin
            .from("milan_messages")
            .select("*")
            .eq("room_id", roomId)
            .order("created_at", { ascending: true });

        if (error) {
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ messages: data || [] });
    } catch (error) {
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const roomId = String(body.roomId || "").trim();
        const username = String(body.username || "").trim();
        const bodyText = String(body.body || "").trim();

        if (!roomId) {
            return NextResponse.json(
                { error: "roomId is required" },
                { status: 400 }
            );
        }

        if (!username) {
            return NextResponse.json(
                { error: "username is required" },
                { status: 400 }
            );
        }

        if (!bodyText) {
            return NextResponse.json(
                { error: "body is required" },
                { status: 400 }
            );
        }

        const { data: membership, error: membershipError } = await supabaseAdmin
            .from("milan_room_members")
            .select("id")
            .eq("room_id", roomId)
            .eq("username", username)
            .maybeSingle();

        if (membershipError) {
            return NextResponse.json(
                { error: membershipError.message },
                { status: 500 }
            );
        }

        if (!membership) {
            return NextResponse.json(
                { error: "User is not a member of this room" },
                { status: 403 }
            );
        }

        const { data, error } = await supabaseAdmin
            .from("milan_messages")
            .insert({
                room_id: roomId,
                username,
                body: bodyText,
            })
            .select()
            .single();

        if (error) {
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ message: data });
    } catch (error) {
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}