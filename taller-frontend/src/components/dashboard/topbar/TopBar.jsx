import React from "react";
import styles from "./topBar.module.css";
import { FiMenu } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import SmartAvatar from "../../ui/smartAvatar/SmartAvatar"; // Asegúrate de que la ruta sea correcta

const TopBar = ({ user, toggleSidebar }) => {
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate("/dashboard/profile");
  };

  return (
    <div className={styles.topBar}>
      <button 
        className={styles.menuButton}
        onClick={toggleSidebar}
        aria-label="Toggle menu"
      >
        <FiMenu className={styles.menuIcon} />
      </button>
      
      <div className={styles.profileContainer}>
        <div 
          className={styles.profileSection}
          onClick={handleProfileClick}
          aria-label="Ver perfil"
          role="button"
          tabIndex={0}
        >
          <div className={styles.profileImageContainer}>
            <SmartAvatar 
              size="sm" 
              className={styles.profileAvatar}
            />
          </div>
          <div className={styles.profileInfo}>
            <span className={styles.profileName}>
              {user?.name || "Usuario"}
            </span>
            <span className={styles.profileEmail}>
              {user?.email || "usuario@ejemplo.com"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;