"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import BackButton from "@/components/BackButton";
import {
    defaultProfile,
    readProfile,
    writeProfile,
    type SubscriptionPlan,
} from "@/lib/profile";

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

const PLAN_DETAILS: Record<
    Exclude<SubscriptionPlan, "none">,
    {
        name: string;
        billing: string;
        price: string;
        trial: string;
        refund: string;
        products: string;
    }
> = {
    pink: {
        name: "Pink",
        billing: "Annual",
        price: "$99.99",
        trial: "1 month free trial",
        refund: "Full refund within first 30 days of payment. After first month, 80% refunded.",
        products: "Sell up to 300 products annually",
    },
    silver: {
        name: "Silver",
        billing: "Quarterly",
        price: "$39.99",
        trial: "7 day free trial",
        refund: "Full refund within first 7 days of payment",
        products: "Sell up to 70 products every quarter",
    },
    bronze: {
        name: "Bronze",
        billing: "Monthly",
        price: "$19.99",
        trial: "3 day free trial",
        refund: "Full refund within first 3 days of payment",
        products: "Sell up to 30 products every month",
    },
};

function parseFullName(fullName: string): NameFields {
    const cleaned = fullName.trim();
    if (!cleaned) return { firstName: "", lastName: "" };

    const parts = cleaned.split(/\s+/);
    return {
        firstName: parts[0] || "",
        lastName: parts.slice(1).join(" "),
    };
}

