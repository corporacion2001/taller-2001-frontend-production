import React, { useState, useRef } from "react";
import styles from "./servicePhotos.module.css";
import Camera from "../../../ui/camera/Camera";
import ConfirmationModal from "../../../ui/confirmationModal/ConfirmationModal";
import { serviceAPI } from "../../../../services/service.api";
import { useNotification } from "../../../../contexts/NotificationContext";
import heic2any from "heic2any";

const ServicePhotos = ({
  photos,
  openImageModal,
  serviceId,
  onPhotosUpdate,
  canEdit = false,
}) => {
  const { showNotification } = useNotification();
  const fileInputRef = useRef(null);
  const [showCamera, setShowCamera] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingPhotoId, setDeletingPhotoId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState(null);

  // Misma función de conversión HEIC que en Step3Service
  const convertHeicToJpg = async (file) => {
    const isHeic =
      file.name.toLowerCase().endsWith(".heic") ||
      file.type.includes("heic") ||
      file.name.toLowerCase().endsWith(".heif") ||
      file.type.includes("heif");

    if (!isHeic) {
      return file;
    }

    try {
      showNotification("Convirtiendo imagen HEIC a JPG...", "info");

      const conversionResult = await heic2any({
        blob: file,
        toType: "image/jpeg",
        quality: 0.8,
      });

      const newFileName = file.name.replace(/\.[^/.]+$/, ".jpg");
      const newFile = new File([conversionResult], newFileName, {
        type: "image/jpeg",
        lastModified: new Date().getTime(),
      });

      return newFile;
    } catch (error) {
      console.error("Error convirtiendo HEIC a JPG:", error);
      showNotification(
        "Error al convertir imagen. Se usará el formato original.",
        "error",
      );
      return file;
    }
  };

  // Mismo handler de selección de archivos que Step3Service
  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const remainingSlots = 15 - photos.length;
    if (remainingSlots <= 0) {
      showNotification("Ya se alcanzó el límite de 15 fotos", "warning");
      return;
    }

    const filesToUpload = files.slice(0, remainingSlots);
    setUploading(true);

    try {
      for (const file of filesToUpload) {
        const processedFile = await convertHeicToJpg(file);
        await uploadPhotoToService(processedFile);
      }

      showNotification(
        `${filesToUpload.length} foto(s) agregada(s) correctamente`,
        "success",
      );

      if (onPhotosUpdate) {
        await onPhotosUpdate();
      }
    } catch (error) {
      console.error("Error subiendo fotos:", error);
      showNotification("Error al subir algunas fotos", "error");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Función para subir foto (mismo flujo que en Step3Service y ServiceStepper)
  const uploadPhotoToService = async (file) => {
    try {
      const uploadUrlResponse = await serviceAPI.getPhotoUploadUrl(serviceId);
      const { uploadUrl, key } = uploadUrlResponse.data.data;

      if (!uploadUrl || !key) {
        throw new Error("No se pudo obtener URL de subida");
      }

      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type || "image/jpeg" },
      });

      if (!uploadResponse.ok) {
        throw new Error(
          `Error subiendo foto a S3: ${uploadResponse.statusText}`,
        );
      }

      await serviceAPI.registerPhotoInDatabase({
        reference: key,
        service_id: serviceId,
      });
    } catch (error) {
      console.error("Error en uploadPhotoToService:", error);
      throw error;
    }
  };

  // Mismo handler de fotos capturadas que Step3Service
  const handlePhotosCaptured = async (capturedPhotos) => {
    setShowCamera(false);

    const remainingSlots = 15 - photos.length;
    if (remainingSlots <= 0) {
      showNotification("Ya se alcanzó el límite de 15 fotos", "warning");
      return;
    }

    const photosToUpload = capturedPhotos.slice(0, remainingSlots);
    setUploading(true);

    try {
      for (const photo of photosToUpload) {
        let fileToUpload;

        if (photo.file) {
          fileToUpload = photo.file;
        } else if (photo.url) {
          const response = await fetch(photo.url);
          const blob = await response.blob();
          fileToUpload = new File(
            [blob],
            photo.name || `camera_${Date.now()}.jpg`,
            { type: "image/jpeg" },
          );
        } else {
          continue;
        }

        await uploadPhotoToService(fileToUpload);
      }

      showNotification(
        `${photosToUpload.length} foto(s) agregada(s) correctamente`,
        "success",
      );

      if (onPhotosUpdate) {
        await onPhotosUpdate();
      }
    } catch (error) {
      console.error("Error subiendo fotos de cámara:", error);
      showNotification("Error al subir algunas fotos", "error");
    } finally {
      setUploading(false);
    }
  };

  // Handler para abrir modal de confirmación
  const handleDeleteClick = (photoId) => {
    setPhotoToDelete(photoId);
    setShowDeleteModal(true);
  };

  // Handler para confirmar eliminación
  const handleConfirmDelete = async () => {
    setShowDeleteModal(false);
    setDeletingPhotoId(photoToDelete);

    try {
      const response = await serviceAPI.deletePhoto(photoToDelete);

      if (response.data?.success === false) {
        throw new Error(response.data?.message || "Error al eliminar foto");
      }

      showNotification("Foto eliminada correctamente", "success");

      if (onPhotosUpdate) {
        await onPhotosUpdate();
      }
    } catch (error) {
      console.error("Error eliminando foto:", error);
      showNotification(error.message || "Error al eliminar la foto", "error");
    } finally {
      setDeletingPhotoId(null);
      setPhotoToDelete(null);
    }
  };

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2>Fotos del Servicio</h2>
        <div className={styles.headerRight}>
          <span className={styles.photoCount}>{photos.length}/15 fotos</span>

          {canEdit && photos.length < 15 && (
            <div className={styles.actionButtons}>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handlePhotoUpload}
                disabled={uploading}
                style={{ display: "none" }}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className={styles.addButton}
                disabled={uploading}
                title="Seleccionar fotos"
              >
                Seleccionar fotos
              </button>
              <button
                onClick={() => setShowCamera(true)}
                className={styles.addButton}
                disabled={uploading}
                title="Tomar foto"
              >
                Tomar foto
              </button>
            </div>
          )}
        </div>
      </div>

      {uploading && (
        <div className={styles.uploadingMessage}>Subiendo fotos...</div>
      )}

      {photos.length > 0 ? (
        <div className={styles.gallery}>
          {photos.map((photo) => (
            <div key={photo.id} className={styles.photoCard}>
              <div
                className={styles.photoWrapper}
                onClick={() => openImageModal(photo.downloadUrl)}
              >
                <img
                  src={photo.downloadUrl}
                  alt="Foto del servicio"
                  className={styles.photo}
                  loading="lazy"
                />
                <div className={styles.photoOverlay}>
                  <span className={styles.zoomIcon}>Ver</span>
                </div>
              </div>

              {canEdit && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(photo.id);
                  }}
                  className={styles.deleteButton}
                  disabled={deletingPhotoId === photo.id}
                >
                  {deletingPhotoId === photo.id ? "Eliminando..." : "Eliminar"}
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className={styles.noData}>
          No hay fotos registradas para este servicio
        </p>
      )}

      {/* Modal de confirmación */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setPhotoToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="¿Eliminar foto?"
        message="¿Está seguro de que desea eliminar esta foto? Esta acción no se puede deshacer."
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        danger={true}
      />

      {/* Mismo componente Camera que usa Step3Service */}
      {showCamera && (
        <Camera
          onCapture={handlePhotosCaptured}
          onClose={() => setShowCamera(false)}
        />
      )}
    </section>
  );
};

export default ServicePhotos;
