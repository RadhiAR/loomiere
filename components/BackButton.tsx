"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

type Props = {
    theme?: "dark" | "light";
    href?: string;
    label?: string;
};

function ArrowIcon({ className = "" }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className={className}
        >
            <path
                d="M15 5L8 12L15 19"
                stroke="currentColor"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

export default function BackButton({
    theme = "light",
    href,
    label = "Back",
}: Props) {
    const router = useRouter();
    const isDark = theme === "dark";

    const className = isDark
        ? "fixed left-4 top-[88px] z-[3200] inline-flex h-12 w-12 items-center justify-center rounded-full text-white transition hover:scale-105 hover:bg-white/10 md:left-8 lg:left-10"
        : "fixed left-4 top-[88px] z-[3200] inline-flex h-12 w-12 items-center justify-center rounded-full text-[#e84a93] transition hover:scale-105 hover:bg-[#ffe3ee] md:left-8 lg:left-10";

    if (href) {
        return (
            <Link href={href} className={className} aria-label={label}>
                <ArrowIcon className="h-8 w-8" />
            </Link>
        );
    }

    return (
        <button
            type="button"
            onClick={() => router.back()}
            className={className}
            aria-label={label}
        >
            <ArrowIcon className="h-8 w-8" />
        </button>
    );
}