import React, { useState } from "react";
import styles from "./step3Service.module.css";
import { useAuth } from "../../../../contexts/AuthContext";
import LoadingSpinner from "../../../ui/spinner/LoadingSpinner";

const ServiceForm = ({
  formData = {},
  encargadosFlotilla = [],
  photos = [],
  onInputChange,
  onUserChange,
  onPhotoUpload,
  onRemovePhoto,
  onAddPart,
  onAddLabor,
  onPartChange,
  onLaborChange,
  onRemovePart,
  onRemoveLabor,
  onSubmit,
  onBack,
  onOpenCamera,
  loading,
  error,
  availableWorkshops = [],
  loadingWorkshops,
  loadingEncargados,
}) => {
  const { user } = useAuth();
  const isAdmin = user?.roles?.includes("Administrador");
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);

  // Asegurar que parts y labors sean arrays
  const parts = Array.isArray(formData.parts) ? formData.parts : [];
  const labors = Array.isArray(formData.labors) ? formData.labors : [];

  // Efecto para detectar cambios en el tamaño de la pantalla
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <form onSubmit={onSubmit} className={styles.serviceForm}>
      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label>Fecha de Entrada*</label>
          <input
            type="date"
            name="entry_date"
            value={formData.entry_date || ""}
            onChange={onInputChange}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>Hora de Entrada*</label>
          <input
            type="time"
            name="entry_time"
            value={formData.entry_time || ""}
            onChange={onInputChange}
            required
          />
        </div>
      </div>

      {isAdmin ? (
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>Taller*</label>
            <select
              name="workshop_id"
              value={formData.workshop_id || ""}
              onChange={onInputChange}
              disabled={loading || loadingWorkshops}
              required
            >
              <option value="">Seleccione un taller...</option>
              {availableWorkshops.map((workshop) => (
                <option key={workshop.id} value={workshop.id}>
                  {workshop.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Encargado Flotilla*</label>
            <select
              name="user_fleet_id"
              value={formData.user_fleet_id || ""}
              onChange={onUserChange}
              disabled={loadingEncargados || (isAdmin && !formData.workshop_id)}
              required
            >
              <option value="">
                {loadingEncargados ? "Cargando..." : "Seleccione un encargado flotilla"}
              </option>
              {encargadosFlotilla.map((encargado) => (
                <option key={encargado.id} value={encargado.id}>
                  {encargado.name} {encargado.lastname1}
                </option>
              ))}
            </select>
          </div>
        </div>
      ) : (
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>Taller asignado</label>
            <div className={styles.workshopInfo}>
              {user?.workshop?.name || "No asignado"}
            </div>
            <input
              type="hidden"
              name="workshop_id"
              value={user?.workshop || ""}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Encargado Flotilla*</label>
            <select
              name="user_fleet_id"
              value={formData.user_fleet_id || ""}
              onChange={onUserChange}
              disabled={loadingEncargados}
              required
            >
              <option value="">
                {loadingEncargados ? "Cargando..." : "Seleccione un encargado flotilla"}
              </option>
              {encargadosFlotilla.map((encargado) => (
                <option key={encargado.id} value={encargado.id}>
                  {encargado.name} {encargado.lastname1}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* ELIMINADO: Sección de área - ya no se necesita */}

      <div className={styles.formGroup}>
        <label>Observaciones</label>
        <textarea
          name="observations"
          value={formData.observations || ""}
          onChange={onInputChange}
          placeholder="Ingrese observaciones adicionales (opcional)"
          maxLength={255}
          rows={3}
          className={styles.textArea}
        />
        <small className={styles.characterCount}>
          {(formData.observations || "").length}/255 caracteres
        </small>
      </div>

      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>Fotos del Vehículo</h3>
        <span className={styles.photoCounter}>({photos.length}/15)</span>
      </div>

      <div className={styles.photoActionsContainer}>
        <div className={styles.photoActions}>
          <label className={styles.fileInputLabel}>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={onPhotoUpload}
              disabled={photos.length >= 15 || loading}
              className={styles.fileInput}
            />
            <span className={styles.photoButton}>Seleccionar fotos</span>
          </label>

          <button
            type="button"
            onClick={onOpenCamera}
            disabled={photos.length >= 15 || loading}
            className={styles.photoButton}
          >
            Tomar foto
          </button>
        </div>
      </div>

      {photos.length > 0 && (
        <div className={styles.gallery}>
          {photos.map((photo, index) => (
            <div key={index} className={styles.photoContainer}>
              <img
                src={photo.url || photo}
                alt={`Vehículo ${index + 1}`}
                className={styles.photo}
              />
              <button
                type="button"
                onClick={() => onRemovePhoto(index)}
                className={styles.deleteButton}
                disabled={loading}
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>
      )}

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.buttonGroup}>
        <button
          type="button"
          onClick={onBack}
          className={styles.secondaryButton}
          disabled={loading}
        >
          Atrás
        </button>
        <button type="submit" disabled={loading} className={styles.button}>
          {loading ? "Registrando..." : "Registrar Servicio"}
        </button>
      </div>
    </form>
  );
};

export default ServiceForm;