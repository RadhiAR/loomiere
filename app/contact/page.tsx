"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";

export default function ContactPage() {
    const [submitted, setSubmitted] = useState(false);

    function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setSubmitted(true);
        e.currentTarget.reset();
    }

    return (
        <main className="min-h-screen bg-[#fff4f8]">
            <div className="relative">
                <Navbar brand="LOOMIÈRE" theme="light" />
                <div className="h-24" />
            </div>

            <section className="mx-auto max-w-4xl px-6 py-10">
                <div className="text-center">
                    <div className="text-xs uppercase tracking-[0.22em] text-black/55">
                        LOOMIÈRE
                    </div>

                    <h1 className="mt-4 text-4xl font-light italic text-black/90">
                        Contact
                    </h1>

                    <p className="mt-4 text-sm leading-7 text-black/70">
                        Have a question or a custom request? Submit the form below. We
                        usually respond within <span className="font-semibold">48 hours</span>.
                        If you don’t hear back, feel free to submit another request.
                    </p>

                    <div className="mt-8 rounded-[28px] border border-[#f2cddd] bg-[#ffe9f2] p-6 shadow-sm">
                        <div className="text-sm leading-7 text-black/85">
                            <div className="font-semibold">Contact Loomière</div>
                            <div className="mt-2">
                                Email: <span className="font-semibold">hello@loomiere.com</span>
                            </div>
                            <div className="mt-1">
                                WhatsApp/Text: <span className="font-semibold">xxx-xxx-xxxx</span>
                            </div>
                            <div className="mt-2 text-xs text-black/60">
                                Feel free to email us or send a WhatsApp message anytime.
                            </div>
                        </div>
                    </div>
                </div>

                <form
                    onSubmit={onSubmit}
                    className="mt-10 rounded-[28px] border border-[#f2cddd] bg-[#ffe9f2] p-8 shadow-xl"
                >
                    <div className="grid gap-6 md:grid-cols-2">
                        <div>
                            <label className="text-xs uppercase tracking-[0.18em] text-black/60">
                                Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                required
                                className="mt-2 w-full rounded-xl border border-[#efc5d7] bg-white p-3 text-sm outline-none focus:border-[#d86b98]"
                                placeholder="Your name"
                            />
                        </div>

                        <div>
                            <label className="text-xs uppercase tracking-[0.18em] text-black/60">
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                required
                                className="mt-2 w-full rounded-xl border border-[#efc5d7] bg-white p-3 text-sm outline-none focus:border-[#d86b98]"
                                placeholder="you@email.com"
                            />
                        </div>

                        <div>
                            <label className="text-xs uppercase tracking-[0.18em] text-black/60">
                                Contact Number
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                required
                                className="mt-2 w-full rounded-xl border border-[#efc5d7] bg-white p-3 text-sm outline-none focus:border-[#d86b98]"
                                placeholder="(xxx) xxx-xxxx"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="text-xs uppercase tracking-[0.18em] text-black/60">
                                Your Query
                            </label>
                            <textarea
                                name="query"
                                required
                                rows={6}
                                className="mt-2 w-full rounded-xl border border-[#efc5d7] bg-white p-3 text-sm outline-none focus:border-[#d86b98]"
                                placeholder="Tell us what you’re looking for — product questions, custom requests, pricing, timeline, etc."
                            />
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end">
                        <button
                            type="submit"
                            className="inline-flex items-center justify-center rounded-full bg-[#e84a93] px-7 py-3 text-xs uppercase tracking-[0.18em] text-white transition hover:bg-[#d63c7f]"
                        >
                            Submit
                        </button>
                    </div>

                    {submitted && (
                        <div className="mt-6 rounded-xl border border-[#efc5d7] bg-white/80 p-4 text-sm text-black/75">
                            Submitted! We typically respond within{" "}
                            <span className="font-semibold">48 hours</span>. If you don’t hear
                            back, feel free to submit another request.
                        </div>
                    )}
                </form>
            </section>

            <section className="pb-14">
                <div className="mx-auto max-w-6xl px-6 text-center text-sm text-black/65">
                    © {new Date().getFullYear()} Loomière by RADHIKA ADDANKI. All rights reserved.
                </div>
            </section>
        </main>
    );
}
