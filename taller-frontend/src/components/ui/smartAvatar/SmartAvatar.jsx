import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import PropTypes from "prop-types";
import styles from "./smartAvatar.module.css";

const SmartAvatar = ({
  size = "md",
  className = "",
  forceFallback = false,
}) => {
  const { user } = useAuth();

  const name = `${user?.name || ""} ${user?.lastname1 || ""}`.trim();

  const photoUrl = user?.photo_url; // Solo usuario logueado

  const [avatarUrl, setAvatarUrl] = useState("");
  const [loading, setLoading] = useState(true);

  const sizeMap = {
    xs: 24,
    sm: 40,
    md: 60,
    lg: 120,
    xl: 160,
  };

  const generateFallbackAvatar = useCallback(() => {
    const initials = name
      .split(" ")
      .slice(0, 2)
      .map((word) => word[0] || "")
      .join("")
      .toUpperCase();

    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      initials
    )}&background=1532ba&color=fff&bold=true`;
  }, [name]);

  useEffect(() => {
    if (!photoUrl || forceFallback) {
      setAvatarUrl(generateFallbackAvatar());
    } else {
      setAvatarUrl(photoUrl);
    }
    setLoading(false);
  }, [photoUrl, forceFallback, generateFallbackAvatar]);

  if (loading) {
    return (
      <div
        className={`${styles.loadingPlaceholder} ${className}`}
        style={{
          width: sizeMap[size],
          height: sizeMap[size],
        }}
      />
    );
  }

  return (
    <img
      src={avatarUrl}
      alt={`Avatar de ${name}`}
      className={`${styles.avatarImage} ${className}`}
      style={{
        width: sizeMap[size],
        height: sizeMap[size],
      }}
      onError={(e) => {
        e.target.src = generateFallbackAvatar();
      }}
    />
  );
};

SmartAvatar.propTypes = {
  size: PropTypes.oneOf(["xs", "sm", "md", "lg", "xl"]),
  className: PropTypes.string,
  forceFallback: PropTypes.bool,
};

export default SmartAvatar;
