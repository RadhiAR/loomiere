import Link from "next/link";

type Props = {
    href?: string;
    size?: "sm" | "md" | "lg";
};

export default function BrandLogo({ href = "/", size = "md" }: Props) {
    const sizeClass =
        size === "sm"
            ? "text-lg"
            : size === "lg"
                ? "text-4xl md:text-5xl"
                : "text-2xl md:text-3xl";

    const content = (
        <div className="relative inline-flex items-center">
            <span
                className={`relative ${sizeClass} font-semibold uppercase tracking-[0.28em] italic text-transparent bg-clip-text bg-gradient-to-r from-[#ff4fa3] via-[#ff87d8] via-[45%] to-[#ffd36e] drop-shadow-[0_0_10px_rgba(255,120,190,0.45)]`}
                style={{
                    WebkitTextStroke: "0.15px rgba(255,255,255,0.35)",
                }}
            >
                LOOMEIRA
            </span>

            <span className="pointer-events-none absolute inset-0 blur-xl opacity-45 bg-gradient-to-r from-[#ff4fa3] via-[#ff87d8] to-[#ffd36e]" />

            <span
                className="pointer-events-none absolute -inset-x-2 top-1/2 h-[38%] -translate-y-1/2 rounded-full opacity-45"
                style={{
                    background:
                        "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0) 100%)",
                    filter: "blur(6px)",
                }}
            />
        </div>
    );

    return href ? <Link href={href}>{content}</Link> : content;
}
