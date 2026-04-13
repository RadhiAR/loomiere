"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import BackButton from "@/components/BackButton";
import { readAdminKey } from "@/lib/admin-session";

const categories = [
    { label: "home decor", value: "home" },
    { label: "pets", value: "pet" },
    { label: "jewellery", value: "jewellery" },
    { label: "apparel", value: "apparel" },
];

const discountTypes = ["amount", "percentage"];
const ADMIN_PRODUCT_USAGE_KEY = "loomiere_admin_product_upload_counts_v1";

function getCategoryRedirect(category: string) {
    switch (category) {
        case "home":
            return "/shop/home";
        case "pet":
            return "/shop/pet";
        case "jewellery":
            return "/shop/jewellery";
        case "apparel":
            return "/shop/apparel";
        default:
            return "/shop";
    }
}

function incrementAdminUsageCount() {
    if (typeof window === "undefined") return;

    const currentAdminId = readAdminKey();
    if (!currentAdminId) return;

    try {
        const raw = window.localStorage.getItem(ADMIN_PRODUCT_USAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : {};
        const next = parsed && typeof parsed === "object" ? parsed : {};

        next[currentAdminId] = Number(next[currentAdminId] || 0) + 1;
        window.localStorage.setItem(ADMIN_PRODUCT_USAGE_KEY, JSON.stringify(next));
    } catch {
        window.localStorage.setItem(
            ADMIN_PRODUCT_USAGE_KEY,
            JSON.stringify({
                [currentAdminId]: 1,
            })
        );
    }
}

export default function UploadProductsPage() {
    const router = useRouter();

    const [files, setFiles] = useState<FileList | null>(null);
    const [form, setForm] = useState({
        name: "",
        description: "",
        category: "",
        price: "",
        ready_to_ship_date: "",
        discount_value: "",
        discount_type: "",
        is_lmra_request_product: "",
        lmra_request_id: "",
    });

    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!form.name.trim()) {
            alert("Product name is required");
            return;
        }

        if (!form.description.trim()) {
            alert("Description is required");
            return;
        }

        if (form.description.length > 200) {
            alert("Description must be 200 characters or less");
            return;
        }

        if (!form.category) {
            alert("Please choose a category");
            return;
        }

        if (!form.price) {
            alert("Please enter a price");
            return;
        }

        setLoading(true);

        try {
            const uploadedUrls: string[] = [];
            const uploadedTypes: string[] = [];

            if (files && files.length > 0) {
                for (const file of Array.from(files)) {
                    const safeFileName = file.name.replace(/\s+/g, "-");
                    const fileName = `${Date.now()}-${safeFileName}`;

                    const { error: uploadError } = await supabase.storage
                        .from("product-media")
                        .upload(fileName, file);

                    if (uploadError) {
                        throw new Error(`Media upload failed: ${uploadError.message}`);
                    }

                    const { data } = supabase.storage
                        .from("product-media")
                        .getPublicUrl(fileName);

                    uploadedUrls.push(data.publicUrl);
                    uploadedTypes.push(file.type.startsWith("video/") ? "video" : "image");
                }
            }

            const slugBase = form.name
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9\s-]/g, "")
                .replace(/\s+/g, "-");

            const payload = {
                name: form.name.trim(),
                slug: `${slugBase}-${Date.now()}`,
                description: form.description.trim(),
                category: form.category,
                price: Number(form.price),
                stock: 1,
                is_featured: false,
                is_active: true,
                image_url: uploadedUrls[0] || null,
                media_urls: uploadedUrls,
                media_types: uploadedTypes,
                ready_to_ship_date: form.ready_to_ship_date || null,
                discount_value: form.discount_value ? Number(form.discount_value) : null,
                discount_type: form.discount_type || null,
            };

            const res = await fetch("/api/admin/products", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            let data: { error?: string; success?: boolean } | null = null;

            try {
                data = await res.json();
            } catch {
                data = null;
            }

            if (!res.ok) {
                throw new Error(data?.error || "Failed to save product");
            }

            incrementAdminUsageCount();

            alert("Product uploaded successfully");
            router.push(getCategoryRedirect(form.category));
            router.refresh();
        } catch (error) {
            console.error(error);

            const message =
                error instanceof Error
                    ? error.message
                    : "Something went wrong while uploading the product.";

            alert(message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <Navbar theme="light" />
            <BackButton href="/" label="Back" theme="light" />

            <main className="min-h-screen bg-[linear-gradient(180deg,#fbf2f6_0%,#f9edf3_35%,#f7e6ee_100%)]">
                <div className="mx-auto max-w-5xl px-6 pt-32 pb-14">
                    <section className="mb-10">
                        <p className="mb-5 text-xs uppercase tracking-[0.45em] text-neutral-500">
                            Loomeira Upload Studio
                        </p>

                        <h1 className="max-w-4xl text-5xl italic leading-[1.05] text-neutral-900">
                            Share your handmade
                            <br />
                            beauty with the world
                        </h1>

                        <p className="mt-5 max-w-3xl text-sm leading-7 text-neutral-600">
                            Upload your beautiful Loomeira creations for the world to see,
                            admire, and buy ✨ Add products you have lovingly made, whether
                            they are inspired by your own creativity or designed from a
                            customer request 💖 If a product was created through a submitted
                            request, include the request number or product name so it stays
                            easy to track and manage across Loomeira 🌸
                        </p>
                    </section>

                    <div className="rounded-[2rem] border border-[#efc9d9] bg-white/70 p-6 shadow-sm">
                        <div className="mb-8 rounded-[1.5rem] border border-pink-200 bg-[#fcf4f8] p-5">
                            <p className="mb-2 text-xs uppercase tracking-[0.35em] text-neutral-500">
                                Product guide
                            </p>
                            <h2 className="text-xl font-semibold text-neutral-900">
                                Upload your products
                            </h2>
                            <p className="mt-3 text-sm leading-6 text-neutral-600">
                                🧶 Showcase your handmade work beautifully.
                                <br />
                                🛍️ Upload customer-request products with the related request
                                number or product name.
                                <br />
                                💕 Keep every creation organized and ready for the Loomeira
                                world.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-neutral-700">
                                    Product name
                                </label>
                                <input
                                    className="w-full rounded-[1rem] border border-[#e7d8df] bg-[#fcf7fa] p-3"
                                    placeholder="Enter product name"
                                    value={form.name}
                                    onChange={(e) =>
                                        setForm({ ...form, name: e.target.value })
                                    }
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-neutral-700">
                                    Product description
                                </label>
                                <textarea
                                    className="w-full rounded-[1rem] border border-[#e7d8df] bg-[#fcf7fa] p-3"
                                    placeholder="Tell the world a little about this handmade product (max 200 characters)"
                                    maxLength={200}
                                    value={form.description}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            description: e.target.value,
                                        })
                                    }
                                />
                                <p className="mt-2 text-sm text-gray-500">
                                    {form.description.length}/200
                                </p>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-neutral-700">
                                    Category
                                </label>
                                <select
                                    className="w-full rounded-[1rem] border border-[#e7d8df] bg-[#fcf7fa] p-3"
                                    value={form.category}
                                    onChange={(e) =>
                                        setForm({ ...form, category: e.target.value })
                                    }
                                >
                                    <option value="">Select category</option>
                                    {categories.map((category) => (
                                        <option key={category.value} value={category.value}>
                                            {category.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="rounded-xl border border-[#efc9d9] bg-[#fcf4f8] p-4">
                                <label className="mb-2 block text-sm font-medium text-neutral-700">
                                    Is this an LMRA request product?
                                </label>
                                <select
                                    className="w-full rounded-[1rem] border border-[#e7d8df] bg-white p-3"
                                    value={form.is_lmra_request_product}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            is_lmra_request_product: e.target.value,
                                            lmra_request_id:
                                                e.target.value === "yes"
                                                    ? form.lmra_request_id
                                                    : "",
                                        })
                                    }
                                >
                                    <option value="">Select option</option>
                                    <option value="yes">Yes</option>
                                    <option value="no">No</option>
                                </select>

                                {form.is_lmra_request_product === "yes" && (
                                    <div className="mt-4">
                                        <label className="mb-2 block text-sm font-medium text-neutral-700">
                                            LMRA Request ID
                                        </label>
                                        <input
                                            className="w-full rounded-[1rem] border border-[#e7d8df] bg-white p-3"
                                            placeholder="Enter LMRA Request ID"
                                            value={form.lmra_request_id}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    lmra_request_id: e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-neutral-700">
                                    Price
                                </label>
                                <input
                                    className="w-full rounded-[1rem] border border-[#e7d8df] bg-[#fcf7fa] p-3"
                                    type="number"
                                    step="0.01"
                                    placeholder="Price"
                                    value={form.price}
                                    onChange={(e) =>
                                        setForm({ ...form, price: e.target.value })
                                    }
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-neutral-700">
                                    Ready to ship date
                                </label>
                                <input
                                    className="w-full rounded-[1rem] border border-[#e7d8df] bg-[#fcf7fa] p-3"
                                    type="date"
                                    value={form.ready_to_ship_date}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            ready_to_ship_date: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-neutral-700">
                                        Discount value
                                    </label>
                                    <input
                                        className="w-full rounded-[1rem] border border-[#e7d8df] bg-[#fcf7fa] p-3"
                                        type="number"
                                        step="0.01"
                                        placeholder="Discount value"
                                        value={form.discount_value}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                discount_value: e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-neutral-700">
                                        Discount type
                                    </label>
                                    <select
                                        className="w-full rounded-[1rem] border border-[#e7d8df] bg-[#fcf7fa] p-3"
                                        value={form.discount_type}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                discount_type: e.target.value,
                                            })
                                        }
                                    >
                                        <option value="">Select discount type</option>
                                        {discountTypes.map((type) => (
                                            <option key={type} value={type}>
                                                {type}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-neutral-700">
                                    Upload photos and videos
                                </label>
                                <input
                                    className="w-full rounded-[1rem] border border-[#e7d8df] bg-[#fcf7fa] p-3"
                                    type="file"
                                    multiple
                                    accept="image/*,video/*"
                                    onChange={(e) => setFiles(e.target.files)}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="rounded-full bg-pink-500 px-6 py-3 text-white hover:bg-pink-600 disabled:opacity-50"
                            >
                                {loading ? "Saving..." : "Upload product"}
                            </button>
                        </form>
                    </div>
                </div>
            </main>
        </>
    );
}