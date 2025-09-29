import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import styles from "./smartAvatar.module.css";
import { usersAPI } from "../../../services/user.api";

const UserListAvatar = ({
  id,
  name,
  lastname,
  photoReference,
  size = "sm",
  className = "",
  forceFallback = false,
}) => {
  const fullName = `${name || ""} ${lastname || ""}`.trim() || "Usuario";

  const [avatarUrl, setAvatarUrl] = useState("");
  const [loading, setLoading] = useState(true);

  const sizeMap = {
    xs: 24,
    sm: 40,
    md: 60,
    lg: 120,
    xl: 160,
  };

  // Genera avatar con iniciales (fallback)
  const generateFallbackAvatar = () => {
    const initials = fullName
      .split(" ")
      .slice(0, 2)
      .map((word) => word[0] || "")
      .join("")
      .toUpperCase();

    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      initials
    )}&background=1532ba&color=fff&bold=true`;
  };

  useEffect(() => {
    // Si no hay foto o forzamos fallback
    if (!photoReference || forceFallback) {
      setAvatarUrl(generateFallbackAvatar());
      setLoading(false);
      return;
    }

    const fetchPhotoUrl = async () => {
      setLoading(true);
      try {
        const res = await usersAPI.getPhoto(id);
        if (res.data.url) {
          setAvatarUrl(res.data.url);
        } else {
          setAvatarUrl(generateFallbackAvatar());
        }
      } catch (error) {
        setAvatarUrl(generateFallbackAvatar());
      } finally {
        setLoading(false);
      }
    };

    fetchPhotoUrl();

    // 👇 Solo depende de id, photoReference y forceFallback
  }, [id, photoReference, forceFallback]);

  if (loading) {
    return (
      <div
        className={`${styles.listLoadingPlaceholder} ${className}`}
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
      alt={`Avatar de ${fullName}`}
      className={`${styles.listAvatarImage} ${className}`}
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

UserListAvatar.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string,
  lastname: PropTypes.string,
  photoReference: PropTypes.string,
  size: PropTypes.oneOf(["xs", "sm", "md", "lg", "xl"]),
  className: PropTypes.string,
  forceFallback: PropTypes.bool,
};

export default UserListAvatar;
