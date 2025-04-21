import { useState, useEffect } from 'react';
import { updateProfile, getProfileData, getCurrentAccount } from '../utils/profile';
import { pinFileToIPFS } from '../utils/pinata';

export default function ProfileEditor({ onClose, onSuccess }) {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        const account = await getCurrentAccount();
        const profileData = await getProfileData(account);

        setName(profileData.name || '');
        setBio(profileData.bio || '');
        setProfileImage(profileData.profileImage || '');

        if (profileData.profileImage) {
          setImagePreview(`https://ipfs.io/ipfs/${profileData.profileImage}`);
        }
      } catch (err) {
        console.error('Error loading profile:', err);
      } finally {
        setInitialLoading(false);
      }
    }

    loadProfile();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }

    setImageFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let imageHash = profileImage;

      if (imageFile) {
        const pinataResponse = await pinFileToIPFS(imageFile);
        imageHash = pinataResponse.IpfsHash;
      }

      await updateProfile({
        name,
        bio,
        profileImage: imageHash
      });

      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="bg-[#2A2A2A] rounded-lg p-4">
      <h2 className="text-xl font-bold text-white mb-4">Edit Profile</h2>

      {error && (
        <div className="bg-red-900 bg-opacity-30 border border-red-800 text-red-200 p-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-300 mb-2">Profile Picture</label>
          <div className="flex items-center">
            <div className="w-20 h-20 bg-gray-800 rounded-full overflow-hidden flex items-center justify-center mr-4">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Profile Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-500 text-3xl">+</span>
              )}
            </div>
            <label className="bg-[#3A3A3A] hover:bg-[#4A4A4A] transition px-4 py-2 rounded cursor-pointer">
              Choose File
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
              />
            </label>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-gray-300 mb-2">Display Name</label>
          <input
            type="text"
            className="w-full bg-[#3A3A3A] border border-gray-700 rounded p-2 text-white"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={50}
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-300 mb-2">Bio</label>
          <textarea
            className="w-full bg-[#3A3A3A] border border-gray-700 rounded p-2 text-white"
            placeholder="Tell the world about yourself"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            maxLength={160}
          />
        </div>

        <div className="flex justify-end mt-6">
          <button
            type="button"
            className="px-4 py-2 rounded text-gray-300 hover:text-white mr-2"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-[#9B7CFA] text-white rounded hover:bg-[#8b6be0] disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}
