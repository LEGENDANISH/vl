import React, { useState } from "react";

const LauncherSettingSection = ({ launcherSettings, updateLauncherSetting }) => {
  const [clientLanguage, setClientLanguage] = useState("English (US)");

  const { openOnStartup, closeWindowBehavior } = launcherSettings;
  const isMinimize = closeWindowBehavior === "minimize";

  // Toggle system tray behavior (minimize or normal)
  const toggleCloseBehavior = () => {
    const newBehavior = isMinimize ? "normal" : "minimize";
    updateLauncherSetting("closeWindowBehavior", newBehavior);
  };

  // Toggle open on startup
  const toggleStartup = () => {
    updateLauncherSetting("openOnStartup", !openOnStartup);
  };

  return (
    <div className="space-y-8">
      {/* Client Language */}
      <div className="space-y-2">
        <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide">
          LAUNCHER LANGUAGE
        </label>
        <select
          value={clientLanguage}
          onChange={(e) => setClientLanguage(e.target.value)}
          className="w-full bg-[#2A2A2A] rounded px-3 py-2 text-white appearance-none border-none outline-none"
        >
          <option value="English (US)">English (US)</option>
          {/* Add more languages if needed */}
        </select>
      </div>

      {/* Startup Behavior */}
      <div className="space-y-4">
        <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide">
          STARTUP SETTINGS
        </label>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-white">
              Open LAUNCHER on windows startup
            </span>
            <button
              onClick={toggleStartup}
              className="flex items-center gap-3 mt-1 focus:outline-none"
            >
              <div
                className="w-10 h-5 rounded-full flex items-center px-1 transition-colors duration-300"
                style={{
                  justifyContent: openOnStartup ? "flex-end" : "flex-start",
                  backgroundColor: openOnStartup ? "#ef4444" : "#4b5563",
                }}
              >
                <div className="w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-300" />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Close Window Behavior */}
      <div className="space-y-4">
        <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide">
          CLOSE BUTTON
        </label>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-white">
              Minimize to system tray
            </span>
            <button
              onClick={toggleCloseBehavior}
              className="flex items-center gap-3 mt-1 focus:outline-none"
            >
              <div
                className="w-10 h-5 rounded-full flex items-center px-1 transition-colors duration-300"
                style={{
                  justifyContent: isMinimize ? "flex-end" : "flex-start",
                  backgroundColor: isMinimize ? "#ef4444" : "#4b5563",
                }}
              >
                <div className="w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-300" />
              </div>
            </button>
          </div>
          <p className="text-xs text-gray-400 ml-6">
            {isMinimize
              ? "LAUNCHER will minimize to system tray and continue running in background."
              : "LAUNCHER will close completely when you click the close button."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LauncherSettingSection;
