import Link from "next/link";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import CategorySection from "@/components/CategorySection";
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

export default function HomePage() {
    return (
        <main className="relative">
            <Navbar brand="LOOMIÈRE" theme="dark" />

            <Hero
                brandName="LOOMIÈRE"
                headline={"Exclusive\nHandcrafted\nCollection"}
                tagline="Elegance in every design"
                ctaText="Shop Now"
                ctaHref="#apparel"
                secondaryCtaText="Know Loomière"
                secondaryCtaHref="/about"
                heroImageUrl="/hero.jpg"
            />

            <RecentCollectionSection />

            <CategorySection
                id="apparel"
                eyebrow="APPAREL"
                title={"Tops, Dresses\n& Scarves"}
                subtitle="Signature silhouettes and seasonal layers — sweaters, tops, dresses, and scarves crafted with texture and softness."
                ctaText="Shop Apparel"
                ctaHref="/shop/apparel"
                ctaNewTab={true}
                backgroundImageUrl="/landing-apparel.jpg"
            />

            <CategorySection
                id="home"
                eyebrow="HOME DÉCOR"
                title={"Woven Living\nEssentials"}
                subtitle="Coasters, curtains, table accents, and handcrafted décor — designed to warm up every corner of your space."
                ctaText="Shop Home"
                ctaHref="/shop/home"
                ctaNewTab={true}
                backgroundImageUrl="/landing-home.jpg"
            />

            <CategorySection
                id="pet"
                eyebrow="PET"
                title={"For Your Dog\nIn Style"}
                subtitle="Collars, cozy sweaters and accessories — handmade for comfort, fit, and everyday charm."
                ctaText="Shop Pet"
                ctaHref="/shop/pet"
                ctaNewTab={true}
                backgroundImageUrl="/landing-pet.jpg"
            />

            <CategorySection
                id="jewellery"
                eyebrow="HANDCRAFTED JEWELLERY"
                title={"Small Details,\nBig Elegance"}
                subtitle="Handmade jewellery designed to pair with your everyday — refined, minimal, and quietly luxurious."
                ctaText="Shop Jewellery"
                ctaHref="/shop/jewellery"
                ctaNewTab={true}
                backgroundImageUrl="/landing-jewellery.jpg"
            />

            <section className="bg-[#f7f4f1] pb-0 pt-20">
                <div className="mx-auto max-w-[1400px] overflow-hidden rounded-t-[36px] border border-black/8 bg-[#f3f1ef]">
                    <div className="border-b border-black/10 px-6 py-14 md:px-12 lg:px-16">
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
                            <div className="text-3xl font-semibold tracking-[0.16em] text-black md:text-4xl">
                                LOOMEIRA
                            </div>
                            <p className="mt-5 text-sm text-black/55">
                                © {new Date().getFullYear()} Loomière by RADHIKA ADDANKI. All rights reserved.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}