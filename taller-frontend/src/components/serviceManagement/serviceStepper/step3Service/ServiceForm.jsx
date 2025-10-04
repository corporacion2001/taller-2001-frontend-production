import React, { useState } from "react";
import styles from "./step3Service.module.css";
import { useAuth } from "../../../../contexts/AuthContext";
import LoadingSpinner from "../../../ui/spinner/LoadingSpinner";
import {
  FiTrash2
} from "react-icons/fi";
const ServiceForm = ({
  formData = {},
  encargados = [],
  areas = [],
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

  // Renderizado de repuestos para móviles (tarjetas)
  const renderMobileParts = () => (
    <div className={styles.mobileList}>
      {parts.map((part, index) => (
        <div key={`part-${index}`} className={styles.mobileCard}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>Repuesto #{index + 1}</span>
            <button
              type="button"
              onClick={() => onRemovePart(index)}
              className={styles.removeButton}
            >
              <FiTrash2 />
            </button>
          </div>

          <div className={styles.cardField}>
            <label>Cantidad:</label>
            <input
              type="number"
              min="1"
              value={part.amount || ""}
              onChange={(e) => onPartChange(index, "amount", e.target.value)}
              className={styles.mobileInput}
            />
          </div>

          <div className={styles.cardField}>
            <label>Nombre:</label>
            <input
              type="text"
              value={part.name || ""}
              onChange={(e) => onPartChange(index, "name", e.target.value)}
              placeholder="Nombre del repuesto"
              maxLength={255}
              className={styles.mobileInput}
            />
          </div>

          <div className={styles.cardField}>
            <label>Precio:</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={part.price || ""}
              onChange={(e) => onPartChange(index, "price", e.target.value)}
              placeholder="0.00"
              className={styles.mobileInput}
            />
          </div>

          <div className={styles.cardField}>
            <label>Nº Factura:</label>
            <input
              type="text"
              value={part.invoice_number || ""}
              onChange={(e) =>
                onPartChange(index, "invoice_number", e.target.value)
              }
              placeholder="Número de factura"
              maxLength={255}
              className={styles.mobileInput}
            />
          </div>
        </div>
      ))}
    </div>
  );

  // Renderizado de mano de obra para móviles (tarjetas)
  const renderMobileLabors = () => (
    <div className={styles.mobileList}>
      {labors.map((labor, index) => (
        <div key={`labor-${index}`} className={styles.mobileCard}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>Mano de obra #{index + 1}</span>
            <button
              type="button"
              onClick={() => onRemoveLabor(index)}
              className={styles.removeButton}
            >
                            <FiTrash2 />
            </button>
          </div>

          <div className={styles.cardField}>
            <label>Cantidad:</label>
            <input
              type="number"
              min="1"
              value={labor.amount || ""}
              onChange={(e) => onLaborChange(index, "amount", e.target.value)}
              className={styles.mobileInput}
            />
          </div>

          <div className={styles.cardField}>
            <label>Descripción:</label>
            <input
              type="text"
              value={labor.description || ""}
              onChange={(e) =>
                onLaborChange(index, "description", e.target.value)
              }
              placeholder="Descripción del trabajo"
              maxLength={255}
              className={styles.mobileInput}
            />
          </div>

          <div className={styles.cardField}>
            <label>Precio:</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={labor.price || ""}
              onChange={(e) => onLaborChange(index, "price", e.target.value)}
              placeholder="0.00"
              className={styles.mobileInput}
            />
          </div>
        </div>
      ))}
    </div>
  );

  // Renderizado de tablas para desktop
  const renderDesktopParts = () => (
    <table className={styles.proformaTable}>
      <thead>
        <tr>
          <th>Cantidad</th>
          <th>Nombre</th>
          <th>Precio</th>
          <th>Nº Factura</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {parts.map((part, index) => (
          <tr key={`part-${index}`}>
            <td>
              <input
                type="number"
                min="1"
                value={part.amount || ""}
                onChange={(e) => onPartChange(index, "amount", e.target.value)}
              />
            </td>
            <td>
              <input
                type="text"
                value={part.name || ""}
                onChange={(e) => onPartChange(index, "name", e.target.value)}
                placeholder="Nombre del repuesto"
                maxLength={255}
              />
            </td>
            <td>
              <input
                type="number"
                min="0"
                step="0.01"
                value={part.price || ""}
                onChange={(e) => onPartChange(index, "price", e.target.value)}
                placeholder="0.00"
              />
            </td>
            <td>
              <input
                type="text"
                value={part.invoice_number || ""}
                onChange={(e) =>
                  onPartChange(index, "invoice_number", e.target.value)
                }
                placeholder="Número de factura"
                maxLength={255}
              />
            </td>
            <td>
              <button
                type="button"
                onClick={() => onRemovePart(index)}
                className={styles.removeButton}
              >
                                <FiTrash2 />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderDesktopLabors = () => (
    <table className={styles.proformaTable}>
      <thead>
        <tr>
          <th>Cantidad</th>
          <th>Descripción</th>
          <th>Precio</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {labors.map((labor, index) => (
          <tr key={`labor-${index}`}>
            <td>
              <input
                type="number"
                min="1"
                value={labor.amount || ""}
                onChange={(e) => onLaborChange(index, "amount", e.target.value)}
              />
            </td>
            <td>
              <input
                type="text"
                value={labor.description || ""}
                onChange={(e) =>
                  onLaborChange(index, "description", e.target.value)
                }
                placeholder="Descripción del trabajo"
                maxLength={255}
              />
            </td>
            <td>
              <input
                type="number"
                min="0"
                step="0.01"
                value={labor.price || ""}
                onChange={(e) => onLaborChange(index, "price", e.target.value)}
                placeholder="0.00"
              />
            </td>
            <td>
              <button
                type="button"
                onClick={() => onRemoveLabor(index)}
                className={styles.removeButton}
              >
                                <FiTrash2 />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

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

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label>Número de Orden*</label>
          <input
            type="text"
            name="order_number"
            value={formData.order_number || ""}
            onChange={onInputChange}
            placeholder="Ingrese el número de orden"
            maxLength={255}
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
            <label>Encargado asignado*</label>
            <select
              name="user_assigned_id"
              value={formData.user_assigned_id || ""}
              onChange={onUserChange}
              disabled={loadingEncargados || (isAdmin && !formData.workshop_id)}
              required
            >
              <option value="">
                {loadingEncargados ? "Cargando..." : "Seleccione un técnico"}
              </option>
              {encargados.map((encargado) => (
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
            <label>Encargado asignado*</label>
            <select
              name="user_assigned_id"
              value={formData.user_assigned_id || ""}
              onChange={onUserChange}
              disabled={loadingEncargados}
              required
            >
              <option value="">
                {loadingEncargados ? "Cargando..." : "Seleccione un técnico"}
              </option>
              {encargados.map((encargado) => (
                <option key={encargado.id} value={encargado.id}>
                  {encargado.name} {encargado.lastname1}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label>Área*</label>
          <select
            name="area_id"
            value={formData.area_id || ""}
            onChange={onInputChange}
            disabled={!formData.user_assigned_id || areas.length === 0}
            required
          >
            <option value="">
              {!formData.user_assigned_id
                ? "Seleccione un técnico primero"
                : areas.length === 0
                ? "No hay áreas disponibles"
                : "Seleccione un área"}
            </option>
            {areas.map((area) => (
              <option key={area.id} value={area.id}>
                {area.name}
              </option>
            ))}
          </select>
        </div>
      </div>

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

      {/* Sección de repuestos - Responsive */}
      <div className={styles.proformaSection}>
        <h3>Repuestos</h3>
        {isMobileView ? renderMobileParts() : renderDesktopParts()}
        <button type="button" onClick={onAddPart} className={styles.addButton}>
          + Agregar Repuesto
        </button>
      </div>

      {/* Sección de mano de obra - Responsive */}
      <div className={styles.proformaSection}>
        <h3>Mano de Obra</h3>
        {isMobileView ? renderMobileLabors() : renderDesktopLabors()}
        <button type="button" onClick={onAddLabor} className={styles.addButton}>
          + Agregar Mano de Obra
        </button>
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
