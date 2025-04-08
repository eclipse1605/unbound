import Layout from '../components/layout';

const Messages = () => {
    return (
        <Layout>
            <div className="flex items-center ">
                <img src="/images/messages.png" alt="Home" className="w-14 h-14" />
                <span className="font-bold text-lg">Messages</span>
            </div>
            <div className="mt-4 space-y-6">
                {/* Recent Conversations */}
                <div className="p-4 bg-background rounded shadow">
                    <h2 className="font-bold">Recent Conversations</h2>
                    <ul className="mt-2 space-y-2">
                        <li>📩 @User3: "Hey, how are you?"</li>
                        <li>📩 @User4: "Check out this cool article!"</li>
                        <li>📩 @User5: "Want to collaborate on a project?"</li>
                    </ul>
                </div>

                {/* New Message Section */}
                <div className="p-4 bg-background rounded shadow">
                    <h2 className="font-bold">Start a New Conversation</h2>
                    <input
                        type="text"
                        placeholder="Search for users..."
                        className="w-full bg-[#333] text-white p-2 rounded-md mt-2 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    />
                    <button className="w-full bg-primary text-white py-2 rounded-md mt-2">
                        New Message
                    </button>
                </div>
            </div>
        </Layout>
    );
};

export default Messages;
