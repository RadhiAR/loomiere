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
            frameWidth: 132,
            frameHeight: 92,
            imageWidth: 150,
            shiftX: -14,
        },
        md: {
            frameWidth: 168,
            frameHeight: 116,
            imageWidth: 190,
            shiftX: -18,
        },
        lg: {
            frameWidth: 202,
            frameHeight: 140,
            imageWidth: 230,
            shiftX: -22,
        },
    } as const;

    const selected = sizeMap[size];
    const isPinkVariant = variant === "dark";

    return (
        <Link
            href={href}
            aria-label="Loomeira home"
            className={`inline-flex shrink-0 items-start justify-start self-start leading-none ${className}`}
        >
            <span
                className="relative block overflow-hidden"
                style={{
                    width: `${selected.frameWidth}px`,
                    height: `${selected.frameHeight}px`,
                }}
            >
                <span
                    className="absolute top-0"
                    style={{
                        left: `${selected.shiftX}px`,
                        width: `${selected.imageWidth}px`,
                        height: "100%",
                    }}
                >
                    <Image
                        src="/yarn-logo.png"
                        alt="Loomeira logo"
                        fill
                        priority
                        sizes={`${selected.imageWidth}px`}
                        className="pointer-events-none select-none object-contain object-left-top"
                        style={{
                            objectPosition: "left top",
                            filter: isPinkVariant
                                ? "brightness(0) saturate(100%) invert(45%) sepia(84%) saturate(1865%) hue-rotate(304deg) brightness(97%) contrast(94%)"
                                : "none",
                        }}
                    />
                </span>
            </span>
        </Link>
    );
}