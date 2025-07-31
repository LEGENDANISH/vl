import React, { useEffect, useState } from "react";
import DownloadPopup from "./Downloadpopup";
import SettingsPopup from "./Setting/SettingPopUp";
import UpdatePopup from "./components/UpdatePopup"; // ← ADD THIS IMPORT
import { Settings } from "lucide-react";
import SystemRequirements from "./components/SystemRequirements";
import FooterSection from "./components/FooterSection";
import HeroSection from "./components/HeroSection";
import VideoSection from "./VideosSection";
import InternetCheckPopup from "./components/InternetCheckPopup";

const Home = () => {  
  const [showDownloadPopup, setShowDownloadPopup] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showUpdatePopup, setShowUpdatePopup] = useState(false); // ← ADD THIS STATE
  const [appVersion, setAppVersion] = useState("");
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(true);
  const [installPath, setInstallPath] = useState("");
  const [launcherSettings, setLauncherSettings] = useState({
    openOnStartup: true,
    closeWindowBehavior: "normal",
  });
  const [isOffline, setIsOffline] = useState(false);
  useEffect(() => {
    const now = new Date();
    const timestamp = now.toTimeString().split(' ')[0] + '.' + now.getMilliseconds().toString().padStart(3, '0');
    console.log(`[${timestamp}] 🧩 <Home /> component mounted`);
  }, []);
  // Internet connectivity check
  useEffect(() => {
    const checkInternet = () => {
      const online = navigator.onLine;
      setIsOffline(!online);
    };

    checkInternet();

    window.addEventListener("online", checkInternet);
    window.addEventListener("offline", checkInternet);

    return () => {
      window.removeEventListener("online", checkInternet);
      window.removeEventListener("offline", checkInternet);
    };
  }, []);

  // ✅ UPDATE LISTENERS - ADD THIS NEW useEffect
useEffect(() => {
  const handleUpdateAvailable = () => {
    console.log("⚡ update-available received in React");
    setShowUpdatePopup(true);
  };

  const handleUpdateDownloaded = () => {
    console.log("✅ update-downloaded received in React");
    // Your UpdatePopup handles the restart logic
  };

  if (window.api) {
    window.api.onUpdateAvailable(handleUpdateAvailable);
    window.api.onUpdateDownloaded(handleUpdateDownloaded);
  }

  return () => {
    if (window.api && window.api.removeUpdateListeners) {
      window.api.removeUpdateListeners();
    }
  };
}, []);

  // Combined initialization useEffect (ONLY ONE - no path change listener here)
  useEffect(() => {
    const initializeSettings = async () => {
      try {
        const [version, folder, autoUpdate, openOnStartup, shouldMinimize] = await Promise.all([
          window.api.getVersion(),
          window.api.getFolder(),
          window.api.getAutoUpdateEnabled(),
          window.api.getAutoLaunch(),
          window.api.getCloseBehavior(),
        ]);
console.log("folde path Version:", folder);
        setAppVersion(version);
        setInstallPath(folder);
        setAutoUpdateEnabled(autoUpdate);
        setLauncherSettings({
          openOnStartup,
          closeWindowBehavior: shouldMinimize ? "minimize" : "normal",
        });
      } catch (err) {
        console.error("Initialization failed:", err);
      }
    };

    initializeSettings();
  }, []);

  const updateLauncherSetting = async (key, value) => {
    setLauncherSettings((prev) => ({ ...prev, [key]: value }));

    if (key === "openOnStartup") {
      await window.api.setAutoLaunch(value);
    } else if (key === "closeWindowBehavior") {
      await window.api.setCloseBehavior(value === "minimize");
    }
  };

  const toggleProfileDropdown = () => {
    setShowProfileDropdown((prev) => !prev);
  };

  const handleDownloadClick = () => {
    setShowDownloadPopup(true);
  };

  const handleVideoClick = (url) => {
    if (!url) return;

    if (window.api && window.api.openExternal) {
      window.api.openExternal(url);
    } else {
      const newWindow = window.open(url, "_blank", "noopener,noreferrer");
      if (newWindow) newWindow.opener = null;
    }
  };

  return (
    <div className="min-h-screen bg-sweetstake text-white overflow-y-scroll overflow-x-hidden scrollbar-none h-screen">
      {/* ✅ Title Bar with drag region */}
      {isOffline && (
        <InternetCheckPopup
          onRetry={() => setIsOffline(!navigator.onLine)}
          onClose={() => window.api.closeWindow()}
        />
      )}

      {/* ✅ UPDATE POPUP - ADD THIS */}
      {showUpdatePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
<div className="max-w-[90vw] max-h-[90vh] w-[500px] h-[300px]">
            <UpdatePopup />
          </div>
        </div>
      )}

      {/* Existing Download Popup */}
      {showDownloadPopup && (
        <DownloadPopup onClose={() => setShowDownloadPopup(false)} />
      )}

<div className="title-bar  py-0 flex justify-between items-center">
        <div className="flex-1 h-full" />
        <div className="flex gap-2 no-drag">
          <button
            onClick={() => window.api.minimizeWindow()}
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-700 text-white text-xl"
            title="Minimize"
          >
            –
          </button>
          <button
            onClick={() => window.api.closeWindow()}
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-red-600 text-white text-base"
            title="Close"
          >
            ×
          </button>
        </div>
      </div>

      {/* Header */}
      <header className="absolute top-5 left-0 right-0 z-40 p-6 no-drag">
        <div className="flex justify-end">
          <div className="relative">
            <button
              type="button"
              onClick={toggleProfileDropdown}
              className="w-12 h-12 bg-sweetstake hover:bg-gray-900 border border-gray-900 rounded-full flex items-center justify-center transition-colors no-drag"
            >
              <Settings size={20} className="text-white" />
            </button>

            <SettingsPopup
              className="absolute top-[50px] right-0 z-50 no-drag"
              isOpen={showProfileDropdown}
              onClose={() => setShowProfileDropdown(false)}
              appVersion={appVersion}
              installPath={installPath}
              autoUpdateEnabled={autoUpdateEnabled}
              launcherSettings={launcherSettings}
              updateLauncherSetting={updateLauncherSetting}
            />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <HeroSection handleDownloadClick={handleDownloadClick}
      autoUpdateEnabled={autoUpdateEnabled} // Pass prop from Home's state
        installPath={installPath}   
         />

      {/* Videos Section */}
      <VideoSection handleVideoClick={handleVideoClick} />

      <div className="bg-sweetstake mt-8 p-6">
        <SystemRequirements />
      </div>
      <div className="bg-sweetstake p-6 mb-12">
        <FooterSection />
      </div>
    </div>
  );
};

export default Home;