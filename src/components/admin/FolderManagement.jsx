import { useState, useEffect } from 'react';
import api from '../../config/api';

const FolderManagement = () => {
  const [folders, setFolders] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [folderFiles, setFolderFiles] = useState([]);
  const [newFolder, setNewFolder] = useState({
    name: '',
    companyName: '',
    description: ''
  });
  const [uploadFile, setUploadFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFolders();
  }, []);

  const fetchFolders = async () => {
    try {
      const { data } = await api.get('/folders');
      setFolders(data.folders || []);
    } catch (error) {
      console.error('Error fetching folders:', error);
    }
  };

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/folders', newFolder);
      setShowCreateModal(false);
      setNewFolder({ name: '', companyName: '', description: '' });
      fetchFolders();
    } catch (error) {
      console.error('Error creating folder:', error);
    }
    setLoading(false);
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile || !selectedFolder) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('folderId', selectedFolder._id);

    try {
      await api.post('/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setShowUploadModal(false);
      setUploadFile(null);
      fetchFolderFiles(selectedFolder._id);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
    setLoading(false);
  };

  const fetchFolderFiles = async (folderId) => {
    try {
      const { data } = await api.get(`/folders/${folderId}`);
      setFolderFiles(data.files || []);
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  const handleFolderClick = (folder) => {
    setSelectedFolder(folder);
    fetchFolderFiles(folder._id);
  };

  const handleProcessOCR = async (fileId) => {
    console.log(fileId)
    try {
      await api.post(`/files/${fileId}/ocr`);
      alert('OCR processing started!');
      fetchFolderFiles(selectedFolder._id);
    } catch (error) {
      console.error('Error processing OCR:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Company Folders</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary"
        >
          + Create Folder
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {folders.map((folder) => (
          <div
            key={folder._id}
            onClick={() => handleFolderClick(folder)}
            className={`card cursor-pointer transition-all ${
              selectedFolder?._id === folder._id ? 'ring-2 ring-blue-500' : ''
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="text-4xl mb-3">📁</div>
                <h3 className="font-semibold text-lg text-gray-900">{folder.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{folder.companyName}</p>
                <p className="text-xs text-gray-500 mt-2">{folder.fileCount} files</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedFolder && (
        <div className="card bg-gray-50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-900">
              Files in {selectedFolder.name}
            </h3>
            <button
              onClick={() => setShowUploadModal(true)}
              className="btn btn-primary text-sm"
            >
              + Upload File
            </button>
          </div>

          <div className="space-y-3">
            {folderFiles.length > 0 ? (
              folderFiles.map((file) => (
                <div key={file._id} className="bg-white p-4 rounded-lg flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">📄</div>
                    <div>
                      <p className="font-medium text-gray-900">{file.originalName}</p>
                      <p className="text-xs text-gray-500">
                        {(file.fileSize / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {file.ocrProcessed ? (
                      <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">
                        Processed
                      </span>
                    ) : (
                      <button
                        onClick={() => handleProcessOCR(file._id)}
                        className="text-xs btn btn-primary"
                      >
                        Process OCR
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">No files uploaded yet</p>
            )}
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Create New Folder</h3>
            <form onSubmit={handleCreateFolder} className="space-y-4">
              <div>
                <label className="label">Folder Name</label>
                <input
                  type="text"
                  value={newFolder.name}
                  onChange={(e) => setNewFolder({ ...newFolder, name: e.target.value })}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="label">Company Name</label>
                <input
                  type="text"
                  value={newFolder.companyName}
                  onChange={(e) => setNewFolder({ ...newFolder, companyName: e.target.value })}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea
                  value={newFolder.description}
                  onChange={(e) => setNewFolder({ ...newFolder, description: e.target.value })}
                  className="input"
                  rows="3"
                />
              </div>
              <div className="flex space-x-3">
                <button type="submit" className="btn btn-primary flex-1" disabled={loading}>
                  {loading ? 'Creating...' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Upload File</h3>
            <form onSubmit={handleFileUpload} className="space-y-4">
              <div>
                <label className="label">Select File</label>
                <input
                  type="file"
                  onChange={(e) => setUploadFile(e.target.files[0])}
                  className="input"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Supported: PDF, DOC, DOCX, JPG, PNG (Max 10MB)
                </p>
              </div>
              <div className="flex space-x-3">
                <button type="submit" className="btn btn-primary flex-1" disabled={loading}>
                  {loading ? 'Uploading...' : 'Upload'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FolderManagement;
