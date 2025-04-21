import LeftSidebar from '../components/leftsidebar';
import RightSidebar from '../components/rightsidebar';
import Header from '../components/header';

const Layout = ({ children }) => {
    return (
        <div className="flex h-screen bg-[#212121] text-white">
            {}
            <LeftSidebar />

            {}
            <div className="flex-grow ml-64 mr-64 pt-20 pb-6 overflow-y-auto">
                <Header />
                <main className="max-w-2xl mx-auto">{children}</main>
            </div>

            {}
            <RightSidebar />
        </div>
    );
};

export default Layout;
