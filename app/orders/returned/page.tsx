import Navbar from "@/components/Navbar";

export default function ReturnedOrdersPage() {
    return (
        <main className="min-h-screen bg-white">
            <div className="relative">
                <Navbar brand="LOOMIÈRE" theme="light" />
                <div className="h-24" />
            </div>

            <section className="mx-auto max-w-5xl px-6 py-12">
                <h1 className="text-4xl font-light italic">Returned Orders</h1>
                <p className="mt-3 text-sm text-black/60">
                    This page will show returned orders. (We can connect it later.)
                </p>
            </section>
        </main>
    );
}