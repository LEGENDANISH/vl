import React, { useEffect, useState } from "react";

export default function UpdatePopup() {
  const [progress, setProgress] = useState(0);
  const [downloaded, setDownloaded] = useState(0);
  const [totalSize, setTotalSize] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    const handleProgress = (_event, progressObj) => {
      console.log("[Renderer] update-download-progress event:", progressObj);

      if (progressObj && typeof progressObj.percent === "number") {
        setProgress(progressObj.percent);
        setDownloaded(progressObj.transferred || 0);
        setTotalSize(progressObj.total || 0);
        setSpeed(progressObj.bytesPerSecond || 0);
      }
    };

    const handleDownloaded = () => {
      setIsDone(true);
    };

    window.api.onUpdateProgress(handleProgress);
    window.api.onUpdateDownloaded(handleDownloaded);

    return () => {
      window.api.removeUpdateListeners();
    };
  }, []);

  const formatBytes = (bytes) => {
    if (bytes === 0) return "0 B";
    const units = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
  };

  const formatSpeed = (bytesPerSecond) => formatBytes(bytesPerSecond) + "/s";

  return (
    <div className="w-[500px] h-[300px] bg-[#0b0f2a] text-white rounded-xl shadow-2xl p-6 font-sans relative flex flex-col justify-center">
      <button
        onClick={() => window.api.closeWindow()}
        className="absolute top-2 right-2 text-white hover:text-gray-400 text-xl leading-none"
        title="Close"
      >
        ×
      </button>

      <h1 className="text-lg font-semibold mb-2 text-center">
        Updating Launcher
      </h1>

      {!isDone ? (
        <>
          <div className="w-full bg-gray-700 h-3 rounded mt-4 overflow-hidden">
            <div
              className="h-3 bg-pink-500 transition-all duration-300"
              style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
            />
          </div>
          <p className="text-sm mt-2 text-center">{progress.toFixed(1)}%</p>
          {totalSize > 0 && (
            <p className="text-xs text-gray-400 mt-1 text-center">
              {formatBytes(downloaded)} / {formatBytes(totalSize)}
              {speed > 0 && ` • ${formatSpeed(speed)}`}
            </p>
          )}
        </>
      ) : (
        <div className="text-center mt-4">
          <h2 className="text-green-400 text-lg mb-1">Update Complete!</h2>
          <p className="text-sm text-gray-400 mb-4">Ready to restart</p>
          <button
            onClick={() => window.api.restartApp()}
            className="bg-pink-500 hover:bg-pink-600 px-5 py-1.5 rounded-lg text-sm font-medium transition"
          >
            Restart Launcher
          </button>
        </div>
      )}
    </div>
  );
}
