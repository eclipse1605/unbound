import Layout from '../components/layout';

const Messages = () => {
    return (
        <Layout>
            <div className="flex items-center">
                <img src="/images/messages.png" alt="Messages" className="w-14 h-14" />
                <span className="font-bold text-lg text-white">Messages</span>
            </div>
            
            <div className="mt-6 p-6 bg-[#2A2A2A] rounded-lg border border-[#3a3a3a]">
                <div className="flex items-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h2 className="text-xl font-bold text-white">The Graph Integration Disabled</h2>
                </div>
                <p className="text-gray-300 mb-4">
                    The Messages feature requires The Graph indexing service, which is currently disabled in this deployment.
                    This page will be fully functional once The Graph integration is enabled.
                </p>
                <p className="text-gray-400 text-sm">
                    Try using the Home page or Profile page which use direct blockchain calls for core functionality.
                </p>
            </div>
        </Layout>
    );
};

export default Messages;
