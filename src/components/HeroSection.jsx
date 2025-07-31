// HeroSection.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  Monitor,
  RectangleGoggles,
  Download,
  X,
} from "lucide-react";
import DownloadPopup from "../DownloadPopup";

// --- Modified to accept props ---
const HeroSection = ({ autoUpdateEnabled: propAutoUpdateEnabled, installPath: propInstallPath }) => {
  // === State ===
  // Keep internal state for UI elements managed by HeroSection
  const [showPopup, setShowPopup] = useState(false);
  const [downloadState, setDownloadState] = useState("idle");
  const [progress, setProgress] = useState({
    downloaded: 0,
    total: 0,
    speed: 0,
    elapsedTime: 0,
  });
  // Removed local state for autoUpdateEnabled and downloadFolder (installPath)
  // They will be used via props: propAutoUpdateEnabled, propInstallPath

  // === Helpers ===
  const formatToMB = (bytes) => `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  const formatSpeedToMBps = useCallback(
    (bytesPerSecond) => `${(bytesPerSecond / (1024 * 1024)).toFixed(2)} MB/s`,
    []
  );

  // Start the download and reset progress state
  const startDownload = async (folder) => {
    setDownloadState("downloading");
    setProgress({ downloaded: 0, total: 0, speed: 0, elapsedTime: 0 });
    const success = await window.api?.runDownloader?.(folder);
    setDownloadState(success ? "done" : "error");
  };

  // Shared check logic - now uses props for installPath and autoUpdateEnabled
  const checkAndHandleStatus = useCallback(async (overrideFolder = null) => { // Allow override for path change listener
    try {
      // Use the installPath prop OR the override (e.g., from path change listener)
      const folderToCheck = overrideFolder || propInstallPath;
      // Use the autoUpdateEnabled prop directly
      const autoUpdateToUse = propAutoUpdateEnabled; // Alias for clarity

      if (!folderToCheck) return;
      // No need to set local state for folder/autoUpdate as they come from props/listener argument

      console.log("Checking status for folder from hero section (via prop or override):", folderToCheck);
      const { status, error } = await window.api?.checkStatus(folderToCheck) || {};
      console.log("Status from hero section:", status, "Error:", error);

      switch (status) {
        case "play":
          setDownloadState("play");
          break;
        case "update-required":
          // Use the autoUpdateEnabled prop directly
          autoUpdateToUse ? startDownload(folderToCheck) : setDownloadState("update-required");
          break;
        case "download":
          setDownloadState("download");
          break;
        default:
          if (error) console.error("Status error:", error);
          setDownloadState("idle");
      }
    } catch (err) {
      console.error("checkAndHandleStatus error:", err);
    }
  }, [propInstallPath, propAutoUpdateEnabled]); // <-- Updated dependencies to props

  // === Consolidated Effect #1: Initial setup + listeners ===
  // Removed the initial fetch of folder/autoUpdateEnabled here.
  // This effect now focuses on setting up listeners and the initial status check.
  useEffect(() => {
    // Run initial check using the propInstallPath
    checkAndHandleStatus();

    // Auto-update setting change listener
    // This listener updates HeroSection's behavior based on backend events.
    const onAutoUpdateChange = (enabled) => {
      console.log("Auto-update change detected in HeroSection:", enabled);
      // HeroSection primarily uses the prop value (propAutoUpdateEnabled).
      // However, this listener can trigger an immediate re-check if needed,
      // especially if the backend state change might affect the outcome of checkStatus
      // based on the *current* path (propInstallPath).
      // The main source of truth for the *value* is the prop.
      checkAndHandleStatus(); // Re-check status as the setting that affects logic changed
    };
    window.api?.onAutoUpdateChange?.(onAutoUpdateChange);

    // 🆕 Install path change listener
    // This listener updates HeroSection's behavior based on backend events.
    const onInstallPathChange = (event, newPath) => {
      console.log("Install path changed to (in HeroSection listener):", newPath);
      // HeroSection primarily uses the prop value (propInstallPath).
      // However, this listener fires immediately when the backend broadcasts the change.
      // It's crucial to check the status for the *new* path provided by the event.
      // We pass the newPath to checkAndHandleStatus to override the prop value temporarily.
      checkAndHandleStatus(newPath); // Check status for the NEW path
      // Note: The parent (Home) also listens for this change and updates its state,
      // causing HeroSection to re-render with the new propInstallPath soon after.
    };
    window.api?.onInstallPathChanged?.(onInstallPathChange);

    // Visibility & focus listeners
    const handleVisibilityOrFocus = () => {
      if (!document.hidden) checkAndHandleStatus(); // Check using current propInstallPath
    };
    document.addEventListener("visibilitychange", handleVisibilityOrFocus);
    window.addEventListener("focus", handleVisibilityOrFocus);

    // Native refresh signal listener
    const handleRefresh = () => checkAndHandleStatus(); // Check using current propInstallPath
    window.api?.onRefreshSignal?.(handleRefresh);

    // Cleanup
    return () => {
      window.api?.removeAutoUpdateChangeListener?.(onAutoUpdateChange);
      window.api?.removeInstallPathChangeListener?.(onInstallPathChange);
      window.api?.removeRefreshListener?.();
      document.removeEventListener("visibilitychange", handleVisibilityOrFocus);
      window.removeEventListener("focus", handleVisibilityOrFocus);
    };
  }, []); // <-- Dependency is the useCallback

  // === Consolidated Effect #2: Handle popup close ===
  useEffect(() => {
    if (!showPopup) checkAndHandleStatus(); // Check using current propInstallPath
  }, [showPopup, checkAndHandleStatus]); // <-- Dependencies

  // === Consolidated Effect #3: Download progress listener ===
  // Keep this listener for updating UI progress
  useEffect(() => {
    const handleProgress = (e, pd) => {
      if (pd.downloading) {
        const { downloaded, total, speed } = pd.downloading;
        requestAnimationFrame(() =>
          setProgress({ downloaded, total, speed, elapsedTime: 0 })
        );
      }
      if (pd.status) {
        // Use the autoUpdateEnabled prop directly for conditional logic
        if (pd.status === "update-required" && !propAutoUpdateEnabled) {
          setDownloadState("update-required");
        } else {
          setDownloadState(pd.status === "downloading" ? "downloading" : pd.status);
        }
      }
    };
    window.api?.onDownloadProgress?.(handleProgress);
    return () => window.api?.removeDownloadProgressListener?.(handleProgress);
  }, [propAutoUpdateEnabled]); // <-- Updated dependency to prop

  // === Actions ===
  const runExe = async () => {
    try {
      // Use the installPath prop directly
      const exePath = `${propInstallPath}\\Test.exe`;
      await window.api?.runExe?.(exePath);
    } catch (err) {
      console.error("Failed to launch exe:", err);
    }
  };

  const handleDownloadClick = () => {
    switch (downloadState) {
      case "downloading":
        return;
      case "play":
        runExe();
        break;
      case "update-required":
        // Use the installPath prop directly
        startDownload(propInstallPath);
        break;
      case "idle":
        setShowPopup(true);
        break;
      default:
        setDownloadState("idle");
    }
  };

  // This function is passed to DownloadPopup and called when a folder is selected there
  const handleFolderSelectFromPopup = async (folder) => {
    // Close the popup first
    setShowPopup(false);
    // Save the folder via API. Parent (Home) listens for this change and updates its installPath state.
    await window.api?.saveFolder?.(folder);
    // Optionally start download immediately with the *selected* folder.
    // The parent's state update (propInstallPath) might trigger a re-check, but this is explicit.
    startDownload(folder);
    // Note: The parent's installPath change listener should also update its state,
    // causing HeroSection to re-render with the new propInstallPath.
  };

  // === UI Elements ===
  const renderButtonContent = () => {
    switch (downloadState) {
      case "downloading":
        const percentage = progress.total
          ? (progress.downloaded / progress.total) * 100
          : 0;
        return (
          <div className="flex flex-col items-center w-full">
            <div className="w-full h-2 bg-gray-700 rounded-full">
              <div
                className="h-full bg-pink-500 rounded-full transition-all duration-300"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="text-[12px] font-medium">
              {`${formatToMB(progress.downloaded)} / ${formatToMB(
                progress.total
              )} @ ${formatSpeedToMBps(progress.speed)}`}
            </span>
          </div>
        );
      case "done":
      case "update-required":
        return (
          <div className="flex items-center gap-2">
            <Download size={20} />
            <span>Update</span>
          </div>
        );
      case "error":
        return (
          <div className="flex items-center gap-2 text-red-500">
            <X size={20} />
            <span>Download Failed</span>
          </div>
        );
      case "play":
        return <span className="flex items-center gap-2">Play Now</span>;
      default:
        return (
          <div className="flex items-center gap-2">
            <Download size={20} />
            <span className="text-lg">Download Now</span>
          </div>
        );
    }
  };

  const getButtonClass = () => {
    const base =
      "glow-button px-8 py-3 mb-[34px] rounded-3xl font-bold text-white text-lg flex items-center justify-center min-w-[250px]";
    switch (downloadState) {
      case "downloading":
        return `${base} bg-gray-700`;
      case "done":
        return `${base} bg-green-600 hover:bg-green-700`;
      case "error":
        return `${base} bg-red-600 hover:bg-red-700`;
      case "update-required":
        return `${base} bg-yellow-500 hover:bg-yellow-600`;
      case "play":
      default:
        return `${base} bg-pink-600 hover:bg-pink-700`;
    }
  };

  return (
    <section className="relative bg-[#060A23] min-h-[620px] pb-[100px]">
      {/* Background glow */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background: "radial-gradient(circle at center, #1e2a78 0%, transparent 60%)",
        }}
      />
      {/* Left side content */}
      <div className="absolute ml-10 top-10 left-6 z-30 flex flex-col items-start">
        <img
          src="./assets/logo.png"
          alt="SweetStakes Logo"
          className="w-[500px] h-auto mb-4"
        />
        <p className="text-white leading-relaxed text-xl max-w-md font-sans">
          Immerse yourself in the ultimate poker experience with{" "}
          <span className="text-pink-500 font-semibold">SWEETSTAKES</span>. Whether you're
          playing for <span className="text-pink-500 font-semibold">real money</span> or{" "}
          <span className="text-pink-500 font-semibold">casual stakes</span>, enjoy{" "}
          <span className="text-pink-500 font-semibold">high-stakes thrills</span> with up
          to 6 players per table. Showcase your{" "}
          <span className="text-pink-500 font-semibold">strategy</span> and{" "}
          <span className="text-pink-500 font-semibold">skill</span> in intense showdowns
          where the <span className="text-pink-500 font-semibold">stakes</span> are high
          and the <span className="text-pink-500 font-semibold">rewards</span> are even
          higher.
        </p>
        <p className="text-gray-300 text-sm mt-4">Platform Availability</p>
        <div className="flex items-center gap-4 mt-2 text-white">
          <Monitor size={24} />
          <RectangleGoggles size={24} />
        </div>
      </div>
      {/* Right-side illustration */}
      <div className="absolute top-1/2 right-0 transform -translate-y-1/2 z-30">
        <img
          src="./assets/right.png"
          alt="Poker Illustration"
          className="ml-[13rem] w-[1280px] h-[580px] object-contain"
        />
      </div>
      {/* Download / Update / Play Button */}
      <div className="absolute bottom-10 right-28 z-30 max-w-xl">
        <button
          type="button"
          onClick={handleDownloadClick}
          disabled={downloadState === "downloading"}
          className={getButtonClass()}
        >
          {renderButtonContent()}
        </button>
      </div>
      {/* Folder selection modal */}
      <DownloadPopup
        isOpen={showPopup}
        onClose={() => setShowPopup(false)}
        onFolderSelect={handleFolderSelectFromPopup} // Use the specific handler
        // Use the installPath prop for the initial folder shown in the popup
        initialFolder={propInstallPath}
      />
    </section>
  );
};

export default HeroSection;