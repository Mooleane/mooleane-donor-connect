export default function Page() {
    return (
        <main className="container mx-auto py-12 px-4">
            <section className="text-center max-w-3xl mx-auto">
                <h1 className="text-5xl font-extrabold mb-2">DonorConnect</h1>
                <p className="text-lg text-gray-500 mb-6">Never lose track of patrons.</p>

                <hr className="my-8 border-gray-200" />

                <p className="text-base text-gray-700 mb-4">
                    A logging app for campaigns who struggle with outdated records, organizing donations, and measuring
                    success.
                </p>

                <p className="text-base text-gray-700 mb-8">
                    DonorConnect centralizes donor records and simplifies donation tracking, promoting a knowledgeable,
                    user-friendly experience.
                </p>

                <nav className="flex justify-center gap-4">
                    <a
                        href="/register"
                        className="inline-flex items-center px-6 py-3 bg-sky-600 text-white rounded-md shadow hover:bg-sky-700"
                    >
                        Get Started
                    </a>

                    <a
                        href="/why-donor-connect"
                        className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                        Why DonorConnect?
                    </a>
                </nav>
            </section>
        </main>
    )
}
