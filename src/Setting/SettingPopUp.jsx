import React, { useEffect, useState } from "react";
import { X, ChevronDown, Folder } from "lucide-react";
import LauncherSettingSection from "./LauncherSettingSection";
import SweetStakesSection from "./SweetStakesSection";

const SettingsPopup = ({ isOpen, onClose,appVersion ,installPath, autoUpdateEnabled, launcherSettings,
  updateLauncherSetting }) => {
  const [activeTab, setActiveTab] = useState("SweetStakes");


  if (!isOpen) return null;
const handleClose = () => {
 
  onClose(); // Call the original onClose handler
};
  return (
<div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 no-drag">
      <div className="bg-[#1A1A1A] w-full max-w-5xl h-[90vh] flex overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-64 bg-[#1A1A1A] flex flex-col">
          {/* Header */}
          <div className="p-6">
            <h1 className="text-xl font-bold text-white">Settings</h1>
          </div>

          {/* Navigation */}
          <div className="flex-1 p-4 space-y-2">
            <button
              onClick={() => setActiveTab("RiotClient")}
              className={`w-full flex items-center gap-2 px-4 py-2 rounded text-sm ${
                activeTab === "RiotClient"
                  ? "bg-gray-700 text-white"
                  : "text-gray-400 hover:bg-gray-700"
              }`}
            >
              <span className="w-5 h-5"></span>
              <span className="font-medium">LAUNCHER</span>
            </button>
            <button
              onClick={() => setActiveTab("SweetStakes")}
              className={`w-full flex items-center gap-2 px-4 py-2 rounded text-sm ${
                activeTab === "SweetStakes"
                  ? "bg-gray-700 text-white"
                  : "text-gray-400 hover:bg-gray-700"
              }`}
            >
              <span className="w-5 h-5"></span>
              <span className="font-medium">SWEET STAKES</span>
            </button>
          </div>

          {/* Footer Links */}
          <div className="p-4 space-y-1 text-xs">
            <button className="text-gray-400 hover:text-white block">
              TERMS OF SERVICE
            </button>
            {/* <button className="text-gray-400 hover:text-white block">
              THIRD PARTY
            </button>
            <button className="text-gray-400 hover:text-white block">
              PRIVACY NOTICE
            </button> */}
<div className="text-gray-500 mt-2">v{appVersion}</div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Top Bar */}
          <div className="flex items-center justify-between p-4 bg-[#1A1A1A]">
            <div className="flex items-center gap-3 ml-2">
            
              <h2 className="text-2xl font-bold text-white tracking-wider">
                {activeTab === "RiotClient" ? "SETTINGS" : "GAME SETTINGS"}
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          {/* Settings Content */}
          <div className="p-6 overflow-y-auto text-white">
            {activeTab === "RiotClient" && <LauncherSettingSection
             launcherSettings={launcherSettings}
  updateLauncherSetting={updateLauncherSetting} />}
            {activeTab === "SweetStakes" && <SweetStakesSection
  initialInstallPath={installPath}
  initialAutoUpdate={autoUpdateEnabled}
  
/>
}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPopup;