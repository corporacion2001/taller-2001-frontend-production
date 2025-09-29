import React from "react";
import styles from "./confirmationModal.module.css";
import { FiAlertTriangle } from "react-icons/fi";

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "¿Estás seguro?",
  message = "Esta acción no se puede deshacer",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  danger = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div
          className={`${styles.iconContainer} ${danger ? styles.danger : ""}`}
        >
          <FiAlertTriangle size={24} />
        </div>

        <h2>{title}</h2>
        <p>{message}</p>

        <div className={styles.buttonGroup}>
          <button
            className={`${styles.button} ${
              danger ? styles.dangerButton : styles.primaryButton
            }`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
          <button
            className={`${styles.button} ${styles.secondaryButton}`}
            onClick={onClose}
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
