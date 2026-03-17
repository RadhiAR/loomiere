import Button from "./Button";

type Props = {
    title: string;
    subtitle: string;
    ctaText: string;
    ctaHref: string;
    leftImageUrl: string;
    rightImageUrl: string;
};

export default function FeaturedTriptych({
    title,
    subtitle,
    ctaText,
    ctaHref,
    leftImageUrl,
    rightImageUrl
}: Props) {
    return (
        <section className="w-full bg-[#e84a93]">
            <div className="mx-auto max-w-6xl px-6 py-14">
                <div className="grid gap-6 md:grid-cols-3 md:items-stretch">
                    {/* Left image */}
                    <div className="overflow-hidden rounded-2xl">
                        <div
                            className="h-[360px] w-full md:h-[420px]"
                            style={{
                                backgroundImage: `url(${leftImageUrl})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center"
                            }}
                        />
                    </div>

                    {/* Center text card */}
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-white/35 bg-white/10 px-8 py-10 text-center text-white backdrop-blur-sm">
                        <div className="text-xs uppercase tracking-[0.22em] text-white/85">
                            Featured
                        </div>

                        <h2 className="mt-4 text-4xl font-light italic leading-[1.05]">
                            {title}
                        </h2>

                        <p className="mt-4 max-w-xs text-sm leading-6 text-white/90">
                            {subtitle}
                        </p>

                        <div className="mt-8">
                            <Button href={ctaHref}>{ctaText}</Button>
                        </div>
                    </div>

                    {/* Right image */}
                    <div className="overflow-hidden rounded-2xl">
                        <div
                            className="h-[360px] w-full md:h-[420px]"
                            style={{
                                backgroundImage: `url(${rightImageUrl})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center"
                            }}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}