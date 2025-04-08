import React, { useState } from "react";
import { Dialog } from "@headlessui/react";
import { X } from "lucide-react";

const Tweet = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [tweetText, setTweetText] = useState("");

  const handleTweet = () => {
    if (tweetText.trim()) {
      console.log("Tweeted:", tweetText); // Replace with backend logic
      setTweetText("");
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Tweet Button in Sidebar */}
      <button
        onClick={() => setIsOpen(true)}
        className="bg-[#9B7CFA] text-white font-medium px-4 py-2 rounded-full w-full hover:bg-[#8b6be0] transition"
      >
        Tweet
      </button>

      {/* Modal */}
      <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="fixed z-50 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen bg-black bg-opacity-50 p-4">
          <Dialog.Panel className="bg-[#1A1A1A] rounded-2xl p-6 w-full max-w-xl shadow-lg relative">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>
            <Dialog.Title className="text-lg font-semibold text-white mb-4">
              What’s happening?
            </Dialog.Title>

            <textarea
              rows="4"
              className="w-full bg-transparent border border-gray-600 rounded-lg p-3 text-white resize-none focus:outline-none focus:ring-2 focus:ring-[#9B7CFA]"
              placeholder="What's on your mind?"
              value={tweetText}
              onChange={(e) => setTweetText(e.target.value)}
            />

            <div className="mt-4 text-right">
              <button
                onClick={handleTweet}
                className="bg-[#9B7CFA] text-white px-4 py-2 rounded-full hover:bg-[#8b6be0] transition disabled:opacity-50"
                disabled={!tweetText.trim()}
              >
                Post
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
};

export default Tweet;
