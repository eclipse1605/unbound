import Layout from '../components/layout';

const Explore = () => {
    return (
        <Layout>
            <div className="flex items-center ">
                <img src="/images/explore.png" alt="Home" className="w-14 h-14" />
                <span className="font-bold text-lg">Explore</span>
            </div>
            <div className="mt-4 space-y-6">
                <div className="p-4 bg-[#2A2A2A] rounded shadow">
                    <h2 className="font-bold">Trending Topics</h2>
                    <ul className="mt-2 space-y-2">
                        <li>#HiGuys</li>
                        <li>#Unbound</li>
                        <li>#SEProject</li>
                    </ul>
                </div>

                <div className="p-4 bg-[#2A2A2A] rounded shadow">
                    <h2 className="font-bold">Discover New Creators</h2>
                    <ul className="mt-2 space-y-2">
                        <li>@UserA</li>
                        <li>@UserB</li>
                        <li>@UserC</li>
                    </ul>
                </div>
            </div>
        </Layout>
    );
};

export default Explore;
