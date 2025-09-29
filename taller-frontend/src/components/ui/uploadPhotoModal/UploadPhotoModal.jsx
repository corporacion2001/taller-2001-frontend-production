import React, { useState } from "react";
import styles from "./uploadPhotoModal.module.css";
import { FaImages, FaTrash } from "react-icons/fa";
import { useAuth } from "../../../contexts/AuthContext";
import { usersAPI } from "../../../services/user.api";
import { useNotification } from "../../../contexts/NotificationContext";
import SmallSpinner from "../../../components/ui/smallSpinner/SmallSpinner";

const UploadPhotoModal = ({ onClose, onPhotoUpdated }) => {
  const { user, loadUser } = useAuth();
  const [uploadLoading, setUploadLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showNotification } = useNotification();

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadLoading(true);
    setError(null);

    try {
      const response = await usersAPI.getUploadUrl(user.id);
      const { uploadUrl, key } = response.data;

      await usersAPI.uploadPhotoToS3(uploadUrl, file);
      await usersAPI.updatePhotoReference(user.id, key);
      await loadUser();

      showNotification("Foto de perfil actualizada con éxito", "success");
      onClose();
      if (onPhotoUpdated) onPhotoUpdated();
    } catch (err) {
      showNotification(
        "Error al subir la imagen. Por favor intenta nuevamente.",
        "error"
      );
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDeletePhoto = async () => {
    setDeleteLoading(true);
    setError(null);

    try {
      await usersAPI.deletePhoto(user.id);
      await loadUser();

      showNotification("Foto de perfil eliminada con éxito", "success");
      onClose();
      if (onPhotoUpdated) onPhotoUpdated();
    } catch (err) {
      showNotification(
        "Error al eliminar la imagen. Por favor intenta nuevamente.",
        "error"
      );
      setError("Error al eliminar la imagen. Por favor intenta nuevamente.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={handleModalClick}>
        <h2>Cambiar foto de perfil</h2>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.buttonGroup}>
          <label
            htmlFor="fileUpload"
            className={`${styles.button} ${styles.primaryButton}`}
            disabled={uploadLoading || deleteLoading}
          >
            {uploadLoading ? (
              <>
                <SmallSpinner />
                Cargando...
              </>
            ) : (
              <>
                <FaImages className={styles.icon} />
                Elegir imagen
              </>
            )}
          </label>
          <input
            id="fileUpload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className={styles.hiddenInput}
            disabled={uploadLoading || deleteLoading}
          />

          {user.photo_url && (
            <button
              className={`${styles.button} ${styles.deleteButton}`}
              onClick={handleDeletePhoto}
              disabled={uploadLoading || deleteLoading}
            >
              {deleteLoading ? (
                <>
                  <SmallSpinner />
                  Eliminando...
                </>
              ) : (
                <>
                  <FaTrash className={styles.icon} />
                  Eliminar foto
                </>
              )}
            </button>
          )}

          <button
            className={`${styles.button} ${styles.secondaryButton}`}
            onClick={onClose}
            disabled={uploadLoading || deleteLoading}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadPhotoModal;
