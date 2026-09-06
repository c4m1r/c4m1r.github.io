import React, { useEffect } from "react";
import { AnalyticsListener } from "./analytics/ga";
import "./App.css";
import DesktopContainer from "./containers/desktop.container";
import LockScreenContainer from "./containers/lockScreen.container";
import { useSelector } from "react-redux";
import { preloadImages } from "./utils/imageOptimization";

// Critical images to preload (above-the-fold)
const CRITICAL_IMAGES = [
  require("./assets/images/baseImages/profile.png").default,
  require("./assets/images/apps/aboutMe.png").default,
];


function App() {
  const systemState = useSelector((state) => state.systemState);

  // Preload critical images on app mount
  useEffect(() => {
    preloadImages(CRITICAL_IMAGES);
  }, []);

  return (
    <div className="App">
      <AnalyticsListener />
      {systemState.isLocked ? <LockScreenContainer /> : <DesktopContainer />}
    </div>
  );
}

export default App;
