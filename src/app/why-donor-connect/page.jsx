export default function Page() {
    return (
        <main className="container mx-auto py-12 px-4">
            <section className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">Why DonorConnect?</h1>

                <article className="prose prose-lg text-gray-800">
                    <h2>The Solution</h2>
                    <p>
                        DonorConnect provides a system for managing up-to-date records, tools to detect duplicate info, and a
                        feature to dig deeper on what data means.
                    </p>

                    <h3>Features</h3>
                    <ul>
                        <li>Centralized donor and donation records</li>
                        <li>Simple interface to add donors, record donations, and make reports</li>
                        <li>A tool to capture notes and generate deeper insights on data</li>
                    </ul>

                    <h3>Expected Future Challenges / Constraints</h3>
                    <ul>
                        <li>Making the UI accessible and easy to navigate for everyone (testing constraints)</li>
                        <li>Creating features that are easy to integrate with each other (time constraint)</li>
                        <li>Making the app's suggestions non-invasive but useful (balancing suggestion tools)</li>
                    </ul>

                    <h3>How The Challenges Will Be Handled / Planned For</h3>
                    <ul>
                        <li>A dashboard will be used to access key features with little navigating</li>
                        <li>Features will revolve around donation handling and gaining insights</li>
                        <li>Focus on suggestions being user-controlled</li>
                    </ul>

                    <h3>Summary of The System</h3>
                    <p>Summary will be added later in VSCode as the implementation matures.</p>

                    <h3>The Project Plan</h3>
                    <p>[Trello Link]</p>
                </article>
            </section>
        </main>
    )
}
