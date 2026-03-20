import Navbar from "@/components/Navbar";
import BackButton from "@/components/BackButton";

export default function LoomeiraLearningPage() {
    return (
        <main className="min-h-screen bg-[#fff8fb] text-[#1a1a1a]">
            <Navbar theme="light" />

            <section className="mx-auto max-w-[1400px] px-4 pb-16 pt-28 md:px-8 md:pt-32">
                <BackButton href="/" label="Home" />

                <div className="mt-8 max-w-4xl">
                    <div className="text-xs uppercase tracking-[0.35em] text-black/45">
                        Loomeira Learning
                    </div>

                    <h1 className="mt-4 text-4xl italic leading-tight md:text-6xl">
                        Loomeira Learning
                    </h1>

                    <p className="mt-6 max-w-3xl text-base leading-8 text-black/60 md:text-lg">
                        This page is ready. We can decide the content for it next.
                    </p>
                </div>

                <div className="mt-12 rounded-[30px] border border-[#f2cddd] bg-[#ffe9f2] p-6 shadow-sm md:p-8">
                    <div className="text-xs uppercase tracking-[0.22em] text-black/50">
                        Coming Soon
                    </div>

                    <p className="mt-4 max-w-3xl text-base leading-8 text-black/65">
                        We can later add tutorials, crochet guides, styling ideas, DIY learning
                        resources, product education, videos, downloadable patterns, or anything else
                        you want here.
                    </p>
                </div>
            </section>
        </main>
    );
}