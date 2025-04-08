import Layout from '../components/layout';

const Home = () => {
    return (
        <Layout>
            <div className="flex items-center ">
                <img src="/images/home.png" alt="Home" className="w-14 h-14" />
                <span className="font-bold text-lg">Home</span>
            </div>
            <div className="mt-4 space-y-6">
                <div className="p-4 bg-[#2A2A2A] rounded shadow">
                    <h2 className="font-bold">@User1</h2>
                    <p>This is my first post! </p>
                </div>
                <div className="p-4 bg-[#2A2A2A] rounded shadow">
                    <h2 className="font-bold">@User2</h2>
                    <p>Hi guys!!!! </p>
                </div>
            </div>
        </Layout>
    );
};

export default Home;
