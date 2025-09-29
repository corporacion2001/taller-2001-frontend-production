import React from "react";
import styles from "./servicePhotos.module.css";

const ServicePhotos = ({ photos, openImageModal }) => {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2>Fotos del Servicio</h2>
        <span className={styles.photoCount}>{photos.length} fotos</span>
      </div>
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
            </div>
          ))}
        </div>
      ) : (
        <p className={styles.noData}>
          No hay fotos registradas para este servicio
        </p>
      )}
    </section>
  );
};

export default ServicePhotos;
