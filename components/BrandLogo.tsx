import Link from "next/link";

type BrandLogoProps = {
    href?: string;
    size?: "sm" | "md" | "lg";
    variant?: "light" | "dark";
    className?: string;
};

export default function BrandLogo({
    href = "/",
    size = "sm",
    variant = "light",
    className = "",
}: BrandLogoProps) {
    const mainColor = variant === "light" ? "text-white" : "text-black";
    const subColor = variant === "light" ? "text-white/70" : "text-black/55";

    const sizeMap = {
        sm: {
            main: "text-[34px] md:text-[40px]",
            sub: "text-[8px] md:text-[9px]",
        },
        md: {
            main: "text-[42px] md:text-[52px]",
            sub: "text-[9px] md:text-[10px]",
        },
        lg: {
            main: "text-[52px] md:text-[64px]",
            sub: "text-[10px] md:text-[11px]",
        },
    };

    const selected = sizeMap[size];

    return (
        <Link href={href} className={`inline-flex flex-col items-start leading-none select-none ${className}`}>
            <div
                className={`${mainColor} ${selected.main} font-semibold italic tracking-[-0.08em]`}
                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
                LMRA
            </div>

            <div className={`${subColor} ${selected.sub} mt-1 pl-[2px] uppercase tracking-[0.38em]`}>
                LOOMEIRA
            </div>
        </Link>
    );
}