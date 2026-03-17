"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewProductPage() {
    const router = useRouter();

    const [form, setForm] = useState({
        name: "",
        slug: "",
        description: "",
        price: "",
        image_url: "",
        category: "",
        stock: "0",
        is_featured: false,
        is_active: true,
    });

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        const res = await fetch("/api/admin/products", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                ...form,
                price: Number(form.price),
                stock: Number(form.stock),
            }),
        });

        if (res.ok) {
            router.push("/admin/products");
            router.refresh();
        } else {
            const data = await res.json();
            alert(data.error || "Failed to create product");
        }
    }

    return (
        <main className="max-w-2xl mx-auto px-6 py-10">
            <h1 className="text-2xl font-semibold mb-6">Add Product</h1>

            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    className="w-full border rounded-lg p-3"
                    placeholder="Name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                />

                <input
                    className="w-full border rounded-lg p-3"
                    placeholder="Slug"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                />

                <textarea
                    className="w-full border rounded-lg p-3"
                    placeholder="Description"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                />

                <input
                    className="w-full border rounded-lg p-3"
                    placeholder="Price"
                    type="number"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                />

                <input
                    className="w-full border rounded-lg p-3"
                    placeholder="Image URL"
                    value={form.image_url}
                    onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                />

                <input
                    className="w-full border rounded-lg p-3"
                    placeholder="Category"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                />

                <input
                    className="w-full border rounded-lg p-3"
                    placeholder="Stock"
                    type="number"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                />

                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={form.is_featured}
                        onChange={(e) =>
                            setForm({ ...form, is_featured: e.target.checked })
                        }
                    />
                    Featured product
                </label>

                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={form.is_active}
                        onChange={(e) =>
                            setForm({ ...form, is_active: e.target.checked })
                        }
                    />
                    Active product
                </label>

                <button className="rounded-xl border px-5 py-3">
                    Save Product
                </button>
            </form>
        </main>
    );
}