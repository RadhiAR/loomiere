import Navbar from "@/components/Navbar";

export default function ReturnsPage() {
    return (
        <main className="min-h-screen bg-[#fff4f8]">
            <div className="relative">
                <Navbar brand="LOOMIÈRE" theme="light" />
                <div className="h-24" />
            </div>

            <section className="mx-auto max-w-3xl px-6 py-12">
                <div className="rounded-[28px] border border-[#f2cddd] bg-[#ffe9f2] p-8 shadow-sm">
                    <div className="text-xs uppercase tracking-[0.22em] text-black/50">
                        LOOMIÈRE
                    </div>

                    <h1 className="mt-4 text-4xl font-light italic text-black/90">
                        Return Policy
                    </h1>

                    <p className="mt-4 text-sm leading-7 text-black/70">
                        Each Loomière piece is handmade with care. If something arrives damaged
                        or incorrect, contact us within 7 days and we’ll make it right.
                    </p>

                    <ul className="mt-6 list-disc space-y-3 pl-5 text-sm leading-7 text-black/70">
                        <li>Returns accepted for damaged or incorrect items within 7 days.</li>
                        <li>Custom orders are final sale unless the item arrives damaged.</li>
                        <li>Shipping fees are non-refundable.</li>
                    </ul>
                </div>
            </section>
        </main>
    );
}
