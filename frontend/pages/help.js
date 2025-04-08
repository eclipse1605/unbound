export default function HelpPage() {
    return (
        <div className="bg-[#212121] text-white min-h-screen p-6">
            <h1 className="text-3xl font-bold">Help & Support</h1>
            <section className="mt-6">
                <h2 className="text-2xl">FAQs</h2>
                <p className="mt-2">Q: How do I use Unbound?</p>
                <p>A: Simply navigate through the pages and explore the features.</p>
                <p className="mt-2">Q: How can I contact support?</p>
                <p>A: Use the form below.</p>
            </section>
            <section className="mt-6">
                <h2 className="text-2xl">Contact Us</h2>
                <form className="mt-4">
                    <input type="text" placeholder="Your Name" className="w-full p-2 mb-2 bg-gray-800 text-white rounded" />
                    <input type="email" placeholder="Your Email" className="w-full p-2 mb-2 bg-gray-800 text-white rounded" />
                    <textarea placeholder="Your Message" className="w-full p-2 bg-gray-800 text-white rounded"></textarea>
                    <button className="mt-4 bg-[#3f2a52] text-white p-2 rounded">Submit</button>
                </form>
            </section>
        </div>
    );
}
