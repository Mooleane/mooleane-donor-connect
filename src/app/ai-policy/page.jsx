export default function Page() {
    return (
        <main className="container mx-auto py-12 px-4">
            <section className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">AI Policy &amp; Safeguards</h1>

                <article className="prose prose-lg text-gray-800">
                    <h2 className="text-2xl font-semibold mt-6 mb-3">How AI Is Being Used Responsibly</h2>
                    <p>
                        AI is being used to generate short insights on recorded data about recent donations. Information
                        about donations (such as donor names or other personally-identifiable details) is anonymized before
                        being sent to the AI.
                    </p>

                    <h3 className="text-xl font-medium mt-4 mb-2">AI Model Used</h3>
                    <ul>
                        <li>- Model: GPT-4o Mini</li>
                        <li>- Knowledge Cutoff: October 2023</li>
                    </ul>

                    <h3 className="text-xl font-medium mt-4 mb-2">How Prompts Are Crafted For DonorConnect</h3>
                    <p>
                        Prompts are constructed to provide the model only the minimal, anonymized context it needs to generate
                        helpful insights (for example: a table of recent donation amounts, dates, and staff-generated notes).
                        Prompts avoid sharing names, contact information, or any PII.
                    </p>

                    <h3 className="text-xl font-medium mt-4 mb-2">How AI Improves The Solution</h3>
                    <p>
                        AI is used to recognize patterns in donation data and flag spikes or drops that may be useful for
                        fundraising teams. These lightweight, actionable insights give staff a starting point for investigation
                        or follow-up without exposing sensitive information.
                    </p>

                    <h3 className="text-xl font-medium mt-4 mb-2">Safeguards &amp; Limitations</h3>
                    <ul>
                        <li>Anonymization: PII is stripped before sending data to the model.</li>
                        <li>Transparency: Insights indicate they were AI-generated, thus should be validated by staff.</li>
                        <li>Manual control: Users can regenerate AI insights at any time.</li>
                    </ul>
                </article>
            </section>
        </main>
    )
}
