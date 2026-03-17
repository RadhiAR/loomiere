"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import BackButton from "@/components/BackButton";
import type { SubscriptionPlan } from "@/lib/profile";

const plans = [
    {
        key: "pink" as SubscriptionPlan,
        name: "Pink",
        billing: "Annually",
        price: "$99.99",
        originalPrice: "$129.99",
        description: "Best value for year-round Loomière access.",
        benefits: [
            "1 month free trial allowed.",
            "Then $99.99 if subscribed for one year.",
            "Original price: $129.99.",
            "Cancellation allowed within first 30 days of payment with a full refund.",
            "After first month, 80% will be refunded.",
            "User can sell up to 300 products annually.",
        ],
    },
    {
        key: "silver" as SubscriptionPlan,
        name: "Silver",
        billing: "Quarterly",
        price: "$39.99",
        description: "Flexible seasonal membership plan.",
        benefits: [
            "7 day free trial allowed.",
            "Then $39.99 if subscribed quarterly.",
            "Cancellation allowed within first 7 days of payment with a full refund.",
            "User can sell up to 70 products every quarter.",
        ],
    },
    {
        key: "bronze" as SubscriptionPlan,
        name: "Bronze",
        billing: "Monthly",
        price: "$19.99",
        description: "Simple monthly access to member benefits.",
        benefits: [
            "3 day free trial allowed.",
            "Then $19.99 if subscribed monthly.",
            "Cancellation allowed within first 3 days of payment with a full refund.",
            "User can sell up to 30 products every month.",
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
                    Choose the Loomière plan that fits your lifestyle.
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