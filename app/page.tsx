import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import CategorySection from "@/components/CategorySection";
import RecentCollectionSection from "@/components/RecentCollectionSection";

export default function HomePage() {
    return (
        <main className="relative">
            <Navbar brand="LOOMIÈRE" theme="dark" />

            {/* HERO */}
            <Hero
                brandName="LOOMIÈRE"
                headline={"Exclusive\nHandcrafted\nCollection"}
                tagline="Elegance in every design"
                ctaText="Shop Now"
                ctaHref="#apparel" // ✅ scrolls to Apparel section
                secondaryCtaText="Know Loomière"
                secondaryCtaHref="/about"
                heroImageUrl="/hero.jpg"
            />
            <RecentCollectionSection />
            {/* SECTION 1 — Apparel */}
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

            {/* SECTION 2 — Home */}
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

            {/* SECTION 3 — Pet */}
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

            {/* SECTION 4 — Jewellery */}
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

            {/* FOOTER */}
            <section className="py-16 bg-white">
                <div className="mx-auto max-w-6xl px-6 text-center text-sm text-black/60">
                    © {new Date().getFullYear()} Loomière by RADHIKA ADDANKI. All rights reserved.
                </div>
            </section>
        </main>
    );
}