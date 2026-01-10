export default function Page() {
    return (
        <main className="container mx-auto py-12 px-4">
            <section className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">Rubric Evidence</h1>

                <article className="prose prose-lg text-gray-800">
                    <h2 className="text-2xl font-semibold mt-6 mb-3">CCC.1.1 - Understand and identify a problem</h2>
                    <p>
                        Example: "CCC.1.1 is shown on the <a href="/about" className="text-sky-600 hover:underline">About Page</a> and <a href="/why-donor-connect" className="text-sky-600 hover:underline">Why DonorConnect Page</a>."
                    </p>

                    <h2 className="text-2xl font-semibold mt-6 mb-3">CCC.1.2 - Identify and plan a solution</h2>
                    <p>
                        Example: "CCC.1.2 is shown on the <a href="/why-donor-connect" className="text-sky-600 hover:underline">Why DonorConnect Page</a>."
                    </p>
                    <p>
                        Example: "CCC.1.2 is also shown in the Trello linked on the <a href="/why-donor-connect" className="text-sky-600 hover:underline">Why DonorConnect Page</a>, which includes wireframes, tasks, a user story, etc."
                    </p>

                    <h2 className="text-2xl font-semibold mt-6 mb-3">CCC.1.3 - Implement a solution</h2>
                    <p>
                        Example: "CCC.1.3 is shown on the <a href="/dashboard" className="text-sky-600 hover:underline">Dashboard Page</a>, <a href="/dashboard?tab=donors" className="text-sky-600 hover:underline">Donors Tab</a>, <a href="/dashboard?tab=donations" className="text-sky-600 hover:underline">Donations Tab</a>, and <a href="/dashboard?tab=reports" className="text-sky-600 hover:underline">Reports Tab</a>."
                    </p>

                    <h2 className="text-2xl font-semibold mt-6 mb-3">TS.6.2 Evidence - Use AI responsibly</h2>
                    <p>
                        Example: "TS.6.2 is shown on the <a href="/ai-policy" className="text-sky-600 hover:underline">AI Policy &amp; Safeguards</a> page."
                    </p>

                    <h2 className="text-2xl font-semibold mt-6 mb-3">TS.6.3 Evidence - Integrate AI tools</h2>
                    <p>
                        Example: "TS.6.3 is shown on the <a href="/ai-policy" className="text-sky-600 hover:underline">AI Policy &amp; Safeguards</a> page and <a href="/dashboard" className="text-sky-600 hover:underline">Dashboard Page</a>, via AI generated insights."
                    </p>

                    <br /><hr />

                    <h3 className="text-xl font-medium mt-6 mb-3">Direct Links</h3>
                    <ul>
                        <li>Github</li>
                        <li>Vercel</li>
                        <li>Trello</li>
                        <li>Wireframes</li>
                    </ul>
                </article>
            </section>
        </main>
    )
}
