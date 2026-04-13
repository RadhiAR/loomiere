"use client";

import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import BackButton from "@/components/BackButton";
import { isAdminSessionActive, readAdminKey } from "@/lib/admin-session";
import {
    defaultProfile,
    readProfile,
    subscriptionLabel,
    type SubscriptionPlan,
    writeProfile,
} from "@/lib/profile";
import {
    getCurrentUser,
    requestPasswordReset,
    updateCurrentUserPassword,
} from "@/lib/auth";

type StoredAdminUser = {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    password: string;
    createdAt: string;
};

type EditableField =
    | "fullName"
    | "username"
    | "email"
    | "phone"
    | "address"
    | "password"
    | null;

type NameFields = {
    firstName: string;
    lastName: string;
};

type AddressFields = {
    line1: string;
    apartment: string;
    city: string;
    state: string;
    zipcode: string;
    country: string;
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

const COUNTRY_OPTIONS = [
    "United States",
    "Canada",
    "India",
    "United Kingdom",
    "Australia",
    "Germany",
    "France",
    "Italy",
    "Spain",
    "Netherlands",
    "Singapore",
    "United Arab Emirates",
    "Japan",
    "South Korea",
];

const STATE_OPTIONS = [
    "Alabama",
    "Alaska",
    "Arizona",
    "Arkansas",
    "California",
    "Colorado",
    "Connecticut",
    "Delaware",
    "Florida",
    "Georgia",
    "Hawaii",
    "Idaho",
    "Illinois",
    "Indiana",
    "Iowa",
    "Kansas",
    "Kentucky",
    "Louisiana",
    "Maine",
    "Maryland",
    "Massachusetts",
    "Michigan",
    "Minnesota",
    "Mississippi",
    "Missouri",
    "Montana",
    "Nebraska",
    "Nevada",
    "New Hampshire",
    "New Jersey",
    "New Mexico",
    "New York",
    "North Carolina",
    "North Dakota",
    "Ohio",
    "Oklahoma",
    "Oregon",
    "Pennsylvania",
    "Rhode Island",
    "South Carolina",
    "South Dakota",
    "Tennessee",
    "Texas",
    "Utah",
    "Vermont",
    "Virginia",
    "Washington",
    "West Virginia",
    "Wisconsin",
    "Wyoming",
];

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

function EditIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" />
        </svg>
    );
}

function parseFullName(fullName: string): NameFields {
    const cleaned = fullName.trim();

    if (!cleaned) {
        return {
            firstName: "",
            lastName: "",
        };
    }

    const parts = cleaned.split(/\s+/);

    if (parts.length === 1) {
        return {
            firstName: parts[0],
            lastName: "",
        };
    }

    return {
        firstName: parts[0],
        lastName: parts.slice(1).join(" "),
    };
}

function formatFullName(name: NameFields) {
    return [name.firstName.trim(), name.lastName.trim()].filter(Boolean).join(" ");
}

function fullNamePreview(name: NameFields) {
    const combined = formatFullName(name);
    return combined || "Not added";
}

function parseAddress(address: string): AddressFields {
    if (!address?.trim()) {
        return {
            line1: "",
            apartment: "",
            city: "",
            state: "",
            zipcode: "",
            country: "",
        };
    }

    const lines = address.split("\n").map((line) => line.trim());

    const getValue = (prefix: string) => {
        const found = lines.find((line) =>
            line.toLowerCase().startsWith(prefix.toLowerCase())
        );
        return found ? found.slice(prefix.length).trim() : "";
    };

    const structuredValues = {
        line1: getValue("Address:"),
        apartment: getValue("Apartment:"),
        city: getValue("City:"),
        state: getValue("State:"),
        zipcode: getValue("Zipcode:"),
        country: getValue("Country:"),
    };

    const hasStructuredFormat = Object.values(structuredValues).some(Boolean);

    if (hasStructuredFormat) {
        return structuredValues;
    }

    return {
        line1: lines[0] || "",
        apartment: "",
        city: lines[1] || "",
        state: "",
        zipcode: "",
        country: lines[2] || "",
    };
}

