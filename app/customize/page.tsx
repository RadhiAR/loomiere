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
        <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#fff1f7] via-[#ffe6f1] to-[#ffd8eb] text-black">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-[#ff9fc7]/20 blur-3xl" />
                <div className="absolute right-[-60px] top-16 h-80 w-80 rounded-full bg-[#f06aa5]/20 blur-3xl" />
                <div className="absolute bottom-[-80px] left-1/3 h-96 w-96 rounded-full bg-[#ffc2da]/25 blur-3xl" />

                <div className="absolute left-[8%] top-[18%] h-24 w-24 rounded-full border border-white/40" />
                <div className="absolute right-[12%] top-[26%] h-16 w-16 rotate-12 rounded-[28px] border border-[#f3a8c7]/50" />
                <div className="absolute bottom-[18%] left-[10%] h-20 w-20 rounded-full border border-[#f3a8c7]/40" />
                <div className="absolute bottom-[24%] right-[14%] h-28 w-28 rounded-[32px] border border-white/40" />

                <svg
                    className="absolute left-[6%] top-[34%] h-10 w-10 text-[#f291bb]/30"
                    viewBox="0 0 100 100"
                    fill="currentColor"
                >
                    <path d="M50 88S8 62 8 32c0-12 10-22 22-22 9 0 16 5 20 12 4-7 11-12 20-12 12 0 22 10 22 22 0 30-42 56-42 56Z" />
                </svg>

                <svg
                    className="absolute right-[20%] bottom-[18%] h-12 w-12 text-[#ea6ea7]/25"
                    viewBox="0 0 100 100"
                    fill="currentColor"
                >
                    <path d="M50 88S8 62 8 32c0-12 10-22 22-22 9 0 16 5 20 12 4-7 11-12 20-12 12 0 22 10 22 22 0 30-42 56-42 56Z" />
                </svg>
            </div>

            <section className="relative mx-auto max-w-[1400px] px-4 pb-16 pt-6 sm:px-6 lg:px-8">
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
                            LOOMEIRA CUSTOM REQUESTS
                        </div>

                        <h1 className="mt-4 text-4xl italic tracking-tight sm:text-5xl lg:text-6xl">
                            Customize Your Item With the Loomeira Team
                        </h1>

                        <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-black/65 sm:text-lg">
                            Upload your required or desired photographs here along with the
                            necessary details, and let our talented Loomeira team customize your
                            product and bring your dream piece to life. Once submitted, a
                            confirmation email will be sent to your email address. A Loomeira
                            member will reach out shortly if there are any questions, and your
                            work will begin with an estimated delivery date.
                        </p>
                    </div>

                    <form
                        onSubmit={onSubmit}
                        className="rounded-[32px] border border-[#efc5d7] bg-white/75 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur-md sm:p-8"
                    >
                        <div className="grid gap-6">
                            <div>
                                <label className="text-xs uppercase tracking-[0.18em] text-black/60">
                                    Upload Reference Photos
                                </label>
                                <input
                                    name="photo"
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="mt-2 w-full rounded-2xl border border-[#efc5d7] bg-white p-3 text-sm outline-none file:mr-4 file:rounded-full file:border-0 file:bg-[#ef5f9a] file:px-4 file:py-2 file:text-white"
                                />
                                <div className="mt-2 text-xs text-black/45">
                                    JPG/PNG preferred. Multiple photo uploads are allowed. Upload
                                    clear images if you already have visual references.
                                </div>
                            </div>

                            <div>
                                <label className="text-xs uppercase tracking-[0.18em] text-black/60">
                                    Product Description
                                </label>
                                <textarea
                                    name="description"
                                    rows={5}
                                    className="mt-2 w-full rounded-2xl border border-[#efc5d7] bg-white p-3 text-sm outline-none focus:border-[#d86b98]"
                                    placeholder="Describe what you want made..."
                                />
                                <div className="mt-2 text-xs text-black/45">
                                    You can upload photographs, write a description, or do both.
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
                                        Measurements (Optional)
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
                                        Extra Notes
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
                                <div className="rounded-2xl border border-[#efc5d7] bg-white/85 p-4 text-sm text-black/70">
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