import React from "react";
import LoadingSpinner from "../spinner/LoadingSpinner";
import "./loadingScreen.css";

const LoadingScreen = () => {
  return (
    <div className="full-loading-screen">
      <div className="loading-wrapper">
        <h1 className="brand-title">Taller 2001</h1>
        <LoadingSpinner />
      </div>
    </div>
  );
};

export default LoadingScreen;
