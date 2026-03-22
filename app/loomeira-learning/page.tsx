"use client";

import Navbar from "@/components/Navbar";
import BackButton from "@/components/BackButton";
import { FormEvent, useEffect, useMemo, useState } from "react";

type LearningEntry = {
    id: string;
    date: string;
    title: string;
    notes: string;
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

function buildPlan(
    topic: string,
    level: string,
    capacity: string,
    duration: string,
    goal: string
): PlanWeek[] {
    const weeks = Math.max(1, Number(duration) || 4);
    const hours = Math.max(1, Number(capacity) || 3);
    const cleanTopic = topic.trim() || "crochet";
    const cleanGoal = goal.trim() || `build consistency in ${cleanTopic}`;

    const beginnerPlan = [
        "Learn tools, materials, and basic terms",
        "Practice foundation stitches and hand control",
        "Repeat small patterns and improve consistency",
        "Create one simple finished project",
    ];

    const intermediatePlan = [
        "Refresh technique and identify weak areas",
        "Work on shaping, tension, and pattern reading",
        "Build speed with guided mini-projects",
        "Complete a polished project with variations",
    ];

    const advancedPlan = [
        "Define a focused outcome and benchmark current skill",
        "Practice complex patterns and precision work",
        "Refine finishing, styling, and customization",
        "Complete a showcase-level project and review gaps",
    ];

    const source =
        level === "Intermediate"
            ? intermediatePlan
            : level === "Advanced"
                ? advancedPlan
                : beginnerPlan;

    return Array.from({ length: weeks }, (_, index) => {
        const focus = source[index % source.length];
        return {
            week: index + 1,
            title: `Week ${index + 1}`,
            focus,
            goal:
                hours <= 2
                    ? `Light pace: spend about ${hours} hour${hours === 1 ? "" : "s"} on ${cleanTopic} and keep the target realistic.`
                    : `Steady pace: spend about ${hours} hours on ${cleanTopic} and move toward ${cleanGoal}.`,
        };
    });
}

function generateAssistantReply(
    question: string,
    planInputs: {
        topic: string;
        level: string;
        capacity: string;
        duration: string;
        goal: string;
    }
) {
    const q = question.trim().toLowerCase();
    const topic = planInputs.topic.trim() || "crochet";
    const level = planInputs.level || "Beginner";
    const capacity = Number(planInputs.capacity) || 3;
    const duration = Number(planInputs.duration) || 4;
    const goal = planInputs.goal.trim() || `improve at ${topic}`;

    if (!q) {
        return "Tell me what you want to learn, what feels difficult, or how much time you have each week, and I’ll help you shape a learning routine.";
    }

    if (q.includes("plan") || q.includes("schedule")) {
        return `Based on your current settings, I’d recommend a ${duration}-week ${level.toLowerCase()} plan for ${topic} with about ${capacity} hour${capacity === 1 ? "" : "s"} per week, focused on ${goal}.`;
    }

    if (q.includes("behind") || q.includes("missed") || q.includes("skip")) {
        return `If you miss a day, don’t restart everything. Move the unfinished ${topic} task to the next open day, keep only one priority goal per session, and protect consistency over perfection.`;
    }

    if (q.includes("beginner")) {
        return `For a beginner in ${topic}, start with fundamentals first, repeat the same technique a few times, and avoid jumping into a large project too early.`;
    }

    if (q.includes("time") || q.includes("busy")) {
        return `Since time is limited, use short sessions. Even ${capacity} focused hour${capacity === 1 ? "" : "s"} a week can work well if each session has one clear task and one measurable outcome.`;
    }

    if (q.includes("motivation") || q.includes("consistent")) {
        return `To stay consistent, pick tiny wins: one stitch, one pattern section, or one finished sample. Visible progress makes it much easier to continue with ${topic}.`;
    }

    return `For ${topic}, I’d focus on one skill at a time, match the workload to your ${level.toLowerCase()} level, and keep the weekly target aligned with your goal: ${goal}.`;
}

export default function LoomeiraLearningPage() {
    const today = useMemo(() => new Date(), []);
    const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
    const [selectedDate, setSelectedDate] = useState(formatDateKey(today));
    const [entries, setEntries] = useState<LearningEntry[]>([]);
    const [goalTitle, setGoalTitle] = useState("");
    const [goalNotes, setGoalNotes] = useState("");

    const [topic, setTopic] = useState("Crochet roses");
    const [level, setLevel] = useState("Beginner");
    const [capacity, setCapacity] = useState("4");
    const [duration, setDuration] = useState("4");
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

    useEffect(() => {
        const stored = window.localStorage.getItem("loomeira-learning-entries");
        if (stored) {
            try {
                setEntries(JSON.parse(stored));
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

    const upcomingEntries = useMemo(
        () =>
            [...entries]
                .sort((a, b) => a.date.localeCompare(b.date))
                .filter((entry) => entry.date >= formatDateKey(today))
                .slice(0, 6),
        [entries, today]
    );

    function handleAddGoal(e: FormEvent) {
        e.preventDefault();

        if (!goalTitle.trim()) return;

        const newEntry: LearningEntry = {
            id: `${selectedDate}-${Date.now()}`,
            date: selectedDate,
            title: goalTitle.trim(),
            notes: goalNotes.trim(),
        };

        setEntries((prev) => [...prev, newEntry]);
        setGoalTitle("");
        setGoalNotes("");
    }

    function handleDeleteGoal(id: string) {
        setEntries((prev) => prev.filter((entry) => entry.id !== id));
    }

    function handleGeneratePlan() {
        const nextPlan = buildPlan(topic, level, capacity, duration, goal);
        setPlan(nextPlan);

        setChatMessages((prev) => [
            ...prev,
            {
                id: `assistant-plan-${Date.now()}`,
                role: "assistant",
                text: `I created a ${nextPlan.length}-week learning plan for ${topic}. You can use it as your base and then add date-specific goals in your calendar.`,
            },
        ]);
    }

    function handleSendChat(e: FormEvent) {
        e.preventDefault();

        if (!chatInput.trim()) return;

        const userMessage: ChatMessage = {
            id: `user-${Date.now()}`,
            role: "user",
            text: chatInput.trim(),
        };

        const assistantMessage: ChatMessage = {
            id: `assistant-${Date.now() + 1}`,
            role: "assistant",
            text: generateAssistantReply(chatInput, {
                topic,
                level,
                capacity,
                duration,
                goal,
            }),
        };

        setChatMessages((prev) => [...prev, userMessage, assistantMessage]);
        setChatInput("");
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
                        Create your own learning calendar, choose any date, add goals, and keep
                        track of what you want to learn step by step. You can also use the AI
                        planner to build a personalized learning routine based on your time and
                        goals.
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

                            <div className="mt-6 space-y-3">
                                {selectedDateEntries.length ? (
                                    selectedDateEntries.map((entry) => (
                                        <div
                                            key={entry.id}
                                            className="rounded-[20px] border border-white/70 bg-white p-4"
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <div className="font-medium">{entry.title}</div>
                                                    {entry.notes ? (
                                                        <p className="mt-2 text-sm leading-6 text-black/60">
                                                            {entry.notes}
                                                        </p>
                                                    ) : null}
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
                                        No goals for this date yet. Add one above.
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="rounded-[30px] border border-[#f2cddd] bg-white p-6 shadow-sm">
                            <div className="text-xs uppercase tracking-[0.22em] text-black/50">
                                Upcoming Goals
                            </div>

                            <div className="mt-4 space-y-3">
                                {upcomingEntries.length ? (
                                    upcomingEntries.map((entry) => (
                                        <div
                                            key={entry.id}
                                            className="rounded-[18px] border border-black/8 bg-[#fff8fb] p-4"
                                        >
                                            <div className="text-xs uppercase tracking-[0.18em] text-black/45">
                                                {entry.date}
                                            </div>
                                            <div className="mt-2 font-medium">{entry.title}</div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm leading-7 text-black/55">
                                        Your future learning goals will appear here.
                                    </p>
                                )}
                            </div>
                        </div>
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
                                    What do you want to learn?
                                </label>
                                <input
                                    type="text"
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    className="w-full rounded-[18px] border border-black/10 bg-[#fffbfd] px-4 py-3 outline-none transition focus:border-[#ea4c97]"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm text-black/60">Level</label>
                                <select
                                    value={level}
                                    onChange={(e) => setLevel(e.target.value)}
                                    className="w-full rounded-[18px] border border-black/10 bg-[#fffbfd] px-4 py-3 outline-none transition focus:border-[#ea4c97]"
                                >
                                    <option>Beginner</option>
                                    <option>Intermediate</option>
                                    <option>Advanced</option>
                                </select>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm text-black/60">
                                    Hours per week
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={capacity}
                                    onChange={(e) => setCapacity(e.target.value)}
                                    className="w-full rounded-[18px] border border-black/10 bg-[#fffbfd] px-4 py-3 outline-none transition focus:border-[#ea4c97]"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm text-black/60">
                                    Duration in weeks
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={duration}
                                    onChange={(e) => setDuration(e.target.value)}
                                    className="w-full rounded-[18px] border border-black/10 bg-[#fffbfd] px-4 py-3 outline-none transition focus:border-[#ea4c97]"
                                />
                            </div>
                        </div>

                        <div className="mt-4">
                            <label className="mb-2 block text-sm text-black/60">
                                Your goal or requirement
                            </label>
                            <textarea
                                value={goal}
                                onChange={(e) => setGoal(e.target.value)}
                                rows={4}
                                className="w-full rounded-[18px] border border-black/10 bg-[#fffbfd] px-4 py-3 outline-none transition focus:border-[#ea4c97]"
                            />
                        </div>

                        <button
                            type="button"
                            onClick={handleGeneratePlan}
                            className="mt-5 rounded-full bg-[#ea4c97] px-5 py-3 text-sm font-medium text-white transition hover:opacity-90"
                        >
                            Create plan
                        </button>

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
                                className="rounded-full bg-[#ea4c97] px-5 py-3 text-sm font-medium text-white transition hover:opacity-90"
                            >
                                Send
                            </button>
                        </form>
                    </div>
                </div>
            </section>
        </main>
    );
}