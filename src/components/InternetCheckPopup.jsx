import React from "react";

const InternetCheckPopup = ({ onRetry, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center">
      <div className="bg-[#1e1e1e] rounded-xl p-6 max-w-md w-full text-white shadow-lg space-y-4">
        <h2 className="text-lg font-semibold">No Internet Connection</h2>
        <p className="text-sm text-gray-300">
          We couldn't connect to the internet to retrieve a necessary update required to play games. Please check your internet connection and try again.
        </p>
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onRetry}
            className="bg-pink-500 hover:bg-pink-600 text-white font-medium px-4 py-2 rounded-lg transition"
          >
            Retry
          </button>
          <button
            onClick={onClose}
            className="border border-gray-500 text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-800 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default InternetCheckPopup;
