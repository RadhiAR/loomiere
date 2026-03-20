"use client";

import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import BackButton from "@/components/BackButton";
import { isAdminSessionActive, readAdminKey } from "@/lib/admin-session";
import { readProfile, subscriptionLabel, type SubscriptionPlan } from "@/lib/profile";

type StoredAdminUser = {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    password: string;
    createdAt: string;
};

const ADMIN_USERS_KEY = "loomiere_admin_users_v1";
const ADMIN_PRODUCT_USAGE_KEY = "loomiere_admin_product_upload_counts_v1";
const ADMIN_LEARNING_PROGRESS_KEY = "loomiere_admin_learning_progress_v1";

const PLAN_LIMITS: Record<SubscriptionPlan, number> = {
    none: 0,
    pink: 300,
    silver: 70,
    bronze: 30,
};

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

function readCurrentAdminName() {
    if (typeof window === "undefined") return "Subscriber Admin";

    const currentAdminId = readAdminKey();
    if (!currentAdminId) return "Subscriber Admin";

    const admins = readAdminUsers();
    const admin = admins.find((item) => item.id === currentAdminId);

    if (!admin) return "Subscriber Admin";
    return `${admin.firstName} ${admin.lastName}`.trim() || "Subscriber Admin";
}

function readUsageMap(): Record<string, number> {
    if (typeof window === "undefined") return {};

    try {
        const raw = window.localStorage.getItem(ADMIN_PRODUCT_USAGE_KEY);
        if (!raw) return {};
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
        return {};
    }
}

function readLearningMap(): Record<string, number> {
    if (typeof window === "undefined") return {};

    try {
        const raw = window.localStorage.getItem(ADMIN_LEARNING_PROGRESS_KEY);
        if (!raw) return {};
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
        return {};
    }
}

function clampPercent(value: number) {
    if (!Number.isFinite(value)) return 0;
    return Math.max(0, Math.min(100, value));
}

