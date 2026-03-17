export type LoomeiraProduct = {
    id: string;
    name: string;
    category: string;
    tags: string[];
    placement: string;
    description: string;
};

export const LOOMEIRA_CATALOG: LoomeiraProduct[] = [
    {
        id: "LMR-COASTER-001",
        name: "Blush Knit Coaster Set",
        category: "Home Decor",
        tags: ["table", "coffee table", "coasters", "pink", "soft", "minimal"],
        placement: "Top surface styling",
        description: "Soft handcrafted coaster set for table and coffee-table styling.",
    },
    {
        id: "LMR-RUNNER-001",
        name: "Rose Loom Table Runner",
        category: "Home Decor",
        tags: ["table", "dining table", "island", "runner", "pink", "elegant"],
        placement: "Center surface runner",
        description: "Textured runner that adds softness and definition to long surfaces.",
    },
    {
        id: "LMR-CUSHION-001",
        name: "Chunky Cushion Cover",
        category: "Home Decor",
        tags: ["sofa", "chair", "bed", "cushion", "cozy", "neutral"],
        placement: "Seat or back support area",
        description: "Hand-knit cushion cover for sofas, chairs, and layered bed styling.",
    },
    {
        id: "LMR-THROW-001",
        name: "Soft Drape Throw",
        category: "Home Decor",
        tags: ["sofa", "bed", "blanket", "throw", "cozy", "neutral", "soft"],
        placement: "Draped edge styling",
        description: "Layered throw blanket for softness, warmth, and premium texture.",
    },
    {
        id: "LMR-SHELF-001",
        name: "Loom Shelf Accent",
        category: "Home Decor",
        tags: ["shelf", "console", "decor", "accent", "minimal"],
        placement: "Shelf or console accent zone",
        description: "Subtle handcrafted decor accent for shelving and consoles.",
    },
    {
        id: "LMR-WALL-001",
        name: "Knotted Wall Hanging",
        category: "Home Decor",
        tags: ["wall", "wall space", "decor", "hanging", "art"],
        placement: "Mounted wall focal zone",
        description: "Handcrafted wall piece for soft visual texture.",
    },
    {
        id: "LMR-PET-001",
        name: "Signature Pet Sweater",
        category: "Pet",
        tags: ["pet", "dog", "cat", "pet sweater", "warm", "cute"],
        placement: "On pet body",
        description: "Soft knit sweater for stylish and comfortable pet wear.",
    },
    {
        id: "LMR-PET-002",
        name: "Custom Name Pet Bandana",
        category: "Pet",
        tags: ["pet", "dog", "cat", "bandana", "custom"],
        placement: "Around neck area",
        description: "Personalized handmade pet accessory.",
    },
    {
        id: "LMR-SCARF-001",
        name: "Signature Knit Scarf",
        category: "Apparel",
        tags: ["person", "scarf", "fashion", "soft", "winter", "layering"],
        placement: "Neck and shoulder styling",
        description: "Elegant knit scarf for everyday styling.",
    },
    {
        id: "LMR-CARDIGAN-001",
        name: "Soft Knit Cardigan",
        category: "Apparel",
        tags: ["person", "cardigan", "fashion", "layering", "cozy"],
        placement: "Upper body styling",
        description: "Versatile layered cardigan with a handmade feel.",
    },
    {
        id: "LMR-TOP-001",
        name: "Crochet Everyday Top",
        category: "Apparel",
        tags: ["person", "crochet top", "top", "summer", "fashion"],
        placement: "Upper body styling",
        description: "Light crochet top for soft premium everyday looks.",
    },
    {
        id: "LMR-JEWEL-001",
        name: "Threaded Bloom Earrings",
        category: "Jewellery",
        tags: ["person", "jewellery", "earrings", "floral", "delicate"],
        placement: "Face-framing styling",
        description: "Handcrafted jewellery accent for refined looks.",
    },
];
