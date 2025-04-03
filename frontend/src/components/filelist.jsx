import React, { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { supabase } from "../supabase/supabaseclient.js";

const FileList = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFiles = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Get files from the metadata table
        const { data, error } = await supabase
          .from('file_metadata')
          .select('*')
          .eq('user_id', user.uid);
          
        if (error) throw error;
        setFiles(data || []);
      } catch (error) {
        console.error('Error fetching files:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, []);

  const getFileUrl = (filePath) => {
    const { data } = supabase.storage.from('uploads').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const downloadFile = (filePath, fileName) => {
    window.open(getFileUrl(filePath), '_blank');
  };
  const deleteFile = async (fileId, filePath) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this file?');
    if (!confirmDelete) return;
    
    try {
      // First delete from storage
      const { error: storageError } = await supabase.storage
        .from('uploads')
        .remove([filePath]);
        
      if (storageError) throw storageError;
      
      // Then delete metadata
      const { error: metadataError } = await supabase
        .from('file_metadata')
        .delete()
        .eq('id', fileId);
        
      if (metadataError) throw metadataError;
      
      // Update the UI
      setFiles(files.filter(file => file.id !== fileId));
      alert('File deleted successfully');
    } catch (error) {
      console.error('Error deleting file:', error);
      alert(`Error deleting file: ${error.message}`);
    }
  };

  return (
    <div className="file-list-container">
      <h2>Your Files</h2>
      {loading ? (
        <p>Loading your files...</p>
      ) : files.length === 0 ? (
        <p>You haven't uploaded any files yet.</p>
      ) : (
        <ul className="file-list">
          {files.map((file) => (
            <li key={file.id} className="file-item">
              <strong>{file.file_name}</strong>
              <p>Uploaded: {new Date(file.uploaded_at).toLocaleString()}</p>
              <p>Size: {(file.file_size / 1024).toFixed(2)} KB</p>
              <p>Type: {file.mime_type}</p>
              <button 
                onClick={() => downloadFile(file.file_path, file.file_name)}
              >
                View/Download
              </button>
              <button 
                  onClick={() => deleteFile(file.id, file.file_path)}
                  className="delete-button"
              >
                Delete
              </button>
              
              {file.mime_type && file.mime_type.startsWith('image/') && (
                <div className="image-preview">
                  <img 
                    src={getFileUrl(file.file_path)} 
                    alt={file.file_name} 
                    style={{ maxWidth: '200px', maxHeight: '200px' }} 
                  />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FileList;