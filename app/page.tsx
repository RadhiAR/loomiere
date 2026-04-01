import Link from "next/link";

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import RecentCollectionSection from "@/components/RecentCollectionSection";

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

const categoryCards = [
    {
        label: "Apparel",
        href: "/shop/apparel",
        description: "Soft silhouettes, scarves, dresses, and statement knitwear.",
        image: "/landing-apparel.jpg",
    },
    {
        label: "Home",
        href: "/shop/home",
        description: "Handcrafted décor pieces designed to warm your living spaces.",
        image: "/landing-home.jpg",
    },
    {
        label: "Pet",
        href: "/shop/pet",
        description: "Comfortable handmade styles and accessories for your companion.",
        image: "/landing-pet.jpg",
    },
    {
        label: "Jewellery",
        href: "/shop/jewellery",
        description: "Delicate finishing touches with a timeless handcrafted spirit.",
        image: "/landing-jewellery.jpg",
    },
];

export default function HomePage() {
    return (
        <main className="relative min-h-screen bg-white text-[#2f2928]">
            <Navbar brand="LMRA" theme="dark" />

            <Hero
                brandName="LMRA"
                headline={"Exclusive\nHandcrafted,\nCollection"}
                tagline="Elegance in every design"
                ctaText="Shop Now"
                ctaHref="#new-arrivals"
                secondaryCtaText="Know Loomeira"
                secondaryCtaHref="/about"
                heroImageUrl="/hero.jpg"
            />

            <section className="bg-white px-6 py-14 md:px-10 md:py-20 lg:px-16">
                <div className="mx-auto max-w-[1400px] overflow-hidden rounded-[36px] border border-[#eadfe3] bg-[#fdf6f8] px-6 py-10 shadow-[0_20px_70px_rgba(0,0,0,0.05)] md:px-10 md:py-14 lg:px-12">
                    <div className="mb-10 text-center">
                        <p className="mb-4 text-[11px] uppercase tracking-[0.42em] text-[#a77f8d]">
                            Shop by Category
                        </p>

                        <h2 className="mx-auto max-w-4xl text-3xl font-light leading-[1.15] text-[#2f2928] md:text-5xl">
                            Explore each collection through a softer, more luxurious lens.
                        </h2>

                        <p className="mx-auto mt-5 max-w-3xl text-[15px] leading-8 text-[#6f615f] md:text-[16px]">
                            Discover handcrafted apparel, elegant home décor, charming pet
                            essentials, and jewellery designed with a refined Loomeira touch.
                        </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                        {categoryCards.map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                className="group relative min-h-[420px] overflow-hidden rounded-[28px] border border-white/50 shadow-[0_18px_50px_rgba(157,100,116,0.12)] transition duration-300 hover:-translate-y-1"
                            >
                                <div
                                    className="absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-105"
                                    style={{ backgroundImage: `url(${item.image})` }}
                                />
                                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(34,24,27,0.08)_0%,rgba(34,24,27,0.28)_45%,rgba(20,12,16,0.62)_100%)]" />

                                <div className="relative z-10 flex h-full flex-col justify-end p-6 text-white md:p-7">
                                    <p className="mb-3 text-[11px] uppercase tracking-[0.34em] text-white/80">
                                        Collection
                                    </p>

                                    <h3 className="text-3xl font-light tracking-[0.01em]">
                                        {item.label}
                                    </h3>

                                    <p className="mt-3 max-w-[280px] text-[15px] leading-7 text-white/88">
                                        {item.description}
                                    </p>

                                    <span className="mt-6 inline-flex w-fit items-center rounded-full border border-white/60 bg-white/10 px-5 py-2 text-[12px] uppercase tracking-[0.28em] text-white backdrop-blur-sm transition group-hover:bg-white/18">
                                        Explore
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            <section
                id="new-arrivals"
                className="bg-white px-6 pb-12 pt-8 md:px-10 md:pb-14 md:pt-10 lg:px-16"
            >
                <div className="mx-auto max-w-[1400px]">
                    <div className="mb-8 text-center">
                        <p className="mb-3 text-[11px] uppercase tracking-[0.38em] text-[#ad8a93]">
                            New Arrivals
                        </p>
                        <h2 className="text-3xl font-light text-[#2f2928] md:text-4xl">
                            Newly added pieces from the latest collection
                        </h2>
                        <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-8 text-[#6f615f]">
                            A flowing edit of recent uploads, presented with a lighter, more
                            editorial feel while keeping your current product functionality
                            unchanged.
                        </p>
                    </div>

                    <div className="overflow-hidden rounded-[36px] border border-[#eadfe3] bg-[#fdf6f8] shadow-[0_20px_70px_rgba(0,0,0,0.05)]">
                        <div className="bg-[#fdf6f8]">
                            <RecentCollectionSection />
                        </div>
                    </div>
                </div>
            </section>

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

                        <div className="mt-12 border-t border-black/10 pt-10 text-center">
                            <div className="text-[42px] font-serif font-medium tracking-[0.08em] text-black md:text-[64px]">
                                LMRA
                            </div>

                            <div className="mt-3 text-[10px] uppercase tracking-[0.6em] text-black/60 md:text-[11px]">
                                LOOMEIRA
                            </div>

                            <p className="mt-5 text-sm text-black/55">
                                © {new Date().getFullYear()} Loomière by RADHIKA ADDANKI. All
                                rights reserved.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}