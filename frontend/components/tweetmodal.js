// components/TweetModal.js
import { Dialog } from '@headlessui/react';
import { X } from 'lucide-react';
import { useState } from 'react';

const TweetModal = ({ isOpen, onClose }) => {
  const [tweetText, setTweetText] = useState('');

  const handlePost = () => {
    if (tweetText.trim()) {
      console.log('Tweeted:', tweetText); // replace with API call
      setTweetText('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen bg-black bg-opacity-50 p-4">
        <Dialog.Panel className="bg-[#1A1A1A] rounded-2xl p-6 w-full max-w-xl shadow-lg relative">
          <button
            onClick={onClose}
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

        <div className="mt-4 flex items-center justify-between">
            <div className="flex space-x-4">
                <img src="/images/image.svg" alt="Add image" className="w-5 h-5 cursor-pointer hover:opacity-80" />
                <img src="/images/gif.svg" alt="Add GIF" className="w-5 h-5 cursor-pointer hover:opacity-80" />
                <img src="/images/emoji.svg" alt="Emoji" className="w-5 h-5 cursor-pointer hover:opacity-80" />
                <img src="/images/poll.svg" alt="Poll" className="w-5 h-5 cursor-pointer hover:opacity-80" />
                <img src="/images/schedule.svg" alt="Schedule" className="w-5 h-5 cursor-pointer hover:opacity-80" />
                <img src="/images/location.svg" alt="Location" className="w-5 h-5 cursor-pointer hover:opacity-80" />
            </div>

            <button
                onClick={handlePost}
                className="bg-[#9B7CFA] text-white px-4 py-2 rounded-full hover:bg-[#8b6be0] transition disabled:opacity-50"
                disabled={!tweetText.trim()}
            >
            Post
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default TweetModal;
