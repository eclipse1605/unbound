import { useState, useEffect } from 'react';

const RightSidebar = () => {
    return (
        <aside className="fixed right-0 top-16 w-64 bg-[#212121] text-white p-4 border-l border-gray-700 h-[calc(100vh-4rem)] overflow-y-auto">
            <h2 className="text-xl font-bold flex items-center space-x-2">
                <span>Trending Now</span>
            </h2>

            <ul className="space-y-2 mt-2">
                <li>#HiGuys</li>
                <li>#Unbound</li>
                <li>#SEProject</li>
            </ul>

            <h2 className="text-xl font-bold mt-6"> Who to Follow</h2>
            <div className="mt-2 space-y-3">
                <div className="flex justify-between items-center">
                    <span>@User1</span>
                    <button className="bg-primary text-white px-3 py-1 rounded">Follow</button>
                </div>
                <div className="flex justify-between items-center">
                    <span>@User2</span>
                    <button className="bg-primary text-white px-3 py-1 rounded">Follow</button>
                </div>
            </div>
        </aside>
    );
};

export default RightSidebar;
