import React, { useContext, useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, updateProfile } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../contexts/usercontext.jsx';
import Navbar from './navbar';
import ListUploads from './listuploads'; // Import the ListUploads component

const Profile = () => {
  const { user, setUser } = useContext(UserContext);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [message, setMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  // Listen for authentication changes and redirect if user logs out
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        navigate('/');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // Handle profile updates
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(getAuth().currentUser, { displayName });
      setUser({ ...getAuth().currentUser });
      setMessage('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('Failed to update profile.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B132B] to-[#1C2541] flex flex-col">
      <Navbar />

      {/* Main content area, flex column, spaced out */}
      <div className="flex-1 flex flex-col items-center p-6 space-y-8 w-full max-w-7xl mx-auto">
        
        {/* Profile Card */}
        <div className="bg-[#1C2541] rounded-lg shadow-lg p-8 w-full max-w-md">
          <div className="flex flex-col items-center">
            <h2 className="mt-4 text-2xl font-semibold text-[#C2D8F2]">
              {user?.displayName || 'Your Name'}
            </h2>
            <p className="text-[#C2D8F2]">{user?.email}</p>
          </div>

          <div className="mt-6 w-full">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="w-full bg-[#5BC0BE] hover:bg-[#6FFFE9] text-[#0B132B] py-2 px-4 rounded transition"
              >
                Edit Profile
              </button>
            ) : (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label htmlFor="displayName" className="block text-[#C2D8F2] mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full bg-[#0B132B] text-[#C2D8F2] px-3 py-2 rounded border border-[#3A506B] focus:outline-none focus:ring-2 focus:ring-[#5BC0BE]"
                    required
                  />
                </div>
                {message && (
                  <p
                    className={`text-center ${
                      message.includes('success') ? 'text-green-500' : 'text-red-500'
                    }`}
                  >
                    {message}
                  </p>
                )}
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="w-1/2 bg-[#3A506B] hover:bg-[#5BC0BE] text-[#C2D8F2] py-2 px-4 rounded transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 bg-[#5BC0BE] hover:bg-[#6FFFE9] text-[#0B132B] py-2 px-4 rounded transition"
                  >
                    Save
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Uploads Card */}
        <div className="bg-[#1C2541] rounded-lg shadow-lg p-8 w-full max-w-4xl">
          {/* Only one heading here for "Your Uploads" */}
          <ListUploads />
        </div>
      </div>
    </div>
  );
};

export default Profile;
