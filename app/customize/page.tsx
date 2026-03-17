"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import BackButton from "@/components/BackButton";

export default function CustomizePage() {
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [requestId, setRequestId] = useState<string | null>(null);

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setSubmitting(true);
        setMessage(null);
        setRequestId(null);

        try {
            const form = e.currentTarget;
            const formData = new FormData(form);

            const res = await fetch("/api/customize", {
                method: "POST",
                body: formData,
            });

            const data = await res.json().catch(() => null);

            if (!res.ok) {
                throw new Error(data?.message || "Request failed");
            }

            setMessage(
                "Your custom request was submitted successfully. Our team will review it and reach out shortly."
            );
            setRequestId(data?.requestId || null);
            form.reset();
        } catch (err: any) {
            setMessage(err?.message || "Something went wrong. Try again.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <main className="min-h-screen bg-[#fff4f8]">
            <div className="relative">
                <Navbar brand="LOOMIÈRE" theme="light" />
                <div className="fixed top-6 left-6 z-[9999] pointer-events-auto">
                    <BackButton theme="light" href="/" label="Home" />
                </div>
                <div className="h-24" />
            </div>

            <section className="mx-auto max-w-4xl px-6 py-14">
                <div className="text-center">
                    <div className="text-xs uppercase tracking-[0.22em] text-black/50">
                        LOOMIÈRE CUSTOM REQUESTS
                    </div>

                    <h1 className="mt-4 text-4xl font-light italic leading-tight text-black/90">
                        Customize Your Piece
                    </h1>

                    <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-black/70">
                        On this page, the user can upload a photo or write a description of a
                        product they want made. Any Loomière subscriber can review the request and
                        create the piece for them. Once submitted, a unique request ID is created
                        for tracking and the request details are emailed to the Loomière team.
                    </p>
                </div>

                <form
                    onSubmit={onSubmit}
                    className="mt-10 rounded-[28px] border border-[#f2cddd] bg-[#ffe9f2] p-6 shadow-xl"
                >
                    <div className="grid gap-6">
                        <div>
                            <label className="text-xs uppercase tracking-[0.18em] text-black/60">
                                Upload reference photo
                            </label>
                            <input
                                name="photo"
                                type="file"
                                accept="image/*"
                                className="mt-3 block w-full rounded-xl border border-[#efc5d7] bg-white p-3 text-sm"
                            />
                            <div className="mt-2 text-xs text-black/45">
                                JPG/PNG preferred. Upload a clear image if you already have a visual
                                reference.
                            </div>
                        </div>

                        <div>
                            <label className="text-xs uppercase tracking-[0.18em] text-black/60">
                                Product description
                            </label>
                            <textarea
                                name="description"
                                rows={5}
                                className="mt-2 w-full rounded-2xl border border-[#efc5d7] bg-white p-3 text-sm outline-none focus:border-[#d86b98]"
                                placeholder="Describe the product you want. Example: I want a soft pink crochet table runner with floral edge details, or a custom pet sweater for a small dog."
                            />
                            <div className="mt-2 text-xs text-black/45">
                                User can upload a photo, write a description, or do both.
                            </div>
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2">
                            <div>
                                <label className="text-xs uppercase tracking-[0.18em] text-black/60">
                                    First Name *
                                </label>
                                <input
                                    name="firstName"
                                    type="text"
                                    required
                                    className="mt-2 w-full rounded-xl border border-[#efc5d7] bg-white p-3 text-sm outline-none focus:border-[#d86b98]"
                                    placeholder="First name"
                                />
                            </div>

                            <div>
                                <label className="text-xs uppercase tracking-[0.18em] text-black/60">
                                    Last Name *
                                </label>
                                <input
                                    name="lastName"
                                    type="text"
                                    required
                                    className="mt-2 w-full rounded-xl border border-[#efc5d7] bg-white p-3 text-sm outline-none focus:border-[#d86b98]"
                                    placeholder="Last name"
                                />
                            </div>

                            <div>
                                <label className="text-xs uppercase tracking-[0.18em] text-black/60">
                                    Email *
                                </label>
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    className="mt-2 w-full rounded-xl border border-[#efc5d7] bg-white p-3 text-sm outline-none focus:border-[#d86b98]"
                                    placeholder="you@email.com"
                                />
                            </div>

                            <div>
                                <label className="text-xs uppercase tracking-[0.18em] text-black/60">
                                    Phone Number *
                                </label>
                                <input
                                    name="phone"
                                    type="tel"
                                    required
                                    className="mt-2 w-full rounded-xl border border-[#efc5d7] bg-white p-3 text-sm outline-none focus:border-[#d86b98]"
                                    placeholder="(xxx) xxx-xxxx"
                                />
                            </div>

                            <div>
                                <label className="text-xs uppercase tracking-[0.18em] text-black/60">
                                    Zipcode *
                                </label>
                                <input
                                    name="zipcode"
                                    type="text"
                                    inputMode="numeric"
                                    required
                                    className="mt-2 w-full rounded-xl border border-[#efc5d7] bg-white p-3 text-sm outline-none focus:border-[#d86b98]"
                                    placeholder="78701"
                                />
                            </div>

                            <div>
                                <label className="text-xs uppercase tracking-[0.18em] text-black/60">
                                    Product Type
                                </label>
                                <input
                                    name="productType"
                                    type="text"
                                    className="mt-2 w-full rounded-xl border border-[#efc5d7] bg-white p-3 text-sm outline-none focus:border-[#d86b98]"
                                    placeholder="Example: Home decor, pet wear, apparel"
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <label className="text-xs uppercase tracking-[0.18em] text-black/60">
                                    Measurements (optional)
                                </label>
                                <textarea
                                    name="measurements"
                                    rows={4}
                                    className="mt-2 w-full rounded-2xl border border-[#efc5d7] bg-white p-3 text-sm outline-none focus:border-[#d86b98]"
                                    placeholder="Bust, waist, hip, product dimensions, pet size, room dimensions, or any custom sizing notes"
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <label className="text-xs uppercase tracking-[0.18em] text-black/60">
                                    Extra notes
                                </label>
                                <textarea
                                    name="notes"
                                    rows={4}
                                    className="mt-2 w-full rounded-2xl border border-[#efc5d7] bg-white p-3 text-sm outline-none focus:border-[#d86b98]"
                                    placeholder="Any timeline, color preference, yarn preference, or special request"
                                />
                            </div>
                        </div>

                        {message && (
                            <div className="rounded-2xl border border-[#efc5d7] bg-white/80 p-4 text-sm text-black/70">
                                <div>{message}</div>
                                {requestId ? (
                                    <div className="mt-2 font-medium text-black/85">
                                        Request ID: {requestId}
                                    </div>
                                ) : null}
                            </div>
                        )}

                        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                            <a
                                href="/shop"
                                className="inline-flex items-center justify-center rounded-full border border-[#efc5d7] bg-white/70 px-6 py-3 text-xs uppercase tracking-[0.18em] text-black/70 transition hover:bg-white"
                            >
                                Cancel
                            </a>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="inline-flex items-center justify-center rounded-full bg-[#ef5f9a] px-6 py-3 text-xs uppercase tracking-[0.18em] text-white transition hover:bg-[#de4d8b] disabled:opacity-60"
                            >
                                {submitting ? "Submitting..." : "Submit Request"}
                            </button>
                        </div>
                    </div>
                </form>
            </section>
        </main>
    );
}
