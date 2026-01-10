export default function Page() {
    return (
        <main className="container mx-auto py-12 px-4">
            <section className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">Reflection</h1>

                <article className="prose prose-lg text-gray-800">
                    <h2 className="text-2xl font-semibold mt-6 mb-3">What went well?</h2>
                    <p>
                        Creating the wireframes went well, and I was able to repurpose a previous project submission into a
                        more polished experience with better UI decisions.
                    </p>

                    <h2 className="text-2xl font-semibold mt-6 mb-3">What didn't go well?</h2>
                    <p>
                        Implementing the features into Next JS was a challenge because I had to figure out how to balance
                        nuanced features such as events tracking into a donation recording system. What also didn't go well the
                        first time was looking at DonorConnect from the perspective of a fundraising staff. This led to me
                        struggling on ideas for what features to implement to make it different from other solutions.
                    </p>

                    <h2 className="text-2xl font-semibold mt-6 mb-3">What I changed during the project and why?</h2>
                    <p>
                        Something I changed during the project was how to approach the features. I originally intended the
                        features to be separate pages but I realized it would be a lot of pages to navigate between, so I put
                        them all in a single Dashboard page so it's a lot more compact.
                    </p>

                    <h2 className="text-2xl font-semibold mt-6 mb-3">What I would build if I had more time?</h2>
                    <p>
                        I would make the app have many more side features such as the ability to automate thank you notes to
                        donors or be able to backup data.
                    </p>
                </article>
            </section>
        </main>
    )
}
