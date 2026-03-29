import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

function slugify(value: string) {
    return value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 60);
}

export async function GET(req: NextRequest) {
    try {
        const username = req.nextUrl.searchParams.get("username")?.trim();

        if (!username) {
            return NextResponse.json(
                { error: "username is required" },
                { status: 400 }
            );
        }

        const { data: memberships, error: membershipError } = await supabaseAdmin
            .from("milan_room_members")
            .select("room_id, role")
            .eq("username", username);

        if (membershipError) {
            return NextResponse.json(
                { error: membershipError.message },
                { status: 500 }
            );
        }

        const roomIds = memberships.map((item) => item.room_id);

        if (!roomIds.length) {
            return NextResponse.json({ rooms: [] });
        }

        const { data: rooms, error: roomError } = await supabaseAdmin
            .from("milan_rooms")
            .select("*")
            .in("id", roomIds)
            .order("created_at", { ascending: true });

        if (roomError) {
            return NextResponse.json(
                { error: roomError.message },
                { status: 500 }
            );
        }

        const { data: members, error: memberListError } = await supabaseAdmin
            .from("milan_room_members")
            .select("room_id, username, role")
            .in("room_id", roomIds)
            .order("joined_at", { ascending: true });

        if (memberListError) {
            return NextResponse.json(
                { error: memberListError.message },
                { status: 500 }
            );
        }

        const roomsWithMembers = rooms.map((room) => ({
            ...room,
            members: members.filter((member) => member.room_id === room.id),
            myRole: memberships.find((member) => member.room_id === room.id)?.role || "member",
        }));

        return NextResponse.json({ rooms: roomsWithMembers });
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
        const roomName = String(body.roomName || "").trim();
        const createdByUsername = String(body.createdByUsername || "").trim();
        const selectedUsernames = Array.isArray(body.selectedUsernames)
            ? body.selectedUsernames
                .map((item: unknown) => String(item || "").trim())
                .filter(Boolean)
            : [];

        if (!roomName) {
            return NextResponse.json(
                { error: "roomName is required" },
                { status: 400 }
            );
        }

        if (!createdByUsername) {
            return NextResponse.json(
                { error: "createdByUsername is required" },
                { status: 400 }
            );
        }

        const slugBase = slugify(roomName);
        const slug = `${slugBase}-${Date.now()}`;

        const { data: room, error: roomError } = await supabaseAdmin
            .from("milan_rooms")
            .insert({
                name: roomName,
                slug,
                is_default: false,
                is_admin_only: true,
                created_by_username: createdByUsername,
            })
            .select()
            .single();

        if (roomError || !room) {
            return NextResponse.json(
                { error: roomError?.message || "Failed to create room" },
                { status: 500 }
            );
        }

        const memberRows = Array.from(
            new Set([createdByUsername, ...selectedUsernames])
        ).map((username) => ({
            room_id: room.id,
            username,
            role: username === createdByUsername ? "owner" : "member",
        }));

        const { error: memberError } = await supabaseAdmin
            .from("milan_room_members")
            .insert(memberRows);

        if (memberError) {
            return NextResponse.json(
                { error: memberError.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ room });
    } catch (error) {
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}