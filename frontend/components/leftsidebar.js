import Link from 'next/link';
import { useState, useEffect } from 'react';

const LeftSidebar = () => {
    const [isSmallScreen, setIsSmallScreen] = useState(false);
    const [tweet, setTweet] = useState("");

    useEffect(() => {
        const handleResize = () => {
            setIsSmallScreen(window.innerWidth <= 768);
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleTweet = () => {
        if (tweet.trim()) {
            console.log("Tweeted:", tweet);
            setTweet(""); // Clear input after tweeting
        }
    };

    return (
        <aside className={`h-screen p-4 bg-[#212121] text-white border-r border-gray-700 fixed left-0 top-0 
            ${isSmallScreen ? 'w-16' : 'w-48 md:w-64'} transition-all duration-300 flex flex-col justify-between z-50`}>

            <nav className="space-y-6 pt-16 md:pt-20">
                <ul className="space-y-4 text-lg">
                    <li>
                        <Link href="/" className="flex items-center space-x-2">
                            <img src="/images/home.png" alt="Home" className="w-14 h-14" />
                            {!isSmallScreen && <span>Home</span>}
                        </Link>
                    </li>

                    <li>
                        <Link href="/explore" className="flex items-center space-x-2">
                            <img src="/images/explore.png" alt="Explore" className="w-14 h-14" />
                            {!isSmallScreen && <span>Explore</span>}
                        </Link>
                    </li>
                    <li>
                        <Link href="/notifications" className="flex items-center space-x-2">
                            <img src="/images/notifications.png" alt="Notifications" className="w-14 h-14" />
                            {!isSmallScreen && <span>Notifications</span>}
                        </Link>
                    </li>
                    <li>
                        <Link href="/messages" className="flex items-center space-x-2">
                            <img src="/images/messages.png" alt="Messages" className="w-14 h-14" />
                            {!isSmallScreen && <span>Messages</span>}
                        </Link>
                    </li>
                    <li>
                        <Link href="/lists" className="flex items-center space-x-2">
                            <img src="/images/lists.png" alt="Lists" className="w-14 h-14" />
                            {!isSmallScreen && <span>Lists</span>}
                        </Link>
                    </li>
                    <li>
                        <Link href="/profile" className="flex items-center space-x-2">
                            <img src="/images/profile.png" alt="Profile" className="w-14 h-14" />
                            {!isSmallScreen && <span>Profile</span>}
                        </Link>
                    </li>
                    <li>
                        <Link href="/explore" className="flex items-center space-x-2">
                            <img src="/images/more.png" alt="More" className="w-14 h-14" />
                            {!isSmallScreen && <span>More</span>}
                        </Link>
                    </li>

                </ul>
            </nav>

            {/* Quick Tweet Box */}
            {!isSmallScreen && (
                <div className="mt-6 p-3 bg-[#2A2A2A] rounded-md">
                    <textarea
                        value={tweet}
                        onChange={(e) => setTweet(e.target.value)}
                        placeholder="What's happening?"
                        className="w-full bg-transparent text-white p-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 resize-none"
                        rows="3"
                    ></textarea>
                    <button
                        onClick={handleTweet}
                        className="w-full bg-primary text-white py-2 rounded-md mt-2 hover:bg-[#5a3a6f] transition"
                    >
                        Tweet
                    </button>
                </div>
            )}
        </aside>
    );
};

export default LeftSidebar;
