import Layout from '../components/layout';

const Profile = () => {
    return (
        <Layout>
            <div className="p-6 bg-[#2A2A2A] rounded shadow">
                {/* Profile Header */}
                <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 bg-gray-500 rounded-full flex items-center justify-center text-3xl">
                        <img src="/images/profile.png" alt="Home" className="w-14 h-14" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">@username</h2>
                        <p className="text-gray-400">"Enter bio here . . . ."</p>
                        <p className="text-gray-500"> Joined May 7, 2020</p>
                    </div>
                </div>

                {/* Profile Stats */}
                <div className="mt-4 flex space-x-6 text-lg">
                    <div><span className="font-bold">245</span> Posts</div>
                    <div><span className="font-bold">10.2K</span> Followers</div>
                    <div><span className="font-bold">512</span> Following</div>
                </div>

                {/* Follow & Edit Buttons */}
                <div className="mt-4">
                    <button className="bg-primary text-white px-6 py-2 rounded-md mr-2">Edit Profile</button>
                    <button className="bg-[#444] text-white px-6 py-2 rounded-md">Follow</button>
                </div>

                {/* Recent Posts */}
                <div className="mt-6 space-y-4">
                    <h3 className="text-xl font-bold">Recent Posts</h3>

                    <div className="p-4 bg-[#333] rounded">
                        <h4 className="font-bold">@username</h4>
                        <p>hellow :p </p>
                    </div>

                    <div className="p-4 bg-[#333] rounded">
                        <h4 className="font-bold">@username</h4>
                        <p>Unbound!!! </p>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Profile;