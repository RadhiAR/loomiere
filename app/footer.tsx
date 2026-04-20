import Link from "next/link";
import Image from "next/image";

const footerColumns = [
    {
        title: "Help",
        links: [
            { label: "Contact Us", href: "/contact" },
            { label: "FAQs", href: "#" },
            { label: "Product Care", href: "#" },
            { label: "Stores", href: "#" },
        ],
    },
    {
        title: "Services",
        links: [
            { label: "Custom Orders", href: "/customize" },
            { label: "Subscriptions", href: "/subscriptions" },
            { label: "Returns", href: "#" },
            { label: "My Orders", href: "/orders" },
        ],
    },
    {
        title: "About Loomeira",
        links: [
            { label: "Our Story", href: "/about" },
            { label: "Craftsmanship", href: "#" },
            { label: "Collections", href: "/shop" },
            { label: "Loomeira Learning", href: "/loomeira-learning" },
            { label: "Loomeira AI", href: "/loomiere-ai" },
        ],
    },
    {
        title: "Email and Updates",
        links: [
            { label: "Subscribe", href: "/subscriptions" },
            { label: "New Arrivals", href: "/shop" },
            { label: "Exclusive Drops", href: "/shop" },
            { label: "Follow Us", href: "#" },
        ],
    },
];

const footerBottomLinks = [
    { label: "Sitemap", href: "#" },
    { label: "Legal Notices", href: "#" },
    { label: "Privacy Policy", href: "#" },
    { label: "Accessibility", href: "#" },
];

export default function Footer() {
    return (
        <section className="relative bg-white px-6 pb-16 pt-4 md:px-10 md:pb-16 md:pt-6 lg:px-16">
            <div className="mx-auto max-w-[1400px] overflow-hidden rounded-[36px] border border-[#eadfe3] bg-[#fdf6f8] shadow-[0_20px_70px_rgba(0,0,0,0.05)]">
                <div className="border-b border-black/10 px-6 py-14 md:px-12 lg:px-16">
                    <div className="mb-12 max-w-3xl">
                        <p className="mb-3 text-[11px] uppercase tracking-[0.34em] text-black/45">
                            Soft Luxury, Handmade
                        </p>
                        <h2 className="text-3xl font-light leading-tight text-black md:text-4xl">
                            Crafted collections for fashion, home, pets, and everyday
                            beauty.
                        </h2>
                    </div>

                    <div className="grid gap-12 md:grid-cols-2 xl:grid-cols-4">
                        {footerColumns.map((column) => (
                            <div key={column.title}>
                                <p className="mb-6 text-[11px] uppercase tracking-[0.28em] text-black/55">
                                    {column.title}
                                </p>

                                <div className="space-y-4">
                                    {column.links.map((link) => (
                                        <Link
                                            key={link.label}
                                            href={link.href}
                                            className="block text-[17px] font-light tracking-[0.01em] text-black/80 transition hover:text-black"
                                        >
                                            {link.label}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="px-6 py-8 md:px-12 lg:px-16">
                    <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
                        <div className="text-[15px] text-black/70">
                            Ship to: United States of America
                        </div>

                        <div className="flex flex-wrap gap-x-8 gap-y-3">
                            {footerBottomLinks.map((link) => (
                                <Link
                                    key={link.label}
                                    href={link.href}
                                    className="text-[15px] text-black/75 transition hover:text-black"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="mt-8 border-t border-black/10 pt-6 text-center">
                        <div className="mx-auto flex flex-col items-center justify-center">
                            <div className="relative h-[140px] w-[140px] md:h-[180px] md:w-[180px]">
                                <Image
                                    src="/loomeira-logo.png"
                                    alt="Loomeira logo"
                                    fill
                                    className="object-contain"
                                    style={{
                                        filter:
                                            "brightness(0) saturate(100%) invert(0%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(0%) contrast(100%)",
                                    }}
                                />
                            </div>

                            <p className="mt-2 text-sm text-black/55">
                                © {new Date().getFullYear()} Loomèira. All rights reserved.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}