function formatFullName(name: NameFields) {
    return [name.firstName.trim(), name.lastName.trim()].filter(Boolean).join(" ");
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

    const structured = {
        line1: getValue("Address:"),
        apartment: getValue("Apartment:"),
        city: getValue("City:"),
        state: getValue("State:"),
        zipcode: getValue("Zipcode:"),
        country: getValue("Country:"),
    };

    if (Object.values(structured).some(Boolean)) {
        return structured;
    }

    return {
        line1: address,
        apartment: "",
        city: "",
        state: "",
        zipcode: "",
        country: "",
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

export default function SubscriptionCheckoutPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const rawPlan = searchParams.get("plan") as SubscriptionPlan | null;
    const selectedPlan =
        rawPlan === "pink" || rawPlan === "silver" || rawPlan === "bronze"
            ? rawPlan
            : "bronze";

    const plan = useMemo(() => PLAN_DETAILS[selectedPlan], [selectedPlan]);

    const [nameFields, setNameFields] = useState<NameFields>({
        firstName: "",
        lastName: "",
    });

    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [addressFields, setAddressFields] = useState<AddressFields>({
        line1: "",
        apartment: "",
        city: "",
        state: "",
        zipcode: "",
        country: "",
    });

    const [cardName, setCardName] = useState("");
    const [cardNumber, setCardNumber] = useState("");
    const [expiry, setExpiry] = useState("");
    const [cvv, setCvv] = useState("");
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        const profile = readProfile();
        const parsedName = parseFullName(profile.fullName);
        const parsedAddress = parseAddress(profile.address);

        setNameFields(parsedName);
        setEmail(profile.email);
        setPhone(profile.phone);
        setAddressFields(parsedAddress);
        setCardName(profile.fullName || `${parsedName.firstName} ${parsedName.lastName}`.trim());
    }, []);

    function submitPayment() {
        const fullName = formatFullName(nameFields).trim();
        const fullAddress = formatAddress(addressFields);

        if (!fullName || !email || !phone || !addressFields.line1 || !addressFields.city || !addressFields.state || !addressFields.zipcode || !addressFields.country) {
            alert("Please complete all required contact details.");
            return;
        }

        if (!cardName || !cardNumber || !expiry || !cvv) {
            alert("Please complete the payment details.");
            return;
        }

        setProcessing(true);

        const current = readProfile();

        const nextProfile = {
            ...defaultProfile,
            ...current,
            fullName,
            email,
            phone,
            address: fullAddress,
            subscription: selectedPlan,
            subscriptionUpdatedAt: new Date().toISOString(),
        };

        writeProfile(nextProfile);

        window.setTimeout(() => {
            router.push("/account");
        }, 800);
    }

    return (
        <main className="min-h-screen bg-[#fff4f8]">
            <div className="relative">
                <Navbar brand="LOOMIÈRE" theme="light" />
                <div className="fixed top-6 left-6 z-[9999] pointer-events-auto">
                    <BackButton theme="light" href="/subscriptions" label="Back" />
                </div>
                <div className="h-24" />
            </div>

            <section className="mx-auto max-w-7xl px-6 py-12">
                <h1 className="text-4xl font-light italic text-black/90">
                    Contact & Payment
                </h1>
                <p className="mt-3 text-sm text-black/60">
                    Complete your contact details and payment to activate your subscription.
                </p>

                <div className="mt-10 grid gap-8 lg:grid-cols-[1.35fr_0.85fr]">
                    <div className="rounded-[28px] border border-[#f2cddd] bg-[#ffe9f2] p-7 shadow-sm">
                        <div className="text-xs uppercase tracking-[0.22em] text-black/50">
                            Contact Details
                        </div>

                        <div className="mt-5 grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="mb-1 block text-xs uppercase tracking-[0.16em] text-black/45">
                                    First Name
                                </label>
                                <input
                                    value={nameFields.firstName}
                                    onChange={(e) =>
                                        setNameFields((p) => ({ ...p, firstName: e.target.value }))
                                    }
                                    className="w-full rounded-xl border border-[#efc5d7] bg-white px-4 py-3 text-sm outline-none focus:border-[#d86b98]"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-xs uppercase tracking-[0.16em] text-black/45">
                                    Last Name
                                </label>
                                <input
                                    value={nameFields.lastName}
                                    onChange={(e) =>
                                        setNameFields((p) => ({ ...p, lastName: e.target.value }))
                                    }
                                    className="w-full rounded-xl border border-[#efc5d7] bg-white px-4 py-3 text-sm outline-none focus:border-[#d86b98]"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-xs uppercase tracking-[0.16em] text-black/45">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full rounded-xl border border-[#efc5d7] bg-white px-4 py-3 text-sm outline-none focus:border-[#d86b98]"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-xs uppercase tracking-[0.16em] text-black/45">
                                    Phone
                                </label>
                                <input
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full rounded-xl border border-[#efc5d7] bg-white px-4 py-3 text-sm outline-none focus:border-[#d86b98]"
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <label className="mb-1 block text-xs uppercase tracking-[0.16em] text-black/45">
                                    Address
                                </label>
                                <input
                                    value={addressFields.line1}
                                    onChange={(e) =>
                                        setAddressFields((p) => ({ ...p, line1: e.target.value }))
                                    }
                                    className="w-full rounded-xl border border-[#efc5d7] bg-white px-4 py-3 text-sm outline-none focus:border-[#d86b98]"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-xs uppercase tracking-[0.16em] text-black/45">
                                    Apartment Number
                                </label>
                                <input
                                    value={addressFields.apartment}
                                    onChange={(e) =>
                                        setAddressFields((p) => ({ ...p, apartment: e.target.value }))
                                    }
                                    className="w-full rounded-xl border border-[#efc5d7] bg-white px-4 py-3 text-sm outline-none focus:border-[#d86b98]"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-xs uppercase tracking-[0.16em] text-black/45">
                                    City
                                </label>
                                <input
                                    value={addressFields.city}
                                    onChange={(e) =>
                                        setAddressFields((p) => ({ ...p, city: e.target.value }))
                                    }
                                    className="w-full rounded-xl border border-[#efc5d7] bg-white px-4 py-3 text-sm outline-none focus:border-[#d86b98]"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-xs uppercase tracking-[0.16em] text-black/45">
                                    State
                                </label>
                                <select
                                    value={addressFields.state}
                                    onChange={(e) =>
                                        setAddressFields((p) => ({ ...p, state: e.target.value }))
                                    }
                                    className="w-full rounded-xl border border-[#efc5d7] bg-white px-4 py-3 text-sm outline-none focus:border-[#d86b98]"
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
                                        setAddressFields((p) => ({ ...p, zipcode: e.target.value }))
                                    }
                                    className="w-full rounded-xl border border-[#efc5d7] bg-white px-4 py-3 text-sm outline-none focus:border-[#d86b98]"
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <label className="mb-1 block text-xs uppercase tracking-[0.16em] text-black/45">
                                    Country
                                </label>
                                <select
                                    value={addressFields.country}
                                    onChange={(e) =>
                                        setAddressFields((p) => ({ ...p, country: e.target.value }))
                                    }
                                    className="w-full rounded-xl border border-[#efc5d7] bg-white px-4 py-3 text-sm outline-none focus:border-[#d86b98]"
                                >
                                    <option value="">Select country</option>
                                    {COUNTRY_OPTIONS.map((country) => (
                                        <option key={country} value={country}>
                                            {country}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="mt-8 border-t border-[#f2cddd] pt-6">
                            <div className="text-xs uppercase tracking-[0.22em] text-black/50">
                                Payment Details
                            </div>

                            <div className="mt-5 grid gap-4 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                    <label className="mb-1 block text-xs uppercase tracking-[0.16em] text-black/45">
                                        Name on Card
                                    </label>
                                    <input
                                        value={cardName}
                                        onChange={(e) => setCardName(e.target.value)}
                                        className="w-full rounded-xl border border-[#efc5d7] bg-white px-4 py-3 text-sm outline-none focus:border-[#d86b98]"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="mb-1 block text-xs uppercase tracking-[0.16em] text-black/45">
                                        Card Number
                                    </label>
                                    <input
                                        value={cardNumber}
                                        onChange={(e) => setCardNumber(e.target.value)}
                                        placeholder="1234 5678 9012 3456"
                                        className="w-full rounded-xl border border-[#efc5d7] bg-white px-4 py-3 text-sm outline-none focus:border-[#d86b98]"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block text-xs uppercase tracking-[0.16em] text-black/45">
                                        Expiry
                                    </label>
                                    <input
                                        value={expiry}
                                        onChange={(e) => setExpiry(e.target.value)}
                                        placeholder="MM/YY"
                                        className="w-full rounded-xl border border-[#efc5d7] bg-white px-4 py-3 text-sm outline-none focus:border-[#d86b98]"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block text-xs uppercase tracking-[0.16em] text-black/45">
                                        CVV
                                    </label>
                                    <input
                                        value={cvv}
                                        onChange={(e) => setCvv(e.target.value)}
                                        placeholder="123"
                                        className="w-full rounded-xl border border-[#efc5d7] bg-white px-4 py-3 text-sm outline-none focus:border-[#d86b98]"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="h-fit rounded-[28px] border border-[#f2cddd] bg-[#ffe9f2] p-7 shadow-sm">
                        <div className="text-xs uppercase tracking-[0.22em] text-black/50">
                            Plan Summary
                        </div>

                        <h2 className="mt-3 text-3xl font-light italic text-black/90">
                            {plan.name}
                        </h2>

                        <div className="mt-3 text-xl font-semibold text-black/85">
                            {plan.price}
                        </div>

                        <div className="mt-6 space-y-4 text-sm leading-6 text-black/70">
                            <div>
                                <div className="text-xs uppercase tracking-[0.16em] text-black/45">
                                    Billing
                                </div>
                                <div>{plan.billing}</div>
                            </div>

                            <div>
                                <div className="text-xs uppercase tracking-[0.16em] text-black/45">
                                    Trial
                                </div>
                                <div>{plan.trial}</div>
                            </div>

                            <div>
                                <div className="text-xs uppercase tracking-[0.16em] text-black/45">
                                    Refund Policy
                                </div>
                                <div>{plan.refund}</div>
                            </div>

                            <div>
                                <div className="text-xs uppercase tracking-[0.16em] text-black/45">
                                    Product Limit
                                </div>
                                <div>{plan.products}</div>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={submitPayment}
                            disabled={processing}
                            className="mt-8 w-full rounded-full bg-[#ef5f9a] px-6 py-3 text-xs uppercase tracking-[0.18em] text-white transition hover:bg-[#de4d8b] disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {processing ? "Processing..." : "Submit Payment"}
                        </button>

                        <p className="mt-4 text-xs leading-5 text-black/45">
                            This is a demo payment step. For real payment collection, connect Stripe
                            or another payment gateway later.
                        </p>
                    </div>
                </div>
            </section>
        </main>
    );
}