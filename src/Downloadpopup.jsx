// components/DownloadPopup.js
import React, { useState, useEffect } from 'react';
import { X, Folder } from 'lucide-react';

const DownloadPopup = ({
  isOpen,
  onClose,
  onFolderSelect,
  initialFolder
}) => {
const [folder, setFolder] = useState('C:\\Games\\');
  const [isSelectingFolder, setIsSelectingFolder] = useState(false);
  const [createShortcut, setCreateShortcut] = useState(true);
useEffect(() => {
  if (isOpen && window.api?.getFolder) {
    window.api.getFolder()
      .then((savedPath) => {
        if (savedPath) {
          setFolder(savedPath);
        }
        console.log("Saved folder path from downloadpopup section:", savedPath);
      })
      .catch((err) => {
        console.error("Failed to load saved folder:", err);
      });
  }
}, [isOpen]);

  const handleSelectFolder = async () => {
    try {
      setIsSelectingFolder(true);
      if (window.api) {
        const path = await window.api.selectFolder();
        if (path) {
          setFolder(path);
        }
      }
    } catch (error) {
      console.error('Error selecting folder:', error);
    } finally {
      setIsSelectingFolder(false);
    }
  };

  const handleInstallClick = () => {
    onFolderSelect(folder);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition-colors"
          disabled={isSelectingFolder}
        >
          <X size={20} />
        </button>

        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Installation</h2>
        </div>

        <div className="space-y-4">
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-700">INSTALL PATH</label>
            <div className="flex items-center space-x-2 mt-1">
              <input
                type="text"
                value={folder}
                onChange={(e) => setFolder(e.target.value)}
                className={`flex-1 border rounded px-3 py-2 text-gray-700 focus:outline-none ${
                  isSelectingFolder ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                placeholder="Select download path..."
                disabled={isSelectingFolder}
              />
              <button
                onClick={handleSelectFolder}
                className={`border text-gray-700 p-2 rounded transition-colors ${
                  isSelectingFolder ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'
                }`}
                disabled={isSelectingFolder}
              >
                <Folder size={18} />
              </button>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-500">
              Create desktop shortcuts for...
            </label>
            <select
              value="All users"
              className={`w-full bg-gray-200 rounded px-3 py-2 text-gray-700 mt-1 ${
                isSelectingFolder ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={isSelectingFolder}
            >
              <option>All users</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-700">LANGUAGE</label>
            <select
              value="English"
              className={`w-full bg-gray-200 rounded px-3 py-2 text-gray-700 mt-1 ${
                isSelectingFolder ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={isSelectingFolder}
            >
              <option>English</option>
            </select>
          </div>

          <div className="mb-6 flex items-center space-x-2">
            <input
              type="checkbox"
              checked={createShortcut}
              onChange={(e) => setCreateShortcut(e.target.checked)}
              className={`w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-600 ${
                isSelectingFolder ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={isSelectingFolder}
            />
            <span className="text-sm text-gray-700">Enable auto-update</span>
          </div>

          <button
            onClick={handleInstallClick}
            disabled={isSelectingFolder}
            className={`w-full bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded font-bold transition-colors ${
              isSelectingFolder ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            DOWNLOAD
          </button>
        </div>
      </div>
    </div>
  );
};

export default DownloadPopup;