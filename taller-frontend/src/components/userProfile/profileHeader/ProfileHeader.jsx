// components/UserProfile/ProfileHeader/ProfileHeader.jsx
import React from "react";
import { FiEdit, FiSave, FiX, FiArrowLeft } from "react-icons/fi";
import Button from "../../ui/button/Button";
import styles from "./profileHeader.module.css";

const ProfileHeader = ({
  isEditing,
  loading,
  onEdit,
  onCancel,
  onSave,
  onBack,
}) => {
  return (
    <div className={styles.profileHeader}>
      <button onClick={onBack} className={styles.backButton}>
        <FiArrowLeft /> Volver
      </button>
      <h1>Mi Perfil</h1>
      {!isEditing ? (
        <Button variant="primary" onClick={onEdit} icon={FiEdit}>
          Editar Información
        </Button>
      ) : (
        <div className={styles.editActions}>
          <Button variant="default" onClick={onCancel} icon={FiX}>
            Cancelar
          </Button>
          <Button
            variant="success"
            onClick={onSave}
            icon={FiSave}
            loading={loading}
          >
            Guardar
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProfileHeader;
