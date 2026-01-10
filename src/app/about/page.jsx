export default function Page() {
    return (
        <main className="container mx-auto py-12 px-4">
            <section className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">About</h1>

                <article className="prose prose-lg text-gray-800">
                    <h2 className="text-2xl font-semibold mt-6 mb-3">The Problem</h2>
                    <p>
                        Fundraising staff may struggle with viewing old data, mismatching records, and making sense of the
                        data.
                    </p>

                    <h3 className="text-xl font-medium mt-4 mb-2">Why This Matters For Nonprofits</h3>
                    <ul>
                        <li>- Donation reporting becomes inaccurate and misleading</li>
                        <li>- Staff forget who to contact and follow-up with</li>
                        <li>- Routines aren’t improved and success isn’t easily gauged</li>
                    </ul>

                    <h3 className="text-xl font-medium mt-4 mb-2">Who Is Affected By This Problem</h3>
                    <ul>
                        <li>- Fundraising Staff</li>
                        <li>- Volunteers</li>
                        <li>- Donors (less insight on the impact of donations)</li>
                    </ul>

                    <h3 className="text-xl font-medium mt-4 mb-2">Problems If It Isn’t Solved</h3>
                    <ul>
                        <li>- Hard to manage and track data</li>
                        <li>- Difficulty learning and getting used to operations</li>
                        <li>- Less insights on donations and how to maximize success</li>
                    </ul>

                    <h3 className="text-xl font-medium mt-4 mb-2">How This App Is Different From Existing Solutions</h3>
                    <p>
                        DonorConnect provides useful features such as donor categories, recent progress summaries, and note
                        tracking for deeper insights on how to gain success/traction.
                    </p>

                    <br /> <hr />

                    <h3 className="text-xl font-medium mt-6 mb-3">Existing Solutions (their pros/cons)</h3>

                    <h4 className="text-lg font-medium mt-4 mb-2">Existing Solution 1 - Manual Spreadsheets (Google Suite)</h4>
                    <ul>
                        <li>+ Directly edit data with many nuanced tools such as charts and categories</li>
                        <li>- Tedious to fully learn and data may be scattered across sheets, docs, etc.</li>
                        <li>- Does not give feedback on the information recorded, requiring deeper analysis</li>
                    </ul>

                    <h4 className="text-lg font-medium mt-4 mb-2">Existing Solution 2 - Email Tracking</h4>
                    <ul>
                        <li>+ Easy to learn and repeat (back-and-forth emails between staff)</li>
                        <li>- Takes long to sift between emails and retain accuracy about donors/donations</li>
                        <li>- The information is messy and not categorized</li>
                    </ul>
                </article>
            </section>
        </main>
    )
}
