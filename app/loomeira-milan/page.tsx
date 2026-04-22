"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import Navbar from "@/components/Navbar";
import BackButton from "@/components/BackButton";
import { supabase } from "@/lib/supabase";
import { getCurrentUser, isLoggedIn } from "@/lib/auth";
import { isAdminSessionActive, readAdminKey } from "@/lib/admin-session";

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

type StoredAdminUser = {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    password: string;
    createdAt: string;
};

type MilanRoomMeta = {
    roomId: string;
    type: "direct-admin" | "admin-group" | "group";
    memberIds: string[];
    memberUsernames: string[];
    createdBy: string;
};

type LmraRequestItem = {
    request_id: string | null;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    product_type: string | null;
    description: string | null;
    measurements: string | null;
    notes: string | null;
    photo_url: string | null;
    status: string | null;
    assignee: string | null;
    created_at: string | null;
    updated_at: string | null;
};

const ADMIN_USERS_KEY = "loomiere_admin_users_v1";
const MILAN_ROOM_META_KEY = "loomeira_milan_room_meta_v1";
const MILAN_MEDIA_BUCKET = "loomeira-milan-media";

const EMOJI_PICKER = [
    "😊",
    "😂",
    "😍",
    "🥰",
    "😘",
    "😭",
    "🤍",
    "🩷",
    "❤️",
    "🔥",
    "✨",
    "🎀",
    "💅",
    "🫶",
    "🙌",
    "👏",
    "🤝",
    "😎",
    "😇",
    "🥳",
    "😴",
    "🤔",
    "😅",
    "😡",
];

const GIF_LIBRARY = [
    "https://media.giphy.com/media/3oriO0OEd9QIDdllqo/giphy.gif",
    "https://media.giphy.com/media/l0HlBO7eyXzSZkJri/giphy.gif",
    "https://media.giphy.com/media/26BRv0ThflsHCqDrG/giphy.gif",
    "https://media.giphy.com/media/xT0xeJpnrWC4XWblEk/giphy.gif",
    "https://media.giphy.com/media/5GoVLqeAOo6PK/giphy.gif",
    "https://media.giphy.com/media/MDJ9IbxxvDUQM/giphy.gif",
];

