"use client";

import { ChangeEvent, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import BackButton from "@/components/BackButton";

type ScanCategory = "home-decor-furniture" | "pet" | "person" | "other";

type HomeItem =
    | "table"
    | "chair"
    | "sofa"
    | "bed"
    | "island"
    | "shelf"
    | "coffee-table"
    | "dining-table"
    | "console"
    | "wall-space";

type PetItem = "dog" | "cat" | "small-pet" | "pet-bed" | "pet-corner";
type PersonItem = "upper-body" | "full-look" | "hair-accessories" | "jewellery-zone";
type OtherItem = "gift-item" | "basket" | "decor-piece" | "custom-object";

type AccessoryGoal =
    | "coasters"
    | "table-runner"
    | "chair-cover"
    | "cushion-cover"
    | "throw-blanket"
    | "bed-throw"
    | "shelf-decor"
    | "island-runner"
    | "wall-hanging"
    | "pet-sweater"
    | "pet-bandana"
    | "pet-blanket"
    | "pet-bow"
    | "scarf"
    | "cardigan"
    | "crochet-top"
    | "jewellery"
    | "hair-accessory"
    | "custom-knitwear"
    | "gift-wrap"
    | "decor-accessory";

type AIRecommendation = {
    product_id: string;
    product_name: string;
    category: string;
    reason: string;
    placement_note: string;
    match_score: number;
};

const scanCategoryOptions: Array<{ value: ScanCategory; label: string }> = [
    { value: "home-decor-furniture", label: "Home Decor & Furniture" },
    { value: "pet", label: "Pet" },
    { value: "person", label: "Person" },
    { value: "other", label: "Other" },
];

const homeItemOptions: Array<{ value: HomeItem; label: string }> = [
    { value: "table", label: "Table" },
    { value: "chair", label: "Chair" },
    { value: "sofa", label: "Sofa" },
    { value: "bed", label: "Bed" },
    { value: "island", label: "Island" },
    { value: "shelf", label: "Shelf" },
    { value: "coffee-table", label: "Coffee Table" },
    { value: "dining-table", label: "Dining Table" },
    { value: "console", label: "Console" },
    { value: "wall-space", label: "Wall Space" },
];

const petItemOptions: Array<{ value: PetItem; label: string }> = [
    { value: "dog", label: "Dog" },
    { value: "cat", label: "Cat" },
    { value: "small-pet", label: "Small Pet" },
    { value: "pet-bed", label: "Pet Bed" },
    { value: "pet-corner", label: "Pet Corner" },
];

const personItemOptions: Array<{ value: PersonItem; label: string }> = [
    { value: "upper-body", label: "Upper Body" },
    { value: "full-look", label: "Full Look" },
    { value: "hair-accessories", label: "Hair Accessories Area" },
    { value: "jewellery-zone", label: "Jewellery Zone" },
];

const otherItemOptions: Array<{ value: OtherItem; label: string }> = [
    { value: "gift-item", label: "Gift Item" },
    { value: "basket", label: "Basket" },
    { value: "decor-piece", label: "Decor Piece" },
    { value: "custom-object", label: "Custom Object" },
];

function getAccessoryOptions(
    scanCategory: ScanCategory,
    selectedItem: string
): Array<{ value: AccessoryGoal; label: string }> {
    if (scanCategory === "home-decor-furniture") {
        if (selectedItem === "table" || selectedItem === "coffee-table" || selectedItem === "dining-table") {
            return [
                { value: "coasters", label: "Coasters" },
                { value: "table-runner", label: "Table Runner" },
                { value: "decor-accessory", label: "Decor Accessory" },
            ];
        }
        if (selectedItem === "chair") {
            return [
                { value: "chair-cover", label: "Chair Cover" },
                { value: "cushion-cover", label: "Cushion Cover" },
                { value: "decor-accessory", label: "Decor Accessory" },
            ];
        }
        if (selectedItem === "sofa") {
            return [
                { value: "cushion-cover", label: "Cushion Cover" },
                { value: "throw-blanket", label: "Throw Blanket" },
                { value: "decor-accessory", label: "Decor Accessory" },
            ];
        }
        if (selectedItem === "bed") {
            return [
                { value: "bed-throw", label: "Bed Throw" },
                { value: "cushion-cover", label: "Cushion Cover" },
                { value: "throw-blanket", label: "Layered Blanket" },
            ];
        }
        if (selectedItem === "island" || selectedItem === "console") {
            return [
                { value: "island-runner", label: "Island Runner" },
                { value: "table-runner", label: "Textile Runner" },
                { value: "decor-accessory", label: "Decor Accessory" },
            ];
        }
        if (selectedItem === "shelf") {
            return [
                { value: "shelf-decor", label: "Shelf Decor" },
                { value: "decor-accessory", label: "Decor Accessory" },
            ];
        }
        if (selectedItem === "wall-space") {
            return [
                { value: "wall-hanging", label: "Wall Hanging" },
                { value: "decor-accessory", label: "Decor Accessory" },
            ];
        }
        return [{ value: "decor-accessory", label: "Decor Accessory" }];
    }

    if (scanCategory === "pet") {
        return [
            { value: "pet-sweater", label: "Pet Sweater" },
            { value: "pet-bandana", label: "Pet Bandana" },
            { value: "pet-blanket", label: "Pet Blanket" },
            { value: "pet-bow", label: "Pet Bow / Accessory" },
        ];
    }

    if (scanCategory === "person") {
        return [
            { value: "scarf", label: "Scarf" },
            { value: "cardigan", label: "Cardigan" },
            { value: "crochet-top", label: "Crochet Top" },
            { value: "jewellery", label: "Jewellery" },
            { value: "hair-accessory", label: "Hair Accessory" },
        ];
    }

    return [
        { value: "gift-wrap", label: "Gift Wrap / Covering" },
        { value: "decor-accessory", label: "Decor Accessory" },
        { value: "custom-knitwear", label: "Custom Knitwear" },
    ];
}

function getDisplayLabelForItem(scanCategory: ScanCategory, selectedItem: string) {
    if (scanCategory === "home-decor-furniture") {
        return homeItemOptions.find((item) => item.value === selectedItem)?.label || "Selected Item";
    }
    if (scanCategory === "pet") {
        return petItemOptions.find((item) => item.value === selectedItem)?.label || "Selected Item";
    }
    if (scanCategory === "person") {
        return personItemOptions.find((item) => item.value === selectedItem)?.label || "Selected Item";
    }
    return otherItemOptions.find((item) => item.value === selectedItem)?.label || "Selected Item";
}

export default function LoomeiraAIPage() {
    const [scanCategory, setScanCategory] = useState<ScanCategory>("home-decor-furniture");
    const [selectedItem, setSelectedItem] = useState<string>("table");
    const [goal, setGoal] = useState<AccessoryGoal>("coasters");
    const [notes, setNotes] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>("");

    const [loading, setLoading] = useState(false);
    const [scanSummary, setScanSummary] = useState("");
    const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
    const [error, setError] = useState("");

    const accessoryOptions = useMemo(() => {
        return getAccessoryOptions(scanCategory, selectedItem);
    }, [scanCategory, selectedItem]);

    function handleScanCategoryChange(value: ScanCategory) {
        setScanCategory(value);
        setRecommendations([]);
        setScanSummary("");
        setError("");

        if (value === "home-decor-furniture") {
            setSelectedItem("table");
            setGoal("coasters");
            return;
        }
        if (value === "pet") {
            setSelectedItem("dog");
            setGoal("pet-sweater");
            return;
        }
        if (value === "person") {
            setSelectedItem("upper-body");
            setGoal("scarf");
            return;
        }

        setSelectedItem("gift-item");
        setGoal("gift-wrap");
    }

    function handleItemChange(value: string) {
        setSelectedItem(value);
        setRecommendations([]);
        setScanSummary("");
        setError("");

        const nextOptions = getAccessoryOptions(scanCategory, value);
        if (nextOptions.length > 0) {
            setGoal(nextOptions[0].value);
        }
    }

    function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0] || null;
        setImageFile(file);
        setRecommendations([]);
        setScanSummary("");
        setError("");

        if (!file) {
            setImagePreview("");
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === "string") {
                setImagePreview(reader.result);
            }
        };
        reader.readAsDataURL(file);
    }

    async function handleScan() {
        if (!imageFile) {
            setError("Please upload an image first.");
            return;
        }

        setLoading(true);
        setError("");
        setRecommendations([]);
        setScanSummary("");

        try {
            const formData = new FormData();
            formData.append("scanCategory", scanCategory);
            formData.append("selectedItem", selectedItem);
            formData.append("goal", goal);
            formData.append("notes", notes);
            formData.append("image", imageFile);

            const res = await fetch("/api/loomeira-ai", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data?.message || "Something went wrong.");
            }

            setScanSummary(data.scan_summary || "");
            setRecommendations(Array.isArray(data.recommendations) ? data.recommendations : []);
        } catch (err: any) {
            setError(err?.message || "Failed to scan image.");
        } finally {
            setLoading(false);
        }
    }

    function renderItemDropdown() {
        if (scanCategory === "home-decor-furniture") {
            return (
                <select
                    value={selectedItem}
                    onChange={(e) => handleItemChange(e.target.value)}
                    className="w-full rounded-xl border border-[#efc5d7] bg-white px-4 py-3 text-sm text-black/85 outline-none focus:border-[#d86b98]"
                >
                    {homeItemOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            );
        }

        if (scanCategory === "pet") {
            return (
                <select
                    value={selectedItem}
                    onChange={(e) => handleItemChange(e.target.value)}
                    className="w-full rounded-xl border border-[#efc5d7] bg-white px-4 py-3 text-sm text-black/85 outline-none focus:border-[#d86b98]"
                >
                    {petItemOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            );
        }

        if (scanCategory === "person") {
            return (
                <select
                    value={selectedItem}
                    onChange={(e) => handleItemChange(e.target.value)}
                    className="w-full rounded-xl border border-[#efc5d7] bg-white px-4 py-3 text-sm text-black/85 outline-none focus:border-[#d86b98]"
                >
                    {personItemOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            );
        }

        return (
            <select
                value={selectedItem}
                onChange={(e) => handleItemChange(e.target.value)}
                className="w-full rounded-xl border border-[#efc5d7] bg-white px-4 py-3 text-sm text-black/85 outline-none focus:border-[#d86b98]"
            >
                {otherItemOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        );
    }

    const selectedItemLabel = getDisplayLabelForItem(scanCategory, selectedItem);

    return (
        <main className="min-h-screen bg-[#fff4f8]">
            <div className="relative">
                <Navbar theme="light" />
                <div className="fixed top-6 left-6 z-[9999] pointer-events-auto">
                    <BackButton theme="light" href="/" label="Home" />
                </div>
                <div className="h-24" />
            </div>

            <section className="mx-auto max-w-7xl px-6 py-12">
                <div className="max-w-4xl">
                    <div className="text-xs uppercase tracking-[0.24em] text-black/45">
                        Loomeira AI
                    </div>
                    <h1 className="mt-3 text-4xl font-light italic text-black/90">
                        Scan an item and get AI-powered Loomeira product suggestions
                    </h1>
                    <p className="mt-4 text-sm leading-7 text-black/60">
                        Upload a photo of a table, sofa, chair, bed, pet, person, or another object.
                        Loomeira AI will analyze it and recommend the best products from your store.
                    </p>
                </div>

                <div className="mt-10 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
                    <div className="rounded-[30px] border border-[#f2cddd] bg-[#ffe9f2] p-6 shadow-sm">
                        <div className="text-xs uppercase tracking-[0.22em] text-black/50">
                            Scan Setup
                        </div>

                        <div className="mt-6 grid gap-5">
                            <div>
                                <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-black/45">
                                    What are you scanning?
                                </label>
                                <select
                                    value={scanCategory}
                                    onChange={(e) => handleScanCategoryChange(e.target.value as ScanCategory)}
                                    className="w-full rounded-xl border border-[#efc5d7] bg-white px-4 py-3 text-sm text-black/85 outline-none focus:border-[#d86b98]"
                                >
                                    {scanCategoryOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-black/45">
                                    Which item are you scanning?
                                </label>
                                {renderItemDropdown()}
                            </div>

                            <div>
                                <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-black/45">
                                    What sort of accessories are you looking for?
                                </label>
                                <select
                                    value={goal}
                                    onChange={(e) => setGoal(e.target.value as AccessoryGoal)}
                                    className="w-full rounded-xl border border-[#efc5d7] bg-white px-4 py-3 text-sm text-black/85 outline-none focus:border-[#d86b98]"
                                >
                                    {accessoryOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-black/45">
                                    Upload image to scan
                                </label>
                                <div className="rounded-2xl border border-dashed border-[#efc5d7] bg-white/65 p-4">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="block w-full text-sm text-black/70 file:mr-4 file:rounded-full file:border-0 file:bg-[#ef5f9a] file:px-4 file:py-2 file:text-xs file:uppercase file:tracking-[0.18em] file:text-white hover:file:bg-[#de4d8b]"
                                    />

                                    {imagePreview ? (
                                        <div className="mt-4 overflow-hidden rounded-2xl border border-[#f2cddd] bg-white">
                                            <img
                                                src={imagePreview}
                                                alt="Uploaded preview"
                                                className="h-72 w-full object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div className="mt-4 rounded-2xl border border-[#f2cddd] bg-[#fff8fb] px-4 py-10 text-center text-sm text-black/45">
                                            Upload a photo of the exact item you want Loomeira AI to analyze.
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-black/45">
                                    Extra notes
                                </label>
                                <textarea
                                    rows={5}
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Example: I want something soft pink and cozy for this sofa, or a simple elegant styling option for this table."
                                    className="w-full rounded-2xl border border-[#efc5d7] bg-white px-4 py-3 text-sm text-black/85 outline-none placeholder:text-black/35 focus:border-[#d86b98]"
                                />
                            </div>

                            <div>
                                <button
                                    type="button"
                                    onClick={handleScan}
                                    disabled={loading}
                                    className="rounded-full bg-[#ef5f9a] px-6 py-3 text-xs uppercase tracking-[0.18em] text-white transition hover:bg-[#de4d8b] disabled:opacity-60"
                                >
                                    {loading ? "Scanning..." : "Scan with Loomeira AI"}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-[30px] border border-[#f2cddd] bg-[#ffe9f2] p-6 shadow-sm">
                        <div className="text-xs uppercase tracking-[0.22em] text-black/50">
                            AI Results
                        </div>

                        {error ? (
                            <div className="mt-6 rounded-2xl border border-[#efc5d7] bg-white p-4 text-sm text-[#c8487d]">
                                {error}
                            </div>
                        ) : null}

                        {!loading && !scanSummary && recommendations.length === 0 ? (
                            <div className="mt-6 rounded-2xl border border-[#f2cddd] bg-white/65 px-5 py-8 text-sm leading-7 text-black/55">
                                Upload an image, choose the item and accessory type, and click
                                <span className="mx-1 font-medium text-black/75">Scan with Loomeira AI</span>
                                to get AI recommendations.
                            </div>
                        ) : null}

                        {scanSummary ? (
                            <div className="mt-6 rounded-2xl border border-[#f2cddd] bg-white/65 px-5 py-4 text-sm text-black/65">
                                <div className="font-medium text-black/85">Scan summary</div>
                                <div className="mt-2">{scanSummary}</div>
                                <div className="mt-3 text-xs text-black/45">
                                    Item scanned: {selectedItemLabel}
                                </div>
                            </div>
                        ) : null}

                        {recommendations.length > 0 ? (
                            <div className="mt-6 space-y-4">
                                {recommendations.map((item) => (
                                    <div
                                        key={item.product_id}
                                        className="rounded-2xl border border-[#f2cddd] bg-white p-5 shadow-sm"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <div className="text-xs uppercase tracking-[0.18em] text-black/45">
                                                    {item.category}
                                                </div>
                                                <h3 className="mt-2 text-xl font-medium text-black/88">
                                                    {item.product_name}
                                                </h3>
                                            </div>

                                            <span className="rounded-full bg-[#fff1f7] px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-[#c8487d]">
                                                {item.match_score}% Match
                                            </span>
                                        </div>

                                        <div className="mt-4 space-y-3 text-sm leading-6 text-black/65">
                                            <p>
                                                <span className="font-medium text-black/82">Why it fits:</span>{" "}
                                                {item.reason}
                                            </p>
                                            <p>
                                                <span className="font-medium text-black/82">Placement:</span>{" "}
                                                {item.placement_note}
                                            </p>
                                        </div>

                                        <div className="mt-5 flex flex-wrap gap-3">
                                            <button
                                                type="button"
                                                className="rounded-full bg-[#ef5f9a] px-5 py-2.5 text-xs uppercase tracking-[0.18em] text-white transition hover:bg-[#de4d8b]"
                                            >
                                                View Product
                                            </button>

                                            <button
                                                type="button"
                                                className="rounded-full border border-[#efc5d7] bg-white px-5 py-2.5 text-xs uppercase tracking-[0.18em] text-black/70 transition hover:bg-[#ffe3ee]"
                                            >
                                                Save Suggestion
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : null}
                    </div>
                </div>
            </section>
        </main>
    );
}