function formatAddress(address: AddressFields) {
    return [
        `Address: ${address.line1}`,
        `Apartment: ${address.apartment}`,
        `City: ${address.city}`,
        `State: ${address.state}`,
        `Zipcode: ${address.zipcode}`,
        `Country: ${address.country}`,
    ].join("\n");
}

function addressPreview(address: AddressFields) {
    const parts = [
        address.line1,
        address.apartment ? `Apt ${address.apartment}` : "",
        address.city,
        address.state,
        address.zipcode,
        address.country,
    ].filter(Boolean);

    return parts.length ? parts.join(", ") : "Not added";
}

function subscriptionBenefits(plan: SubscriptionPlan) {
    if (plan === "pink") {
        return [
            "1 month free trial",
            "Then $99.99 billed annually",
            "Original price $129.99",
            "Up to 300 products annually",
        ];
    }

    if (plan === "silver") {
        return [
            "7 day free trial",
            "Then $39.99 billed quarterly",
            "Full refund within first 7 days",
            "Up to 70 products every quarter",
        ];
    }

    if (plan === "bronze") {
        return [
            "3 day free trial",
            "Then $19.99 billed monthly",
            "Full refund within first 3 days",
            "Up to 30 products every month",
        ];
    }

    return ["No active subscription selected yet."];
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

    const [profile, setProfile] = useState(defaultProfile);
    const [editingField, setEditingField] = useState<EditableField>(null);
    const [nameFields, setNameFields] = useState<NameFields>({
        firstName: "",
        lastName: "",
    });
    const [addressFields, setAddressFields] = useState<AddressFields>({
        line1: "",
        apartment: "",
        city: "",
        state: "",
        zipcode: "",
        country: "",
    });
    const [savedSection, setSavedSection] = useState<EditableField>(null);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [forgotPasswordMessage, setForgotPasswordMessage] = useState("");

    useEffect(() => {
        const adminActive = isAdminSessionActive();
        setIsAdmin(adminActive);

        const currentAdminId = readAdminKey();
        setAdminName(readCurrentAdminName());

        const storedProfile = readProfile();
        setProfile(storedProfile);
        setNameFields(parseFullName(storedProfile.fullName));
        setAddressFields(parseAddress(storedProfile.address));

        const nextSubscription =
            storedProfile.subscription === "none" ? "pink" : storedProfile.subscription;
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

    function update<K extends keyof typeof profile>(key: K, value: (typeof profile)[K]) {
        setProfile((previous) => ({
            ...previous,
            [key]: value,
        }));
        setSavedSection(null);
    }

    function startEditing(field: EditableField) {
        if (field === "fullName") {
            setNameFields(parseFullName(profile.fullName));
        }

        if (field === "address") {
            setAddressFields(parseAddress(profile.address));
        }

        if (field === "password") {
            setCurrentPassword("");
            setNewPassword("");
            setConfirmNewPassword("");
            setPasswordError("");
            setForgotPasswordMessage("");
        }

        setEditingField(field);
        setSavedSection(null);
    }

    function updateNameField<K extends keyof NameFields>(key: K, value: NameFields[K]) {
        const nextName = {
            ...nameFields,
            [key]: value,
        };

        setNameFields(nextName);
        setProfile((previous) => ({
            ...previous,
            fullName: formatFullName(nextName),
        }));
        setSavedSection(null);
    }

    function updateAddressField<K extends keyof AddressFields>(
        key: K,
        value: AddressFields[K]
    ) {
        const nextAddress = {
            ...addressFields,
            [key]: value,
        };

        setAddressFields(nextAddress);
        setProfile((previous) => ({
            ...previous,
            address: formatAddress(nextAddress),
        }));
        setSavedSection(null);
    }

    function saveSection(field: EditableField) {
        const nextProfile = { ...profile };

        if (field === "fullName") {
            nextProfile.fullName = formatFullName(nameFields);
        }

        if (field === "address") {
            nextProfile.address = formatAddress(addressFields);
        }

        setProfile(nextProfile);
        writeProfile(nextProfile);
        setEditingField(null);
        setSavedSection(field);
    }

    function savePasswordSection() {
        setPasswordError("");
        setForgotPasswordMessage("");

        if (!currentPassword.trim()) {
            setPasswordError("Please enter your current password.");
            return;
        }

        if (!newPassword.trim()) {
            setPasswordError("Please enter a new password.");
            return;
        }

        if (newPassword.length < 6) {
            setPasswordError("New password must be at least 6 characters.");
            return;
        }

        if (newPassword !== confirmNewPassword) {
            setPasswordError("New password and confirm password do not match.");
            return;
        }

        const result = updateCurrentUserPassword(currentPassword, newPassword);

        if (!result.ok) {
            setPasswordError(result.message);
            return;
        }

        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
        setEditingField(null);
        setSavedSection("password");
    }

    function handleForgotPasswordFromDashboard() {
        const currentUser = getCurrentUser();
        const emailToUse = profile.email || currentUser?.email || "";

        if (!emailToUse.trim()) {
            setForgotPasswordMessage("No email found for this account. Please add your email first.");
            return;
        }

        const result = requestPasswordReset(emailToUse);
        setForgotPasswordMessage(result.message);
        setPasswordError("");
    }

    function cancelSubscription() {
        const next = {
            ...profile,
            subscription: "none" as SubscriptionPlan,
            subscriptionUpdatedAt: "",
        };

        setProfile(next);
        setSubscription("pink");
        setSubscriptionText(subscriptionLabel("pink"));
        writeProfile(next);
        setSavedSection(null);
    }

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

    const hasActiveSubscription = profile.subscription !== "none";
    const subscriptionBenefitsList = useMemo(
        () => subscriptionBenefits(profile.subscription),
        [profile.subscription]
    );

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

                    <div className="mt-10 grid gap-6 xl:grid-cols-[1fr_1fr]">
                        <div className="rounded-[30px] border border-[#efc5d7] bg-white/80 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
                            <div className="text-xs uppercase tracking-[0.24em] text-black/45">
                                Your Details
                            </div>

                            <div className="mt-6 space-y-5">
                                <DetailCard
                                    label="Full Name"
                                    preview={fullNamePreview(parseFullName(profile.fullName))}
                                    isEditing={editingField === "fullName"}
                                    onEdit={() => startEditing("fullName")}
                                    saved={savedSection === "fullName"}
                                    editAriaLabel="Edit full name"
                                >
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <input
                                            value={nameFields.firstName}
                                            onChange={(e) =>
                                                updateNameField("firstName", e.target.value)
                                            }
                                            placeholder="First Name"
                                            className="w-full rounded-xl border border-[#efc5d7] bg-white px-4 py-3 text-sm text-black/85 outline-none focus:border-[#d86b98]"
                                        />
                                        <input
                                            value={nameFields.lastName}
                                            onChange={(e) =>
                                                updateNameField("lastName", e.target.value)
                                            }
                                            placeholder="Last Name"
                                            className="w-full rounded-xl border border-[#efc5d7] bg-white px-4 py-3 text-sm text-black/85 outline-none focus:border-[#d86b98]"
                                        />
                                    </div>

                                    <div className="mt-4 flex justify-end">
                                        <button
                                            type="button"
                                            onClick={() => saveSection("fullName")}
                                            className="rounded-full bg-[#ef5f9a] px-5 py-2.5 text-xs uppercase tracking-[0.18em] text-white transition hover:bg-[#de4d8b]"
                                        >
                                            Save Details
                                        </button>
                                    </div>
                                </DetailCard>

                                <DetailCard
                                    label="Username"
                                    preview={profile.username || "Not added"}
                                    isEditing={editingField === "username"}
                                    onEdit={() => startEditing("username")}
                                    saved={savedSection === "username"}
                                    editAriaLabel="Edit username"
                                >
                                    <input
                                        value={profile.username}
                                        onChange={(e) => update("username", e.target.value)}
                                        className="w-full rounded-xl border border-[#efc5d7] bg-white px-4 py-3 text-sm text-black/85 outline-none focus:border-[#d86b98]"
                                    />

                                    <div className="mt-4 flex justify-end">
                                        <button
                                            type="button"
                                            onClick={() => saveSection("username")}
                                            className="rounded-full bg-[#ef5f9a] px-5 py-2.5 text-xs uppercase tracking-[0.18em] text-white transition hover:bg-[#de4d8b]"
                                        >
                                            Save Details
                                        </button>
                                    </div>
                                </DetailCard>

                                <DetailCard
                                    label="Email"
                                    preview={profile.email || "Not added"}
                                    isEditing={editingField === "email"}
                                    onEdit={() => startEditing("email")}
                                    saved={savedSection === "email"}
                                    editAriaLabel="Edit email"
                                >
                                    <input
                                        value={profile.email}
                                        onChange={(e) => update("email", e.target.value)}
                                        className="w-full rounded-xl border border-[#efc5d7] bg-white px-4 py-3 text-sm text-black/85 outline-none focus:border-[#d86b98]"
                                    />

                                    <div className="mt-4 flex justify-end">
                                        <button
                                            type="button"
                                            onClick={() => saveSection("email")}
                                            className="rounded-full bg-[#ef5f9a] px-5 py-2.5 text-xs uppercase tracking-[0.18em] text-white transition hover:bg-[#de4d8b]"
                                        >
                                            Save Details
                                        </button>
                                    </div>
                                </DetailCard>

                                <DetailCard
                                    label="Phone"
                                    preview={profile.phone || "Not added"}
                                    isEditing={editingField === "phone"}
                                    onEdit={() => startEditing("phone")}
                                    saved={savedSection === "phone"}
                                    editAriaLabel="Edit phone"
                                >
                                    <input
                                        value={profile.phone}
                                        onChange={(e) => update("phone", e.target.value)}
                                        className="w-full rounded-xl border border-[#efc5d7] bg-white px-4 py-3 text-sm text-black/85 outline-none focus:border-[#d86b98]"
                                    />

                                    <div className="mt-4 flex justify-end">
                                        <button
                                            type="button"
                                            onClick={() => saveSection("phone")}
                                            className="rounded-full bg-[#ef5f9a] px-5 py-2.5 text-xs uppercase tracking-[0.18em] text-white transition hover:bg-[#de4d8b]"
                                        >
                                            Save Details
                                        </button>
                                    </div>
                                </DetailCard>

                                <DetailCard
                                    label="Address"
                                    preview={addressPreview(parseAddress(profile.address))}
                                    isEditing={editingField === "address"}
                                    onEdit={() => startEditing("address")}
                                    saved={savedSection === "address"}
                                    editAriaLabel="Edit address"
                                >
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <input
                                            value={addressFields.line1}
                                            onChange={(e) =>
                                                updateAddressField("line1", e.target.value)
                                            }
                                            placeholder="Address"
                                            className="w-full rounded-xl border border-[#efc5d7] bg-white px-4 py-3 text-sm text-black/85 outline-none focus:border-[#d86b98]"
                                        />
                                        <input
                                            value={addressFields.apartment}
                                            onChange={(e) =>
                                                updateAddressField("apartment", e.target.value)
                                            }
                                            placeholder="Apartment Number"
                                            className="w-full rounded-xl border border-[#efc5d7] bg-white px-4 py-3 text-sm text-black/85 outline-none focus:border-[#d86b98]"
                                        />
                                        <input
                                            value={addressFields.city}
                                            onChange={(e) =>
                                                updateAddressField("city", e.target.value)
                                            }
                                            placeholder="City"
                                            className="w-full rounded-xl border border-[#efc5d7] bg-white px-4 py-3 text-sm text-black/85 outline-none focus:border-[#d86b98]"
                                        />
                                        <select
                                            value={addressFields.state}
                                            onChange={(e) =>
                                                updateAddressField("state", e.target.value)
                                            }
                                            className="w-full rounded-xl border border-[#efc5d7] bg-white px-4 py-3 text-sm text-black/85 outline-none focus:border-[#d86b98]"
                                        >
                                            <option value="">Select state</option>
                                            {STATE_OPTIONS.map((state) => (
                                                <option key={state} value={state}>
                                                    {state}
                                                </option>
                                            ))}
                                        </select>
                                        <input
                                            value={addressFields.zipcode}
                                            onChange={(e) =>
                                                updateAddressField("zipcode", e.target.value)
                                            }
                                            placeholder="Zipcode"
                                            className="w-full rounded-xl border border-[#efc5d7] bg-white px-4 py-3 text-sm text-black/85 outline-none focus:border-[#d86b98]"
                                        />
                                        <select
                                            value={addressFields.country}
                                            onChange={(e) =>
                                                updateAddressField("country", e.target.value)
                                            }
                                            className="w-full rounded-xl border border-[#efc5d7] bg-white px-4 py-3 text-sm text-black/85 outline-none focus:border-[#d86b98]"
                                        >
                                            <option value="">Select country</option>
                                            {COUNTRY_OPTIONS.map((country) => (
                                                <option key={country} value={country}>
                                                    {country}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="mt-4 flex justify-end">
                                        <button
                                            type="button"
                                            onClick={() => saveSection("address")}
                                            className="rounded-full bg-[#ef5f9a] px-5 py-2.5 text-xs uppercase tracking-[0.18em] text-white transition hover:bg-[#de4d8b]"
                                        >
                                            Save Details
                                        </button>
                                    </div>
                                </DetailCard>

                                <DetailCard
                                    label="Password"
                                    preview="••••••••"
                                    isEditing={editingField === "password"}
                                    onEdit={() => startEditing("password")}
                                    saved={savedSection === "password"}
                                    editAriaLabel="Edit password"
                                >
                                    <div className="grid gap-4">
                                        <input
                                            type="password"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            placeholder="Current Password"
                                            className="w-full rounded-xl border border-[#efc5d7] bg-white px-4 py-3 text-sm text-black/85 outline-none focus:border-[#d86b98]"
                                        />
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="New Password"
                                            className="w-full rounded-xl border border-[#efc5d7] bg-white px-4 py-3 text-sm text-black/85 outline-none focus:border-[#d86b98]"
                                        />
                                        <input
                                            type="password"
                                            value={confirmNewPassword}
                                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                                            placeholder="Confirm New Password"
                                            className="w-full rounded-xl border border-[#efc5d7] bg-white px-4 py-3 text-sm text-black/85 outline-none focus:border-[#d86b98]"
                                        />
                                    </div>

                                    {passwordError ? (
                                        <p className="mt-4 text-sm text-[#cf4a6f]">{passwordError}</p>
                                    ) : null}

                                    {forgotPasswordMessage ? (
                                        <p className="mt-4 text-sm text-[#cf5b8d]">
                                            {forgotPasswordMessage}
                                        </p>
                                    ) : null}

                                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                                        <button
                                            type="button"
                                            onClick={handleForgotPasswordFromDashboard}
                                            className="text-sm font-medium text-[#cf5b8d] underline underline-offset-4"
                                        >
                                            Forgot password?
                                        </button>

                                        <button
                                            type="button"
                                            onClick={savePasswordSection}
                                            className="rounded-full bg-[#ef5f9a] px-5 py-2.5 text-xs uppercase tracking-[0.18em] text-white transition hover:bg-[#de4d8b]"
                                        >
                                            Save Password
                                        </button>
                                    </div>
                                </DetailCard>
                            </div>
                        </div>

                        <div className="rounded-[30px] border border-[#efc5d7] bg-white/80 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
                            <div className="text-xs uppercase tracking-[0.24em] text-black/45">
                                Subscription
                            </div>

                            <div className="mt-6">
                                <h2 className="text-2xl font-semibold text-black/80">
                                    {hasActiveSubscription
                                        ? subscriptionLabel(profile.subscription)
                                        : "No active subscription"}
                                </h2>

                                {profile.subscriptionUpdatedAt ? (
                                    <p className="mt-2 text-sm text-black/45">
                                        Updated on {profile.subscriptionUpdatedAt}
                                    </p>
                                ) : null}
                            </div>

                            <div className="mt-8">
                                <div className="text-xs uppercase tracking-[0.24em] text-black/45">
                                    Included Benefits
                                </div>

                                <ul className="mt-4 space-y-4">
                                    {subscriptionBenefitsList.map((benefit) => (
                                        <li
                                            key={benefit}
                                            className="flex items-start gap-3 text-base text-black/65"
                                        >
                                            <span className="mt-2 inline-block h-2.5 w-2.5 rounded-full bg-[#ef5f9a]" />
                                            <span>{benefit}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="mt-8 flex flex-wrap gap-4">
                                {!hasActiveSubscription ? (
                                    <a
                                        href="/subscriptions"
                                        className="rounded-full bg-[#ef5f9a] px-7 py-3 text-sm uppercase tracking-[0.22em] text-white transition hover:bg-[#de4d8b]"
                                    >
                                        Explore Subscriptions
                                    </a>
                                ) : (
                                    <>
                                        <a
                                            href="/subscriptions"
                                            className="rounded-full bg-[#ef5f9a] px-7 py-3 text-sm uppercase tracking-[0.22em] text-white transition hover:bg-[#de4d8b]"
                                        >
                                            Manage Subscription
                                        </a>

                                        <button
                                            type="button"
                                            onClick={cancelSubscription}
                                            className="rounded-full border border-[#efc5d7] bg-[#fff9fc] px-7 py-3 text-sm uppercase tracking-[0.22em] text-black/70 transition hover:bg-white"
                                        >
                                            Cancel Subscription
                                        </button>
                                    </>
                                )}
                            </div>
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

function DetailCard({
    label,
    preview,
    isEditing,
    onEdit,
    children,
    saved,
    editAriaLabel,
}: {
    label: string;
    preview: React.ReactNode;
    isEditing: boolean;
    onEdit: () => void;
    children?: React.ReactNode;
    saved?: boolean;
    editAriaLabel: string;
}) {
    return (
        <div className="rounded-[22px] border border-[#efc5d7] bg-[#fff9fc] p-4">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                    <div className="text-xs uppercase tracking-[0.22em] text-black/45">{label}</div>

                    {isEditing ? (
                        <div className="mt-4">{children}</div>
                    ) : (
                        <div className="mt-4">
                            <div className="text-base font-medium text-black/80">{preview}</div>
                            {saved ? (
                                <p className="mt-2 text-sm text-[#cf5b8d]">Saved successfully.</p>
                            ) : null}
                        </div>
                    )}
                </div>

                {!isEditing ? (
                    <button
                        type="button"
                        onClick={onEdit}
                        aria-label={editAriaLabel}
                        className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#efc5d7] bg-white text-black/55 transition hover:bg-[#ffdbe9] hover:text-black/80"
                    >
                        <EditIcon />
                    </button>
                ) : null}
            </div>
        </div>
    );
}