function MilanMark() {
    return (
        <div className="relative flex h-14 w-14 items-center justify-center rounded-[20px] bg-[linear-gradient(135deg,#ff4f8b_0%,#d81b60_100%)] shadow-[0_14px_30px_rgba(232,74,138,0.28)]">
            <span className="text-2xl font-semibold italic text-white">A</span>
            <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-white/80" />
            <div className="absolute -bottom-1 left-2 h-2.5 w-2.5 rounded-full bg-[#ffbfd4]" />
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

function formatDate(value: string | null | undefined) {
    if (!value) return "N/A";

    try {
        return new Date(value).toLocaleString();
    } catch {
        return "N/A";
    }
}

function formatRoomTitle(room: MilanRoom, meta?: MilanRoomMeta | null, currentUsername?: string) {
    if (!meta) return room.name;

    if (meta.type === "direct-admin") {
        const others = meta.memberUsernames.filter(
            (member) => member.toLowerCase() !== (currentUsername || "").toLowerCase()
        );

        if (others.length > 0) {
            return `@${others[0]}`;
        }
    }

    return room.name;
}

function readAdminUsers(): StoredAdminUser[] {
    if (typeof window === "undefined") return [];

    try {
        const raw = window.localStorage.getItem(ADMIN_USERS_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function readRoomMeta(): MilanRoomMeta[] {
    if (typeof window === "undefined") return [];

    try {
        const raw = window.localStorage.getItem(MILAN_ROOM_META_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function writeRoomMeta(items: MilanRoomMeta[]) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(MILAN_ROOM_META_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event("loomeira-milan-meta-changed"));
}

function normalizeRoomMeta(items: MilanRoomMeta[]) {
    const deduped = new Map<string, MilanRoomMeta>();

    items.forEach((item) => {
        if (!item?.roomId) return;

        deduped.set(item.roomId, {
            roomId: item.roomId,
            type: item.type || "group",
            memberIds: Array.isArray(item.memberIds) ? item.memberIds : [],
            memberUsernames: Array.isArray(item.memberUsernames) ? item.memberUsernames : [],
            createdBy: item.createdBy || "",
        });
    });

    return Array.from(deduped.values());
}

function isGifMessage(content: string) {
    const trimmed = content.trim();
    if (!trimmed) return false;

    if (/^https?:\/\/\S+\.(gif)(\?\S*)?$/i.test(trimmed)) {
        return true;
    }

    if (
        /^https?:\/\/(media\.)?(giphy\.com|tenor\.com|i\.giphy\.com|media\.tenor\.com)\//i.test(
            trimmed
        )
    ) {
        return true;
    }

    return false;
}

function isMediaMessage(content: string) {
    return content.startsWith("[media]");
}

function parseMediaMessage(content: string) {
    if (!content.startsWith("[media]")) return null;

    const payload = content.replace("[media]", "");
    const [kind, url, filename] = payload.split("||");

    return {
        kind,
        url,
        filename,
    };
}

function buildMediaMessage(kind: "image" | "video", url: string, filename: string) {
    return `[media]${kind}||${url}||${filename}`;
}

function isLmraMessage(content: string) {
    return content.startsWith("[lmra]");
}

function parseLmraMessage(content: string) {
    if (!content.startsWith("[lmra]")) return null;

    try {
        return JSON.parse(content.replace("[lmra]", "")) as LmraRequestItem;
    } catch {
        return null;
    }
}

function buildLmraMessage(item: LmraRequestItem) {
    return `[lmra]${JSON.stringify(item)}`;
}

export default function LoomeiraMilanPage() {
    const shopperUser = getCurrentUser();
    const shopperLoggedIn = isLoggedIn();
    const adminLoggedIn = isAdminSessionActive();

    const [adminUsers, setAdminUsers] = useState<StoredAdminUser[]>([]);
    const [roomMeta, setRoomMeta] = useState<MilanRoomMeta[]>([]);
    const [selectedAdminIds, setSelectedAdminIds] = useState<string[]>([]);
    const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
    const [gifPickerOpen, setGifPickerOpen] = useState(false);
    const [attachmentPanelOpen, setAttachmentPanelOpen] = useState(false);
    const [attachmentTab, setAttachmentTab] = useState<"upload" | "lmra">("upload");
    const [uploadingAttachment, setUploadingAttachment] = useState(false);
    const [lmraSearch, setLmraSearch] = useState("");
    const [lmraLoading, setLmraLoading] = useState(false);
    const [lmraResult, setLmraResult] = useState<LmraRequestItem | null>(null);
    const [lmraMessage, setLmraMessage] = useState("");

    const [userSearch, setUserSearch] = useState("");
    const [showCreateGroupPanel, setShowCreateGroupPanel] = useState(false);

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const currentAdmin = useMemo(() => {
        if (!adminLoggedIn) return null;
        const adminKey = readAdminKey();
        return adminUsers.find((item) => item.id === adminKey) || null;
    }, [adminLoggedIn, adminUsers]);

    const loggedIn = shopperLoggedIn || adminLoggedIn;

    const username = useMemo(() => {
        if (currentAdmin) return currentAdmin.username;
        if (!shopperUser) return "Guest";
        return shopperUser.username || `${shopperUser.firstName} ${shopperUser.lastName}`.trim();
    }, [currentAdmin, shopperUser]);

    const userId = currentAdmin?.id || shopperUser?.id || "guest-user";

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

    const roomMetaMap = useMemo(() => {
        return roomMeta.reduce<Record<string, MilanRoomMeta>>((acc, item) => {
            acc[item.roomId] = item;
            return acc;
        }, {});
    }, [roomMeta]);

    const activeRoom = useMemo(
        () => rooms.find((room) => room.id === activeRoomId) || null,
        [rooms, activeRoomId]
    );

    const activeRoomMeta = activeRoomId ? roomMetaMap[activeRoomId] || null : null;

    const adminDirectory = useMemo(() => {
        return adminUsers
            .filter((admin) => admin.username?.trim())
            .sort((a, b) => a.username.localeCompare(b.username));
    }, [adminUsers]);

    const searchableAdmins = useMemo(() => {
        const query = userSearch.trim().toLowerCase();

        return adminDirectory.filter((admin) => {
            if (admin.id === userId) return false;
            if (!query) return true;

            return (
                admin.username.toLowerCase().includes(query) ||
                `${admin.firstName} ${admin.lastName}`.toLowerCase().includes(query) ||
                admin.email.toLowerCase().includes(query)
            );
        });
    }, [adminDirectory, userId, userSearch]);

    const visibleRooms = useMemo(() => {
        return rooms.filter((room) => {
            const meta = roomMetaMap[room.id];
            if (!meta) return false;
            return meta.memberIds.includes(userId);
        });
    }, [rooms, roomMetaMap, userId]);

    const sortedVisibleRooms = useMemo(() => {
        return [...visibleRooms].sort((a, b) => {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
    }, [visibleRooms]);

    const directRooms = useMemo(() => {
        return sortedVisibleRooms.filter((room) => roomMetaMap[room.id]?.type === "direct-admin");
    }, [sortedVisibleRooms, roomMetaMap]);

    const groupRooms = useMemo(() => {
        return sortedVisibleRooms.filter((room) => {
            const type = roomMetaMap[room.id]?.type;
            return type === "admin-group" || type === "group";
        });
    }, [sortedVisibleRooms, roomMetaMap]);

    const activeRoomTitle = useMemo(() => {
        return activeRoom ? formatRoomTitle(activeRoom, activeRoomMeta, username) : "Select a chat";
    }, [activeRoom, activeRoomMeta, username]);

    function syncAdminUsers() {
        setAdminUsers(readAdminUsers());
    }

    function syncRoomMeta() {
        setRoomMeta(normalizeRoomMeta(readRoomMeta()));
    }

    function saveOrUpdateRoomMeta(nextItem: MilanRoomMeta) {
        const next = normalizeRoomMeta([
            ...roomMeta.filter((item) => item.roomId !== nextItem.roomId),
            nextItem,
        ]);
        writeRoomMeta(next);
        setRoomMeta(next);
    }

    useEffect(() => {
        syncAdminUsers();
        syncRoomMeta();

        const onStorage = () => {
            syncAdminUsers();
            syncRoomMeta();
        };

        window.addEventListener("storage", onStorage);
        window.addEventListener("focus", onStorage);
        window.addEventListener("loomeira-milan-meta-changed", onStorage as EventListener);
        window.addEventListener("loomiere-admin-changed", onStorage as EventListener);

        return () => {
            window.removeEventListener("storage", onStorage);
            window.removeEventListener("focus", onStorage);
            window.removeEventListener("loomeira-milan-meta-changed", onStorage as EventListener);
            window.removeEventListener("loomiere-admin-changed", onStorage as EventListener);
        };
    }, []);

    useEffect(() => {
        if (adminLoggedIn && userId && !selectedAdminIds.length) {
            setSelectedAdminIds([userId]);
        }
    }, [adminLoggedIn, userId, selectedAdminIds.length]);

    useEffect(() => {
        let mounted = true;

        async function loadRooms() {
            setLoadingRooms(true);
            setError("");

            const { data, error } = await supabase
                .from("loomeira_milan_rooms")
                .select("id, name, is_group, created_by, created_at")
                .order("created_at", { ascending: false });

            if (!mounted) return;

            if (error) {
                setError("Could not load chats yet.");
                setLoadingRooms(false);
                return;
            }

            const nextRooms = Array.isArray(data) ? data : [];
            setRooms(nextRooms);

            if (!activeRoomId && nextRooms.length > 0) {
                const firstVisible = nextRooms.find((room) => roomMetaMap[room.id]?.memberIds.includes(userId));
                if (firstVisible) {
                    setActiveRoomId(firstVisible.id);
                }
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
                        .order("created_at", { ascending: false });

                    const nextRooms = Array.isArray(data) ? data : [];
                    setRooms(nextRooms);

                    if (!activeRoomId) {
                        const firstVisible = nextRooms.find(
                            (room) => roomMetaMap[room.id]?.memberIds.includes(userId)
                        );
                        if (firstVisible) {
                            setActiveRoomId(firstVisible.id);
                        }
                    }
                }
            )
            .subscribe();

        return () => {
            mounted = false;
            supabase.removeChannel(roomsChannel);
        };
    }, [activeRoomId, roomMetaMap, userId]);

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
                setError("Could not load messages for this chat.");
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

    async function handleOpenDirectChat(targetAdmin: StoredAdminUser) {
        if (!loggedIn) {
            setError("Please log in to start a direct chat.");
            return;
        }

        setError("");

        const existingMeta = roomMeta.find((item) => {
            if (item.type !== "direct-admin") return false;
            const ids = [...item.memberIds].sort();
            const compareIds = [...new Set([userId, targetAdmin.id])].sort();

            return JSON.stringify(ids) === JSON.stringify(compareIds);
        });

        if (existingMeta?.roomId) {
            setActiveRoomId(existingMeta.roomId);
            return;
        }

        try {
            const roomName = `${username} · ${targetAdmin.username}`;

            const { data, error } = await supabase
                .from("loomeira_milan_rooms")
                .insert([
                    {
                        name: roomName,
                        is_group: false,
                        created_by: userId,
                    },
                ])
                .select()
                .single();

            if (error) {
                throw error;
            }

            if (data?.id) {
                saveOrUpdateRoomMeta({
                    roomId: data.id,
                    type: "direct-admin",
                    memberIds: [userId, targetAdmin.id],
                    memberUsernames: [username, targetAdmin.username],
                    createdBy: userId,
                });

                setRooms((prev) => {
                    const exists = prev.some((room) => room.id === data.id);
                    if (exists) return prev;
                    return [data, ...prev];
                });

                setActiveRoomId(data.id);
                setUserSearch("");
            }
        } catch (openError: any) {
            setError(openError?.message || "Could not open direct chat right now.");
        }
    }

    async function handleCreateGroup() {
        if (!adminLoggedIn) {
            setError("Only admin users can create groups.");
            return;
        }

        if (!newGroupName.trim()) {
            setError("Please enter a group name.");
            return;
        }

        if (selectedAdminIds.length < 2) {
            setError("Please select at least two users for a group.");
            return;
        }

        setCreatingGroup(true);
        setError("");

        try {
            const selectedAdmins = adminDirectory.filter((admin) =>
                selectedAdminIds.includes(admin.id)
            );

            const memberIds = Array.from(new Set(selectedAdmins.map((admin) => admin.id)));
            const memberUsernames = Array.from(
                new Set(selectedAdmins.map((admin) => admin.username).filter(Boolean))
            );

            const { data, error } = await supabase
                .from("loomeira_milan_rooms")
                .insert([
                    {
                        name: newGroupName.trim(),
                        is_group: true,
                        created_by: userId,
                    },
                ])
                .select()
                .single();

            if (error) {
                throw error;
            }

            if (data?.id) {
                saveOrUpdateRoomMeta({
                    roomId: data.id,
                    type: "admin-group",
                    memberIds,
                    memberUsernames,
                    createdBy: userId,
                });

                setRooms((prev) => {
                    const exists = prev.some((room) => room.id === data.id);
                    if (exists) return prev;
                    return [data, ...prev];
                });

                setActiveRoomId(data.id);
            }

            setNewGroupName("");
            setSelectedAdminIds(adminLoggedIn ? [userId] : []);
            setShowCreateGroupPanel(false);
        } catch (createError: any) {
            setError(createError?.message || "Could not create group right now.");
        } finally {
            setCreatingGroup(false);
        }
    }

    async function handleSendMessage(messageOverride?: string) {
        if (!loggedIn) {
            setError("Please log in to send messages in MILAN.");
            return;
        }

        if (!activeRoomId) {
            setError("Please select a chat first.");
            return;
        }

        const finalMessage = (messageOverride ?? newMessage).trim();
        if (!finalMessage) return;

        setSending(true);
        setError("");

        const { error } = await supabase.from("loomeira_milan_messages").insert([
            {
                room_id: activeRoomId,
                username,
                user_id: userId,
                content: finalMessage,
            },
        ]);

        if (error) {
            setError("Message could not be sent.");
            setSending(false);
            return;
        }

        setNewMessage("");
        setSending(false);
        setEmojiPickerOpen(false);
        setGifPickerOpen(false);
        setAttachmentPanelOpen(false);
        setLmraResult(null);
        setLmraMessage("");
        setLmraSearch("");
    }

    function toggleAdminSelection(adminId: string) {
        setSelectedAdminIds((prev) =>
            prev.includes(adminId)
                ? prev.filter((id) => id !== adminId)
                : [...prev, adminId]
        );
    }

    function addEmoji(emoji: string) {
        setNewMessage((prev) => `${prev}${emoji}`);
    }

    function sendGif(gifUrl: string) {
        handleSendMessage(gifUrl);
    }

    async function handleAttachmentUpload(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!loggedIn) {
            setError("Please log in before attaching files.");
            return;
        }

        const isImage = file.type.startsWith("image/");
        const isVideo = file.type.startsWith("video/");

        if (!isImage && !isVideo) {
            setError("Only image and video files are allowed.");
            return;
        }

        try {
            setUploadingAttachment(true);
            setError("");

            const extension = file.name.split(".").pop() || "file";
            const path = `chat/${activeRoomId || "general"}/${Date.now()}-${Math.random()
                .toString(36)
                .slice(2)}.${extension}`;

            const { error: uploadError } = await supabase.storage
                .from(MILAN_MEDIA_BUCKET)
                .upload(path, file, {
                    cacheControl: "3600",
                    upsert: false,
                });

            if (uploadError) {
                throw new Error(uploadError.message);
            }

            const { data } = supabase.storage.from(MILAN_MEDIA_BUCKET).getPublicUrl(path);
            const publicUrl = data?.publicUrl || "";

            if (!publicUrl) {
                throw new Error("Could not generate file URL.");
            }

            await handleSendMessage(
                buildMediaMessage(isImage ? "image" : "video", publicUrl, file.name)
            );
        } catch (uploadError: any) {
            setError(
                uploadError?.message ||
                "Attachment upload failed. Please make sure the Supabase bucket exists and allows uploads."
            );
        } finally {
            setUploadingAttachment(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    }

    async function handleLmraSearch() {
        if (!lmraSearch.trim()) {
            setLmraMessage("Enter an LMRA request number.");
            setLmraResult(null);
            return;
        }

        try {
            setLmraLoading(true);
            setLmraMessage("");
            setLmraResult(null);

            const res = await fetch(
                `/api/custom-requests?ids=${encodeURIComponent(lmraSearch.trim())}`
            );
            const data = await res.json().catch(() => null);

            if (!res.ok) {
                throw new Error(data?.message || "Failed to search LMRA request.");
            }

            const item = Array.isArray(data?.items) ? data.items[0] : null;

            if (!item) {
                setLmraMessage("No LMRA request found for that number.");
                return;
            }

            setLmraResult(item);
        } catch (searchError: any) {
            setLmraMessage(searchError?.message || "Failed to search LMRA request.");
        } finally {
            setLmraLoading(false);
        }
    }

    async function handleSendLmraRequest() {
        if (!lmraResult) {
            setLmraMessage("Search and select an LMRA request first.");
            return;
        }

        await handleSendMessage(buildLmraMessage(lmraResult));
    }

    return (
        <main className="min-h-screen bg-[radial-gradient(circle_at_top,#fff6fa_0%,#ffe8f0_34%,#ffdbe8_100%)] text-black">
            <Navbar theme="light" />

            <section className="px-6 pb-10 pt-28 md:px-10 lg:px-16">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-6 overflow-hidden rounded-[34px] border border-[#f1b8ce] bg-white/80 shadow-[0_22px_70px_rgba(236,72,153,0.14)] backdrop-blur">
                        <div className="bg-[linear-gradient(135deg,#fff7fb_0%,#ffe8f1_100%)] px-6 py-6 md:px-8 md:py-7">
                            <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                                <div className="flex items-start gap-4">
                                    <MilanMark />
                                    <div>
                                        <div className="text-[11px] uppercase tracking-[0.34em] text-[#cc4d84]">
                                            Subscribers chat club
                                        </div>
                                        <h1 className="mt-2 text-3xl font-light tracking-[0.02em] text-[#7c163d] md:text-5xl">
                                            Loomeira — MILAN
                                        </h1>
                                        <p className="mt-3 max-w-3xl text-sm leading-7 text-black/60 md:text-base">
                                            A cleaner workspace for Loomeira subscribers and admins.
                                            Search usernames, open direct chats instantly, and create
                                            groups only when you actually need them.
                                        </p>
                                    </div>
                                </div>

                                <div className="hidden md:block">
                                    <BackButton />
                                </div>
                            </div>

                            <div className="mt-5 flex flex-wrap items-center gap-3">
                                <div className="rounded-full border border-[#efbfd1] bg-white px-4 py-2 text-xs uppercase tracking-[0.2em] text-[#a61f57] shadow-sm">
                                    Logged in as: {loggedIn ? username : "Guest"}
                                </div>
                                <div className="rounded-full border border-[#efbfd1] bg-[#fff4f8] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[#b62b68] shadow-sm">
                                    {directRooms.length} chats • {groupRooms.length} groups
                                </div>
                            </div>
                        </div>
                    </div>

                    {error ? (
                        <div className="mb-5 rounded-2xl border border-[#f0a3bf] bg-[#fff3f7] px-5 py-4 text-sm text-[#b11e5b]">
                            {error}
                        </div>
                    ) : null}

                    <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
                        <aside className="rounded-[32px] border border-[#f1b6cc] bg-[#fff9fc]/90 p-4 shadow-[0_16px_50px_rgba(236,72,153,0.12)]">
                            <div className="rounded-[26px] border border-[#f3cad9] bg-white p-4 shadow-sm">
                                <div className="text-[11px] uppercase tracking-[0.28em] text-[#cb4b84]">
                                    Search usernames
                                </div>

                                <input
                                    value={userSearch}
                                    onChange={(e) => setUserSearch(e.target.value)}
                                    placeholder="Search admin usernames..."
                                    className="mt-3 w-full rounded-2xl border border-[#efbdd1] bg-[#fff8fb] px-4 py-3 text-sm text-black/80 outline-none placeholder:text-black/35 focus:border-[#e55291]"
                                />

                                <div className="mt-3 max-h-64 space-y-2 overflow-y-auto">
                                    {searchableAdmins.length === 0 ? (
                                        <div className="rounded-2xl border border-dashed border-[#f0c7d7] bg-[#fff8fb] px-4 py-4 text-sm text-black/45">
                                            No matching usernames found.
                                        </div>
                                    ) : (
                                        searchableAdmins.map((admin) => (
                                            <button
                                                key={admin.id}
                                                type="button"
                                                onClick={() => handleOpenDirectChat(admin)}
                                                className="flex w-full items-center justify-between rounded-2xl border border-[#f1d1dc] bg-[#fffafb] px-4 py-3 text-left transition hover:border-[#ea5a93] hover:bg-[#ffeef5]"
                                            >
                                                <div>
                                                    <div className="text-sm font-semibold text-[#731538]">
                                                        @{admin.username}
                                                    </div>
                                                    <div className="mt-1 text-xs text-black/45">
                                                        {admin.firstName} {admin.lastName}
                                                    </div>
                                                </div>
                                                <div className="rounded-full bg-[#ffe2ed] px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-[#b72c69]">
                                                    Chat
                                                </div>
                                            </button>
                                        ))
                                    )}
                                </div>
                            </div>

                            <div className="mt-4 rounded-[26px] border border-[#f3cad9] bg-white p-4 shadow-sm">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <div className="text-[11px] uppercase tracking-[0.28em] text-[#cb4b84]">
                                            Groups
                                        </div>
                                        <div className="mt-1 text-sm font-medium text-[#731538]">
                                            Create only when needed
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setShowCreateGroupPanel((prev) => !prev)}
                                        className="rounded-full bg-[#e94685] px-4 py-2 text-xs uppercase tracking-[0.2em] text-white transition hover:bg-[#d93778]"
                                    >
                                        {showCreateGroupPanel ? "Close" : "New Group"}
                                    </button>
                                </div>

                                {showCreateGroupPanel ? (
                                    <div className="mt-4 rounded-[22px] border border-[#f3cad9] bg-[#fff7fa] p-4">
                                        <label className="mb-2 block text-[11px] uppercase tracking-[0.22em] text-[#b7306b]">
                                            Group name
                                        </label>
                                        <input
                                            value={newGroupName}
                                            onChange={(e) => setNewGroupName(e.target.value)}
                                            placeholder="Ex: Milan Ops, Ticket Review"
                                            className="w-full rounded-2xl border border-[#efbdd1] bg-white px-4 py-3 text-sm text-black/80 outline-none placeholder:text-black/35 focus:border-[#e55291]"
                                        />

                                        <div className="mt-4 text-[11px] uppercase tracking-[0.22em] text-[#b7306b]">
                                            Select users
                                        </div>

                                        <div className="mt-2 max-h-52 space-y-2 overflow-y-auto rounded-2xl border border-[#f0c2d5] bg-white p-3">
                                            {adminDirectory.length === 0 ? (
                                                <div className="rounded-xl bg-[#fff6fa] px-3 py-3 text-sm text-black/50">
                                                    No admin usernames found yet.
                                                </div>
                                            ) : (
                                                adminDirectory.map((admin) => {
                                                    const checked = selectedAdminIds.includes(admin.id);
                                                    const isCurrentAdmin = admin.id === userId;

                                                    return (
                                                        <label
                                                            key={admin.id}
                                                            className={`flex cursor-pointer items-center justify-between rounded-2xl border px-3 py-3 text-sm transition ${checked
                                                                    ? "border-[#ea5a93] bg-[#ffe4ef]"
                                                                    : "border-[#f1d1dc] bg-[#fffafb]"
                                                                }`}
                                                        >
                                                            <div>
                                                                <div className="font-medium text-[#74153a]">
                                                                    @{admin.username}
                                                                </div>
                                                                <div className="text-[11px] uppercase tracking-[0.16em] text-black/45">
                                                                    {isCurrentAdmin ? "You" : "Admin user"}
                                                                </div>
                                                            </div>

                                                            <input
                                                                type="checkbox"
                                                                checked={checked}
                                                                onChange={() => toggleAdminSelection(admin.id)}
                                                                className="h-4 w-4 accent-[#ea4f8a]"
                                                            />
                                                        </label>
                                                    );
                                                })
                                            )}
                                        </div>

                                        <button
                                            type="button"
                                            onClick={handleCreateGroup}
                                            disabled={creatingGroup || !adminLoggedIn}
                                            className="mt-4 inline-flex rounded-full bg-[#e94685] px-5 py-3 text-xs uppercase tracking-[0.22em] text-white transition hover:bg-[#d93778] disabled:opacity-60"
                                        >
                                            {creatingGroup ? "Creating..." : "Create Group"}
                                        </button>

                                        {!adminLoggedIn ? (
                                            <p className="mt-2 text-xs leading-6 text-black/50">
                                                Only admin users can create groups.
                                            </p>
                                        ) : null}
                                    </div>
                                ) : null}
                            </div>

                            <div className="mt-4 rounded-[26px] border border-[#f3cad9] bg-white p-4 shadow-sm">
                                <div className="text-[11px] uppercase tracking-[0.28em] text-[#cb4b84]">
                                    Direct chats
                                </div>

                                <div className="mt-3 space-y-2">
                                    {loadingRooms ? (
                                        <div className="rounded-2xl border border-[#f2c6d7] bg-[#fffafb] px-4 py-4 text-sm text-black/55">
                                            Loading chats...
                                        </div>
                                    ) : directRooms.length === 0 ? (
                                        <div className="rounded-2xl border border-dashed border-[#f2c6d7] bg-[#fffafb] px-4 py-4 text-sm text-black/45">
                                            Search a username above to start your first direct chat.
                                        </div>
                                    ) : (
                                        directRooms.map((room) => {
                                            const active = room.id === activeRoomId;
                                            const meta = roomMetaMap[room.id];

                                            return (
                                                <button
                                                    key={room.id}
                                                    type="button"
                                                    onClick={() => setActiveRoomId(room.id)}
                                                    className={`w-full rounded-[22px] border px-4 py-3 text-left transition ${active
                                                            ? "border-[#eb5a94] bg-[#ffe3ee] shadow-sm"
                                                            : "border-[#f2c6d7] bg-white hover:bg-[#fff2f7]"
                                                        }`}
                                                >
                                                    <div className="text-sm font-semibold text-[#731538]">
                                                        {formatRoomTitle(room, meta, username)}
                                                    </div>
                                                    <div className="mt-1 text-[11px] uppercase tracking-[0.18em] text-black/45">
                                                        Direct message
                                                    </div>
                                                </button>
                                            );
                                        })
                                    )}
                                </div>
                            </div>

                            <div className="mt-4 rounded-[26px] border border-[#f3cad9] bg-white p-4 shadow-sm">
                                <div className="text-[11px] uppercase tracking-[0.28em] text-[#cb4b84]">
                                    Groups
                                </div>

                                <div className="mt-3 space-y-2">
                                    {loadingRooms ? (
                                        <div className="rounded-2xl border border-[#f2c6d7] bg-[#fffafb] px-4 py-4 text-sm text-black/55">
                                            Loading groups...
                                        </div>
                                    ) : groupRooms.length === 0 ? (
                                        <div className="rounded-2xl border border-dashed border-[#f2c6d7] bg-[#fffafb] px-4 py-4 text-sm text-black/45">
                                            No groups created yet.
                                        </div>
                                    ) : (
                                        groupRooms.map((room) => {
                                            const active = room.id === activeRoomId;
                                            const meta = roomMetaMap[room.id];

                                            return (
                                                <button
                                                    key={room.id}
                                                    type="button"
                                                    onClick={() => setActiveRoomId(room.id)}
                                                    className={`w-full rounded-[22px] border px-4 py-3 text-left transition ${active
                                                            ? "border-[#eb5a94] bg-[#ffe3ee] shadow-sm"
                                                            : "border-[#f2c6d7] bg-white hover:bg-[#fff2f7]"
                                                        }`}
                                                >
                                                    <div className="text-sm font-semibold text-[#731538]">
                                                        {room.name}
                                                    </div>
                                                    <div className="mt-1 text-[11px] uppercase tracking-[0.18em] text-black/45">
                                                        {meta?.memberUsernames?.length || 0} members
                                                    </div>
                                                </button>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </aside>

                        <section className="flex min-h-[760px] flex-col overflow-hidden rounded-[34px] border border-[#f0b3ca] bg-white/90 shadow-[0_18px_60px_rgba(236,72,153,0.14)]">
                            <div className="border-b border-[#f6c7d9] bg-[linear-gradient(90deg,#fff7fb_0%,#ffeaf2_100%)] px-5 py-5 md:px-6">
                                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                    <div>
                                        <div className="text-[11px] uppercase tracking-[0.24em] text-[#cd4f86]">
                                            Active conversation
                                        </div>
                                        <h2 className="mt-2 text-2xl font-semibold text-[#7f143d] md:text-3xl">
                                            {activeRoomTitle}
                                        </h2>

                                        {activeRoomMeta?.memberUsernames?.length ? (
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                {activeRoomMeta.memberUsernames.map((member) => (
                                                    <span
                                                        key={member}
                                                        className="rounded-full border border-[#efbdd1] bg-white px-3 py-1 text-xs text-[#a9215a]"
                                                    >
                                                        @{member}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : null}
                                    </div>

                                    <div className="rounded-full border border-[#efbdd1] bg-white px-4 py-2 text-xs uppercase tracking-[0.2em] text-[#b72768] shadow-sm">
                                        Loomeira chat
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top,#fffafd_0%,#fff4f8_46%,#ffedf4_100%)] px-4 py-5 md:px-6">
                                {!activeRoomId ? (
                                    <div className="flex h-full min-h-[440px] items-center justify-center">
                                        <div className="max-w-lg rounded-[30px] border border-[#f3bfd3] bg-white px-7 py-10 text-center shadow-sm">
                                            <div className="mb-4 text-4xl text-[#eb4f8d]">💬</div>
                                            <div className="text-xl font-semibold text-[#7d173e]">
                                                Start with a username search
                                            </div>
                                            <p className="mt-3 text-sm leading-7 text-black/55">
                                                Open a direct chat from the left panel or create a group.
                                                Once selected, your messages, GIFs, media, and LMRA tickets
                                                will appear here.
                                            </p>
                                        </div>
                                    </div>
                                ) : loadingMessages ? (
                                    <div className="rounded-2xl border border-[#f3c8d8] bg-white px-4 py-5 text-sm text-black/55">
                                        Loading messages...
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="flex h-full min-h-[400px] items-center justify-center">
                                        <div className="max-w-md rounded-[28px] border border-[#f3bfd3] bg-white px-6 py-8 text-center shadow-sm">
                                            <div className="mb-3 text-3xl text-[#eb4f8d]">♥</div>
                                            <div className="text-lg font-medium text-[#7d173e]">
                                                No messages yet
                                            </div>
                                            <p className="mt-2 text-sm leading-7 text-black/55">
                                                Send the first message, drop a GIF, attach media, or share an
                                                LMRA ticket.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {messages.map((message) => {
                                            const mine = message.user_id === userId;
                                            const renderAsGif = isGifMessage(message.content);
                                            const renderAsMedia = isMediaMessage(message.content);
                                            const renderAsLmra = isLmraMessage(message.content);

                                            const media = renderAsMedia
                                                ? parseMediaMessage(message.content)
                                                : null;
                                            const lmra = renderAsLmra
                                                ? parseLmraMessage(message.content)
                                                : null;

                                            return (
                                                <div
                                                    key={message.id}
                                                    className={`flex ${mine ? "justify-end" : "justify-start"}`}
                                                >
                                                    <div
                                                        className={`max-w-[86%] rounded-[26px] px-4 py-3 shadow-sm ${mine
                                                                ? "bg-[linear-gradient(135deg,#ea4f8a_0%,#d81b60_100%)] text-white"
                                                                : "border border-[#f1bfd2] bg-white text-black"
                                                            }`}
                                                    >
                                                        <div
                                                            className={`mb-1 text-[11px] uppercase tracking-[0.18em] ${mine ? "text-white/75" : "text-[#b2346d]"
                                                                }`}
                                                        >
                                                            {message.username}
                                                        </div>

                                                        {renderAsLmra && lmra ? (
                                                            <div
                                                                className={`rounded-[22px] border px-4 py-4 ${mine
                                                                        ? "border-white/25 bg-white/10"
                                                                        : "border-[#efc5d7] bg-[#fff7fa]"
                                                                    }`}
                                                            >
                                                                <div
                                                                    className={`text-[11px] uppercase tracking-[0.22em] ${mine ? "text-white/80" : "text-[#b52e69]"
                                                                        }`}
                                                                >
                                                                    LMRA Request
                                                                </div>
                                                                <div className="mt-2 text-base font-semibold">
                                                                    {lmra.request_id || "No request ID"}
                                                                </div>
                                                                <div
                                                                    className={`mt-2 text-sm ${mine ? "text-white/90" : "text-black/65"
                                                                        }`}
                                                                >
                                                                    {lmra.product_type || "No product type"}
                                                                </div>
                                                                <div
                                                                    className={`mt-2 text-sm leading-6 ${mine ? "text-white/85" : "text-black/60"
                                                                        }`}
                                                                >
                                                                    {lmra.description || "No description"}
                                                                </div>
                                                                <div
                                                                    className={`mt-3 text-xs ${mine ? "text-white/80" : "text-black/50"
                                                                        }`}
                                                                >
                                                                    Status: {lmra.status || "submitted"} • Updated:{" "}
                                                                    {formatDate(lmra.updated_at)}
                                                                </div>
                                                            </div>
                                                        ) : renderAsMedia && media ? (
                                                            <div className="space-y-3">
                                                                {media.kind === "image" ? (
                                                                    <img
                                                                        src={media.url}
                                                                        alt={media.filename || "Attached image"}
                                                                        className="max-h-[360px] rounded-2xl object-contain"
                                                                    />
                                                                ) : (
                                                                    <video
                                                                        src={media.url}
                                                                        controls
                                                                        className="max-h-[360px] rounded-2xl"
                                                                    />
                                                                )}
                                                                <div
                                                                    className={`text-xs break-all ${mine ? "text-white/80" : "text-black/50"
                                                                        }`}
                                                                >
                                                                    {media.filename}
                                                                </div>
                                                            </div>
                                                        ) : renderAsGif ? (
                                                            <img
                                                                src={message.content.trim()}
                                                                alt="Shared GIF"
                                                                className="max-h-[320px] rounded-2xl object-contain"
                                                            />
                                                        ) : (
                                                            <div className="whitespace-pre-wrap break-words text-sm leading-7">
                                                                {message.content}
                                                            </div>
                                                        )}

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
                                <div className="relative">
                                    <div className="mb-3 flex flex-wrap gap-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setEmojiPickerOpen((prev) => !prev);
                                                setGifPickerOpen(false);
                                                setAttachmentPanelOpen(false);
                                            }}
                                            className="rounded-full border border-[#efbdd1] bg-[#fff7fa] px-4 py-2 text-xs uppercase tracking-[0.18em] text-[#b62b68] hover:bg-[#ffe7f0]"
                                        >
                                            Emoji
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setGifPickerOpen((prev) => !prev);
                                                setEmojiPickerOpen(false);
                                                setAttachmentPanelOpen(false);
                                            }}
                                            className="rounded-full border border-[#efbdd1] bg-[#fff7fa] px-4 py-2 text-xs uppercase tracking-[0.18em] text-[#b62b68] hover:bg-[#ffe7f0]"
                                        >
                                            GIF
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setAttachmentPanelOpen((prev) => !prev);
                                                setEmojiPickerOpen(false);
                                                setGifPickerOpen(false);
                                            }}
                                            className="rounded-full border border-[#efbdd1] bg-[#fff7fa] px-4 py-2 text-sm font-semibold text-[#b62b68] hover:bg-[#ffe7f0]"
                                        >
                                            +
                                        </button>
                                    </div>

                                    {emojiPickerOpen && (
                                        <div className="mb-3 rounded-[24px] border border-[#efbdd1] bg-[#fff8fb] p-4 shadow-sm">
                                            <div className="mb-3 text-[11px] uppercase tracking-[0.18em] text-[#b62b68]">
                                                Choose emoji
                                            </div>
                                            <div className="grid grid-cols-6 gap-2 sm:grid-cols-8 md:grid-cols-10">
                                                {EMOJI_PICKER.map((emoji) => (
                                                    <button
                                                        key={emoji}
                                                        type="button"
                                                        onClick={() => addEmoji(emoji)}
                                                        className="rounded-2xl border border-[#f1d4de] bg-white px-3 py-3 text-2xl transition hover:bg-[#ffe7f0]"
                                                    >
                                                        {emoji}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {gifPickerOpen && (
                                        <div className="mb-3 rounded-[24px] border border-[#efbdd1] bg-[#fff8fb] p-4 shadow-sm">
                                            <div className="mb-3 text-[11px] uppercase tracking-[0.18em] text-[#b62b68]">
                                                Choose GIF
                                            </div>
                                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                                {GIF_LIBRARY.map((gifUrl) => (
                                                    <button
                                                        key={gifUrl}
                                                        type="button"
                                                        onClick={() => sendGif(gifUrl)}
                                                        className="overflow-hidden rounded-[22px] border border-[#f1d4de] bg-white transition hover:scale-[1.01] hover:bg-[#ffe7f0]"
                                                    >
                                                        <img
                                                            src={gifUrl}
                                                            alt="GIF option"
                                                            className="h-36 w-full object-cover"
                                                        />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {attachmentPanelOpen && (
                                        <div className="mb-3 rounded-[24px] border border-[#efbdd1] bg-[#fff8fb] p-4 shadow-sm">
                                            <div className="mb-3 flex flex-wrap gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setAttachmentTab("upload")}
                                                    className={`rounded-full px-4 py-2 text-xs uppercase tracking-[0.18em] ${attachmentTab === "upload"
                                                            ? "bg-[#ef5f9a] text-white"
                                                            : "border border-[#efbdd1] bg-white text-[#b62b68]"
                                                        }`}
                                                >
                                                    Attach file
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setAttachmentTab("lmra")}
                                                    className={`rounded-full px-4 py-2 text-xs uppercase tracking-[0.18em] ${attachmentTab === "lmra"
                                                            ? "bg-[#ef5f9a] text-white"
                                                            : "border border-[#efbdd1] bg-white text-[#b62b68]"
                                                        }`}
                                                >
                                                    LMRA request
                                                </button>
                                            </div>

                                            {attachmentTab === "upload" ? (
                                                <div className="rounded-[22px] border border-[#f1d4de] bg-white p-4">
                                                    <div className="text-[11px] uppercase tracking-[0.18em] text-[#b62b68]">
                                                        Attach image or video
                                                    </div>
                                                    <p className="mt-2 text-sm text-black/55">
                                                        Choose a file from your system and send it into this chat.
                                                    </p>

                                                    <input
                                                        ref={fileInputRef}
                                                        type="file"
                                                        accept="image/*,video/*"
                                                        onChange={handleAttachmentUpload}
                                                        className="mt-4 block w-full rounded-xl border border-[#efc5d7] bg-[#fff9fc] px-3 py-3 text-sm text-black/70"
                                                    />

                                                    {uploadingAttachment ? (
                                                        <div className="mt-3 text-sm text-[#b62b68]">
                                                            Uploading attachment...
                                                        </div>
                                                    ) : null}
                                                </div>
                                            ) : (
                                                <div className="rounded-[22px] border border-[#f1d4de] bg-white p-4">
                                                    <div className="text-[11px] uppercase tracking-[0.18em] text-[#b62b68]">
                                                        Send LMRA request
                                                    </div>
                                                    <p className="mt-2 text-sm text-black/55">
                                                        Search with the LMRA request number and send it into the chat.
                                                    </p>

                                                    <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                                                        <input
                                                            value={lmraSearch}
                                                            onChange={(e) => setLmraSearch(e.target.value)}
                                                            placeholder="Enter LMRA request number"
                                                            className="flex-1 rounded-xl border border-[#efc5d7] bg-[#fff9fc] px-4 py-3 text-sm text-black/75 outline-none focus:border-[#d86b98]"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={handleLmraSearch}
                                                            className="rounded-full bg-[#ef5f9a] px-5 py-3 text-xs uppercase tracking-[0.18em] text-white hover:bg-[#de4d8b]"
                                                        >
                                                            {lmraLoading ? "Searching..." : "Search"}
                                                        </button>
                                                    </div>

                                                    {lmraMessage ? (
                                                        <div className="mt-3 text-sm text-[#b62b68]">
                                                            {lmraMessage}
                                                        </div>
                                                    ) : null}

                                                    {lmraResult ? (
                                                        <div className="mt-4 rounded-[20px] border border-[#efc5d7] bg-[#fff8fb] p-4">
                                                            <div className="text-[11px] uppercase tracking-[0.18em] text-[#b62b68]">
                                                                Request found
                                                            </div>
                                                            <div className="mt-2 text-base font-semibold text-[#7c163d]">
                                                                {lmraResult.request_id}
                                                            </div>
                                                            <div className="mt-2 text-sm text-black/65">
                                                                {lmraResult.product_type || "No product type"}
                                                            </div>
                                                            <div className="mt-2 text-sm leading-6 text-black/55">
                                                                {lmraResult.description || "No description"}
                                                            </div>
                                                            <div className="mt-3 text-xs text-black/45">
                                                                Status: {lmraResult.status || "submitted"}
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={handleSendLmraRequest}
                                                                className="mt-4 rounded-full bg-[#ef5f9a] px-5 py-3 text-xs uppercase tracking-[0.18em] text-white hover:bg-[#de4d8b]"
                                                            >
                                                                Send LMRA ticket
                                                            </button>
                                                        </div>
                                                    ) : null}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-end gap-3">
                                    <textarea
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder={
                                            !activeRoomId
                                                ? "Select or create a chat first..."
                                                : loggedIn
                                                    ? "Type a message..."
                                                    : "Log in to join the conversation..."
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
                                        onClick={() => handleSendMessage()}
                                        disabled={sending || !loggedIn || uploadingAttachment || !activeRoomId}
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