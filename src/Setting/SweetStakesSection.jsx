import React, { useState, useEffect } from "react";
import { Folder } from "lucide-react";

const SweetStakesSection = () => {
  const [installPath, setInstallPath] = useState("");
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(true);
  const [isSelectingFolder, setIsSelectingFolder] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [gameLanguage, setGameLanguage] = useState("English");
  const [currentPatchline, setCurrentPatchline] = useState("LIVE");

  // 🔄 Fetch saved folder and auto-update setting from backend on mount
  useEffect(() => {
    const fetchInitialSettings = async () => {
      try {
        const savedPath = await window.api.getFolder();
        const autoUpdate = await window.api.getAutoUpdateEnabled();
        if (savedPath) setInstallPath(savedPath);
        if (typeof autoUpdate === "boolean") setAutoUpdateEnabled(autoUpdate);
      } catch (error) {
        console.error("Failed to load settings:", error);
      }
    };
    fetchInitialSettings();
  }, []);

  // 🎯 Handle download progress updates
  useEffect(() => {
    const handleProgress = (event, progress) => {
      const downloaded = progress?.downloading?.downloaded || 0;
      const total = progress?.downloading?.total || 0;
      setDownloading(total > 0 && downloaded < total);
    };

    window.api.onDownloadProgress(handleProgress);
    return () => {
      window.api.removeDownloadProgressListener(handleProgress);
    };
  }, []);

  // 📁 Folder selection
const handleSelectFolder = async () => {
  try {
    setIsSelectingFolder(true);
    const selectedPath = await window.api.selectFolder();
    if (selectedPath) {
      setInstallPath(selectedPath);
      await window.api.saveFolder(selectedPath);
      
      // Broadcast the install path change
      await window.api.broadcastInstallPathChange?.(selectedPath);
    }
  } catch (error) {
    console.error("Error selecting folder:", error);
  } finally {
    setIsSelectingFolder(false);
  }
};
  return (
    <div className="space-y-6">
      {/* Game Language */}
      <div className="space-y-2">
        <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide">
          GAME TEXT LANGUAGE
        </label>
        <select
          value={gameLanguage}
          onChange={(e) => setGameLanguage(e.target.value)}
          className="w-full bg-[#2A2A2A] rounded px-3 py-2 text-white appearance-none"
        >
          <option value="English">English</option>
        </select>
      </div>

      {/* Patchline */}
      <div className="space-y-2">
        <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide">
          CURRENT GAME VERSION
        </label>
        <select
          value={currentPatchline}
          onChange={(e) => setCurrentPatchline(e.target.value)}
          className="w-full bg-[#2A2A2A] rounded px-3 py-2 text-white appearance-none"
        >
          <option value="TESTER">TESTER</option>
        </select>
      </div>

      {/* Install Path */}
      <div className="space-y-2">
        <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide">
          INSTALL PATH
        </label>
        <div className="flex items-center space-x-2 mt-1">
          <input
            type="text"
            value={
              downloading ? "Can't change while downloading..." : installPath
            }
            readOnly
            className={`flex-1 bg-[#2A2A2A] text-white rounded px-3 py-2 focus:outline-none ${
              downloading || isSelectingFolder
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
          />
          <button
            onClick={handleSelectFolder}
            disabled={downloading || isSelectingFolder}
            className={`border text-gray-300 p-2 rounded transition-colors ${
              downloading || isSelectingFolder
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-gray-700"
            }`}
          >
            <Folder size={18} />
          </button>
        </div>
      </div>

      {/* Automatic Updates */}
      <div className="space-y-2">
        <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide">
          AUTOMATIC UPDATES
        </label>
        <p className="text-gray-500 text-xs">
          SweetStakes will automatically update when Game is running.
        </p>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={autoUpdateEnabled}
            onChange={async (e) => {
              const checked = e.target.checked;
              setAutoUpdateEnabled(checked);
              try {
                await window.api.setAutoUpdateEnabled(checked);
                await window.api.broadcastAutoUpdateChange(checked);
              } catch (err) {
                console.error("Failed to save auto-update setting:", err);
              }
            }}
            className="w-4 h-4 bg-[#2A2A2A]"
          />
          <span className="text-sm">Enable auto-update</span>
        </div>
      </div>
    </div>
  );
};

export default SweetStakesSection;
