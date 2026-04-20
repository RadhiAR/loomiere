"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import RecentCollectionSection from "@/components/RecentCollectionSection";
import Footer from "@/app/footer";
import { supabase } from "@/lib/supabase";

type StoredUser = {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    username: string;
    password: string;
    createdAt: string;
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

const USERS_KEY = "loomiere_auth_users_v1";
const ADMIN_USERS_KEY = "loomiere_admin_users_v1";

const categoryCards = [
    {
        label: "Apparel",
        href: "/shop/apparel",
        description: "Soft silhouettes, scarves, dresses, and statement knitwear.",
        image: "/landing-apparel.jpg",
    },
    {
        label: "Home",
        href: "/shop/home",
        description: "Handcrafted décor pieces designed to warm your living spaces.",
        image: "/landing-home.jpg",
    },
    {
        label: "Pet",
        href: "/shop/pet",
        description: "Comfortable handmade styles and accessories for your companion.",
        image: "/landing-pet.jpg",
    },
    {
        label: "Jewellery",
        href: "/shop/jewellery",
        description: "Delicate finishing touches with a timeless handcrafted spirit.",
        image: "/landing-jewellery.jpg",
    },
];

function readStoredArray<T>(key: string): T[] {
    if (typeof window === "undefined") return [];

    try {
        const raw = window.localStorage.getItem(key);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

export default function HomePage() {
    const [userCount, setUserCount] = useState(0);
    const [adminCount, setAdminCount] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [messageType, setMessageType] = useState<"success" | "error" | null>(null);

    useEffect(() => {
        const refreshCounts = async () => {
            const users = readStoredArray<StoredUser>(USERS_KEY);
            const admins = readStoredArray<StoredAdminUser>(ADMIN_USERS_KEY);

            const shopperRows = users.map((user) => ({
                id: user.id,
                role: "shopper",
                first_name: user.firstName?.trim() || null,
                last_name: user.lastName?.trim() || null,
                phone: user.phone?.trim() || null,
                email: user.email?.trim().toLowerCase() || null,
                username: user.username?.trim() || null,
                created_at: user.createdAt || new Date().toISOString(),
            }));

            const adminRows = admins.map((admin) => ({
                id: admin.id,
                role: "admin",
                first_name: admin.firstName?.trim() || null,
                last_name: admin.lastName?.trim() || null,
                phone: null,
                email: admin.email?.trim().toLowerCase() || null,
                username: admin.username?.trim() || null,
                created_at: admin.createdAt || new Date().toISOString(),
            }));

            const rowsToSync = [...shopperRows, ...adminRows];

            if (rowsToSync.length > 0) {
                await supabase.from("community_users").upsert(rowsToSync, {
                    onConflict: "id",
                });
            }

            const { count: shopperCount, error: shopperError } = await supabase
                .from("community_users")
                .select("*", { count: "exact", head: true })
                .eq("role", "shopper");

            const { count: adminUserCount, error: adminError } = await supabase
                .from("community_users")
                .select("*", { count: "exact", head: true })
                .eq("role", "admin");

            if (shopperError || adminError) {
                setUserCount(users.length);
                setAdminCount(admins.length);
                return;
            }

            setUserCount(shopperCount || 0);
            setAdminCount(adminUserCount || 0);
        };

        refreshCounts();

        const handleRefresh = () => {
            refreshCounts();
        };

        window.addEventListener("storage", handleRefresh);
        window.addEventListener("focus", handleRefresh);
        window.addEventListener("loomiere-auth-changed", handleRefresh as EventListener);
        window.addEventListener("loomiere-admin-changed", handleRefresh as EventListener);

        return () => {
            window.removeEventListener("storage", handleRefresh);
            window.removeEventListener("focus", handleRefresh);
            window.removeEventListener("loomiere-auth-changed", handleRefresh as EventListener);
            window.removeEventListener("loomiere-admin-changed", handleRefresh as EventListener);
        };
    }, []);

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
        <main className="relative min-h-screen bg-white text-[#2f2928]">
            <Navbar brand="LMRA" theme="dark" />

            <Hero
                brandName="LMRA"
                headline={"Exclusive\nHandcrafted,\nCollection"}
                tagline="Elegance in every design"
                ctaText="Shop Now"
                ctaHref="#new-arrivals"
                secondaryCtaText="Know Loomeira"
                secondaryCtaHref="/about"
                heroImageUrl="/hero.jpg"
            />

            <section className="bg-white px-6 pb-4 pt-14 md:px-10 md:pb-4 md:pt-20 lg:px-16">
                <div className="mx-auto max-w-[1400px] overflow-hidden rounded-[36px] border border-[#eadfe3] bg-[#fdf6f8] px-6 py-10 shadow-[0_20px_70px_rgba(0,0,0,0.05)] md:px-10 md:py-14 lg:px-12">
                    <div className="mb-10 text-center">
                        <p className="mb-4 text-[11px] uppercase tracking-[0.42em] text-[#a77f8d]">
                            Shop by Category
                        </p>

                        <h2 className="mx-auto max-w-4xl text-3xl font-light leading-[1.15] text-[#2f2928] md:text-5xl">
                            Explore each collection through a softer, more luxurious lens.
                        </h2>

                        <p className="mx-auto mt-5 max-w-3xl text-[15px] leading-8 text-[#6f615f] md:text-[16px]">
                            Discover handcrafted apparel, elegant home décor, charming pet
                            essentials, and jewellery designed with a refined Loomeira touch.
                        </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                        {categoryCards.map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                className="group relative min-h-[420px] overflow-hidden rounded-[28px] border border-white/50 shadow-[0_18px_50px_rgba(157,100,116,0.12)] transition duration-300 hover:-translate-y-1"
                            >
                                <div
                                    className="absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-105"
                                    style={{ backgroundImage: `url(${item.image})` }}
                                />
                                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(34,24,27,0.08)_0%,rgba(34,24,27,0.28)_45%,rgba(20,12,16,0.62)_100%)]" />

                                <div className="relative z-10 flex h-full flex-col justify-end p-6 text-white md:p-7">
                                    <p className="mb-3 text-[11px] uppercase tracking-[0.34em] text-white/80">
                                        Collection
                                    </p>

                                    <h3 className="text-3xl font-light tracking-[0.01em]">
                                        {item.label}
                                    </h3>

                                    <p className="mt-3 max-w-[280px] text-[15px] leading-7 text-white/88">
                                        {item.description}
                                    </p>

                                    <span className="mt-6 inline-flex w-fit items-center rounded-full border border-white/60 bg-white/10 px-5 py-2 text-[12px] uppercase tracking-[0.28em] text-white backdrop-blur-sm transition group-hover:bg-white/18">
                                        Explore
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-white px-6 pb-10 pt-2 md:px-10 md:pb-12 lg:px-16">
                <div className="mx-auto max-w-[1400px] overflow-hidden rounded-[40px] border border-[#e9c9da] bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.95),rgba(255,245,251,0.92)_22%,rgba(252,225,242,0.88)_45%,rgba(238,222,255,0.88)_72%,rgba(255,238,247,0.95)_100%)] px-6 py-10 shadow-[0_24px_80px_rgba(226,128,177,0.18)] md:px-10 md:py-14 lg:px-12">
                    <div className="relative overflow-hidden rounded-[32px] border border-white/45 bg-[linear-gradient(135deg,rgba(255,244,250,0.72),rgba(255,235,245,0.58),rgba(244,233,255,0.62))] px-4 py-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] md:px-8 md:py-10">
                        <div className="pointer-events-none absolute inset-0">
                            <div className="absolute left-[6%] top-[10%] h-24 w-24 rounded-full bg-white/30 blur-2xl" />
                            <div className="absolute right-[8%] top-[14%] h-28 w-28 rounded-full bg-[#f2d4ff]/40 blur-3xl" />
                            <div className="absolute bottom-[8%] left-[15%] h-24 w-24 rounded-full bg-[#ffd7ec]/40 blur-3xl" />
                            <div className="absolute bottom-[10%] right-[12%] h-24 w-24 rounded-full bg-white/30 blur-2xl" />

                            <div className="absolute left-[8%] top-[18%] text-[22px] text-white/80">✦</div>
                            <div className="absolute left-[18%] top-[30%] text-[14px] text-[#f08db8]/80">✦</div>
                            <div className="absolute right-[14%] top-[18%] text-[20px] text-white/80">✦</div>
                            <div className="absolute right-[22%] top-[58%] text-[16px] text-[#b57ee6]/80">✦</div>
                            <div className="absolute left-[24%] bottom-[22%] text-[18px] text-[#f08db8]/80">✦</div>
                            <div className="absolute right-[10%] bottom-[16%] text-[22px] text-white/70">✦</div>

                            <div className="absolute inset-x-0 bottom-0 h-32 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.3),transparent_70%)]" />
                        </div>

                        <div className="relative z-10 text-center">
                            <p className="mb-3 text-[11px] uppercase tracking-[0.34em] text-[#b06d8e]">
                                Loomeira Community
                            </p>

                            <h2 className="mx-auto max-w-4xl text-3xl font-light leading-[1.18] text-[#2f2928] md:text-5xl">
                                A growing circle of creators, shoppers, and subscriber admins.
                            </h2>

                            <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-8 text-[#6f615f]">
                                See how many user profiles and admin subscriber accounts have been
                                created in Loomeira.
                            </p>

                            <div className="mx-auto mt-7 flex max-w-[260px] items-center justify-center gap-4 text-[#d887ad]">
                                <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[#e6aac8] to-[#e6aac8]" />
                                <span className="text-xl">✦</span>
                                <span className="h-px flex-1 bg-gradient-to-l from-transparent via-[#d9b4ff] to-[#d9b4ff]" />
                            </div>
                        </div>

                        <div className="relative z-10 mt-10 grid gap-6 md:grid-cols-2">
                            <div className="group relative overflow-hidden rounded-[30px] border border-[#f0bfd7] bg-[linear-gradient(180deg,rgba(255,255,255,0.78),rgba(255,245,250,0.7))] px-6 py-8 text-center shadow-[0_18px_45px_rgba(231,121,171,0.16)] backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_55px_rgba(231,121,171,0.22)]">
                                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.55),transparent_42%)]" />
                                <div className="pointer-events-none absolute right-6 top-6 text-[#ee8fb8]">✦</div>
                                <div className="pointer-events-none absolute left-8 bottom-10 text-[#ee8fb8]">✦</div>

                                <div className="relative z-10 mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#f2a8ca] bg-[linear-gradient(135deg,#f7bad5,#ea72a8)] text-3xl text-white shadow-[0_10px_30px_rgba(230,77,151,0.28)]">
                                    ♛
                                </div>

                                <p className="mt-5 text-[11px] uppercase tracking-[0.32em] text-[#bf6f93]">
                                    Admin Users
                                </p>

                                <div className="mt-4 text-5xl font-light text-[#d83f8f] drop-shadow-[0_10px_22px_rgba(232,104,161,0.28)] md:text-6xl">
                                    {adminCount}
                                </div>

                                <p className="mx-auto mt-3 max-w-md text-[15px] leading-7 text-[#6f615f]">
                                    Subscriber admin accounts registered for managing products and
                                    platform activity.
                                </p>
                            </div>

                            <div className="group relative overflow-hidden rounded-[30px] border border-[#d9c2ff] bg-[linear-gradient(180deg,rgba(255,255,255,0.78),rgba(248,243,255,0.72))] px-6 py-8 text-center shadow-[0_18px_45px_rgba(171,127,233,0.16)] backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_55px_rgba(171,127,233,0.22)]">
                                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.55),transparent_42%)]" />
                                <div className="pointer-events-none absolute right-8 top-10 text-[#a67be4]">✦</div>
                                <div className="pointer-events-none absolute left-10 bottom-10 text-[#a67be4]">✦</div>

                                <div className="relative z-10 mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#c7aaf3] bg-[linear-gradient(135deg,#d8c5ff,#9d6be8)] text-3xl text-white shadow-[0_10px_30px_rgba(157,107,232,0.28)]">
                                    ✿
                                </div>

                                <p className="mt-5 text-[11px] uppercase tracking-[0.32em] text-[#8d65d0]">
                                    Normal Users
                                </p>

                                <div className="mt-4 text-5xl font-light text-[#8e49dd] drop-shadow-[0_10px_22px_rgba(157,107,232,0.28)] md:text-6xl">
                                    {userCount}
                                </div>

                                <p className="mx-auto mt-3 max-w-md text-[15px] leading-7 text-[#6f615f]">
                                    Shopper accounts created for browsing, ordering, and engaging
                                    with the Loomeira experience.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section
                id="new-arrivals"
                className="bg-white px-6 pb-12 pt-8 md:px-10 md:pb-14 md:pt-10 lg:px-16"
            >
                <div className="mx-auto max-w-[1400px]">
                    <div className="mb-8 text-center">
                        <p className="mb-3 text-[11px] uppercase tracking-[0.38em] text-[#ad8a93]">
                            New Arrivals
                        </p>
                        <h2 className="text-3xl font-light text-[#2f2928] md:text-4xl">
                            Newly added pieces from the latest collection
                        </h2>
                        <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-8 text-[#6f615f]">
                            A flowing edit of recent uploads, presented with a lighter, more
                            editorial feel while keeping your current product functionality
                            unchanged.
                        </p>
                    </div>

                    <div className="overflow-hidden rounded-[36px] border border-[#eadfe3] bg-[#fdf6f8] shadow-[0_20px_70px_rgba(0,0,0,0.05)]">
                        <div className="bg-[#fdf6f8]">
                            <RecentCollectionSection />
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-white px-6 pb-4 pt-2 md:px-10 md:pb-6 lg:px-16">
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
                                        <span className="font-medium text-black">
                                            WhatsApp/Text:
                                        </span>{" "}
                                        <span className="font-semibold text-black">
                                            xxx-xxx-xxxx
                                        </span>
                                    </p>

                                    <p className="max-w-2xl text-[17px] leading-8 text-black/55">
                                        Feel free to email us or send a WhatsApp message anytime
                                        for product questions, custom requests, pricing, or
                                        timelines.
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
                                        Returns accepted for damaged or incorrect items within 7
                                        days.
                                    </li>
                                    <li>
                                        Custom orders are final sale unless the item arrives
                                        damaged.
                                    </li>
                                    <li>Shipping fees are non-refundable.</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="px-6 pb-12 pt-10 md:px-12 lg:px-16" />
                </div>
            </section>

            <Footer />
        </main>
    );
}