import Navbar from "@/components/Navbar";

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-gradient-to-br from-[#ff5fa2] via-[#ff8a5b] to-[#ffd36e]">
            {/* NAVBAR */}
            <div className="relative">
                <Navbar brand="LOOMIÈRE" theme="light" />
                <div className="h-24" />
            </div>

            {/* KNOW LOOMIÈRE — zigzag editorial */}
            <section className="mx-auto max-w-6xl px-6 py-10">
                <div className="space-y-24">
                    {/* ROW 1 */}
                    <div className="grid items-center gap-12 md:grid-cols-2">
                        <div className="overflow-hidden rounded-2xl shadow-xl">
                            <img
                                src="/about-top-left.jpg"
                                alt="Loomière craft"
                                className="w-full object-cover"
                            />
                        </div>

                        <div>
                            <div className="text-xs uppercase tracking-[0.22em] text-black/55">
                                The Story
                            </div>

                            <h1 className="mt-4 text-4xl font-light italic leading-tight text-black/90">
                                Know Loomière
                            </h1>

                            <p className="mt-6 text-sm leading-7 text-black/80">
                                Loomière is a handcrafted textile label founded on the belief
                                that everyday objects can carry warmth, texture, and intention.
                                Each piece is thoughtfully made — blending softness with
                                structure.
                            </p>
                        </div>
                    </div>

                    {/* ROW 2 */}
                    <div className="grid items-center gap-12 md:grid-cols-2">
                        <div>
                            <p className="text-sm leading-7 text-black/80">
                                From wearable silhouettes to home accents, Loomière celebrates
                                tactile beauty and quiet luxury through slow craftsmanship and
                                considered design.
                            </p>
                        </div>

                        <div className="overflow-hidden rounded-2xl shadow-xl">
                            <img
                                src="/about-mid-right.jpg"
                                alt="Loomière making"
                                className="w-full object-cover"
                            />
                        </div>
                    </div>

                    {/* ROW 3 */}
                    <div className="grid items-center gap-12 md:grid-cols-2">
                        <div className="overflow-hidden rounded-2xl shadow-xl">
                            <img
                                src="/about-bottom-left.jpg"
                                alt="Loomière textile"
                                className="w-full object-cover"
                            />
                        </div>

                        <div>
                            <p className="text-sm leading-7 text-black/80">
                                Rooted in warmth and personal expression, every Loomière creation
                                carries story, texture, and human touch — designed to be lived
                                with and cherished.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FOUNDER SECTION */}
            <section className="mx-auto max-w-6xl px-6 pb-16">
                <div className="rounded-2xl border border-white/60 bg-gradient-to-br from-[#ffd1e3] via-[#ffe0d6] to-[#fff0d6] p-10 shadow-xl">
                    <div className="grid gap-10 md:grid-cols-[220px_1fr] md:items-start">
                        {/* Founder image */}
                        <div className="overflow-hidden rounded-2xl border border-white/60 bg-white/70">
                            <img
                                src="/founder.jpg"
                                alt="Founder Loomière"
                                className="h-[220px] w-full object-cover"
                            />
                        </div>

                        {/* Founder text */}
                        <div>
                            <div className="text-xs uppercase tracking-[0.22em] text-black/55">
                                Founder
                            </div>

                            <h2 className="mt-3 text-3xl font-light italic text-black/90">
                                Radhika Addanki
                            </h2>

                            <p className="mt-5 text-sm leading-7 text-black/85">
                                <span className="font-semibold">
                                    Loomière was founded by Radhika Addanki
                                </span>{" "}
                                to merge textile craft with contemporary design and create a
                                modern studio of handmade pieces.
                            </p>

                            <p className="mt-4 text-sm leading-7 text-black/85">
                                From apparel to home accents and pet essentials, Loomière
                                reflects her commitment to softness, structure, and timeless
                                tactile beauty.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <section className="pb-14">
                <div className="mx-auto max-w-6xl px-6 text-center text-sm text-white/95">
                    © {new Date().getFullYear()} Loomière by RADHIKA ADDANKI. All rights reserved.
                </div>
            </section>
        </main>
    );
}