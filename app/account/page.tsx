"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import BackButton from "@/components/BackButton";
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

function EditIcon() {
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
        >
            <path
                d="M4 20h4l10.5-10.5a2.12 2.12 0 0 0-4-4L4 16v4Z"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M13.5 6.5l4 4"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
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

export default function AccountPage() {
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
        const storedProfile = readProfile();
        setProfile(storedProfile);
        setNameFields(parseFullName(storedProfile.fullName));
        setAddressFields(parseAddress(storedProfile.address));
    }, []);

    function update<K extends keyof typeof profile>(key: K, value: (typeof profile)[K]) {
        setProfile((p) => ({ ...p, [key]: value }));
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
        const nextName = { ...nameFields, [key]: value };
        setNameFields(nextName);
        setProfile((p) => ({
            ...p,
            fullName: formatFullName(nextName),
        }));
        setSavedSection(null);
    }

    function updateAddressField<K extends keyof AddressFields>(
        key: K,
        value: AddressFields[K]
    ) {
        const nextAddress = { ...addressFields, [key]: value };
        setAddressFields(nextAddress);
        setProfile((p) => ({
            ...p,
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

    function handleForgotPasswordFromAccount() {
        const currentUser = getCurrentUser();
        const emailToUse = profile.email || currentUser?.email || "";

        if (!emailToUse.trim()) {
            setForgotPasswordMessage(
                "No email found for this account. Please add your email first."
            );
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
        writeProfile(next);
        setSavedSection(null);
    }

    const hasActiveSubscription = profile.subscription !== "none";

    return (
        <main className="min-h-screen bg-[#fff4f8]">
            <div className="relative">
                <Navbar brand="LOOMIÈRE" theme="light" />
                <div className="fixed top-6 left-6 z-[9999] pointer-events-auto">
                    <BackButton theme="light" href="/" label="Home" />
                </div>
                <div className="h-24" />
            </div>

            <section className="mx-auto max-w-6xl px-6 py-12">
                <div className="mt-10 grid gap-10 md:grid-cols-2">
                    <div className="rounded-2xl border border-[#f2cddd] bg-[#ffe9f2] p-6 shadow-sm">
                        <div className="text-xs uppercase tracking-[0.22em] text-black/50">
                            Your Details
                        </div>

                        <div className="mt-5 space-y-5">
                            <div className="rounded-2xl border border-[#f2cddd] bg-white/55 px-4 py-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0 flex-1">
                                        <div className="text-xs uppercase tracking-[0.18em] text-black/50">
                                            Full Name
                                        </div>

                                        {editingField === "fullName" ? (
                                            <>
                                                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                                    <div>
                                                        <label className="mb-1 block text-xs uppercase tracking-[0.16em] text-black/45">
                                                            First Name
                                                        </label>
                                                        <input
                                                            autoFocus
                                                            value={nameFields.firstName}
                                                            onChange={(e) =>
                                                                updateNameField(
                                                                    "firstName",
                                                                    e.target.value
                                                                )
                                                            }
                                                            className="w-full rounded-xl border border-[#efc5d7] bg-white px-4 py-3 text-sm text-black/85 outline-none focus:border-[#d86b98]"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="mb-1 block text-xs uppercase tracking-[0.16em] text-black/45">
                                                            Last Name
                                                        </label>
                                                        <input
                                                            value={nameFields.lastName}
                                                            onChange={(e) =>
                                                                updateNameField(
                                                                    "lastName",
                                                                    e.target.value
                                                                )
                                                            }
                                                            className="w-full rounded-xl border border-[#efc5d7] bg-white px-4 py-3 text-sm text-black/85 outline-none focus:border-[#d86b98]"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="mt-4">
                                                    <button
                                                        type="button"
                                                        onClick={() => saveSection("fullName")}
                                                        className="rounded-full bg-[#ef5f9a] px-5 py-2.5 text-xs uppercase tracking-[0.18em] text-white transition hover:bg-[#de4d8b]"
                                                    >
                                                        Save Details
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="mt-3 text-sm text-black/85">
                                                    {fullNamePreview(parseFullName(profile.fullName))}
                                                </div>

                                                {savedSection === "fullName" && (
                                                    <div className="mt-3 text-sm text-black/60">
                                                        Saved successfully.
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => startEditing("fullName")}
                                        className="mt-1 inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#efc5d7] bg-white/70 text-black/60 transition hover:bg-[#ffdbe9] hover:text-black/80"
                                        aria-label="Edit full name"
                                    >
                                        <EditIcon />
                                    </button>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-[#f2cddd] bg-white/55 px-4 py-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0 flex-1">
                                        <div className="text-xs uppercase tracking-[0.18em] text-black/50">
                                            Username
                                        </div>

                                        {editingField === "username" ? (
                                            <>
                                                <input
                                                    autoFocus
                                                    value={profile.username}
                                                    onChange={(e) => update("username", e.target.value)}
                                                    className="mt-3 w-full rounded-xl border border-[#efc5d7] bg-white px-4 py-3 text-sm text-black/85 outline-none focus:border-[#d86b98]"
                                                />

                                                <div className="mt-4">
                                                    <button
                                                        type="button"
                                                        onClick={() => saveSection("username")}
                                                        className="rounded-full bg-[#ef5f9a] px-5 py-2.5 text-xs uppercase tracking-[0.18em] text-white transition hover:bg-[#de4d8b]"
                                                    >
                                                        Save Details
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="mt-3 text-sm text-black/85">
                                                    {profile.username || "Not added"}
                                                </div>

                                                {savedSection === "username" && (
                                                    <div className="mt-3 text-sm text-black/60">
                                                        Saved successfully.
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => startEditing("username")}
                                        className="mt-1 inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#efc5d7] bg-white/70 text-black/60 transition hover:bg-[#ffdbe9] hover:text-black/80"
                                        aria-label="Edit username"
                                    >
                                        <EditIcon />
                                    </button>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-[#f2cddd] bg-white/55 px-4 py-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0 flex-1">
                                        <div className="text-xs uppercase tracking-[0.18em] text-black/50">
                                            Email
                                        </div>

                                        {editingField === "email" ? (
                                            <>
                                                <input
                                                    autoFocus
                                                    type="email"
                                                    value={profile.email}
                                                    onChange={(e) => update("email", e.target.value)}
                                                    className="mt-3 w-full rounded-xl border border-[#efc5d7] bg-white px-4 py-3 text-sm text-black/85 outline-none focus:border-[#d86b98]"
                                                />

                                                <div className="mt-4">
                                                    <button
                                                        type="button"
                                                        onClick={() => saveSection("email")}
                                                        className="rounded-full bg-[#ef5f9a] px-5 py-2.5 text-xs uppercase tracking-[0.18em] text-white transition hover:bg-[#de4d8b]"
                                                    >
                                                        Save Details
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="mt-3 text-sm text-black/85">
                                                    {profile.email || "Not added"}
                                                </div>

                                                {savedSection === "email" && (
                                                    <div className="mt-3 text-sm text-black/60">
                                                        Saved successfully.
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => startEditing("email")}
                                        className="mt-1 inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#efc5d7] bg-white/70 text-black/60 transition hover:bg-[#ffdbe9] hover:text-black/80"
                                        aria-label="Edit email"
                                    >
                                        <EditIcon />
                                    </button>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-[#f2cddd] bg-white/55 px-4 py-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0 flex-1">
                                        <div className="text-xs uppercase tracking-[0.18em] text-black/50">
                                            Phone
                                        </div>

                                        {editingField === "phone" ? (
                                            <>
                                                <input
                                                    autoFocus
                                                    value={profile.phone}
                                                    onChange={(e) => update("phone", e.target.value)}
                                                    className="mt-3 w-full rounded-xl border border-[#efc5d7] bg-white px-4 py-3 text-sm text-black/85 outline-none focus:border-[#d86b98]"
                                                />

                                                <div className="mt-4">
                                                    <button
                                                        type="button"
                                                        onClick={() => saveSection("phone")}
                                                        className="rounded-full bg-[#ef5f9a] px-5 py-2.5 text-xs uppercase tracking-[0.18em] text-white transition hover:bg-[#de4d8b]"
                                                    >
                                                        Save Details
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="mt-3 text-sm text-black/85">
                                                    {profile.phone || "Not added"}
                                                </div>

                                                {savedSection === "phone" && (
                                                    <div className="mt-3 text-sm text-black/60">
                                                        Saved successfully.
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => startEditing("phone")}
                                        className="mt-1 inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#efc5d7] bg-white/70 text-black/60 transition hover:bg-[#ffdbe9] hover:text-black/80"
                                        aria-label="Edit phone"
                                    >
                                        <EditIcon />
                                    </button>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-[#f2cddd] bg-white/55 px-4 py-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0 flex-1">
                                        <div className="text-xs uppercase tracking-[0.18em] text-black/50">
                                            Address
                                        </div>

                                        {editingField === "address" ? (
                                            <>
                                                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                                    <div className="sm:col-span-2">
                                                        <label className="mb-1 block text-xs uppercase tracking-[0.16em] text-black/45">
                                                            Address
                                                        </label>
                                                        <input
                                                            autoFocus
                                                            value={addressFields.line1}
                                                            onChange={(e) =>
                                                                updateAddressField(
                                                                    "line1",
                                                                    e.target.value
                                                                )
                                                            }
                                                            className="w-full rounded-xl border border-[#efc5d7] bg-white px-4 py-3 text-sm text-black/85 outline-none focus:border-[#d86b98]"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="mb-1 block text-xs uppercase tracking-[0.16em] text-black/45">
                                                            Apartment Number
                                                        </label>
                                                        <input
                                                            value={addressFields.apartment}
                                                            onChange={(e) =>
                                                                updateAddressField(
                                                                    "apartment",
                                                                    e.target.value
                                                                )
                                                            }
                                                            className="w-full rounded-xl border border-[#efc5d7] bg-white px-4 py-3 text-sm text-black/85 outline-none focus:border-[#d86b98]"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="mb-1 block text-xs uppercase tracking-[0.16em] text-black/45">
                                                            City
                                                        </label>
                                                        <input
                                                            value={addressFields.city}
                                                            onChange={(e) =>
                                                                updateAddressField(
                                                                    "city",
                                                                    e.target.value
                                                                )
                                                            }
                                                            className="w-full rounded-xl border border-[#efc5d7] bg-white px-4 py-3 text-sm text-black/85 outline-none focus:border-[#d86b98]"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="mb-1 block text-xs uppercase tracking-[0.16em] text-black/45">
                                                            State
                                                        </label>
                                                        <select
                                                            value={addressFields.state}
                                                            onChange={(e) =>
                                                                updateAddressField(
                                                                    "state",
                                                                    e.target.value
                                                                )
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
                                                    </div>

                                                    <div>
                                                        <label className="mb-1 block text-xs uppercase tracking-[0.16em] text-black/45">
                                                            Zipcode
                                                        </label>
                                                        <input
                                                            value={addressFields.zipcode}
                                                            onChange={(e) =>
                                                                updateAddressField(
                                                                    "zipcode",
                                                                    e.target.value
                                                                )
                                                            }
                                                            className="w-full rounded-xl border border-[#efc5d7] bg-white px-4 py-3 text-sm text-black/85 outline-none focus:border-[#d86b98]"
                                                        />
                                                    </div>

                                                    <div className="sm:col-span-2">
                                                        <label className="mb-1 block text-xs uppercase tracking-[0.16em] text-black/45">
                                                            Country
                                                        </label>
                                                        <select
                                                            value={addressFields.country}
                                                            onChange={(e) =>
                                                                updateAddressField(
                                                                    "country",
                                                                    e.target.value
                                                                )
                                                            }
                                                            className="w-full rounded-xl border border-[#efc5d7] bg-white px-4 py-3 text-sm text-black/85 outline-none focus:border-[#d86b98]"
                                                        >
                                                            <option value="">Select country</option>
                                                            {COUNTRY_OPTIONS.map((country) => (
                                                                <option
                                                                    key={country}
                                                                    value={country}
                                                                >
                                                                    {country}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>

                                                <div className="mt-4">
                                                    <button
                                                        type="button"
                                                        onClick={() => saveSection("address")}
                                                        className="rounded-full bg-[#ef5f9a] px-5 py-2.5 text-xs uppercase tracking-[0.18em] text-white transition hover:bg-[#de4d8b]"
                                                    >
                                                        Save Details
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="mt-3 text-sm text-black/85">
                                                    {addressPreview(parseAddress(profile.address))}
                                                </div>

                                                {savedSection === "address" && (
                                                    <div className="mt-3 text-sm text-black/60">
                                                        Saved successfully.
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => startEditing("address")}
                                        className="mt-1 inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#efc5d7] bg-white/70 text-black/60 transition hover:bg-[#ffdbe9] hover:text-black/80"
                                        aria-label="Edit address"
                                    >
                                        <EditIcon />
                                    </button>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-[#f2cddd] bg-white/55 px-4 py-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0 flex-1">
                                        <div className="text-xs uppercase tracking-[0.18em] text-black/50">
                                            Password
                                        </div>

                                        {editingField === "password" ? (
                                            <>
                                                <div className="mt-3 grid gap-3">
                                                    <div>
                                                        <label className="mb-1 block text-xs uppercase tracking-[0.16em] text-black/45">
                                                            Current Password
                                                        </label>
                                                        <input
                                                            autoFocus
                                                            type="password"
                                                            value={currentPassword}
                                                            onChange={(e) =>
                                                                setCurrentPassword(e.target.value)
                                                            }
                                                            className="w-full rounded-xl border border-[#efc5d7] bg-white px-4 py-3 text-sm text-black/85 outline-none focus:border-[#d86b98]"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="mb-1 block text-xs uppercase tracking-[0.16em] text-black/45">
                                                            New Password
                                                        </label>
                                                        <input
                                                            type="password"
                                                            value={newPassword}
                                                            onChange={(e) =>
                                                                setNewPassword(e.target.value)
                                                            }
                                                            className="w-full rounded-xl border border-[#efc5d7] bg-white px-4 py-3 text-sm text-black/85 outline-none focus:border-[#d86b98]"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="mb-1 block text-xs uppercase tracking-[0.16em] text-black/45">
                                                            Confirm New Password
                                                        </label>
                                                        <input
                                                            type="password"
                                                            value={confirmNewPassword}
                                                            onChange={(e) =>
                                                                setConfirmNewPassword(e.target.value)
                                                            }
                                                            className="w-full rounded-xl border border-[#efc5d7] bg-white px-4 py-3 text-sm text-black/85 outline-none focus:border-[#d86b98]"
                                                        />
                                                    </div>
                                                </div>

                                                {passwordError ? (
                                                    <div className="mt-3 text-sm text-[#c8487d]">
                                                        {passwordError}
                                                    </div>
                                                ) : null}

                                                {forgotPasswordMessage ? (
                                                    <div className="mt-3 text-sm text-black/60">
                                                        {forgotPasswordMessage}
                                                    </div>
                                                ) : null}

                                                <div className="mt-4 flex flex-wrap items-center gap-3">
                                                    <button
                                                        type="button"
                                                        onClick={savePasswordSection}
                                                        className="rounded-full bg-[#ef5f9a] px-5 py-2.5 text-xs uppercase tracking-[0.18em] text-white transition hover:bg-[#de4d8b]"
                                                    >
                                                        Save Password
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={handleForgotPasswordFromAccount}
                                                        className="text-sm text-black/55 underline underline-offset-4"
                                                    >
                                                        Forgot password?
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="mt-3 text-sm text-black/85">
                                                    ••••••••
                                                </div>

                                                {savedSection === "password" && (
                                                    <div className="mt-3 text-sm text-black/60">
                                                        Password updated successfully.
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => startEditing("password")}
                                        className="mt-1 inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#efc5d7] bg-white/70 text-black/60 transition hover:bg-[#ffdbe9] hover:text-black/80"
                                        aria-label="Edit password"
                                    >
                                        <EditIcon />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-[#f2cddd] bg-[#ffe9f2] p-6 shadow-sm">
                        <div className="text-xs uppercase tracking-[0.22em] text-black/50">
                            Subscription
                        </div>

                        <div className="mt-5">
                            <div className="text-lg font-medium text-black/85">
                                {subscriptionLabel(profile.subscription)}
                            </div>

                            {profile.subscriptionUpdatedAt && hasActiveSubscription ? (
                                <div className="mt-2 text-sm text-black/55">
                                    Activated on{" "}
                                    {new Date(
                                        profile.subscriptionUpdatedAt
                                    ).toLocaleDateString()}
                                </div>
                            ) : null}

                            <div className="mt-6">
                                <div className="text-xs uppercase tracking-[0.18em] text-black/45">
                                    Included Benefits
                                </div>

                                <ul className="mt-3 space-y-3 text-sm leading-6 text-black/70">
                                    {subscriptionBenefits(profile.subscription).map((benefit) => (
                                        <li key={benefit} className="flex gap-3">
                                            <span className="mt-[7px] inline-block h-1.5 w-1.5 rounded-full bg-[#ef5f9a]" />
                                            <span>{benefit}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="mt-6 flex flex-wrap gap-3">
                                {hasActiveSubscription ? (
                                    <>
                                        <Link
                                            href="/subscriptions"
                                            className="rounded-full border border-[#efc5d7] bg-white/65 px-5 py-2 text-xs uppercase tracking-[0.18em] text-black/70 transition hover:bg-[#ffdbe9]"
                                        >
                                            Modify
                                        </Link>

                                        <button
                                            onClick={cancelSubscription}
                                            className="rounded-full border border-[#efc5d7] bg-white/65 px-5 py-2 text-xs uppercase tracking-[0.18em] text-black/70 transition hover:bg-[#ffdbe9]"
                                        >
                                            Cancel Subscription
                                        </button>
                                    </>
                                ) : (
                                    <Link
                                        href="/subscriptions"
                                        className="rounded-full bg-[#ef5f9a] px-5 py-2 text-xs uppercase tracking-[0.18em] text-white transition hover:bg-[#de4d8b]"
                                    >
                                        Explore Subscriptions
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
