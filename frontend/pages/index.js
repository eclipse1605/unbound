import { useState } from 'react';
import Layout from '../components/layout';
import SparkFeed from '../components/SparkFeed';
import CreateSpark from '../components/CreateSpark';
import { Dialog } from '@headlessui/react';
import { X } from 'lucide-react';

const Home = () => {
    const [isComposeOpen, setIsComposeOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleCreateSuccess = () => {
        
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <Layout>
            <div className="flex items-center">
                <img src="/images/home.png" alt="Home" className="w-14 h-14" />
                <span className="font-bold text-lg text-white">Home</span>
                <button 
                    onClick={() => setIsComposeOpen(true)}
                    className="ml-auto bg-[#9B7CFA] text-white px-4 py-2 rounded-full hover:bg-[#8b6be0] transition"
                >
                    Compose
                </button>
            </div>
            
            {}
            <div className="mt-4">
                <SparkFeed key={refreshTrigger} />
            </div>

            {}
            <Dialog open={isComposeOpen} onClose={() => setIsComposeOpen(false)} className="fixed z-50 inset-0 overflow-y-auto">
                <div className="flex items-center justify-center min-h-screen bg-black bg-opacity-50 p-4">
                    <Dialog.Panel className="bg-[#1A1A1A] rounded-2xl p-6 w-full max-w-xl shadow-lg relative">
                        <button
                            onClick={() => setIsComposeOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white"
                        >
                            <X size={20} />
                        </button>
                        <Dialog.Title className="text-lg font-semibold text-white mb-4">
                            Create a Spark
                        </Dialog.Title>
                        
                        <CreateSpark 
                            onClose={() => setIsComposeOpen(false)} 
                            onSuccess={handleCreateSuccess} 
                        />
                    </Dialog.Panel>
                </div>
            </Dialog>
        </Layout>
    );
};

export default Home;
