import React, { useContext, useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, updateProfile } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../contexts/usercontext.jsx';
import Navbar from './navbar';
import ListUploads from './listuploads';
import LogoutButton from './logout';

const Profile = () => {
  const { user, setUser } = useContext(UserContext);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [message, setMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const navigate = useNavigate();

  // Listen for authentication changes and redirect if user logs out
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        navigate('/');
      } else {
        setDisplayName(currentUser.displayName || '');
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
      setMessageType('success');
      setIsEditing(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('Failed to update profile.');
      setMessageType('error');
    }
  };

  // Generate initials for avatar
  const getInitials = () => {
    if (!user?.displayName) return '?';
    return user.displayName
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="min-h-screen bg-[#f5f9ff] flex flex-col">
      <Navbar />

      <div className="flex-1 container max-w-7xl mx-auto py-8 px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-[#64b5f6] to-[#1e88e5] py-8 px-4">
                <div className="flex flex-col items-center">
                  <div className="h-24 w-24 rounded-full bg-white/20 shadow-lg flex items-center justify-center text-white text-2xl font-bold mb-4">
                    {getInitials()}
                  </div>
                  <h2 className="text-xl text-white font-semibold text-center">
                    {user?.displayName || 'Your Name'}
                  </h2>
                  {/* Fix for email overflow - add truncation and tooltip */}
                  <div className="w-full text-center mt-1">
                    <p 
                      className="text-white/90 text-sm truncate max-w-full px-4" 
                      title={user?.email} // Show full email on hover
                    >
                      {user?.email}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {message && (
                  <div className={`mb-4 p-3 rounded-md ${
                    messageType === 'success' 
                      ? 'bg-green-50 text-green-700 border border-green-200' 
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    <p className="text-sm flex items-center">
                      {messageType === 'success' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      )}
                      {message}
                    </p>
                  </div>
                )}
                
                {!isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-gray-500 text-sm font-medium">Account Information</h3>
                      <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs text-gray-500">Display Name</p>
                            <p className="font-medium text-gray-800">{user?.displayName || 'Not set'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Email</p>
                            <p className="font-medium text-gray-800 break-all">{user?.email}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => setIsEditing(true)}
                      className="w-full bg-[#1e88e5] hover:bg-[#1976d2] text-white py-2.5 px-4 rounded-lg transition-colors font-medium flex items-center justify-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit Profile
                    </button>
                    
                    <div className="pt-2">
                      <LogoutButton customClass="w-full bg-white text-[#1e88e5] border border-[#1e88e5] hover:bg-[#e3f2fd] py-2.5 px-4 rounded-lg transition-colors font-medium" />
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div>
                      <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
                        Display Name
                      </label>
                      <input
                        type="text"
                        id="displayName"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-[#64b5f6] focus:border-[#1e88e5] focus:outline-none transition-colors text-gray-700"
                        required
                      />
                    </div>
                    
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          setDisplayName(user?.displayName || '');
                        }}
                        className="flex-1 bg-white border border-gray-300 text-gray-700 py-2.5 px-4 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 bg-[#1e88e5] hover:bg-[#1976d2] text-white py-2.5 px-4 rounded-lg transition-colors font-medium"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
          
          {/* Uploads Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md overflow-hidden h-full">
              <div className="bg-gradient-to-r from-[#64b5f6] to-[#1e88e5] py-4 px-6">
                <h2 className="text-xl text-white font-semibold flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Your Uploads
                </h2>
              </div>
              <div className="p-6">
                <ListUploads />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;