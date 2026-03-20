"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import BackButton from "@/components/BackButton";
import { trackRequestId } from "@/lib/custom-request-tracker";

export default function CustomizePage() {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    async function onSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setSubmitting(true);
        setMessage(null);

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

            const requestId = data?.requestId || "";

            if (requestId) {
                trackRequestId(requestId);
            }

            form.reset();

            router.push(
                requestId
                    ? `/customize/requests?submitted=${encodeURIComponent(requestId)}`
                    : "/customize/requests"
            );
        } catch (err: any) {
            setMessage(err?.message || "Something went wrong. Try again.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <main className="min-h-screen bg-[#f9eff4] text-black">
            <section className="mx-auto max-w-[1400px] px-4 pb-16 pt-6 sm:px-6 lg:px-8">
                <div className="pointer-events-none absolute inset-x-0 top-6 z-20 flex items-start justify-between px-4 sm:px-6 lg:px-8">
                    <div className="pointer-events-auto">
                        <BackButton href="/" label="Home" theme="light" />
                    </div>
                    <div className="pointer-events-auto">
                        <Navbar theme="light" />
                    </div>
                </div>

                <div className="mx-auto max-w-4xl pt-28">
                    <div className="mb-8 text-center">
                        <div className="text-xs uppercase tracking-[0.35em] text-black/45">
                            LOOMIÈRE CUSTOM REQUESTS
                        </div>
                        <h1 className="mt-4 text-4xl italic tracking-tight sm:text-5xl">
                            Customize Your Piece
                        </h1>
                        <p className="mx-auto mt-4 max-w-3xl text-base leading-8 text-black/65">
                            Upload a photo or describe the piece you want made. Once submitted,
                            a unique request ID is created for tracking and your request is sent
                            to the Loomière team.
                        </p>
                    </div>

                    <form
                        onSubmit={onSubmit}
                        className="rounded-[32px] border border-[#efc5d7] bg-white/80 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.06)] sm:p-8"
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
                                    className="mt-2 w-full rounded-2xl border border-[#efc5d7] bg-white p-3 text-sm outline-none file:mr-4 file:rounded-full file:border-0 file:bg-[#ef5f9a] file:px-4 file:py-2 file:text-white"
                                />
                                <div className="mt-2 text-xs text-black/45">
                                    JPG/PNG preferred. Upload a clear image if you already have a visual reference.
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
                                    placeholder="Describe what you want made..."
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

                            {message ? (
                                <div className="rounded-2xl border border-[#efc5d7] bg-white/80 p-4 text-sm text-black/70">
                                    {message}
                                </div>
                            ) : null}

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
                </div>
            </section>
        </main>
    );
}