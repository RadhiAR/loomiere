"use client";

import Navbar from "@/components/Navbar";
import BackButton from "@/components/BackButton";
import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";

type LearningEntry = {
    id: string;
    date: string;
    title: string;
    notes: string;
    progress: number;
};

type ChatMessage = {
    id: string;
    role: "user" | "assistant";
    text: string;
};

type PlanWeek = {
    week: number;
    title: string;
    focus: string;
    goal: string;
};

const footerColumns = [
    {
        title: "Help",
        links: [
            { label: "Contact Us", href: "/contact" },
            { label: "FAQs", href: "#" },
            { label: "Product Care", href: "#" },
            { label: "Stores", href: "#" },
        ],
    },
    {
        title: "Services",
        links: [
            { label: "Custom Orders", href: "/customize" },
            { label: "Subscriptions", href: "/subscriptions" },
            { label: "Returns", href: "#" },
            { label: "My Orders", href: "/orders" },
        ],
    },
    {
        title: "About Loomeira",
        links: [
            { label: "Our Story", href: "/about" },
            { label: "Craftsmanship", href: "#" },
            { label: "Collections", href: "/shop" },
            { label: "Loomeira Learning", href: "/loomeira-learning" },
            { label: "Loomeira AI", href: "/loomiere-ai" },
        ],
    },
    {
        title: "Email and Updates",
        links: [
            { label: "Subscribe", href: "/subscriptions" },
            { label: "New Arrivals", href: "/shop" },
            { label: "Exclusive Drops", href: "/shop" },
            { label: "Follow Us", href: "#" },
        ],
    },
];

const footerBottomLinks = [
    { label: "Sitemap", href: "#" },
    { label: "Legal Notices", href: "#" },
    { label: "Privacy Policy", href: "#" },
    { label: "Accessibility", href: "#" },
];

function formatDateKey(date: Date) {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function formatMonthLabel(date: Date) {
    return date.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
    });
}

function getMonthMatrix(viewDate: Date) {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const startDay = firstDay.getDay();

    const gridStart = new Date(year, month, 1 - startDay);
    const days: Date[] = [];

    for (let i = 0; i < 42; i += 1) {
        const day = new Date(gridStart);
        day.setDate(gridStart.getDate() + i);
        days.push(day);
    }

    return days;
}

function addDaysToDateKey(dateKey: string, daysToAdd: number) {
    const [year, month, day] = dateKey.split("-").map(Number);
    const date = new Date(year, (month || 1) - 1, day || 1);
    date.setDate(date.getDate() + daysToAdd);
    return formatDateKey(date);
}

