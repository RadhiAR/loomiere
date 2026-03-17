import Button from "./Button";

type Props = {
    brandName: string;
    headline: string;
    tagline: string;

    ctaText: string;
    ctaHref: string;

    // NEW: second CTA
    secondaryCtaText?: string;
    secondaryCtaHref?: string;

    heroImageUrl: string;
};

export default function Hero({
    headline,
    tagline,
    ctaText,
    ctaHref,
    secondaryCtaText,
    secondaryCtaHref,
    heroImageUrl
}: Props) {
    return (
        <section className="relative min-h-[85vh] w-full overflow-hidden">
            {/* Background image */}
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage: `url(${heroImageUrl})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center"
                }}
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/20" />

            {/* Content */}
            <div className="relative z-[1]">
                <div className="mx-auto max-w-6xl px-6 pt-28 pb-20">
                    <div className="mt-16 max-w-3xl">
                        <h1 className="whitespace-pre-line text-white font-light italic leading-[0.95] text-5xl sm:text-6xl md:text-7xl">
                            {headline}
                        </h1>

                        <div className="mt-7 text-white/90 text-sm uppercase tracking-[0.12em]">
                            {tagline}
                        </div>

                        {/* Buttons row */}
                        <div className="mt-10 flex flex-wrap gap-4">
                            <Button href={ctaHref}>{ctaText}</Button>

                            {secondaryCtaText && secondaryCtaHref && (
                                <Button href={secondaryCtaHref}>{secondaryCtaText}</Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}