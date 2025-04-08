import Layout from '../components/layout';

const Notifications = () => {
    return (
        <Layout>
            <div className="flex items-center ">
                <img src="/images/notifications.png" alt="Home" className="w-14 h-14" />
                <span className="font-bold text-lg">Notifications</span>
            </div>
            <div className="mt-4 space-y-6">
                <div className="p-4 bg-[#2A2A2A] rounded shadow">
                    <h2 className="font-bold">Recent Activity</h2>
                    <ul className="mt-2 space-y-2">
                        <li> @User1 liked your post.</li>
                        <li> @User2 commented: "This is amazing!"</li>
                        <li> @User3 started following you.</li>
                        <li> @User4 retweeted your post.</li>
                    </ul>
                </div>

                <div className="p-4 bg-[#2A2A2A] rounded shadow">
                    <h2 className="font-bold">Suggested for You</h2>
                    <ul className="mt-2 space-y-2">
                        <li> @UserA just joined Unbound.</li>
                        <li> @UserB posted a viral thread.</li>
                    </ul>
                </div>
            </div>
        </Layout>
    );
};

export default Notifications;
