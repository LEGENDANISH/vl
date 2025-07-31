import React, { useState, useEffect } from 'react';
import { X, Folder, Download, Upload, CheckCircle } from 'lucide-react';

const FileTransferPopup = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState('download'); // 'download' or 'upload'
  const [folder, setFolder] = useState('C:\\Games\\');
  const [filePath, setFilePath] = useState('');
  const [step, setStep] = useState('start'); // 'start', 'installing', 'uploading', 'done', 'error'
  const [isSelectingFolder, setIsSelectingFolder] = useState(false);
  const [isSelectingFile, setIsSelectingFile] = useState(false);
  const [createShortcut, setCreateShortcut] = useState(true);
  const [progress, setProgress] = useState({
    percentage: 0,
    transferred: 0,
    total: 0,
    timeRemaining: 0,
  });

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (seconds) => {
    if (seconds <= 0) return 'Calculating...';
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}m ${secs}s`;
  };

  const handleSelectFolder = async () => {
    try {
      setIsSelectingFolder(true);
      const path = await window.api.selectFolder();
      if (path) setFolder(path);
    } catch (error) {
      console.error('Error selecting folder:', error);
      setStep('error');
    } finally {
      setIsSelectingFolder(false);
    }
  };

  const handleSelectFile = async () => {
    try {
      setIsSelectingFile(true);
      const path = await window.api.selectFile();
      if (path) setFilePath(path);
    } catch (error) {
      console.error('Error selecting file:', error);
      setStep('error');
    } finally {
      setIsSelectingFile(false);
    }
  };

  const handleTransferClick = async () => {
    if (mode === 'download') {
      const url = import.meta.env.VITE_DOWNLOAD_URL;
      const exePath = import.meta.env.VITE_EXE_PATH;
      setStep('installing');
      const success = await window.api.runDownloader(
        folder,
        url,
        exePath,
        ({ progress, downloaded, total, timeRemaining }) => {
          setProgress({ percentage: progress, transferred: downloaded, total, timeRemaining });
        }
      );
      setStep(success ? 'done' : 'error');
    } else {
      const uploadUrl = import.meta.env.VITE_UPLOAD_URL;
      setStep('uploading');
      const success = await window.api.runUploader(
        filePath,
        uploadUrl,
        ({ progress, uploaded, total, timeRemaining }) => {
          setProgress({ percentage: progress, transferred: uploaded, total, timeRemaining });
        }
      );
      setStep(success ? 'done' : 'error');
    }
  };

  const resetAndClose = () => {
    setStep('start');
    setFolder('C:\\Games\\');
    setFilePath('');
    setProgress({ percentage: 0, transferred: 0, total: 0, timeRemaining: 0 });
    setMode('download');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
        <button
          onClick={resetAndClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition-colors"
          disabled={isSelectingFolder || isSelectingFile || step === 'installing' || step === 'uploading'}
        >
          <X size={20} />
        </button>

        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            {mode === 'download' ? 'Download' : 'Upload'} File
          </h2>
        </div>

        {step === 'start' && (
          <div className="space-y-4">
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700">MODE</label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="w-full bg-gray-200 rounded px-3 py-2 text-gray-700 mt-1"
              >
                <option value="download">Download</option>
                <option value="upload">Upload</option>
              </select>
            </div>

            {mode === 'download' ? (
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-700">DOWNLOAD PATH</label>
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
            ) : (
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-700">FILE TO UPLOAD</label>
                <div className="flex items-center space-x-2 mt-1">
                  <input
                    type="text"
                    value={filePath}
                    onChange={(e) => setFilePath(e.target.value)}
                    className={`flex-1 border rounded px-3 py-2 text-gray-700 focus:outline-none ${
                      isSelectingFile ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    placeholder="Select file to upload..."
                    disabled={isSelectingFile}
                  />
                  <button
                    onClick={handleSelectFile}
                    className={`border text-gray-700 p-2 rounded transition-colors ${
                      isSelectingFile ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'
                    }`}
                    disabled={isSelectingFile}
                  >
                    <Folder size={18} />
                  </button>
                </div>
              </div>
            )}

            {mode === 'download' && (
              <>
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
              </>
            )}

            <button
              onClick={handleTransferClick}
              disabled={isSelectingFolder || isSelectingFile || (mode === 'upload' && !filePath)}
              className={`w-full bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded font-bold transition-colors ${
                isSelectingFolder || isSelectingFile || (mode === 'upload' && !filePath)
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              }`}
            >
              {mode === 'download' ? 'DOWNLOAD' : 'UPLOAD'}
            </button>
          </div>
        )}

        {(step === 'installing' || step === 'uploading') && (
          <div className="text-center">
            <div className="relative w-32 h-32 mx-auto mb-4">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="54" fill="none" stroke="#E5E7EB" strokeWidth="8" />
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke="#EF4444"
                  strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 54}`}
                  strokeDashoffset={`${2 * Math.PI * 54 * (1 - progress.percentage / 100)}`}
                  className="transition-all duration-300"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                {step === 'installing' ? (
                  <Download size={32} className="text-red-600 mb-2" />
                ) : (
                  <Upload size={32} className="text-red-600 mb-2" />
                )}
                <span className="text-gray-800 font-bold text-lg">
                  {progress.percentage.toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="text-center space-y-2">
              <div className="text-gray-800 font-medium">
                {step === 'installing' ? 'Downloading file...' : 'Uploading file...'}
              </div>
              <div className="text-gray-600 text-sm">
                {formatBytes(progress.transferred)} / {formatBytes(progress.total)}
              </div>
              <div className="text-gray-600 text-sm">
                Time remaining: {formatTime(progress.timeRemaining)}
              </div>
              <div className="text-red-600 text-sm font-medium">
                {step === 'installing' ? 'Downloading...' : 'Uploading...'}
              </div>
            </div>
          </div>
        )}

        {step === 'done' && (
          <div className="text-center">
            <div className="relative w-32 h-32 mx-auto mb-4">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="54" fill="none" stroke="#E5E7EB" strokeWidth="8" />
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 54}`}
                  strokeDashoffset="0"
                  className="transition-all duration-300"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <CheckCircle size={32} className="text-green-500 mb-2" />
                <span className="text-gray-800 font-bold text-lg">Complete!</span>
              </div>
            </div>

            <div className="text-green-500 font-medium mb-4">
              {mode === 'download' ? 'Download' : 'Upload'} completed successfully!
            </div>

            <button
              onClick={resetAndClose}
              className="w-full bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded font-bold transition-colors"
            >
              Close
            </button>
          </div>
        )}

        {step === 'error' && (
          <div className="flex flex-col items-center space-y-4">
            <div className="rounded-full h-16 w-16 flex items-center justify-center bg-red-100">
              <X size={32} className="text-red-500" />
            </div>
            <p className="text-gray-800 font-medium">{mode === 'download' ? 'Download' : 'Upload'} Failed</p>
            <p className="text-sm text-gray-600 text-center">
              There was an error {mode === 'download' ? 'downloading' : 'uploading'} the file. Please check your connection and try again.
            </p>
            <div className="flex space-x-3 w-full">
              <button
                onClick={resetAndClose}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setStep('start')}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileTransferPopup;