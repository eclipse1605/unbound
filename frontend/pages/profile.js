import Layout from '../components/layout';
import { useEffect, useState } from 'react';
import { setupNetwork } from '../utils/ethereum';
import { ethers } from 'ethers';
import { getOrbitManagerWritable } from '../utils/orbit';
import { getProfileData, orbitUser, isOrbiting, unorbitUser } from '../utils/profile';
import ProfileEditor from '../components/ProfileEditor';
import { Dialog } from '@headlessui/react';
import { useRouter } from 'next/router';
import { fetchUserSparksAndRebounds, fetchUserOrbitData, isUserOrbiting, likeSpark, unlikeSpark } from '../utils/directQueries';
import { formatDate } from '../utils/format';
import { isIpfsHash, fetchIpfsContent } from '../utils/ipfs';
import Link from 'next/link';
import Head from 'next/head';
import Image from 'next/image';
import { setupNetwork as networkSetup } from '../utils/network';

const Profile = () => {
    const router = useRouter();
    const { address: queryAddress } = router.query;
    
    const [address, setAddress] = useState('');
    const [sparks, setSparks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [orbiters, setOrbiters] = useState([]);
    const [orbits, setOrbits] = useState([]);
    const [isOrbiting, setIsOrbiting] = useState(false);
    const [orbitLoading, setOrbitLoading] = useState(false);
    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
    const [profileData, setProfileData] = useState({name: '', bio: '', profileImage: ''});
    const [viewingOwnProfile, setViewingOwnProfile] = useState(true);
    const [currentUserAddress, setCurrentUserAddress] = useState('');
    const [hasDirectAccess, setHasDirectAccess] = useState(false);

    const refreshProfileData = async () => {
        if (!router.isReady) return;
        
        setLoading(true);
        setError('');
        try {
            let userAddress = '';
            let targetAddress = '';

            if (typeof window !== 'undefined' && window.ethereum) {
                const connected = await setupNetwork().catch(() => false);
                setHasDirectAccess(connected);
                
                const provider = new ethers.BrowserProvider(window.ethereum);
                const accounts = await provider.send('eth_requestAccounts', []);
                userAddress = accounts[0];
                setCurrentUserAddress(userAddress);

                targetAddress = queryAddress || userAddress;
                setAddress(targetAddress);

                setViewingOwnProfile(userAddress.toLowerCase() === targetAddress.toLowerCase());
            } else {
                setError('MetaMask not detected.');
                setLoading(false);
                return;
            }

            const profile = await getProfileData(targetAddress);
            setProfileData(profile);

            try {
                const contentData = await fetchUserSparksAndRebounds(targetAddress);

                const processedContent = await Promise.all(contentData.map(async (item) => {
                    try {
                        // Debug the raw item format
                        console.log(`Processing raw item with ID ${item.id}:`, item);
                        
                        // Fix for array-indexed data vs object properties
                        // Check if we have numeric indices and assign them properly
                        if (item[2] && typeof item[2] === 'string' && !item.mediaHash) {
                            console.log(`[Profile] Found mediaHash at index 2: ${item[2]}, adding as mediaHash property`);
                            item.mediaHash = item[2];
                        }
                        
                        if (!item.content) {
                            item.content = "No content available";
                        } else if (typeof item.content !== 'string') {
                            item.content = String(item.content || "");
                        }

                        if (item.content && isIpfsHash(item.content)) {
                            try {
                                console.log("Fetching IPFS content for item:", item.id);
                                const ipfsContent = await fetchIpfsContent(item.content);
                                
                                if (ipfsContent && typeof ipfsContent === 'string') {
                                    item.content = ipfsContent;
                                } else if (ipfsContent && typeof ipfsContent === 'object') {
                                    item.content = JSON.stringify(ipfsContent);
                                }
                            } catch (ipfsError) {
                                console.error("Failed to fetch IPFS content:", ipfsError);
                                item.content = "Error loading content from IPFS";
                            }
                        }
                        
                        // Ensure mediaHash is present after processing
                        console.log(`[Profile] After processing, item ${item.id || 'unknown'} mediaHash:`, item.mediaHash);
                    } catch (error) {
                        console.error("Error processing item content:", error, item);
                        item.content = "Error processing content";
                    }
                    return item;
                }));
                
                setSparks(processedContent);
            } catch (sparkErr) {
                console.error('Failed to load sparks and rebounds:', sparkErr);
                setSparks([]);
            }

            try {
                const orbitData = await fetchUserOrbitData(targetAddress);
                setOrbiters(orbitData.orbiters || []);
                setOrbits(orbitData.orbits || []);

                if (!viewingOwnProfile) {
                    const orbiting = await isUserOrbiting(userAddress, targetAddress);
                    setIsOrbiting(orbiting);
                }
            } catch (orbitErr) {
                console.error('Failed to load orbit data:', orbitErr);
                setOrbiters([]);
                setOrbits([]);
            }
        } catch (err) {
            console.error('Failed to load profile:', err);
            setError('Failed to load profile: ' + (err?.message || String(err)));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshProfileData();
    }, [router.isReady, queryAddress]);

    const handleOrbit = async () => {
        if (!hasDirectAccess) {
            setError('MetaMask connection required to orbit users');
            return;
        }
        
        setOrbitLoading(true);
        try {
            const contract = await getOrbitManagerWritable();
            await contract.orbit(address);
            setIsOrbiting(true);

            setOrbiters(prev => [...prev, currentUserAddress]);
        } catch (err) {
            setError('Failed to orbit: ' + (err?.message || String(err)));
        } finally {
            setOrbitLoading(false);
        }
    };
    
    const handleUnorbit = async () => {
        if (!hasDirectAccess) {
            setError('MetaMask connection required to unorbit users');
            return;
        }
        
        setOrbitLoading(true);
        try {
            const contract = await getOrbitManagerWritable();
            await contract.unorbit(address);
            setIsOrbiting(false);

            setOrbiters(prev => prev.filter(orbiter => 
                orbiter.toLowerCase() !== currentUserAddress.toLowerCase()
            ));
        } catch (err) {
            setError('Failed to unorbit: ' + (err?.message || String(err)));
        } finally {
            setOrbitLoading(false);
        }
    };

    const handleProfileUpdate = () => {
        
        getProfileData(address).then(setProfileData);
    };

    const formatAddress = (addr) => {
        if (!addr) return '';
        return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
    };
    
    const renderSparks = () => {
        if (sparks.length === 0) {
            return (
                <div className="bg-[#2A2A2A] border border-gray-700 text-gray-300 rounded-lg p-6 text-center">
                    <p className="text-xl mb-4">No sparks yet</p>
                    {viewingOwnProfile && (
                        <p>Create your first spark to get started!</p>
                    )}
                </div>
            );
        }

        console.log("Sparks to render:", sparks);
    
        // Debug: Check which sparks have mediaHash
        sparks.forEach(spark => {
            // Fix mediaHash if it's at index 2 but not in the mediaHash property
            if (spark[2] && typeof spark[2] === 'string' && !spark.mediaHash) {
                console.log(`[Profile] Adding missing mediaHash from index 2: ${spark[2]}`);
                spark.mediaHash = spark[2];
            }
            
            console.log(`[Profile] Spark ${spark.id} mediaHash:`, {
                hasMediaHash: !!spark.mediaHash,
                mediaHash: spark.mediaHash,
                indexedData: spark[2]
            });
        });

        return (
            <div className="space-y-4">
                {sparks.map((item) => {
                    console.log(`Rendering spark ${item.id}:`, item);
                    // Create a unique key using type and id together
                    const uniqueKey = `${item.type || 'spark'}-${item.id}`;
                    return (
                    <div key={uniqueKey} className="bg-[#2A2A2A] p-3 rounded-lg border border-gray-700 shadow-md">
                        <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                                <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center overflow-hidden">
                                    {profileData.profileImage ? (
                                        <img src={profileData.profileImage} alt="Profile" className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                        <span className="text-white text-sm">{profileData.name?.charAt(0) || address?.slice(0, 1)}</span>
                                    )}
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center">
                                    <p className="text-white font-semibold text-sm">
                                        {profileData.name || formatAddress(address)}
                                    </p>
                                    <span className="ml-2 text-gray-400 text-xs">
                                        {formatDate(item.timestamp * 1000)}
                                    </span>
                                </div>
                                
                                {}
                                {process.env.NODE_ENV !== 'production' && (
                                    <div className="text-xs text-gray-500 mb-1">
                                        ID: {item.id}, Type: {item.type || 'unknown'}
                                    </div>
                                )}
                                
                                <div className="text-gray-300 text-sm mt-1 break-words whitespace-pre-wrap">
                                    {typeof item.content === 'string' && item.content 
                                        ? item.content 
                                        : "Content unavailable"}
                                </div>
                                
                                {/* Display media if available */}
                                {item.mediaHash && (
                                    <div className="mt-3">
                                        <img 
                                            src={`https://gateway.pinata.cloud/ipfs/${item.mediaHash}`}
                                            alt="Media content" 
                                            className="rounded-md max-h-96 max-w-full"
                                            onLoad={(e) => {
                                                console.log(`[Profile] Image loaded successfully for spark ${item.id}`);
                                            }}
                                            onError={(e) => {
                                                console.error(`[Profile] Failed to load image for spark ${item.id}:`, item.mediaHash);
                                                e.target.style.display = 'none';
                                                // Show error message below
                                                const errorMsg = document.createElement('div');
                                                errorMsg.className = 'text-red-400 mt-2 text-xs';
                                                errorMsg.innerText = 'Failed to load image from IPFS.';
                                                e.target.parentNode.appendChild(errorMsg);
                                            }}
                                        />
                                    </div>
                                )}
                                
                                {item.isRebound && item.originalSparkId && (
                                    <div className="text-xs text-[#9B7CFA] mt-1">
                                        Rebounded from spark #{item.originalSparkId}
                                    </div>
                                )}
                                
                                <div className="flex items-center space-x-4 mt-2">
                                    <button 
                                        className={`flex items-center space-x-1 ${item.hasLiked ? 'text-[#9B7CFA]' : 'text-gray-400 hover:text-gray-300'}`}
                                        onClick={async () => {
                                            try {
                                                setLoading(true);
                                                if (item.hasLiked) {
                                                    await unlikeSpark(item.id);
                                                    
                                                    setSparks(sparks.map(s => 
                                                        s.id === item.id 
                                                            ? {...s, hasLiked: false, likes: Math.max(0, s.likes - 1)} 
                                                            : s
                                                    ));
                                                } else {
                                                    await likeSpark(item.id);
                                                    
                                                    setSparks(sparks.map(s => 
                                                        s.id === item.id 
                                                            ? {...s, hasLiked: true, likes: s.likes + 1} 
                                                            : s
                                                    ));
                                                }
                                            } catch (error) {
                                                console.error('Error toggling like:', error);
                                                console.log(error.message || 'Failed to like/unlike spark');
                                            } finally {
                                                setLoading(false);
                                            }
                                        }}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                        </svg>
                                        <span className="text-xs">{item.likes || 0}</span>
                                    </button>
                                    <Link href={`/spark/${item.id}`} passHref>
                                        <button className="text-gray-400 flex items-center space-x-1 hover:text-gray-300">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                            </svg>
                                            <span className="text-xs">{item.rebounds || 0}</span>
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                )})}
            </div>
        );
    };
    
    return (
        <Layout>
            <div className="container mx-auto p-4">
                {}
                <div className="bg-[#2A2A2A] rounded-lg p-4 shadow-md mb-4">
                    <div className="flex flex-col items-center">
                        <div className="w-20 h-20 rounded-full bg-gray-600 mb-3 flex items-center justify-center overflow-hidden">
                        {profileData.profileImage ? (
                                <img src={profileData.profileImage} alt="Profile" className="w-full h-full rounded-full object-cover" />
                            ) : (
                                <span className="text-white text-xl">{profileData.name?.charAt(0) || address?.slice(0, 1)}</span>
                            )}
                        </div>
                        <h1 className="text-white text-lg font-bold truncate max-w-full">
                            {profileData.name || formatAddress(address)}
                        </h1>
                        <p className="text-gray-400 text-xs mb-2">
                            {formatAddress(address)}
                        </p>
                        
                        {profileData.bio && (
                            <p className="text-gray-300 text-center text-sm mb-3">{profileData.bio}</p>
                        )}
                        
                        <div className="grid grid-cols-3 w-full md:w-1/2 border-t border-gray-700 pt-3 mb-3">
                            <div className="text-center">
                                <p className="text-white font-bold text-sm">{orbiters.length}</p>
                                <p className="text-gray-400 text-xs">Orbiters</p>
                            </div>
                            <div className="text-center">
                                <p className="text-white font-bold text-sm">{orbits.length}</p>
                                <p className="text-gray-400 text-xs">Orbits</p>
                    </div>
                            <div className="text-center">
                                <p className="text-white font-bold text-sm">{sparks.length}</p>
                                <p className="text-gray-400 text-xs">Sparks</p>
                    </div>
                </div>

                    {viewingOwnProfile ? (
                        <button 
                            onClick={() => setIsEditProfileOpen(true)}
                                className="py-2 px-4 rounded-full bg-[#9B7CFA] hover:bg-[#8b6be0] text-white font-medium transition w-full md:w-1/3"
                            >
                                Edit Profile
                            </button>
                        ) : (
                            <button 
                                onClick={isOrbiting ? handleUnorbit : handleOrbit}
                                disabled={orbitLoading}
                                className={`py-2 px-4 rounded-full ${
                                    isOrbiting ? 'bg-gray-700 hover:bg-gray-600' : 'bg-[#9B7CFA] hover:bg-[#8b6be0]'
                                } text-white font-medium transition flex items-center justify-center w-full md:w-1/3`}
                            >
                                {orbitLoading && (
                                    <div className="animate-spin h-4 w-4 border-2 border-t-transparent border-white rounded-full mr-2"></div>
                                )}
                                {isOrbiting ? 'Unorbit' : 'Orbit'}
                            </button>
                    )}
                    </div>
                </div>

                {}
                <div className="mt-4">
                    <h2 className="text-white text-xl font-bold mb-4">
                        {viewingOwnProfile ? 'Your Sparks' : `${profileData.name ? profileData.name + "'s" : formatAddress(address)} Sparks`}
                    </h2>
                    
                    {loading && (
                        <div className="flex justify-center p-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9B7CFA]"></div>
                        </div>
                    )}
                    
                    {error && (
                        <div className="bg-[#2A2A2A] border border-red-800 text-gray-300 rounded-lg p-4 shadow-md">
                            <p className="font-medium">Error</p>
                            <p className="text-sm mt-1">{error}</p>
                            <button 
                                onClick={refreshProfileData}
                                className="mt-3 px-4 py-2 bg-[#9B7CFA] text-white rounded-md hover:bg-[#8b6be0] transition"
                            >
                                Retry
                            </button>
                        </div>
                    )}
                    
                    {!loading && !error && renderSparks()}
                </div>

                {}
                <Dialog open={isEditProfileOpen} onClose={() => setIsEditProfileOpen(false)} className="fixed z-50 inset-0 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen bg-black bg-opacity-50 p-4">
                        <Dialog.Panel className="bg-[#1A1A1A] rounded-2xl p-6 w-full max-w-md shadow-lg">
                            <Dialog.Title className="text-lg font-semibold text-white mb-4">
                                Edit Profile
                            </Dialog.Title>
                            
                            <ProfileEditor 
                                initialData={profileData}
                                userAddress={address}
                                onSuccess={() => {
                                    setIsEditProfileOpen(false);
                                    handleProfileUpdate();
                                }}
                                onCancel={() => setIsEditProfileOpen(false)}
                            />
                        </Dialog.Panel>
                    </div>
                </Dialog>
            </div>
        </Layout>
    );
};

export default Profile;