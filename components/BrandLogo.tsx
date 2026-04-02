import Link from "next/link";
import Image from "next/image";

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
    const sizeMap = {
        sm: {
            width: 150,
            height: 150,
        },
        md: {
            width: 190,
            height: 190,
        },
        lg: {
            width: 230,
            height: 230,
        },
    } as const;

    const selected = sizeMap[size];
    const isPinkVariant = variant === "dark";

    return (
        <Link
            href={href}
            aria-label="Loomeira home"
            className={`inline-flex shrink-0 items-start justify-start self-start ${className}`}
        >
            <span
                className="relative block"
                style={{
                    width: `${selected.width}px`,
                    height: `${selected.height}px`,
                }}
            >
                <Image
                    src="/loomeira-logo.png"
                    alt="Loomeira logo"
                    fill
                    priority
                    sizes={`${selected.width}px`}
                    className="pointer-events-none select-none object-contain object-left-top"
                    style={{
                        objectPosition: "left top",
                        filter: isPinkVariant
                            ? "brightness(0) saturate(100%) invert(45%) sepia(84%) saturate(1865%) hue-rotate(304deg) brightness(97%) contrast(94%)"
                            : "none",
                    }}
                />
            </span>
        </Link>
    );
}