import Navbar from "@/components/Navbar";

export default function AboutPage() {
    return (
        <>
            <Navbar theme="light" />

            <main className="relative min-h-screen overflow-hidden bg-[#fbe8f2]">
                {/* Main soft ombre background */}
                <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                        background:
                            "linear-gradient(135deg, #ffffff 0%, #fff8fc 14%, #ffeef7 32%, #ffddea 55%, #fbe8f2 78%, #ffffff 100%)",
                    }}
                />

                {/* Full-page rangoli style background */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-70">
                    {/* top left */}
                    <div className="absolute left-8 top-24 h-56 w-56">
                        <div className="absolute inset-0 rounded-full border border-white/60" />
                        <div className="absolute inset-[12%] rounded-full border border-white/55" />
                        <div className="absolute inset-[24%] rounded-full border border-white/50" />
                        <div className="absolute inset-[36%] rounded-full border border-white/45" />
                        <div className="absolute inset-[48%] rounded-full border border-white/40" />
                    </div>

                    {/* top mid */}
                    <div className="absolute left-[38%] top-16 h-40 w-40 rotate-12">
                        <div className="absolute inset-0 rounded-full border border-white/45" />
                        <div className="absolute inset-[18%] rounded-full border border-white/40" />
                        <div className="absolute inset-[36%] rounded-full border border-white/35" />
                    </div>

                    {/* top right */}
                    <div className="absolute right-16 top-28 h-52 w-52">
                        <div className="absolute inset-0 rounded-full border border-white/55" />
                        <div className="absolute inset-[14%] rounded-full border border-white/50" />
                        <div className="absolute inset-[28%] rounded-full border border-white/45" />
                        <div className="absolute inset-[42%] rounded-full border border-white/40" />
                    </div>

                    {/* left center floral dots */}
                    <div
                        className="absolute left-[-20px] top-[38%] h-72 w-72 rounded-full"
                        style={{
                            background:
                                "radial-gradient(circle, rgba(255,255,255,0.75) 1.3px, transparent 1.3px)",
                            backgroundSize: "18px 18px",
                            maskImage:
                                "radial-gradient(circle at center, black 0 44%, transparent 45%)",
                            WebkitMaskImage:
                                "radial-gradient(circle at center, black 0 44%, transparent 45%)",
                        }}
                    />

                    {/* right center floral dots */}
                    <div
                        className="absolute right-[-30px] top-[42%] h-80 w-80 rounded-full"
                        style={{
                            background:
                                "radial-gradient(circle, rgba(255,255,255,0.72) 1.4px, transparent 1.4px)",
                            backgroundSize: "20px 20px",
                            maskImage:
                                "radial-gradient(circle at center, black 0 42%, transparent 43%)",
                            WebkitMaskImage:
                                "radial-gradient(circle at center, black 0 42%, transparent 43%)",
                        }}
                    />

                    {/* bottom left */}
                    <div className="absolute bottom-24 left-10 h-56 w-56">
                        <div className="absolute inset-0 rounded-full border border-white/60" />
                        <div className="absolute inset-[12%] rounded-full border border-white/55" />
                        <div className="absolute inset-[24%] rounded-full border border-white/50" />
                        <div className="absolute inset-[36%] rounded-full border border-white/45" />
                        <div className="absolute inset-[48%] rounded-full border border-white/40" />
                    </div>

                    {/* bottom center */}
                    <div
                        className="absolute bottom-12 left-[44%] h-48 w-48 rounded-full"
                        style={{
                            background:
                                "repeating-radial-gradient(circle, rgba(255,255,255,0.65) 0 2px, transparent 2px 14px)",
                            maskImage:
                                "radial-gradient(circle at center, black 0 46%, transparent 47%)",
                            WebkitMaskImage:
                                "radial-gradient(circle at center, black 0 46%, transparent 47%)",
                        }}
                    />

                    {/* bottom right */}
                    <div className="absolute bottom-16 right-14 h-64 w-64 rotate-6">
                        <div className="absolute inset-0 rounded-full border border-white/55" />
                        <div className="absolute inset-[10%] rounded-full border border-white/50" />
                        <div className="absolute inset-[20%] rounded-full border border-white/45" />
                        <div className="absolute inset-[30%] rounded-full border border-white/40" />
                        <div className="absolute inset-[40%] rounded-full border border-white/35" />
                    </div>

                    {/* extra soft motifs */}
                    <div
                        className="absolute left-[20%] top-[62%] h-32 w-32 rounded-full"
                        style={{
                            background:
                                "radial-gradient(circle, rgba(255,255,255,0.65) 1.2px, transparent 1.2px)",
                            backgroundSize: "14px 14px",
                            maskImage:
                                "radial-gradient(circle at center, black 0 38%, transparent 39%)",
                            WebkitMaskImage:
                                "radial-gradient(circle at center, black 0 38%, transparent 39%)",
                        }}
                    />

                    <div
                        className="absolute right-[24%] top-[22%] h-28 w-28 rounded-full"
                        style={{
                            background:
                                "radial-gradient(circle, rgba(255,255,255,0.6) 1.1px, transparent 1.1px)",
                            backgroundSize: "13px 13px",
                            maskImage:
                                "radial-gradient(circle at center, black 0 38%, transparent 39%)",
                            WebkitMaskImage:
                                "radial-gradient(circle at center, black 0 38%, transparent 39%)",
                        }}
                    />
                </div>

                <div className="relative z-10 mx-auto max-w-7xl px-6 pb-10 pt-20 md:px-10 md:pb-14 md:pt-24">
                    {/* KNOW LOOMEIRA */}
                    <section className="space-y-16 md:space-y-24">
                        {/* ROW 1 */}
                        <div className="grid items-center gap-10 md:grid-cols-2">
                            <div className="overflow-hidden rounded-[28px] shadow-lg">
                                <img
                                    src="/about-top-left.jpg"
                                    alt="Loomeira craft"
                                    className="h-[320px] w-full object-cover md:h-[420px]"
                                />
                            </div>

                            <div className="text-[#4b2940]">
                                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-[#b25a87]">
                                    The Story
                                </p>

                                <h1 className="mb-5 text-4xl font-medium italic leading-tight md:text-5xl">
                                    Know Loomeira ✨
                                </h1>

                                <p className="text-base leading-8 md:text-lg md:leading-9">
                                    Loomeira was started by{" "}
                                    <span className="font-semibold">Radhika Addanki</span> as an
                                    initiative to create a platform where people, especially women
                                    and kids, can learn, create, and grow from home 🌸. With just
                                    a computer, iPad, or mobile phone, anyone can begin this
                                    journey without needing any special background. Loomeira is
                                    built to make creativity feel empowering, accessible, and
                                    independent — putting opportunity directly into users’ hands
                                    💖
                                </p>
                            </div>
                        </div>

                        {/* ROW 2 */}
                        <div className="grid items-center gap-10 md:grid-cols-2">
                            <div className="order-2 text-[#4b2940] md:order-1">
                                <p className="text-base leading-8 md:text-lg md:leading-9">
                                    Loomeira brings everything together in one beautiful place —
                                    you can plan 📝, learn 🎓, make 🧵, sell 🛍️, and earn 💸 all
                                    at the same place. For women, it creates a flexible path to do
                                    meaningful work from home. For kids, it can become an inspiring
                                    summer activity or holiday activity where they can imagine an
                                    idea, learn a skill, make something special, and even sell it.
                                    It is designed to show that small ideas can grow into
                                    confidence, creativity, and real value 🌟
                                </p>
                            </div>

                            <div className="order-1 overflow-hidden rounded-[28px] shadow-lg md:order-2">
                                <img
                                    src="/about-mid-right.jpg"
                                    alt="Loomeira making"
                                    className="h-[320px] w-full object-cover md:h-[420px]"
                                />
                            </div>
                        </div>

                        {/* ROW 3 */}
                        <div className="grid items-center gap-10 md:grid-cols-2">
                            <div className="overflow-hidden rounded-[28px] shadow-lg">
                                <img
                                    src="/about-bottom-left.jpg"
                                    alt="Loomeira handmade collection"
                                    className="h-[320px] w-full object-cover md:h-[420px]"
                                />
                            </div>

                            <div className="text-[#4b2940]">
                                <p className="text-base leading-8 md:text-lg md:leading-9">
                                    Loomeira is not restricted only to knitting or crafting 💕. It
                                    welcomes handmade creations of many kinds, as long as
                                    Loomeira users want to create and buy them. From home décor,
                                    tops, and keychains to gifts, accessories, and other handmade
                                    pieces, the platform is open to imagination, learning, and
                                    growth. Loomeira is a joyful space where people can create,
                                    share, sell, and celebrate handmade talent in all forms 🌈
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* FOOTER */}
                    <footer className="pb-6 pt-16 text-center text-sm text-[#7b5267] md:pt-20">
                        © {new Date().getFullYear()} Loomèira. All
                        rights reserved.
                    </footer>
                </div>
            </main>
        </>
    );
}