export default function Page() {
    return (
        <main className="container mx-auto py-12 px-4">
            <section className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">Reflection</h1>

                <article className="prose prose-lg text-gray-800">
                    <h2 className="text-2xl font-semibold mt-6 mb-3">What challenged me the most?</h2>
                    <p>
                        The most challenging part was figuring out how to look at DonorConnect from the perspective of a fundraising staff.
                        This led to me struggling on ideas for what features to implement to make it different from other solutions. Implementing the features into
                        Next JS was also a challenge because I had to figure out how to balance side features such as note tracking into a donation recording system.
                    </p>

                    <h2 className="text-2xl font-semibold mt-6 mb-3">What would I change or add if I had more time?</h2>
                    <p>
                        I would make the app have many more side features such as the ability to automate thank you notes to
                        donors or be able to backup data.
                    </p>

                    <h2 className="text-2xl font-semibold mt-6 mb-3">What did I learn about building real products?</h2>
                    <p>
                        I learned that it takes a lot of iteration to get a concept to a state where it works well for users as a product.
                        Brainstorming ideas was a struggle as I initially had little to no ideas for what features would suit a fundraising staff.
                        The process for coming up with even a simple note tracking idea took hours to come up with, leaving me stuck on the wireframes.
                    </p>

                    <h2 className="text-2xl font-semibold mt-6 mb-3">How did AI help?</h2>
                    <p>
                        In-terms of DonorConnect, AI generates insights for the fundraising staff based on recent donations and patterns in the data.
                        In-terms of the app itself, it helped to generate ideas for features that would be useful for fundraising staff when I got stuck,
                        taught me different ways to look at the issues I encountered inside of VSCode,
                        and generally why most of the components in the app are a bit more polished than in the wireframes.
                    </p>
                </article>
            </section>
        </main>
    )
}
