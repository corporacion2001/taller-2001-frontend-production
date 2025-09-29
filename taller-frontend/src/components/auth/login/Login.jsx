import React, { useState, useLayoutEffect } from "react";
import styles from "./login.module.css";

import LeftPanel from "./leftPanel/LeftPanel";
import RightPanel from "./rightPanel/RightPanel";

const Login = () => {
  const [isDesktop, setIsDesktop] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useLayoutEffect(() => {
    const checkViewport = () => {
      setIsDesktop(window.innerWidth > 992);
    };

    // Primero establecer el estado inicial sincrónicamente
    checkViewport();

    // Luego marcar como listo después del primer render
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 0);

    window.addEventListener("resize", checkViewport);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", checkViewport);
    };
  }, []);

  return (
    <div className={`${styles.splitContainer} ${isReady ? styles.ready : ""}`}>
      {isDesktop && <LeftPanel />}
      <RightPanel />
    </div>
  );
};

export default Login;
