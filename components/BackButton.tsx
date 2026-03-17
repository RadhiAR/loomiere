"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

type Props = {
    theme?: "dark" | "light";
    href?: string;
    label?: string;
};

export default function BackButton({
    theme = "light",
    href,
    label = "Back",
}: Props) {
    const router = useRouter();
    const isDark = theme === "dark";

    const style = isDark
        ? "text-white/90 border-white/50 hover:bg-white/10"
        : "text-black/80 border-black/20 hover:bg-black/5";

    const className = `pointer-events-auto inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs uppercase tracking-[0.22em] transition ${style}`;

    // ✅ If href exists -> real Link (best)
    if (href) {
        return (
            <Link href={href} className={className} aria-label={label}>
                ← {label}
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
            ← {label}
        </button>
    );
}