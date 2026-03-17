export type HealthResponse = {
    ok: boolean;
    service?: string;
};

export type CollectionHero = {
    brandName: string;
    headline: string;
    tagline: string;
    ctaText: string;
    ctaHref: string;
    heroImageUrl: string;
};