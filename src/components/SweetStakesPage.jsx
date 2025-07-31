import React, { useState, useEffect } from "react";
import SweetStakesSection from "../Setting/SweetStakesSection";
import HeroSection from "./HeroSection";

const SweetStakesPage = () => {
  const [installPath, setInstallPath] = useState("");

  useEffect(() => {
    // On mount, fetch folder from backend once and set it
    const fetchSavedPath = async () => {
      try {
        if (window.api) {
          const savedPath = await window.api.getFolder();
          if (savedPath) {
            setInstallPath(savedPath);
          }
        }
      } catch (error) {
        console.error("Failed to load saved folder path:", error);
      }
    };

    fetchSavedPath();
  }, []);

  return (
    <>
      <HeroSection installPath={installPath} setInstallPath={setInstallPath} />
      <SweetStakesSection
        installPath={installPath}
        setInstallPath={setInstallPath}
      />
    </>
  );
};

export default SweetStakesPage;
