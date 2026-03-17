import Link from "next/link";

type Props = {
    href: string;
    children: React.ReactNode;
    newTab?: boolean;
};

export default function Button({ href, children, newTab = false }: Props) {
    const className =
        "inline-flex items-center justify-center rounded-full border border-white/70 px-7 py-3 text-xs uppercase tracking-[0.18em] text-white transition hover:border-white hover:bg-white/10";

    // For external/new-tab usage, use <a>
    if (newTab) {
        return (
            <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={className}
            >
                {children}
            </a>
        );
    }

    // For normal internal links / hashes (#apparel)
    return (
        <Link href={href} className={className}>
            {children}
        </Link>
    );
}