"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import BackButton from "@/components/BackButton";
import type { SubscriptionPlan } from "@/lib/profile";

const plans = [
    {
        key: "aura" as SubscriptionPlan,
        name: "Aura",
        billing: "Monthly",
        price: "$29.99",
        originalPrice: "$99.99",
        description: "Perfect for emerging creators starting their journey on Loomeira.",
        benefits: [
            "Eligible for up to  category-matched customer request tickets per year.",
            "Access to Loomeira Learning with AI-generated craft plans.",
            "Basic creator dashboard to track uploads and activity.",
            "Standard product visibility across marketplace.",
            "Upload and sell handmade products.",
            "Community access to Milan chat.",
            "Cancellation allowed within first 30 days with full refund.",
        ],
    },
    {
        key: "velour" as SubscriptionPlan,
        name: "Velour",
        billing: "Quarterly",
        price: "$49.99",
        description: "For growing creators who want more visibility and opportunities.",
        benefits: [
            "Eligible for up to 79 category-matched customer request tickets per year.",
            "Priority ticket assignment within selected categories.",
            "Enhanced creator dashboard with performance insights.",
            "Improved product visibility and occasional featured placement.",
            "Access to Loomeira Learning + AI planner + calendar tracking.",
            "Stronger presence in Milan creator network.",
            "7 day free trial with full refund policy.",
        ],
    },
    {
        key: "elite" as SubscriptionPlan,
        name: "Élite",
        billing: "Annually",
        price: "$129.99",
        description: "Designed for top creators ready to scale their handmade brand.",
        benefits: [
            "Eligible for up to 99 category-matched customer request tickets per year.",
            "Highest priority ticket assignment across categories.",
            "Premium creator badge with top visibility.",
            "Advanced analytics dashboard for growth tracking.",
            "Early access to new Loomeira features and tools.",
            "Priority support and faster request handling.",
            "Exclusive access to premium learning content & workshops.",
        ],
    },
];

export default function SubscriptionsPage() {
    return (
        <main className="min-h-screen bg-[#fff4f8]">
            <div className="relative">
                <Navbar brand="LOOMIÈRE" theme="light" />
                <div className="fixed top-6 left-6 z-[9999] pointer-events-auto">
                    <BackButton theme="light" href="/" label="Home" />
                </div>
                <div className="h-24" />
            </div>

            <section className="mx-auto max-w-7xl px-6 py-12">
                <h1 className="text-4xl font-light italic text-black/90">Subscriptions</h1>
                <p className="mt-3 text-sm text-black/60">
                    Choose your Loomeira creator plan and unlock opportunities to grow, learn, and sell.
                </p>

                <div className="mt-10 grid gap-6 md:grid-cols-3">
                    {plans.map((plan) => (
                        <div
                            key={plan.key}
                            className="rounded-[28px] border border-[#f2cddd] bg-[#ffe9f2] p-7 shadow-sm"
                        >
                            <div className="text-xs uppercase tracking-[0.22em] text-black/50">
                                {plan.billing}
                            </div>

                            <h2 className="mt-3 text-3xl font-light italic text-black/90">
                                {plan.name}
                            </h2>

                            <div className="mt-4 flex items-end gap-3">
                                <div className="text-2xl font-semibold text-black/85">
                                    {plan.price}
                                </div>

                                {"originalPrice" in plan && plan.originalPrice ? (
                                    <div className="text-sm text-black/40 line-through">
                                        {plan.originalPrice}
                                    </div>
                                ) : null}
                            </div>

                            <p className="mt-4 text-sm leading-6 text-black/60">
                                {plan.description}
                            </p>

                            <div className="mt-6">
                                <div className="text-xs uppercase tracking-[0.18em] text-black/45">
                                    Benefits
                                </div>

                                <ul className="mt-3 space-y-3 text-sm leading-6 text-black/70">
                                    {plan.benefits.map((benefit) => (
                                        <li key={benefit} className="flex gap-3">
                                            <span className="mt-[7px] inline-block h-1.5 w-1.5 rounded-full bg-[#ef5f9a]" />
                                            <span>{benefit}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <Link
                                href={`/subscriptions/checkout?plan=${plan.key}`}
                                className="mt-8 inline-flex rounded-full bg-[#ef5f9a] px-6 py-3 text-xs uppercase tracking-[0.18em] text-white transition hover:bg-[#de4d8b]"
                            >
                                Choose Plan
                            </Link>
                        </div>
                    ))}
                </div>
            </section>
        </main>
    );
}