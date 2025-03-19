import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../contexts/usercontext.jsx';

const ListUploads = () => {
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(UserContext);

  useEffect(() => {
    const fetchUploads = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://127.0.0.1:8000/list_user_uploads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: user.uid }),
        });
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }
        setUploads(data.uploads);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user && user.uid) {
      fetchUploads();
    }
  }, [user]);

  const handleDelete = async (download_url) => {
    // Ask for confirmation before deleting
    if (!window.confirm("Are you sure you want to delete this upload?")) {
      return;
    }
    try {
      const response = await fetch('http://127.0.0.1:8000/delete_user_uploads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ download_url }),
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      // Remove the deleted upload from state
      setUploads((prev) => prev.filter((u) => u.download_url !== download_url));
    } catch (err) {
      console.error("Error deleting upload:", err);
      setError(err.message);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold text-[#C2D8F2] text-center mb-4">
        Your Uploads
      </h2>

      {loading ? (
        <p className="text-center text-[#C2D8F2]">Loading uploads...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : uploads.length === 0 ? (
        <p className="text-center text-[#C2D8F2]">No uploads found.</p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-4">
          {uploads.map((upload, index) => (
            <li
              key={index}
              className="bg-[#1C2541] p-4 rounded shadow-lg flex flex-col items-center"
            >
              <p className="text-xl text-[#C2D8F2] font-bold mb-2 text-center">
                {upload.name}
              </p>
              <div className="flex space-x-4">
                <a
                  href={upload.download_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#6FFFE9] hover:underline"
                >
                  Open
                </a>
                <button
                  onClick={() => handleDelete(upload.download_url)}
                  className="text-red-500 hover:underline"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ListUploads;
