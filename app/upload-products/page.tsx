"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";

const categories = [
    { label: "home decor", value: "home" },
    { label: "pets", value: "pet" },
    { label: "jewellery", value: "jewellery" },
    { label: "apparel", value: "apparel" },
];
const discountTypes = ["amount", "percentage"];

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
                    const fileName = `${Date.now()}-${file.name}`;

                    const { error: uploadError } = await supabase.storage
                        .from("product-media")
                        .upload(fileName, file);

                    if (uploadError) {
                        throw new Error(uploadError.message);
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
                name: form.name,
                slug: `${slugBase}-${Date.now()}`,
                description: form.description,
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

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to save product");
            }

            alert("Product uploaded successfully");
            router.push("/shop");
            router.refresh();
        } catch (error) {
            console.error(error);
            alert("Something went wrong while uploading the product.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <Navbar theme="light" />

            <main className="min-h-screen bg-[#fdf1f6]">
                <div className="max-w-3xl mx-auto px-6 pt-28 pb-10">
                    <h1 className="text-3xl font-semibold mb-8">Upload your products</h1>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <input
                            className="w-full border rounded-lg p-3"
                            placeholder="Product name"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                        />

                        <div>
                            <textarea
                                className="w-full border rounded-lg p-3"
                                placeholder="Description (max 200 characters)"
                                maxLength={200}
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                {form.description.length}/200
                            </p>
                        </div>

                        <select
                            className="w-full border rounded-lg p-3"
                            value={form.category}
                            onChange={(e) => setForm({ ...form, category: e.target.value })}
                        >
                            <option value="">Select category</option>
                            {categories.map((category) => (
                                <option key={category.value} value={category.value}>
                                    {category.label}
                                </option>
                            ))}
                        </select>

                        <input
                            className="w-full border rounded-lg p-3"
                            type="number"
                            step="0.01"
                            placeholder="Price"
                            value={form.price}
                            onChange={(e) => setForm({ ...form, price: e.target.value })}
                        />

                        <input
                            className="w-full border rounded-lg p-3"
                            type="date"
                            value={form.ready_to_ship_date}
                            onChange={(e) =>
                                setForm({ ...form, ready_to_ship_date: e.target.value })
                            }
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                                className="w-full border rounded-lg p-3"
                                type="number"
                                step="0.01"
                                placeholder="Discount value"
                                value={form.discount_value}
                                onChange={(e) =>
                                    setForm({ ...form, discount_value: e.target.value })
                                }
                            />

                            <select
                                className="w-full border rounded-lg p-3"
                                value={form.discount_type}
                                onChange={(e) =>
                                    setForm({ ...form, discount_type: e.target.value })
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

                        <div>
                            <label className="block mb-2 font-medium">
                                Upload photos and videos
                            </label>
                            <input
                                className="w-full border rounded-lg p-3"
                                type="file"
                                multiple
                                accept="image/*,video/*"
                                onChange={(e) => setFiles(e.target.files)}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-xl px-6 py-3 bg-pink-600 text-white hover:bg-pink-700 disabled:opacity-50"
                        >
                            {loading ? "Saving..." : "Save"}
                        </button>
                    </form>
                </div>
            </main>
        </>
    );
}