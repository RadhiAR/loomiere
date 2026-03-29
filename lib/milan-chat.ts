import { supabase } from "@/lib/supabase";

export type MilanRoom = {
    id: string;
    name: string;
    slug: string;
    is_default: boolean;
    is_admin_only: boolean;
    created_by_username: string;
    created_at: string;
    myRole?: string;
    members?: Array<{
        room_id: string;
        username: string;
        role: string;
    }>;
};

export type MilanMessage = {
    id: string;
    room_id: string;
    username: string;
    body: string;
    created_at: string;
    edited_at: string | null;
};

export async function fetchMilanRooms(username: string) {
    const res = await fetch(`/api/milan/rooms?username=${encodeURIComponent(username)}`, {
        cache: "no-store",
    });
    const data = await res.json();

    if (!res.ok) {
        throw new Error(data?.error || "Failed to fetch rooms");
    }

    return data.rooms as MilanRoom[];
}

export async function createMilanRoom(input: {
    roomName: string;
    createdByUsername: string;
    selectedUsernames: string[];
}) {
    const res = await fetch("/api/milan/rooms", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data?.error || "Failed to create room");
    }

    return data.room as MilanRoom;
}

export async function fetchMilanMessages(roomId: string) {
    const res = await fetch(`/api/milan/messages?roomId=${encodeURIComponent(roomId)}`, {
        cache: "no-store",
    });
    const data = await res.json();

    if (!res.ok) {
        throw new Error(data?.error || "Failed to fetch messages");
    }

    return data.messages as MilanMessage[];
}

export async function sendMilanMessage(input: {
    roomId: string;
    username: string;
    body: string;
}) {
    const res = await fetch("/api/milan/messages", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data?.error || "Failed to send message");
    }

    return data.message as MilanMessage;
}

export function subscribeToMilanRoomMessages(
    roomId: string,
    onInsert: (message: MilanMessage) => void
) {
    const channel = supabase
        .channel(`milan-room-${roomId}`)
        .on(
            "postgres_changes",
            {
                event: "INSERT",
                schema: "public",
                table: "milan_messages",
                filter: `room_id=eq.${roomId}`,
            },
            (payload) => {
                onInsert(payload.new as MilanMessage);
            }
        )
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
}