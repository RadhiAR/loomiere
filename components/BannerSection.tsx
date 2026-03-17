import Button from "./Button";

type Props = {
    eyebrow: string;
    title: string;
    subtitle: string;
    ctaText: string;
    ctaHref: string;
    backgroundImageUrl: string;
};

export default function BannerSection({
    eyebrow,
    title,
    subtitle,
    ctaText,
    ctaHref,
    backgroundImageUrl
}: Props) {
    return (
        <section className="relative w-full">
            <div
                className="relative min-h-[70vh] w-full"
                style={{
                    backgroundImage: `url(${backgroundImageUrl})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center"
                }}
            >
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/20" />

                {/* Content */}
                <div className="relative z-[1]">
                    <div className="mx-auto max-w-6xl px-6 py-24">
                        <div className="max-w-2xl text-white">
                            <div className="text-xs uppercase tracking-[0.22em] text-white/85">
                                {eyebrow}
                            </div>

                            <h2 className="mt-5 whitespace-pre-line text-5xl font-light italic leading-[0.95] md:text-6xl">
                                {title}
                            </h2>

                            <p className="mt-6 max-w-md text-sm leading-6 text-white/90">
                                {subtitle}
                            </p>

                            <div className="mt-10">
                                <Button href={ctaHref}>{ctaText}</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}