export default function LoomeiraLearningPage() {
    const today = useMemo(() => new Date(), []);
    const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
    const [selectedDate, setSelectedDate] = useState(formatDateKey(today));
    const [entries, setEntries] = useState<LearningEntry[]>([]);
    const [goalTitle, setGoalTitle] = useState("");
    const [goalNotes, setGoalNotes] = useState("");

    const [editingProgressId, setEditingProgressId] = useState<string | null>(null);
    const [progressDraft, setProgressDraft] = useState("");

    const [topic, setTopic] = useState("Crochet roses");
    const [experience, setExperience] = useState("Beginner");
    const [hoursPerDay, setHoursPerDay] = useState("1");
    const [daysPerWeek, setDaysPerWeek] = useState("4");
    const [goal, setGoal] = useState("make decorative crochet roses confidently");
    const [plan, setPlan] = useState<PlanWeek[]>([]);

    const [chatInput, setChatInput] = useState("");
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
        {
            id: "welcome",
            role: "assistant",
            text: "Hi, I’m your Loomeira learning assistant. Ask me about planning your learning, staying consistent, or breaking a skill into smaller goals.",
        },
    ]);

    const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
    const [isSendingChat, setIsSendingChat] = useState(false);
    const [isAddingPlanToTracker, setIsAddingPlanToTracker] = useState(false);

    useEffect(() => {
        const stored = window.localStorage.getItem("loomeira-learning-entries");
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                const normalized = Array.isArray(parsed)
                    ? parsed.map((entry) => ({
                        ...entry,
                        progress:
                            typeof entry.progress === "number" && Number.isFinite(entry.progress)
                                ? Math.max(0, Math.min(100, entry.progress))
                                : 0,
                    }))
                    : [];
                setEntries(normalized);
            } catch {
                setEntries([]);
            }
        }

        const storedPlan = window.localStorage.getItem("loomeira-learning-plan");
        if (storedPlan) {
            try {
                setPlan(JSON.parse(storedPlan));
            } catch {
                setPlan([]);
            }
        }
    }, []);

    useEffect(() => {
        window.localStorage.setItem("loomeira-learning-entries", JSON.stringify(entries));
    }, [entries]);

    useEffect(() => {
        window.localStorage.setItem("loomeira-learning-plan", JSON.stringify(plan));
    }, [plan]);

    const calendarDays = useMemo(() => getMonthMatrix(viewDate), [viewDate]);

    const selectedDateEntries = useMemo(
        () => entries.filter((entry) => entry.date === selectedDate),
        [entries, selectedDate]
    );

    const selectedDateInProgressEntries = useMemo(
        () => selectedDateEntries.filter((entry) => entry.progress < 100),
        [selectedDateEntries]
    );

    const selectedDateCompletedEntries = useMemo(
        () => selectedDateEntries.filter((entry) => entry.progress >= 100),
        [selectedDateEntries]
    );

    const overallPlannerEntries = useMemo(
        () => [...entries].sort((a, b) => a.date.localeCompare(b.date)),
        [entries]
    );

    function handleAddGoal(e: FormEvent) {
        e.preventDefault();

        if (!goalTitle.trim()) return;

        const newEntry: LearningEntry = {
            id: `${selectedDate}-${Date.now()}`,
            date: selectedDate,
            title: goalTitle.trim(),
            notes: goalNotes.trim(),
            progress: 0,
        };

        setEntries((prev) => [...prev, newEntry]);
        setGoalTitle("");
        setGoalNotes("");
    }

    function handleDeleteGoal(id: string) {
        setEntries((prev) => prev.filter((entry) => entry.id !== id));

        if (editingProgressId === id) {
            setEditingProgressId(null);
            setProgressDraft("");
        }
    }

    function handleStartProgressEdit(entry: LearningEntry) {
        setEditingProgressId(entry.id);
        setProgressDraft(String(entry.progress ?? 0));
    }

    function handleSaveProgress(id: string) {
        const parsed = Number(progressDraft);

        if (!Number.isFinite(parsed)) return;

        const nextProgress = Math.max(0, Math.min(100, Math.round(parsed)));

        setEntries((prev) =>
            prev.map((entry) =>
                entry.id === id ? { ...entry, progress: nextProgress } : entry
            )
        );

        setEditingProgressId(null);
        setProgressDraft("");
    }

    function handleCancelProgressEdit() {
        setEditingProgressId(null);
        setProgressDraft("");
    }

    async function handleGeneratePlan() {
        if (!topic.trim()) {
            setChatMessages((prev) => [
                ...prev,
                {
                    id: `assistant-plan-missing-topic-${Date.now()}`,
                    role: "assistant",
                    text: "Plan generation failed: Please enter what you want to learn first.",
                },
            ]);
            return;
        }

        setIsGeneratingPlan(true);

        try {
            const weeklyHours =
                Math.max(1, Number(hoursPerDay) || 1) * Math.max(1, Number(daysPerWeek) || 1);

            const response = await fetch("/api/loomeira-learning", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    mode: "plan",
                    topic,
                    level: experience,
                    capacity: String(weeklyHours),
                    duration: "4",
                    goal,
                    experience,
                    hoursPerDay,
                    daysPerWeek,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.error || "Failed to generate plan.");
            }

            const nextPlan: PlanWeek[] = Array.isArray(data.plan) ? data.plan : [];
            setPlan(nextPlan);

            setChatMessages((prev) => [
                ...prev,
                {
                    id: `assistant-plan-${Date.now()}`,
                    role: "assistant",
                    text: `I created a ${nextPlan.length}-week learning plan for ${topic}. Review it below, and if it looks good, click "Add AI plan to tracker."`,
                },
            ]);
        } catch (error) {
            console.error("PLAN ERROR:", error);

            setChatMessages((prev) => [
                ...prev,
                {
                    id: `assistant-plan-error-${Date.now()}`,
                    role: "assistant",
                    text: `Plan generation failed: ${error instanceof Error ? error.message : "Unknown error"
                        }`,
                },
            ]);
        } finally {
            setIsGeneratingPlan(false);
        }
    }

    function handleAddPlanToTracker() {
        if (!plan.length) return;

        setIsAddingPlanToTracker(true);

        const newEntries: LearningEntry[] = plan.map((item, index) => ({
            id: `plan-${item.week}-${Date.now()}-${index}`,
            date: addDaysToDateKey(selectedDate, index * 7),
            title: item.focus,
            notes: item.goal,
            progress: 0,
        }));

        setEntries((prev) => [...prev, ...newEntries]);

        setChatMessages((prev) => [
            ...prev,
            {
                id: `assistant-tracker-${Date.now()}`,
                role: "assistant",
                text: "Done — I added your AI plan to the tracker starting from the selected date.",
            },
        ]);

        setIsAddingPlanToTracker(false);
    }

    async function handleSendChat(e: FormEvent) {
        e.preventDefault();

        if (!chatInput.trim()) return;

        const userText = chatInput.trim();

        const userMessage: ChatMessage = {
            id: `user-${Date.now()}`,
            role: "user",
            text: userText,
        };

        setChatMessages((prev) => [...prev, userMessage]);
        setChatInput("");
        setIsSendingChat(true);

        try {
            const weeklyHours =
                Math.max(1, Number(hoursPerDay) || 1) * Math.max(1, Number(daysPerWeek) || 1);

            const response = await fetch("/api/loomeira-learning", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    mode: "chat",
                    question: userText,
                    topic,
                    level: experience,
                    capacity: String(weeklyHours),
                    duration: "4",
                    goal,
                    experience,
                    hoursPerDay,
                    daysPerWeek,
                    plan,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.error || "Failed to get assistant reply.");
            }

            const assistantMessage: ChatMessage = {
                id: `assistant-${Date.now() + 1}`,
                role: "assistant",
                text: data.reply || "Sorry, I couldn't respond right now.",
            };

            setChatMessages((prev) => [...prev, assistantMessage]);
        } catch (error) {
            console.error("CHAT ERROR:", error);

            const assistantMessage: ChatMessage = {
                id: `assistant-error-${Date.now() + 1}`,
                role: "assistant",
                text: `Chat failed: ${error instanceof Error ? error.message : "Unknown error"}`,
            };

            setChatMessages((prev) => [...prev, assistantMessage]);
        } finally {
            setIsSendingChat(false);
        }
    }

    return (
        <main className="min-h-screen bg-[#fff8fb] text-[#1a1a1a]">
            <Navbar theme="light" />

            <section className="mx-auto max-w-[1400px] px-4 pb-16 pt-28 md:px-8 md:pt-32">
                <BackButton href="/" label="Home" />

                <div className="mt-8 max-w-5xl">
                    <div className="text-xs uppercase tracking-[0.35em] text-black/45">
                        Loomeira Learning
                    </div>

                    <h1 className="mt-4 text-4xl italic leading-tight md:text-6xl">
                        Plan your learning journey
                    </h1>

                    <p className="mt-6 max-w-4xl text-base leading-8 text-black/60 md:text-lg">
                        Take your learning journey to the next level with Loomeira Learning ✨
                        Build your path with our exclusive AI plan generator, stay inspired with
                        creative goals, and track your progress beautifully through your Loomeira
                        calendar. Excitingly, once you start growing your skills, you can also
                        share your progress in Loomeira Milan with other admin users and celebrate
                        every handmade milestone together 💖
                    </p>
                </div>

                <div className="mt-12 grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
                    <div className="rounded-[30px] border border-[#f2cddd] bg-white p-5 shadow-sm md:p-7">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <div className="text-xs uppercase tracking-[0.22em] text-black/50">
                                    Learning Calendar
                                </div>
                                <h2 className="mt-2 text-2xl font-medium">
                                    {formatMonthLabel(viewDate)}
                                </h2>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setViewDate(
                                            new Date(
                                                viewDate.getFullYear(),
                                                viewDate.getMonth() - 1,
                                                1
                                            )
                                        )
                                    }
                                    className="rounded-full border border-black/10 px-4 py-2 text-sm transition hover:bg-[#fff1f6]"
                                >
                                    Prev
                                </button>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setViewDate(
                                            new Date(
                                                viewDate.getFullYear(),
                                                viewDate.getMonth() + 1,
                                                1
                                            )
                                        )
                                    }
                                    className="rounded-full border border-black/10 px-4 py-2 text-sm transition hover:bg-[#fff1f6]"
                                >
                                    Next
                                </button>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-7 gap-2 text-center text-xs uppercase tracking-[0.2em] text-black/45">
                            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                                <div key={day} className="py-2">
                                    {day}
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-7 gap-2">
                            {calendarDays.map((day) => {
                                const dateKey = formatDateKey(day);
                                const hasGoals = entries.some((entry) => entry.date === dateKey);
                                const isCurrentMonth = day.getMonth() === viewDate.getMonth();
                                const isSelected = dateKey === selectedDate;
                                const isToday = dateKey === formatDateKey(today);

                                return (
                                    <button
                                        key={dateKey}
                                        type="button"
                                        onClick={() => setSelectedDate(dateKey)}
                                        className={`min-h-[88px] rounded-[20px] border p-3 text-left transition ${isSelected
                                                ? "border-[#ea4c97] bg-[#ffe9f2]"
                                                : "border-black/8 bg-[#fffbfd] hover:bg-[#fff1f6]"
                                            } ${isCurrentMonth ? "text-black" : "text-black/30"}`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span
                                                className={`text-sm ${isToday ? "font-semibold text-[#ea4c97]" : ""
                                                    }`}
                                            >
                                                {day.getDate()}
                                            </span>

                                            {hasGoals ? (
                                                <span className="h-2.5 w-2.5 rounded-full bg-[#ea4c97]" />
                                            ) : null}
                                        </div>

                                        <div className="mt-3 space-y-1">
                                            {entries
                                                .filter((entry) => entry.date === dateKey)
                                                .slice(0, 2)
                                                .map((entry) => (
                                                    <div
                                                        key={entry.id}
                                                        className="truncate rounded-full bg-white px-2 py-1 text-[11px] text-black/65"
                                                    >
                                                        {entry.title}
                                                    </div>
                                                ))}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="rounded-[30px] border border-[#f2cddd] bg-[#ffe9f2] p-6 shadow-sm">
                            <div className="text-xs uppercase tracking-[0.22em] text-black/50">
                                Selected Date
                            </div>

                            <div className="mt-3 text-2xl font-medium">{selectedDate}</div>

                            <form onSubmit={handleAddGoal} className="mt-6 space-y-4">
                                <input
                                    type="text"
                                    value={goalTitle}
                                    onChange={(e) => setGoalTitle(e.target.value)}
                                    placeholder="Add a learning goal"
                                    className="w-full rounded-[18px] border border-black/10 bg-white px-4 py-3 outline-none transition focus:border-[#ea4c97]"
                                />

                                <textarea
                                    value={goalNotes}
                                    onChange={(e) => setGoalNotes(e.target.value)}
                                    placeholder="Optional notes"
                                    rows={4}
                                    className="w-full rounded-[18px] border border-black/10 bg-white px-4 py-3 outline-none transition focus:border-[#ea4c97]"
                                />

                                <button
                                    type="submit"
                                    className="rounded-full bg-[#ea4c97] px-5 py-3 text-sm font-medium text-white transition hover:opacity-90"
                                >
                                    Save goal
                                </button>
                            </form>

                            <div className="mt-8 text-xs uppercase tracking-[0.22em] text-black/50">
                                Goals in Progress
                            </div>

                            <div className="mt-4 space-y-3">
                                {selectedDateInProgressEntries.length ? (
                                    selectedDateInProgressEntries.map((entry) => {
                                        const isEditing = editingProgressId === entry.id;

                                        return (
                                            <div
                                                key={entry.id}
                                                className="rounded-[20px] border border-white/70 bg-white p-4"
                                            >
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="min-w-0 flex-1">
                                                        <div className="font-medium">{entry.title}</div>

                                                        {entry.notes ? (
                                                            <p className="mt-2 text-sm leading-6 text-black/60">
                                                                {entry.notes}
                                                            </p>
                                                        ) : null}

                                                        <div className="mt-4">
                                                            <div className="mb-2 flex items-center justify-between gap-3">
                                                                <span className="text-xs uppercase tracking-[0.18em] text-black/45">
                                                                    Progress
                                                                </span>
                                                                <span className="text-sm font-medium text-[#ea4c97]">
                                                                    {entry.progress}%
                                                                </span>
                                                            </div>

                                                            <div className="h-2 w-full overflow-hidden rounded-full bg-[#f6d9e5]">
                                                                <div
                                                                    className="h-full rounded-full bg-[#ea4c97] transition-all"
                                                                    style={{ width: `${entry.progress}%` }}
                                                                />
                                                            </div>
                                                        </div>

                                                        {isEditing ? (
                                                            <div className="mt-4 flex flex-wrap items-center gap-2">
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    max="100"
                                                                    value={progressDraft}
                                                                    onChange={(e) => setProgressDraft(e.target.value)}
                                                                    placeholder="0 to 100"
                                                                    className="w-28 rounded-full border border-black/10 bg-[#fffbfd] px-4 py-2 text-sm outline-none transition focus:border-[#ea4c97]"
                                                                />
                                                                <span className="text-sm text-black/45">%</span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleSaveProgress(entry.id)}
                                                                    className="rounded-full bg-[#ea4c97] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
                                                                >
                                                                    Save
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={handleCancelProgressEdit}
                                                                    className="rounded-full border border-black/10 px-4 py-2 text-sm transition hover:bg-[#fff1f6]"
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                        ) : null}
                                                    </div>

                                                    <div className="flex shrink-0 items-center gap-3">
                                                        {!isEditing ? (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleStartProgressEdit(entry)}
                                                                className="text-sm text-black/45 transition hover:text-[#ea4c97]"
                                                            >
                                                                Edit
                                                            </button>
                                                        ) : null}

                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteGoal(entry.id)}
                                                            className="text-sm text-black/45 transition hover:text-[#ea4c97]"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p className="text-sm leading-7 text-black/55">
                                        No goals in progress for this date yet.
                                    </p>
                                )}
                            </div>

                            <div className="mt-8 text-xs uppercase tracking-[0.22em] text-black/50">
                                Goals Completed
                            </div>

                            <div className="mt-4 space-y-3">
                                {selectedDateCompletedEntries.length ? (
                                    selectedDateCompletedEntries.map((entry) => (
                                        <div
                                            key={entry.id}
                                            className="rounded-[20px] border border-white/70 bg-white p-4"
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="min-w-0 flex-1">
                                                    <div className="font-medium">{entry.title}</div>

                                                    {entry.notes ? (
                                                        <p className="mt-2 text-sm leading-6 text-black/60">
                                                            {entry.notes}
                                                        </p>
                                                    ) : null}

                                                    <div className="mt-4">
                                                        <div className="mb-2 flex items-center justify-between gap-3">
                                                            <span className="text-xs uppercase tracking-[0.18em] text-black/45">
                                                                Completed
                                                            </span>
                                                            <span className="text-sm font-medium text-[#ea4c97]">
                                                                100%
                                                            </span>
                                                        </div>

                                                        <div className="h-2 w-full overflow-hidden rounded-full bg-[#f6d9e5]">
                                                            <div
                                                                className="h-full rounded-full bg-[#ea4c97]"
                                                                style={{ width: "100%" }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteGoal(entry.id)}
                                                    className="text-sm text-black/45 transition hover:text-[#ea4c97]"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm leading-7 text-black/55">
                                        No completed goals for this date yet.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 rounded-[30px] border border-[#f2cddd] bg-white p-6 shadow-sm md:p-8">
                    <div className="text-xs uppercase tracking-[0.22em] text-black/50">
                        Overall Planner
                    </div>

                    <h2 className="mt-3 text-2xl font-medium">Your plans across all dates</h2>

                    <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {overallPlannerEntries.length ? (
                            overallPlannerEntries.map((entry) => (
                                <div
                                    key={entry.id}
                                    className="rounded-[22px] border border-black/8 bg-[#fff8fb] p-4"
                                >
                                    <div className="text-xs uppercase tracking-[0.18em] text-black/45">
                                        {entry.date}
                                    </div>
                                    <div className="mt-2 font-medium">{entry.title}</div>
                                    {entry.notes ? (
                                        <p className="mt-2 text-sm leading-6 text-black/60">
                                            {entry.notes}
                                        </p>
                                    ) : null}
                                    <div className="mt-4 flex items-center justify-between">
                                        <span className="text-xs uppercase tracking-[0.18em] text-black/45">
                                            Status
                                        </span>
                                        <span className="text-sm font-medium text-[#ea4c97]">
                                            {entry.progress >= 100 ? "Completed" : `${entry.progress}%`}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm leading-7 text-black/55">
                                Your overall planner will appear here once you start adding goals.
                            </p>
                        )}
                    </div>
                </div>

                <div className="mt-8 grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
                    <div className="rounded-[30px] border border-[#f2cddd] bg-white p-6 shadow-sm md:p-8">
                        <div className="text-xs uppercase tracking-[0.22em] text-black/50">
                            AI Plan Generator
                        </div>

                        <h2 className="mt-3 text-2xl font-medium">Create a personalized plan</h2>

                        <div className="mt-6 grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm text-black/60">
                                    What would you like to learn?
                                </label>
                                <input
                                    type="text"
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    className="w-full rounded-[18px] border border-black/10 bg-[#fffbfd] px-4 py-3 outline-none transition focus:border-[#ea4c97]"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm text-black/60">
                                    Experience level
                                </label>
                                <select
                                    value={experience}
                                    onChange={(e) => setExperience(e.target.value)}
                                    className="w-full rounded-[18px] border border-black/10 bg-[#fffbfd] px-4 py-3 outline-none transition focus:border-[#ea4c97]"
                                >
                                    <option>Beginner</option>
                                    <option>Intermediate</option>
                                    <option>Advanced</option>
                                </select>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm text-black/60">
                                    Hours per day
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={hoursPerDay}
                                    onChange={(e) => setHoursPerDay(e.target.value)}
                                    className="w-full rounded-[18px] border border-black/10 bg-[#fffbfd] px-4 py-3 outline-none transition focus:border-[#ea4c97]"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm text-black/60">
                                    Days per week
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="7"
                                    value={daysPerWeek}
                                    onChange={(e) => setDaysPerWeek(e.target.value)}
                                    className="w-full rounded-[18px] border border-black/10 bg-[#fffbfd] px-4 py-3 outline-none transition focus:border-[#ea4c97]"
                                />
                            </div>
                        </div>

                        <div className="mt-4">
                            <label className="mb-2 block text-sm text-black/60">
                                Goal or learning requirement
                            </label>
                            <textarea
                                value={goal}
                                onChange={(e) => setGoal(e.target.value)}
                                rows={4}
                                className="w-full rounded-[18px] border border-black/10 bg-[#fffbfd] px-4 py-3 outline-none transition focus:border-[#ea4c97]"
                            />
                        </div>

                        <div className="mt-5 flex flex-wrap gap-3">
                            <button
                                type="button"
                                onClick={handleGeneratePlan}
                                disabled={isGeneratingPlan}
                                className="rounded-full bg-[#ea4c97] px-5 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isGeneratingPlan ? "Creating plan..." : "Create plan"}
                            </button>

                            {plan.length ? (
                                <button
                                    type="button"
                                    onClick={handleAddPlanToTracker}
                                    disabled={isAddingPlanToTracker}
                                    className="rounded-full border border-[#ea4c97] px-5 py-3 text-sm font-medium text-[#ea4c97] transition hover:bg-[#fff1f6] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {isAddingPlanToTracker ? "Adding..." : "Add AI plan to tracker"}
                                </button>
                            ) : null}
                        </div>

                        <div className="mt-6 space-y-4">
                            {plan.length ? (
                                plan.map((item) => (
                                    <div
                                        key={item.week}
                                        className="rounded-[20px] border border-black/8 bg-[#fff8fb] p-4"
                                    >
                                        <div className="text-xs uppercase tracking-[0.18em] text-black/45">
                                            {item.title}
                                        </div>
                                        <div className="mt-2 font-medium">{item.focus}</div>
                                        <p className="mt-2 text-sm leading-6 text-black/60">
                                            {item.goal}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm leading-7 text-black/55">
                                    Build a plan here and then map each step into your calendar.
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="rounded-[30px] border border-[#f2cddd] bg-[#ffe9f2] p-6 shadow-sm md:p-8">
                        <div className="text-xs uppercase tracking-[0.22em] text-black/50">
                            Chat with AI
                        </div>

                        <h2 className="mt-3 text-2xl font-medium">Ask for learning help</h2>

                        <div className="mt-6 max-h-[420px] space-y-4 overflow-y-auto pr-1">
                            {chatMessages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`max-w-[88%] rounded-[22px] px-4 py-3 text-sm leading-7 ${message.role === "assistant"
                                            ? "bg-white text-black/75"
                                            : "ml-auto bg-[#ea4c97] text-white"
                                        }`}
                                >
                                    {message.text}
                                </div>
                            ))}
                        </div>

                        <form onSubmit={handleSendChat} className="mt-6 flex flex-col gap-3 md:flex-row">
                            <input
                                type="text"
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                placeholder="Ask about your learning plan, time, or next steps"
                                className="flex-1 rounded-full border border-black/10 bg-white px-5 py-3 outline-none transition focus:border-[#ea4c97]"
                            />
                            <button
                                type="submit"
                                disabled={isSendingChat}
                                className="rounded-full bg-[#ea4c97] px-5 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isSendingChat ? "Sending..." : "Send"}
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            <section className="pb-12 pt-2">
                <div className="mx-auto max-w-[1400px] px-4 md:px-8">
                    <div className="overflow-hidden rounded-[30px] border border-[#eadfe3] bg-[#fdf6f8] shadow-[0_12px_35px_rgba(0,0,0,0.04)]">
                        <div className="border-b border-black/10 px-6 py-10 md:px-10 lg:px-12">
                            <div className="mb-10 max-w-3xl">
                                <p className="mb-3 text-[10px] uppercase tracking-[0.32em] text-black/45">
                                    Soft Luxury, Handmade
                                </p>
                                <h2 className="text-2xl font-light leading-snug text-black md:text-3xl">
                                    Crafted collections for fashion, home, pets, and everyday beauty.
                                </h2>
                            </div>

                            <div className="grid gap-10 md:grid-cols-2 xl:grid-cols-4">
                                {footerColumns.map((column) => (
                                    <div key={column.title}>
                                        <p className="mb-5 text-[10px] uppercase tracking-[0.26em] text-black/55">
                                            {column.title}
                                        </p>

                                        <div className="space-y-3">
                                            {column.links.map((link) => (
                                                <Link
                                                    key={link.label}
                                                    href={link.href}
                                                    className="block text-[15px] font-light tracking-[0.01em] text-black/80 transition hover:text-black"
                                                >
                                                    {link.label}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="px-6 py-6 md:px-10 lg:px-12">
                            <div className="flex flex-col items-start justify-between gap-5 lg:flex-row lg:items-center">
                                <div className="text-[14px] text-black/70">
                                    Ship to: United States of America
                                </div>

                                <div className="flex flex-wrap gap-x-6 gap-y-2">
                                    {footerBottomLinks.map((link) => (
                                        <Link
                                            key={link.label}
                                            href={link.href}
                                            className="text-[14px] text-black/75 transition hover:text-black"
                                        >
                                            {link.label}
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-6 border-t border-black/10 pt-5 text-center">
                                <div className="mx-auto flex flex-col items-center justify-center">
                                    <div className="relative h-[90px] w-[90px] md:h-[120px] md:w-[120px]">
                                        <Image
                                            src="/loomeira-logo.png"
                                            alt="Loomeira logo"
                                            fill
                                            className="object-contain"
                                            style={{
                                                filter:
                                                    "brightness(0) saturate(100%) invert(0%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(0%) contrast(100%)",
                                            }}
                                        />
                                    </div>

                                    <p className="mt-2 text-xs text-black/55">
                                        © {new Date().getFullYear()} Loomèira. All rights reserved.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}