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
            width: 180,
            height: 110,
        },
        md: {
            width: 220,
            height: 135,
        },
        lg: {
            width: 260,
            height: 160,
        },
    } as const;

    const selected = sizeMap[size];
    const logoSrc =
        variant === "light"
            ? "/loomeira-logo.png"
            : "/loomeira-logo-black.png";

    return (
        <Link
            href={href}
            className={`inline-flex items-center justify-center select-none ${className}`}
            aria-label="Loomeira home"
        >
            <Image
                src={logoSrc}
                alt="Loomeira logo"
                width={selected.width}
                height={selected.height}
                priority
                className="h-auto w-auto object-contain"
            />
        </Link>
    );
}