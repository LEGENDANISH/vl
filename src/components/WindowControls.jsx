import React from "react";

const WindowControls = () => {
  return (
    <div className="absolute top-2 right-2 z-50 flex gap-2 no-drag">
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
  );
};

export default WindowControls;
