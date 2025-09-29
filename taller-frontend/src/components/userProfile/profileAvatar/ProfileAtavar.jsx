import React from "react";
import SmartAvatar from "../../ui/smartAvatar/SmartAvatar";
import styles from "./profileAvatar.module.css";
import { FaPlus } from "react-icons/fa"; // Puedes usar otro ícono si prefieres

const ProfileAvatar = ({ onEdit }) => {
  return (
    <div className={styles.avatarContainer}>
      <SmartAvatar 
        size="lg"
        className={styles.profileAvatar}
      />
      <button className={styles.editButton} onClick={onEdit} title="Cambiar foto">
        <FaPlus size={14} />
      </button>
    </div>
  );
};

export default ProfileAvatar;
