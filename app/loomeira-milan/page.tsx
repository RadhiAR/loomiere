"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Navbar from "@/components/Navbar";
import BackButton from "@/components/BackButton";
import { supabase } from "@/lib/supabase";
import { getCurrentUser, isLoggedIn } from "@/lib/auth";

type MilanRoom = {
    id: string;
    name: string;
    is_group: boolean;
    created_by: string;
    created_at: string;
};

type MilanMessage = {
    id: string;
    room_id: string;
    username: string;
    user_id: string;
    content: string;
    created_at: string;
};

function HeartBadgeA() {
    return (
        <div className="relative flex h-20 w-20 items-center justify-center">
            <div className="absolute h-12 w-12 rotate-45 rounded-[14px] bg-[#ff4f8b]" />
            <div className="absolute left-[12px] top-[12px] h-10 w-10 rounded-full bg-[#ff4f8b]" />
            <div className="absolute right-[12px] top-[12px] h-10 w-10 rounded-full bg-[#ff4f8b]" />
            <div className="relative z-10 -mt-1 text-[30px] font-semibold italic text-white">
                A
            </div>
        </div>
    );
}

function formatTime(value: string) {
    try {
        return new Date(value).toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
        });
    } catch {
        return "";
    }
}

export default function LoomeiraMilanPage() {
    const currentUser = getCurrentUser();
    const loggedIn = isLoggedIn();

    const username = useMemo(() => {
        if (!currentUser) return "Guest";
        return currentUser.username || `${currentUser.firstName} ${currentUser.lastName}`.trim();
    }, [currentUser]);

    const userId = currentUser?.id || "guest-user";

    const [rooms, setRooms] = useState<MilanRoom[]>([]);
    const [activeRoomId, setActiveRoomId] = useState<string>("");
    const [messages, setMessages] = useState<MilanMessage[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [newGroupName, setNewGroupName] = useState("");
    const [loadingRooms, setLoadingRooms] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [creatingGroup, setCreatingGroup] = useState(false);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");

    const bottomRef = useRef<HTMLDivElement | null>(null);

    const activeRoom = useMemo(
        () => rooms.find((room) => room.id === activeRoomId) || null,
        [rooms, activeRoomId]
    );

    useEffect(() => {
        let mounted = true;

        async function loadRooms() {
            setLoadingRooms(true);
            setError("");

            const { data, error } = await supabase
                .from("loomeira_milan_rooms")
                .select("id, name, is_group, created_by, created_at")
                .order("created_at", { ascending: true });

            if (!mounted) return;

            if (error) {
                setError("Could not load MILAN rooms yet.");
                setLoadingRooms(false);
                return;
            }

            const nextRooms = Array.isArray(data) ? data : [];
            setRooms(nextRooms);

            if (nextRooms.length > 0) {
                setActiveRoomId((prev) => prev || nextRooms[0].id);
            }

            setLoadingRooms(false);
        }

        loadRooms();

        const roomsChannel = supabase
            .channel("loomeira-milan-rooms-live")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "loomeira_milan_rooms",
                },
                async () => {
                    const { data } = await supabase
                        .from("loomeira_milan_rooms")
                        .select("id, name, is_group, created_by, created_at")
                        .order("created_at", { ascending: true });

                    const nextRooms = Array.isArray(data) ? data : [];
                    setRooms(nextRooms);

                    if (!activeRoomId && nextRooms.length > 0) {
                        setActiveRoomId(nextRooms[0].id);
                    }
                }
            )
            .subscribe();

        return () => {
            mounted = false;
            supabase.removeChannel(roomsChannel);
        };
    }, [activeRoomId]);

    useEffect(() => {
        if (!activeRoomId) return;

        let mounted = true;

        async function loadMessages() {
            setLoadingMessages(true);
            setError("");

            const { data, error } = await supabase
                .from("loomeira_milan_messages")
                .select("id, room_id, username, user_id, content, created_at")
                .eq("room_id", activeRoomId)
                .order("created_at", { ascending: true });

            if (!mounted) return;

            if (error) {
                setError("Could not load messages for this room.");
                setLoadingMessages(false);
                return;
            }

            setMessages(Array.isArray(data) ? data : []);
            setLoadingMessages(false);
        }

        loadMessages();

        const messagesChannel = supabase
            .channel(`loomeira-milan-messages-${activeRoomId}`)
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "loomeira_milan_messages",
                    filter: `room_id=eq.${activeRoomId}`,
                },
                async () => {
                    const { data } = await supabase
                        .from("loomeira_milan_messages")
                        .select("id, room_id, username, user_id, content, created_at")
                        .eq("room_id", activeRoomId)
                        .order("created_at", { ascending: true });

                    setMessages(Array.isArray(data) ? data : []);
                }
            )
            .subscribe();

        return () => {
            mounted = false;
            supabase.removeChannel(messagesChannel);
        };
    }, [activeRoomId]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    async function createDefaultRoomIfNeeded() {
        const { data } = await supabase
            .from("loomeira_milan_rooms")
            .select("id, name, is_group, created_by, created_at")
            .order("created_at", { ascending: true });

        const existingRooms = Array.isArray(data) ? data : [];

        if (existingRooms.length > 0) return existingRooms;

        const { data: inserted } = await supabase
            .from("loomeira_milan_rooms")
            .insert([
                {
                    name: "Milan Lounge",
                    is_group: true,
                    created_by: userId,
                },
            ])
            .select();

        return Array.isArray(inserted) ? inserted : [];
    }

    useEffect(() => {
        createDefaultRoomIfNeeded();
    }, []);

    async function handleCreateGroup() {
        if (!loggedIn) {
            setError("Please log in to create a MILAN group.");
            return;
        }

        if (!newGroupName.trim()) {
            setError("Please enter a group name.");
            return;
        }

        setCreatingGroup(true);
        setError("");

        const { data, error } = await supabase
            .from("loomeira_milan_rooms")
            .insert([
                {
                    name: newGroupName.trim(),
                    is_group: true,
                    created_by: userId,
                },
            ])
            .select();

        if (error) {
            setError("Could not create group right now.");
            setCreatingGroup(false);
            return;
        }

        const createdRoom = Array.isArray(data) ? data[0] : null;

        if (createdRoom?.id) {
            setActiveRoomId(createdRoom.id);
        }

        setNewGroupName("");
        setCreatingGroup(false);
    }

    async function handleSendMessage() {
        if (!loggedIn) {
            setError("Please log in to send messages in MILAN.");
            return;
        }

        if (!activeRoomId) {
            setError("Please select a room first.");
            return;
        }

        if (!newMessage.trim()) return;

        setSending(true);
        setError("");

        const { error } = await supabase.from("loomeira_milan_messages").insert([
            {
                room_id: activeRoomId,
                username,
                user_id: userId,
                content: newMessage.trim(),
            },
        ]);

        if (error) {
            setError("Message could not be sent.");
            setSending(false);
            return;
        }

        setNewMessage("");
        setSending(false);
    }

    return (
        <main className="min-h-screen bg-[radial-gradient(circle_at_top,#fff0f6_0%,#ffe0ea_32%,#ffd0df_100%)] text-black">
            <Navbar theme="light" />

            <section className="px-6 pb-10 pt-28 md:px-10 lg:px-16">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-8 flex flex-col gap-5 rounded-[34px] border border-[#f3aac6] bg-white/70 p-6 shadow-[0_18px_60px_rgba(236,72,153,0.12)] backdrop-blur">
                        <div className="flex items-start justify-between gap-5">
                            <div className="flex items-center gap-4">
                                <HeartBadgeA />
                                <div>
                                    <div className="text-[11px] uppercase tracking-[0.34em] text-[#d14a85]">
                                        Subscribers Chat Club
                                    </div>
                                    <h1 className="mt-2 text-3xl font-light tracking-[0.03em] text-[#7c163d] md:text-5xl">
                                        Loomeira - MILAN
                                    </h1>
                                    <p className="mt-3 max-w-2xl text-sm leading-7 text-black/65 md:text-base">
                                        A red-and-pink heart-themed chat space for Loomeira subscribers.
                                        Talk under your usernames, create separate groups, and keep the vibe
                                        warm, stylish, and social.
                                    </p>
                                </div>
                            </div>

                            <div className="hidden md:block">
                                <BackButton />
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <div className="rounded-full border border-[#f2a8c6] bg-[#fff4f8] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[#a61f57]">
                                Logged in as: {loggedIn ? username : "Guest"}
                            </div>
                            <div className="rounded-full border border-[#f7bfd5] bg-white px-4 py-2 text-xs uppercase tracking-[0.2em] text-black/55">
                                Hearts • Groups • Live chat
                            </div>
                        </div>
                    </div>

                    {error ? (
                        <div className="mb-6 rounded-2xl border border-[#f0a3bf] bg-[#fff3f7] px-5 py-4 text-sm text-[#b11e5b]">
                            {error}
                        </div>
                    ) : null}

                    <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
                        <aside className="rounded-[30px] border border-[#f1b1cb] bg-white/75 p-5 shadow-[0_12px_40px_rgba(236,72,153,0.12)]">
                            <div className="mb-4 flex items-center justify-between">
                                <div>
                                    <div className="text-[11px] uppercase tracking-[0.28em] text-[#cb4b84]">
                                        Milan Rooms
                                    </div>
                                    <h2 className="mt-2 text-xl font-medium text-[#7c163d]">
                                        Groups & chats
                                    </h2>
                                </div>
                            </div>

                            <div className="rounded-[24px] border border-[#f5bfd5] bg-[#fff3f7] p-4">
                                <label className="mb-2 block text-[11px] uppercase tracking-[0.22em] text-[#b7306b]">
                                    Create a new group
                                </label>
                                <input
                                    value={newGroupName}
                                    onChange={(e) => setNewGroupName(e.target.value)}
                                    placeholder="Ex: Milan Brides, Crochet Queens"
                                    className="w-full rounded-2xl border border-[#efbdd1] bg-white px-4 py-3 text-sm text-black/80 outline-none placeholder:text-black/35 focus:border-[#e55291]"
                                />
                                <button
                                    type="button"
                                    onClick={handleCreateGroup}
                                    disabled={creatingGroup}
                                    className="mt-3 inline-flex rounded-full bg-[#e94685] px-5 py-3 text-xs uppercase tracking-[0.22em] text-white transition hover:bg-[#d93778] disabled:opacity-60"
                                >
                                    {creatingGroup ? "Creating..." : "Create Group"}
                                </button>
                            </div>

                            <div className="mt-5 space-y-2">
                                {loadingRooms ? (
                                    <div className="rounded-2xl border border-[#f2c6d7] bg-white px-4 py-5 text-sm text-black/55">
                                        Loading rooms...
                                    </div>
                                ) : rooms.length === 0 ? (
                                    <div className="rounded-2xl border border-[#f2c6d7] bg-white px-4 py-5 text-sm text-black/55">
                                        No rooms yet.
                                    </div>
                                ) : (
                                    rooms.map((room) => {
                                        const active = room.id === activeRoomId;

                                        return (
                                            <button
                                                key={room.id}
                                                type="button"
                                                onClick={() => setActiveRoomId(room.id)}
                                                className={`w-full rounded-[22px] border px-4 py-4 text-left transition ${active
                                                        ? "border-[#eb5a94] bg-[#ffe3ee] shadow-sm"
                                                        : "border-[#f2c6d7] bg-white hover:bg-[#fff2f7]"
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between gap-3">
                                                    <div>
                                                        <div className="text-sm font-medium text-[#731538]">
                                                            {room.name}
                                                        </div>
                                                        <div className="mt-1 text-[11px] uppercase tracking-[0.18em] text-black/45">
                                                            {room.is_group ? "Group chat" : "Direct room"}
                                                        </div>
                                                    </div>
                                                    <div className="text-xl text-[#ef5f9a]">♡</div>
                                                </div>
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                        </aside>

                        <section className="flex min-h-[720px] flex-col overflow-hidden rounded-[34px] border border-[#f0b3ca] bg-white/80 shadow-[0_14px_50px_rgba(236,72,153,0.14)]">
                            <div className="flex items-center justify-between border-b border-[#f6c7d9] bg-[linear-gradient(90deg,#ffe1ee_0%,#fff4f8_100%)] px-5 py-5">
                                <div>
                                    <div className="text-[11px] uppercase tracking-[0.24em] text-[#cd4f86]">
                                        Active room
                                    </div>
                                    <h2 className="mt-2 text-2xl font-medium text-[#7f143d]">
                                        {activeRoom?.name || "Select a room"}
                                    </h2>
                                </div>

                                <div className="flex items-center gap-2 rounded-full border border-[#efbdd1] bg-white px-4 py-2 text-xs uppercase tracking-[0.2em] text-[#b72768]">
                                    <span>♥</span>
                                    <span>MILAN</span>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top,#fff7fa_0%,#fff3f7_45%,#ffedf4_100%)] px-4 py-5 md:px-6">
                                {loadingMessages ? (
                                    <div className="rounded-2xl border border-[#f3c8d8] bg-white px-4 py-5 text-sm text-black/55">
                                        Loading messages...
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="flex h-full min-h-[400px] items-center justify-center">
                                        <div className="max-w-md rounded-[28px] border border-[#f3bfd3] bg-white px-6 py-8 text-center shadow-sm">
                                            <div className="mb-3 text-3xl text-[#eb4f8d]">♥</div>
                                            <div className="text-lg font-medium text-[#7d173e]">
                                                Start the first conversation
                                            </div>
                                            <p className="mt-2 text-sm leading-7 text-black/55">
                                                Send the first message in this room and make MILAN feel alive.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {messages.map((message) => {
                                            const mine = message.user_id === userId;

                                            return (
                                                <div
                                                    key={message.id}
                                                    className={`flex ${mine ? "justify-end" : "justify-start"}`}
                                                >
                                                    <div
                                                        className={`max-w-[80%] rounded-[26px] px-4 py-3 shadow-sm ${mine
                                                                ? "bg-[#ea4f8a] text-white"
                                                                : "border border-[#f1bfd2] bg-white text-black"
                                                            }`}
                                                    >
                                                        <div
                                                            className={`mb-1 text-[11px] uppercase tracking-[0.18em] ${mine ? "text-white/75" : "text-[#b2346d]"
                                                                }`}
                                                        >
                                                            {message.username}
                                                        </div>
                                                        <div className="whitespace-pre-wrap text-sm leading-7">
                                                            {message.content}
                                                        </div>
                                                        <div
                                                            className={`mt-2 text-[11px] ${mine ? "text-white/75" : "text-black/40"
                                                                }`}
                                                        >
                                                            {formatTime(message.created_at)}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <div ref={bottomRef} />
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-[#f5c7d8] bg-white px-4 py-4 md:px-6">
                                <div className="flex items-end gap-3">
                                    <textarea
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder={
                                            loggedIn
                                                ? "Type your message with love..."
                                                : "Log in to join the MILAN conversation..."
                                        }
                                        rows={2}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendMessage();
                                            }
                                        }}
                                        className="min-h-[62px] flex-1 resize-none rounded-[24px] border border-[#efbdd1] bg-[#fff7fa] px-4 py-4 text-sm text-black/85 outline-none placeholder:text-black/35 focus:border-[#e94f8b]"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleSendMessage}
                                        disabled={sending || !loggedIn}
                                        className="inline-flex h-[62px] items-center rounded-full bg-[#e94685] px-7 text-xs uppercase tracking-[0.24em] text-white transition hover:bg-[#d73777] disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {sending ? "Sending..." : "Send ♥"}
                                    </button>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </section>
        </main>
    );
}