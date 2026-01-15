export default function Page() {
    return (
        <main className="container mx-auto py-12 px-4">
            <section className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">Why DonorConnect?</h1>

                <article className="prose prose-lg text-gray-800">
                    <h2 className="text-2xl font-semibold mt-6 mb-3">The Solution</h2>
                    <p>
                        DonorConnect provides a system for managing up-to-date records, tools to simplify donor management and donation recording, and a
                        feature to dig deeper on what data means.
                    </p>

                    <h3 className="text-xl font-medium mt-4 mb-2">Features</h3>
                    <ul>
                        <li>- Centralized donor and donation records</li>
                        <li>- Simple interface to add donors, record donations, and make reports</li>
                        <li>- A tool to capture notes and generate deeper insights on data</li>
                    </ul>

                    <h3 className="text-xl font-medium mt-4 mb-2">Expected Future Challenges / Constraints</h3>
                    <ul>
                        <li>- Making the UI accessible and easy to navigate for everyone (testing constraints)</li>
                        <li>- Creating features that are easy to integrate with each other (time constraint)</li>
                        <li>- Making the app's suggestions non-invasive but useful (balancing suggestion tools)</li>
                    </ul>

                    <h3 className="text-xl font-medium mt-4 mb-2">How The Challenges Will Be Handled / Planned For</h3>
                    <ul>
                        <li>- A dashboard will be used to access key features with little navigating</li>
                        <li>- Features will revolve around donation handling and gaining insights</li>
                        <li>- Focus on suggestions being user-controlled and anonymized to reduce privacy concerns</li>
                    </ul>

                    <h3 className="text-xl font-medium mt-4 mb-2">Summary of The System</h3>
                    <p>
                        The dashboard brings a quick summary of statistics from donors/donations data and an overview of recent activity based on monthly/lifetime donations.
                        This allows staff to spend less time analyzing the data because they have quick access to the most important information.
                        The donors tab allows for easy creation of new donors, and the donations tab allows for easy recording of donations.
                        The reports tab allows for easy generation of reports, and the notes feature allows donations to be much more detailed (also affecting AI insights).
                    </p>

                    <h3 className="text-xl font-medium mt-4 mb-2">The Project Plan</h3>
                    <p>
                        <a
                            href="https://trello.com/invite/b/6951eb0e648e5be483733b6f/ATTIdd4da9c97a5a54f7f94af03c14ce6c740832C95D/aaron-lopez-bc2-donorconnect"
                            className="text-sky-600 hover:underline"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Trello Board
                        </a>
                    </p>
                </article>
            </section>
        </main>
    )
}
