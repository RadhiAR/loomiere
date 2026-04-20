"use client";

import Link from "next/link";
import Image from "next/image";
import { FormEvent, useState } from "react";

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

export default function Footer() {
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [messageType, setMessageType] = useState<"success" | "error" | null>(null);

    async function onSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setSubmitting(true);
        setMessage(null);
        setMessageType(null);

        try {
            const form = e.currentTarget;
            const formData = new FormData(form);

            const payload = {
                name: String(formData.get("name") || "").trim(),
                email: String(formData.get("email") || "").trim(),
                phone: String(formData.get("phone") || "").trim(),
                query: String(formData.get("query") || "").trim(),
            };

            const res = await fetch("/api/contact", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json().catch(() => null);

            if (!res.ok) {
                throw new Error(data?.message || "Failed to submit contact request.");
            }

            form.reset();
            setMessage(data?.message || "Contact request submitted successfully.");
            setMessageType("success");
        } catch (error: any) {
            setMessage(error?.message || "Something went wrong. Please try again.");
            setMessageType("error");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <section className="relative bg-white px-6 pb-16 pt-4 md:px-10 md:pb-16 md:pt-6 lg:px-16">
            <div className="mx-auto max-w-[1400px] overflow-hidden rounded-[36px] border border-[#eadfe3] bg-[#fdf6f8] shadow-[0_20px_70px_rgba(0,0,0,0.05)]">
                <div className="px-6 pt-12 md:px-12 md:pt-14 lg:px-16 lg:pt-16">
                    <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
                        <div className="rounded-[32px] border border-[#efc5d7] bg-[#fdeff5] p-6 md:p-8">
                            <p className="mb-4 text-[11px] uppercase tracking-[0.34em] text-black/45">
                                Contact Loomi&egrave;re
                            </p>

                            <div className="space-y-4">
                                <p className="text-[18px] leading-8 text-black/80 md:text-[20px]">
                                    <span className="font-medium text-black">Email:</span>{" "}
                                    <a
                                        href="mailto:hello@loomiere.com"
                                        className="font-semibold text-black transition hover:text-[#d94b8f]"
                                    >
                                        hello@loomiere.com
                                    </a>
                                </p>

                                <p className="text-[18px] leading-8 text-black/80 md:text-[20px]">
                                    <span className="font-medium text-black">WhatsApp/Text:</span>{" "}
                                    <span className="font-semibold text-black">xxx-xxx-xxxx</span>
                                </p>

                                <p className="max-w-2xl text-[17px] leading-8 text-black/55">
                                    Feel free to email us or send a WhatsApp message anytime for
                                    product questions, custom requests, pricing, or timelines.
                                </p>
                            </div>

                            <form onSubmit={onSubmit} className="mt-8 grid gap-4">
                                <input
                                    name="name"
                                    type="text"
                                    required
                                    placeholder="Your name"
                                    className="w-full rounded-[24px] border border-[#efc5d7] bg-white px-6 py-4 text-[18px] text-black/80 outline-none placeholder:text-black/35 focus:border-[#d86b98]"
                                />

                                <input
                                    name="email"
                                    type="email"
                                    required
                                    placeholder="you@email.com"
                                    className="w-full rounded-[24px] border border-[#efc5d7] bg-white px-6 py-4 text-[18px] text-black/80 outline-none placeholder:text-black/35 focus:border-[#d86b98]"
                                />

                                <input
                                    name="phone"
                                    type="tel"
                                    required
                                    placeholder="(xxx) xxx-xxxx"
                                    className="w-full rounded-[24px] border border-[#efc5d7] bg-white px-6 py-4 text-[18px] text-black/80 outline-none placeholder:text-black/35 focus:border-[#d86b98]"
                                />

                                <textarea
                                    name="query"
                                    required
                                    rows={5}
                                    placeholder="Tell us what you’re looking for — product questions, custom requests, pricing, timeline, etc."
                                    className="w-full resize-none rounded-[24px] border border-[#efc5d7] bg-white px-6 py-5 text-[18px] leading-8 text-black/80 outline-none placeholder:text-black/35 focus:border-[#d86b98]"
                                />

                                {message ? (
                                    <div
                                        className={`rounded-[20px] border px-5 py-4 text-sm leading-7 ${messageType === "success"
                                                ? "border-[#efc5d7] bg-white text-black/75"
                                                : "border-[#efb7c6] bg-[#fff8fb] text-[#b24878]"
                                            }`}
                                    >
                                        {message}
                                    </div>
                                ) : null}

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-[#e64d97] px-8 py-4 text-[15px] font-medium uppercase tracking-[0.28em] text-white transition hover:bg-[#d93f8b] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {submitting ? "Submitting..." : "Submit"}
                                </button>
                            </form>
                        </div>

                        <div className="rounded-[32px] border border-[#efc5d7] bg-[#fdeff5] p-6 md:p-8">
                            <p className="mb-4 text-[11px] uppercase tracking-[0.34em] text-black/45">
                                Loomi&egrave;re
                            </p>

                            <h2 className="text-3xl font-light italic leading-tight text-black md:text-5xl">
                                Return Policy
                            </h2>

                            <p className="mt-6 text-[18px] leading-8 text-black/70">
                                Each Loomi&egrave;re piece is handmade with care. If something
                                arrives damaged or incorrect, contact us within 7 days and
                                we&rsquo;ll make it right.
                            </p>

                            <ul className="mt-8 list-disc space-y-5 pl-6 text-[18px] leading-8 text-black/70 marker:text-black/70">
                                <li>
                                    Returns accepted for damaged or incorrect items within 7 days.
                                </li>
                                <li>
                                    Custom orders are final sale unless the item arrives damaged.
                                </li>
                                <li>Shipping fees are non-refundable.</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="mt-12 border-t border-black/10 px-6 py-14 md:px-12 lg:px-16">
                    <div className="mb-12 max-w-3xl">
                        <p className="mb-3 text-[11px] uppercase tracking-[0.34em] text-black/45">
                            Soft Luxury, Handmade
                        </p>
                        <h2 className="text-3xl font-light leading-tight text-black md:text-4xl">
                            Crafted collections for fashion, home, pets, and everyday beauty.
                        </h2>
                    </div>

                    <div className="grid gap-12 md:grid-cols-2 xl:grid-cols-4">
                        {footerColumns.map((column) => (
                            <div key={column.title}>
                                <p className="mb-6 text-[11px] uppercase tracking-[0.28em] text-black/55">
                                    {column.title}
                                </p>

                                <div className="space-y-4">
                                    {column.links.map((link) => (
                                        <Link
                                            key={link.label}
                                            href={link.href}
                                            className="block text-[17px] font-light tracking-[0.01em] text-black/80 transition hover:text-black"
                                        >
                                            {link.label}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="px-6 py-8 md:px-12 lg:px-16">
                    <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
                        <div className="text-[15px] text-black/70">
                            Ship to: United States of America
                        </div>

                        <div className="flex flex-wrap gap-x-8 gap-y-3">
                            {footerBottomLinks.map((link) => (
                                <Link
                                    key={link.label}
                                    href={link.href}
                                    className="text-[15px] text-black/75 transition hover:text-black"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="mt-8 border-t border-black/10 pt-6 text-center">
                        <div className="mx-auto flex flex-col items-center justify-center">
                            <div className="relative h-[140px] w-[140px] md:h-[180px] md:w-[180px]">
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

                            <p className="mt-2 text-sm text-black/55">
                                © {new Date().getFullYear()} Loomèira. All rights reserved.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}