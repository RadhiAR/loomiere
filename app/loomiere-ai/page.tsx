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

type PersonItem =
    | "upper-body"
    | "full-look"
    | "hair-accessories"
    | "jewellery-zone";

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
        if (
            selectedItem === "table" ||
            selectedItem === "coffee-table" ||
            selectedItem === "dining-table"
        ) {
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

function getDisplayLabelForItem(
    scanCategory: ScanCategory,
    selectedItem: string
) {
    if (scanCategory === "home-decor-furniture") {
        return (
            homeItemOptions.find((item) => item.value === selectedItem)?.label ||
            "Selected Item"
        );
    }

    if (scanCategory === "pet") {
        return (
            petItemOptions.find((item) => item.value === selectedItem)?.label ||
            "Selected Item"
        );
    }

    if (scanCategory === "person") {
        return (
            personItemOptions.find((item) => item.value === selectedItem)?.label ||
            "Selected Item"
        );
    }

    return (
        otherItemOptions.find((item) => item.value === selectedItem)?.label ||
        "Selected Item"
    );
}

function buildLocalRecommendations(
    scanCategory: ScanCategory,
    selectedItem: string,
    goal: string,
    notes: string
): { summary: string; recommendations: AIRecommendation[] } {
    const noteText = notes.trim() ? ` Notes: ${notes.trim()}` : "";

    if (scanCategory === "pet") {
        return {
            summary: `Here are product suggestions for your ${selectedItem.replace(
                /-/g,
                " "
            )}.${noteText}`,
            recommendations: [
                {
                    product_id: "pet-1",
                    product_name: "Pet Sweater",
                    category: "Pet",
                    reason: "A cozy handcrafted option for everyday comfort.",
                    placement_note: "Best suited for colder days or styled pet looks.",
                    match_score: goal === "pet-sweater" ? 96 : 88,
                },
                {
                    product_id: "pet-2",
                    product_name: "Pet Bandana",
                    category: "Pet",
                    reason: "A lightweight accessory that adds a soft handmade touch.",
                    placement_note: "Great for casual styling and gift-friendly bundles.",
                    match_score: goal === "pet-bandana" ? 95 : 84,
                },
                {
                    product_id: "pet-3",
                    product_name: "Pet Blanket",
                    category: "Pet",
                    reason: "A soft layer for beds, crates, or sofa corners.",
                    placement_note: "Works well for comfort-focused and practical use.",
                    match_score: goal === "pet-blanket" ? 94 : 86,
                },
            ],
        };
    }

    if (scanCategory === "person") {
        return {
            summary: `Here are product suggestions based on the selected ${selectedItem.replace(
                /-/g,
                " "
            )}.${noteText}`,
            recommendations: [
                {
                    product_id: "person-1",
                    product_name: "Crochet Top",
                    category: "Wearables",
                    reason: "A handcrafted statement piece that suits boutique styling.",
                    placement_note: "Best for fashion-led looks and signature outfits.",
                    match_score: goal === "crochet-top" ? 96 : 87,
                },
                {
                    product_id: "person-2",
                    product_name: "Scarf",
                    category: "Wearables",
                    reason: "A versatile add-on that complements simple or elegant looks.",
                    placement_note: "Easy to pair with multiple outfits.",
                    match_score: goal === "scarf" ? 95 : 85,
                },
                {
                    product_id: "person-3",
                    product_name: "Hair Accessory",
                    category: "Accessories",
                    reason: "A delicate handmade piece for subtle styling.",
                    placement_note: "Works well for gifting or finishing touches.",
                    match_score: goal === "hair-accessory" ? 94 : 83,
                },
            ],
        };
    }

    if (scanCategory === "home-decor-furniture") {
        return {
            summary: `Here are product suggestions for your ${selectedItem.replace(
                /-/g,
                " "
            )}.${noteText}`,
            recommendations: [
                {
                    product_id: "home-1",
                    product_name: "Table Runner",
                    category: "Home",
                    reason: "Adds texture and a handcrafted look to flat surfaces.",
                    placement_note: "Ideal for tables, islands, and consoles.",
                    match_score:
                        goal === "table-runner" || goal === "island-runner" ? 96 : 88,
                },
                {
                    product_id: "home-2",
                    product_name: "Cushion Cover",
                    category: "Home",
                    reason: "A warm decorative option for chairs, sofas, or beds.",
                    placement_note: "Best for soft layering and comfort-focused styling.",
                    match_score: goal === "cushion-cover" ? 95 : 86,
                },
                {
                    product_id: "home-3",
                    product_name: "Decor Accessory",
                    category: "Home",
                    reason: "A versatile handmade accent for shelves and surfaces.",
                    placement_note: "Good for subtle decor updates and gift sets.",
                    match_score:
                        goal === "decor-accessory" || goal === "shelf-decor" ? 94 : 84,
                },
            ],
        };
    }

    return {
        summary: `Here are product suggestions based on your selected item.${noteText}`,
        recommendations: [
            {
                product_id: "other-1",
                product_name: "Custom Knitwear",
                category: "Custom",
                reason: "A flexible handmade option for unique requests.",
                placement_note: "Best when the item does not fit standard categories.",
                match_score: goal === "custom-knitwear" ? 95 : 86,
            },
            {
                product_id: "other-2",
                product_name: "Decor Accessory",
                category: "Custom",
                reason: "A simple decorative handmade piece for styling or gifting.",
                placement_note: "Useful for baskets, gift items, or display corners.",
                match_score: goal === "decor-accessory" ? 93 : 84,
            },
            {
                product_id: "other-3",
                product_name: "Gift Wrap / Covering",
                category: "Custom",
                reason: "A handcrafted addition for presentation and gifting.",
                placement_note: "Best for special orders or curated bundles.",
                match_score: goal === "gift-wrap" ? 94 : 83,
            },
        ],
    };
}

export default function LoomeiraAIPage() {
    const [scanCategory, setScanCategory] =
        useState<ScanCategory>("home-decor-furniture");
    const [selectedItem, setSelectedItem] = useState<string>("table");
    const [goal, setGoal] = useState<AccessoryGoal>("coasters");
    const [notes, setNotes] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState("");
    const [loading, setLoading] = useState(false);
    const [scanSummary, setScanSummary] = useState("");
    const [recommendations, setRecommendations] = useState<AIRecommendation[]>(
        []
    );
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

        if (!file.type.startsWith("image/")) {
            setError("Please upload a valid image file.");
            setImageFile(null);
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
            const result = buildLocalRecommendations(
                scanCategory,
                selectedItem,
                goal,
                notes
            );

            setScanSummary(result.summary);
            setRecommendations(result.recommendations);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to scan image.");
        } finally {
            setLoading(false);
        }
    }

    function renderItemDropdown() {
        const className =
            "w-full rounded-xl border border-[#efc5d7] bg-white px-4 py-3 text-sm text-black/85 outline-none focus:border-[#d86b98]";

        if (scanCategory === "home-decor-furniture") {
            return (
                <select
                    value={selectedItem}
                    onChange={(e) => handleItemChange(e.target.value)}
                    className={className}
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
                    className={className}
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
                    className={className}
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
                className={className}
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
        <main className="min-h-screen bg-[#fff8fb] text-[#1a1a1a]">
            <Navbar theme="light" />

            <section className="mx-auto max-w-[1400px] px-4 pb-16 pt-28 md:px-8 md:pt-32">
                <BackButton href="/" label="Home" />

                <div className="mt-8 max-w-4xl">
                    <div className="text-xs uppercase tracking-[0.35em] text-black/45">
                        Loomeira AI
                    </div>
                    <h1 className="mt-4 text-4xl italic leading-tight md:text-6xl">
                        Scan an item and get AI-powered Loomeira product suggestions
                    </h1>
                    <p className="mt-6 max-w-3xl text-base leading-8 text-black/60 md:text-lg">
                        Upload a photo of a table, sofa, chair, bed, pet, person, or
                        another object. Loomeira AI will analyze it and recommend the best
                        products from your store.
                    </p>
                </div>

                <div className="mt-12 grid gap-8 lg:grid-cols-2">
                    <div className="rounded-[30px] border border-[#f2cddd] bg-[#ffe9f2] p-6 shadow-sm md:p-8">
                        <div className="text-xs uppercase tracking-[0.22em] text-black/50">
                            Scan Setup
                        </div>

                        <div className="mt-8 space-y-6">
                            <div>
                                <label className="mb-3 block text-xs uppercase tracking-[0.22em] text-black/50">
                                    What are you scanning?
                                </label>
                                <select
                                    value={scanCategory}
                                    onChange={(e) =>
                                        handleScanCategoryChange(e.target.value as ScanCategory)
                                    }
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
                                <label className="mb-3 block text-xs uppercase tracking-[0.22em] text-black/50">
                                    Which item are you scanning?
                                </label>
                                {renderItemDropdown()}
                            </div>

                            <div>
                                <label className="mb-3 block text-xs uppercase tracking-[0.22em] text-black/50">
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
                                <label className="mb-3 block text-xs uppercase tracking-[0.22em] text-black/50">
                                    Upload image to scan
                                </label>

                                <div className="rounded-[24px] border border-dashed border-[#efc5d7] bg-white p-4">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="block w-full text-sm text-black/70 file:mr-4 file:rounded-full file:border-0 file:bg-[#ef5f9a] file:px-5 file:py-3 file:text-xs file:uppercase file:tracking-[0.18em] file:text-white hover:file:bg-[#de4d8b]"
                                    />

                                    {imagePreview ? (
                                        <div className="mt-5 overflow-hidden rounded-2xl border border-[#f2cddd]">
                                            <img
                                                src={imagePreview}
                                                alt="Selected preview"
                                                className="h-[240px] w-full object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <p className="mt-4 text-sm leading-7 text-black/50">
                                            Upload a photo of the exact item you want Loomeira AI to
                                            analyze.
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="mb-3 block text-xs uppercase tracking-[0.22em] text-black/50">
                                    Extra notes
                                </label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    rows={4}
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

                    <div className="rounded-[30px] border border-[#f2cddd] bg-[#ffe9f2] p-6 shadow-sm md:p-8">
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
                                <span className="mx-1 font-medium text-black/75">
                                    Scan with Loomeira AI
                                </span>
                                to get AI recommendations.
                            </div>
                        ) : null}

                        {scanSummary ? (
                            <div className="mt-6 rounded-2xl border border-[#efc5d7] bg-white p-5 text-sm leading-7 text-black/70">
                                {scanSummary}
                            </div>
                        ) : null}

                        {recommendations.length > 0 ? (
                            <div className="mt-6 space-y-4">
                                {recommendations.map((item) => (
                                    <div
                                        key={item.product_id}
                                        className="rounded-2xl border border-[#efc5d7] bg-white p-5"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <div className="text-xs uppercase tracking-[0.2em] text-[#d86b98]">
                                                    {item.category}
                                                </div>
                                                <h3 className="mt-2 text-xl font-medium text-black/85">
                                                    {item.product_name}
                                                </h3>
                                            </div>
                                            <div className="rounded-full bg-[#fff1f7] px-3 py-1 text-xs font-medium text-[#d86b98]">
                                                {item.match_score}% match
                                            </div>
                                        </div>

                                        <p className="mt-3 text-sm leading-7 text-black/65">
                                            {item.reason}
                                        </p>

                                        <p className="mt-3 text-sm leading-7 text-black/55">
                                            <span className="font-medium text-black/75">
                                                Placement note:
                                            </span>{" "}
                                            {item.placement_note}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : null}

                        <div className="mt-8 rounded-2xl border border-[#f2cddd] bg-white/75 p-5 text-sm leading-7 text-black/55">
                            Selected item:
                            <span className="ml-2 font-medium text-black/75">
                                {selectedItemLabel}
                            </span>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}