import Layout from '../components/layout';

const Lists = () => {
    return (
        <Layout>
            <div className="flex items-center ">
                <img src="/images/lists.png" alt="Home" className="w-14 h-14" />
                <span className="font-bold text-lg">Lists</span>
            </div>

            <div className="mt-4 space-y-6">
                {/* Saved Lists */}
                <div className="p-4 bg-[#2A2A2A] rounded shadow">
                    <h2 className="font-bold">Saved Lists</h2>
                    <ul className="mt-2 space-y-2">
                        <li>🔹 List 1</li>
                        <li>🔹 List 2</li>
                        <li>🔹 List 3</li>
                    </ul>
                </div>

                {/* Suggested Lists */}
                <div className="p-4 bg-[#2A2A2A] rounded shadow">
                    <h2 className="font-bold">Trending Lists</h2>
                    <ul className="mt-2 space-y-2">
                        <li> List A</li>
                        <li> List B</li>
                        <li> List C</li>
                    </ul>
                </div>

                {/* Create New List */}
                <div className="p-4 bg-[#2A2A2A] rounded shadow">
                    <h2 className="font-bold">Create a New List</h2>
                    <input
                        type="text"
                        placeholder="List Name..."
                        className="w-full bg-[#333] text-white p-2 rounded-md mt-2 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    />
                    <button className="w-full bg-primary text-white py-2 rounded-md mt-2">
                        Create List
                    </button>
                </div>
            </div>
        </Layout>
    );
};

export default Lists;
