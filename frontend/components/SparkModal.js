
import { Dialog } from '@headlessui/react';
import { X } from 'lucide-react';
import { useState } from 'react';

const SparkModal = ({ isOpen, onClose }) => {
  const [content, setContent] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('Creating spark:', content);
    setContent('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#212121] rounded-lg p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Create a Spark</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's happening?"
            className="w-full h-32 bg-[#2c2c2c] text-white rounded-lg p-4 mb-4 resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            maxLength={280}
          />
          <div className="flex justify-between items-center">
            <span className="text-gray-400">
              {content.length}/280 characters
            </span>
            <button
              type="submit"
              disabled={!content.trim()}
              className={`px-6 py-2 rounded-full ${
                content.trim()
                  ? 'bg-primary hover:bg-[#5a3a6f]'
                  : 'bg-gray-600 cursor-not-allowed'
              } text-white transition`}
            >
              Spark
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SparkModal;