export default function MyDashboardPage() {
    const [isAdmin, setIsAdmin] = useState(false);
    const [adminName, setAdminName] = useState("Subscriber Admin");
    const [subscription, setSubscription] = useState<SubscriptionPlan>("pink");
    const [subscriptionText, setSubscriptionText] = useState("");
    const [usageCount, setUsageCount] = useState(0);
    const [learningProgress, setLearningProgress] = useState(0);
    const [pendingRequests, setPendingRequests] = useState(0);
    const [pendingSyncMessage, setPendingSyncMessage] = useState("");

    useEffect(() => {
        const adminActive = isAdminSessionActive();
        setIsAdmin(adminActive);

        const currentAdminId = readAdminKey();
        setAdminName(readCurrentAdminName());

        const profile = readProfile();
        const nextSubscription = profile.subscription === "none" ? "pink" : profile.subscription;
        setSubscription(nextSubscription);
        setSubscriptionText(subscriptionLabel(nextSubscription));

        const usageMap = readUsageMap();
        setUsageCount(Number(usageMap[currentAdminId] || 0));

        const learningMap = readLearningMap();
        setLearningProgress(clampPercent(Number(learningMap[currentAdminId] || 0)));

        async function loadPendingRequests() {
            if (!currentAdminId) {
                setPendingRequests(0);
                return;
            }

            try {
                const res = await fetch("/api/admin/custom-requests", {
                    headers: {
                        "x-admin-key": currentAdminId,
                    },
                });

                if (!res.ok) {
                    setPendingRequests(0);
                    setPendingSyncMessage("Pending requests will sync after a valid admin dashboard key is saved.");
                    return;
                }

                const data = await res.json().catch(() => null);
                const items = Array.isArray(data?.items) ? data.items : [];

                const pending = items.filter((item: any) => {
                    const status = String(item?.status || "").toLowerCase();
                    return status !== "completed" && status !== "cancelled";
                }).length;

                setPendingRequests(pending);
                setPendingSyncMessage("");
            } catch {
                setPendingRequests(0);
                setPendingSyncMessage("Pending requests will sync after a valid admin dashboard key is saved.");
            }
        }

        loadPendingRequests();
    }, []);

    const yearlyLimit = PLAN_LIMITS[subscription] || 0;
    const usagePercent = yearlyLimit > 0 ? clampPercent((usageCount / yearlyLimit) * 100) : 0;
    const pendingPercent = clampPercent((pendingRequests / 25) * 100);

    const chartValues = useMemo(() => {
        const usageValue = Math.max(usagePercent, 1);
        const learningValue = Math.max(learningProgress, 1);
        const pendingValue = Math.max(pendingPercent, 1);

        const total = usageValue + learningValue + pendingValue;

        const usageSlice = (usageValue / total) * 360;
        const learningSlice = (learningValue / total) * 360;
        const pendingSlice = 360 - usageSlice - learningSlice;

        return {
            usageSlice,
            learningSlice,
            pendingSlice,
        };
    }, [usagePercent, learningProgress, pendingPercent]);

    if (!isAdmin) {
        return (
            <main className="min-h-screen bg-[#f9eff4] text-black">
                <section className="mx-auto max-w-[1600px] px-4 pb-16 pt-6 sm:px-6 lg:px-8">
                    <div className="pointer-events-none absolute inset-x-0 top-6 z-20 flex items-start justify-between px-4 sm:px-6 lg:px-8">
                        <div className="pointer-events-auto">
                            <BackButton href="/" label="Home" theme="light" />
                        </div>
                        <div className="pointer-events-auto">
                            <Navbar theme="light" />
                        </div>
                    </div>

                    <div className="mx-auto max-w-4xl pt-32">
                        <div className="rounded-[32px] border border-[#efc5d7] bg-white/80 p-10 text-center shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
                            <div className="text-xs uppercase tracking-[0.28em] text-black/45">
                                Loomière Admin
                            </div>
                            <h1 className="mt-4 text-4xl italic text-black/85">My Dashboard</h1>
                            <p className="mt-4 text-base leading-8 text-black/60">
                                This page is available only for admin subscriber accounts.
                            </p>
                        </div>
                    </div>
                </section>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#f9eff4] text-black">
            <section className="mx-auto max-w-[1600px] px-4 pb-16 pt-6 sm:px-6 lg:px-8">
                <div className="pointer-events-none absolute inset-x-0 top-6 z-20 flex items-start justify-between px-4 sm:px-6 lg:px-8">
                    <div className="pointer-events-auto">
                        <BackButton href="/" label="Home" theme="light" />
                    </div>
                    <div className="pointer-events-auto">
                        <Navbar theme="light" />
                    </div>
                </div>

                <div className="mx-auto max-w-7xl pt-28">
                    <div className="mb-8 text-center">
                        <div className="text-xs uppercase tracking-[0.35em] text-black/45">
                            Loomière Admin
                        </div>
                        <h1 className="mt-4 text-4xl italic tracking-tight sm:text-5xl">
                            My Dashboard
                        </h1>
                        <p className="mx-auto mt-4 max-w-3xl text-base leading-8 text-black/65">
                            Track your seller account usage, learning journey, and pending custom requests in one place.
                        </p>
                    </div>

                    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
                        <div className="rounded-[30px] border border-[#efc5d7] bg-white/80 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
                            <div className="text-xs uppercase tracking-[0.24em] text-black/45">
                                Overview
                            </div>

                            <div className="mt-6 flex flex-col items-center">
                                <div
                                    className="relative h-72 w-72 rounded-full"
                                    style={{
                                        background: `conic-gradient(
                                            #ef5f9a 0deg ${chartValues.usageSlice}deg,
                                            #f4b6cf ${chartValues.usageSlice}deg ${chartValues.usageSlice + chartValues.learningSlice}deg,
                                            #d86b98 ${chartValues.usageSlice + chartValues.learningSlice}deg 360deg
                                        )`,
                                    }}
                                >
                                    <div className="absolute inset-[26px] flex items-center justify-center rounded-full bg-[#fff7fb] text-center shadow-inner">
                                        <div>
                                            <div className="text-xs uppercase tracking-[0.22em] text-black/45">
                                                {adminName}
                                            </div>
                                            <div className="mt-2 text-2xl font-medium italic text-black/85">
                                                Dashboard
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 grid w-full gap-4">
                                    <LegendRow
                                        colorClass="bg-[#ef5f9a]"
                                        label="Account Usage"
                                        value={`${usageCount}/${yearlyLimit || 0}`}
                                        subtext={`${usagePercent.toFixed(0)}% of yearly seller capacity used`}
                                    />
                                    <LegendRow
                                        colorClass="bg-[#f4b6cf]"
                                        label="Learning Progress"
                                        value={`${learningProgress.toFixed(0)}%`}
                                        subtext="AI learning section placeholder for future feature"
                                    />
                                    <LegendRow
                                        colorClass="bg-[#d86b98]"
                                        label="Custom Requests Pending"
                                        value={String(pendingRequests)}
                                        subtext="Pending requests currently assigned in admin flow"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-6">
                            <InfoCard
                                eyebrow="Account Usage"
                                title="Subscription usage tracker"
                                description="This currently tracks how many products you have uploaded against your current subscription cap."
                            >
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <MiniStat label="Current Plan" value={subscriptionText} />
                                    <MiniStat label="Products Used" value={`${usageCount} / ${yearlyLimit || 0}`} />
                                </div>

                                <ProgressBar value={usagePercent} />

                                <p className="mt-3 text-sm leading-7 text-black/55">
                                    Pink plan supports up to 300 products per year, Silver supports 70, and Bronze supports 30.
                                </p>
                            </InfoCard>

                            <InfoCard
                                eyebrow="Learning Progress"
                                title="AI learning tracker"
                                description="Learning AI is not introduced yet, so this section is ready as a placeholder."
                            >
                                <MiniStat label="Current Progress" value={`${learningProgress.toFixed(0)}%`} />
                                <ProgressBar value={learningProgress} />
                            </InfoCard>

                            <InfoCard
                                eyebrow="Custom Requests"
                                title="Pending under your admin dashboard"
                                description="This checks pending requests from the admin request flow."
                            >
                                <MiniStat label="Pending Requests" value={String(pendingRequests)} />
                                <ProgressBar value={pendingPercent} />

                                {pendingSyncMessage ? (
                                    <p className="mt-3 text-sm leading-7 text-black/50">
                                        {pendingSyncMessage}
                                    </p>
                                ) : null}
                            </InfoCard>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}

function LegendRow({
    colorClass,
    label,
    value,
    subtext,
}: {
    colorClass: string;
    label: string;
    value: string;
    subtext: string;
}) {
    return (
        <div className="rounded-[22px] border border-[#efc5d7] bg-[#fff9fc] p-4">
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                    <span className={`mt-1 inline-block h-3.5 w-3.5 rounded-full ${colorClass}`} />
                    <div>
                        <div className="text-sm font-medium text-black/80">{label}</div>
                        <div className="mt-1 text-xs leading-6 text-black/50">{subtext}</div>
                    </div>
                </div>
                <div className="text-sm font-medium text-black/75">{value}</div>
            </div>
        </div>
    );
}

function InfoCard({
    eyebrow,
    title,
    description,
    children,
}: {
    eyebrow: string;
    title: string;
    description: string;
    children: React.ReactNode;
}) {
    return (
        <div className="rounded-[30px] border border-[#efc5d7] bg-white/80 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
            <div className="text-xs uppercase tracking-[0.24em] text-black/45">{eyebrow}</div>
            <h2 className="mt-3 text-2xl italic text-black/85">{title}</h2>
            <p className="mt-3 text-sm leading-7 text-black/60">{description}</p>
            <div className="mt-5">{children}</div>
        </div>
    );
}

function MiniStat({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-[22px] border border-[#efc5d7] bg-[#fff9fc] p-4">
            <div className="text-xs uppercase tracking-[0.22em] text-black/45">{label}</div>
            <div className="mt-2 text-lg font-medium text-black/80">{value}</div>
        </div>
    );
}

function ProgressBar({ value }: { value: number }) {
    return (
        <div className="mt-5">
            <div className="h-3 w-full overflow-hidden rounded-full bg-[#f7d9e6]">
                <div
                    className="h-full rounded-full bg-[#ef5f9a] transition-all"
                    style={{ width: `${clampPercent(value)}%` }}
                />
            </div>
        </div>
    );
}