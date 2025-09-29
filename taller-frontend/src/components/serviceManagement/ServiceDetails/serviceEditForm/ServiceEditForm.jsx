import React, { useState, useEffect } from "react";
import {
  FiSave,
  FiPlus,
  FiTrash2,
  FiArrowRight,
  FiCheckCircle,
  FiTruck,
  FiX,
} from "react-icons/fi";
import styles from "./serviceEditForm.module.css";
import { useAuth } from "../../../../contexts/AuthContext"; // Ajusta la ruta según tu estructura

const ServiceEditForm = ({
  service,
  formData,
  deliveryData,
  loading,
  error,
  handleSaveChanges,
  handleMarkInProcess,
  handleMarkFinished,
  handleMarkDelivered,
  handleDeliveryDataChange,
  handleInputChange,
  handlePartChange,
  handleLaborChange,
  handleMechanicsChange,
  handleDeleteService,
  addNewPart,
  addNewLabor,
  removePart,
  removeLabor,
  calculatePartsTotal,
  calculateLaborsTotal,
  formatPrice,
  hasValidPartsOrLabors,
  isFormCompleteForProcess,
  isFormCompleteForDelivered,
  buttonStates,
}) => {
  const { user } = useAuth();
  const isFinished = service.status_service.name === "Finalizado";
  const isDelivered = service.status_service.name === "Entregado";
  const isReadOnly = isDelivered || isFinished;
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  const [mechanicInput, setMechanicInput] = useState("");

  // Verificar roles del usuario
  const isAdmin = user?.roles?.includes("Administrador");
  const isFleetMgr = user?.roles?.includes("Encargado Flotilla");
  const canSeeDeliveryData = isAdmin || isFleetMgr;

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString;
    if (dateString.includes("/")) {
      const [day, month, year] = dateString.split("/");
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }
    return "";
  };

  const formatDeliveryDateTime = (dateTimeString) => {
    if (!dateTimeString) return "";

    const date = new Date(dateTimeString);
    const offset = -6 * 60;
    const localDate = new Date(date.getTime() + offset * 60 * 1000);

    const day = String(localDate.getUTCDate()).padStart(2, "0");
    const month = String(localDate.getUTCMonth() + 1).padStart(2, "0");
    const year = localDate.getUTCFullYear();

    const hours = String(localDate.getUTCHours()).padStart(2, "0");
    const minutes = String(localDate.getUTCMinutes()).padStart(2, "0");
    const seconds = String(localDate.getUTCSeconds()).padStart(2, "0");

    return `${day}/${month}/${year} a las ${hours}:${minutes}:${seconds}`;
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    handleInputChange({ target: { name, value } });
  };

  // ----------------- CÁLCULO DE SUBTOTAL, IVA Y TOTAL -----------------
  const IVA_RATE = 0.13;
  const subtotal = calculatePartsTotal() + calculateLaborsTotal();
  const ivaAmount = subtotal * IVA_RATE;
  const totalWithIVA = subtotal + ivaAmount;

  // ----------------- MANEJO DE MECÁNICOS MEJORADO -----------------
  const addMechanic = () => {
    if (
      mechanicInput.trim() &&
      !formData.mechanics.includes(mechanicInput.trim())
    ) {
      const newMechanics = [...formData.mechanics, mechanicInput.trim()];
      handleMechanicsChange({ target: { value: newMechanics.join(", ") } });
      setMechanicInput("");
    }
  };

  const removeMechanic = (mechanicToRemove) => {
    const newMechanics = formData.mechanics.filter(
      (mechanic) => mechanic !== mechanicToRemove
    );
    handleMechanicsChange({ target: { value: newMechanics.join(", ") } });
  };

  const handleMechanicKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addMechanic();
    }
  };

  // ----------------- RENDERIZADO CONDICIONAL DE BOTONES -----------------
  const renderActionButtons = () => {
    switch (service.status_service.name) {
      case "Pendiente":
        return (
          <button
            type="button"
            onClick={handleMarkInProcess}
            disabled={buttonStates.markStatus || !isFormCompleteForProcess()}
            className={styles.secondaryButton}
            title={
              !isFormCompleteForProcess()
                ? "Complete todos los campos requeridos y al menos un repuesto o mano de obra válido"
                : ""
            }
          >
            <FiArrowRight />{" "}
            {buttonStates.markStatus ? "Procesando..." : "Marcar como En Proceso"}
          </button>
        );
      case "En proceso":
        return (
          <button
            type="button"
            onClick={handleMarkFinished}
            disabled={buttonStates.markStatus || !hasValidPartsOrLabors()}
            className={styles.secondaryButton}
            title={
              !hasValidPartsOrLabors()
                ? "Debe agregar al menos un repuesto o mano de obra válida"
                : "Guardará los cambios y marcará el servicio como Finalizado"
            }
          >
            <FiCheckCircle />{" "}
            {buttonStates.markStatus ? "Procesando..." : "Marcar como Finalizado"}
          </button>
        );
      case "Finalizado":
        // SOLO mostrar botón de entregado si el usuario tiene permisos
        return !isDelivered && canSeeDeliveryData ? (
          <button
            type="button"
            onClick={handleMarkDelivered}
            disabled={buttonStates.markStatus || !isFormCompleteForDelivered()}
            className={styles.secondaryButton}
            title={
              !isFormCompleteForDelivered()
                ? "Complete número de factura, método de pago y al menos un repuesto o mano de obra válido"
                : "Guardará los cambios y marcará el servicio como Entregado"
            }
          >
            <FiTruck /> {buttonStates.markStatus ? "Procesando..." : "Marcar como Entregado"}
          </button>
        ) : null;
      default:
        return null;
    }
  };

  // ----------------- RENDERIZADO DE REPUESTOS EN MÓVIL (TARJETAS) -----------------
  const renderMobileParts = () => (
    <div className={styles.mobileList}>
      {formData.parts.map((part, index) => (
        <div key={`part-${index}`} className={styles.mobileCard}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>Repuesto #{index + 1}</span>
            {!isDelivered && (
              <button
                type="button"
                onClick={() => removePart(index, part.id)}
                className={styles.removeButton}
                disabled={loading}
              >
                <FiTrash2 />
              </button>
            )}
          </div>

          <div className={styles.cardField}>
            <label>Cantidad:</label>
            {isDelivered ? (
              <span>{part.amount}</span>
            ) : (
              <input
                type="number"
                min="1"
                value={part.amount || ""}
                onChange={(e) =>
                  handlePartChange(index, "amount", e.target.value)
                }
                required
                className={styles.mobileInput}
              />
            )}
          </div>

          <div className={styles.cardField}>
            <label>Nombre:</label>
            {isDelivered ? (
              <span>{part.name}</span>
            ) : (
              <input
                type="text"
                value={part.name || ""}
                onChange={(e) =>
                  handlePartChange(index, "name", e.target.value)
                }
                placeholder="Nombre del repuesto"
                required
                className={styles.mobileInput}
              />
            )}
          </div>

          <div className={styles.cardField}>
            <label>Precio:</label>
            {isDelivered ? (
              <span>{formatPrice(part.price)}</span>
            ) : (
              <input
                type="number"
                min="0"
                step="0.01"
                value={part.price || 0}
                onChange={(e) =>
                  handlePartChange(index, "price", e.target.value)
                }
                placeholder="0.00"
                className={styles.mobileInput}
              />
            )}
          </div>

          <div className={styles.cardField}>
            <label>Nº Factura:</label>
            {isDelivered ? (
              <span>{part.invoice_number || "N/A"}</span>
            ) : (
              <input
                type="text"
                value={part.invoice_number || ""}
                onChange={(e) =>
                  handlePartChange(index, "invoice_number", e.target.value)
                }
                placeholder="Número de factura"
                className={styles.mobileInput}
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );

  // ----------------- RENDERIZADO DE MANO DE OBRA EN MÓVIL (TARJETAS) -----------------
  const renderMobileLabors = () => (
    <div className={styles.mobileList}>
      {formData.labors.map((labor, index) => (
        <div key={`labor-${index}`} className={styles.mobileCard}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>Mano de obra #{index + 1}</span>
            {!isDelivered && (
              <button
                type="button"
                onClick={() => removeLabor(index, labor.id)}
                className={styles.removeButton}
                disabled={loading}
              >
                <FiTrash2 />
              </button>
            )}
          </div>

          <div className={styles.cardField}>
            <label>Cantidad:</label>
            {isDelivered ? (
              <span>{labor.amount}</span>
            ) : (
              <input
                type="number"
                min="1"
                value={labor.amount || ""}
                onChange={(e) =>
                  handleLaborChange(index, "amount", e.target.value)
                }
                required
                className={styles.mobileInput}
              />
            )}
          </div>

          <div className={styles.cardField}>
            <label>Descripción:</label>
            {isDelivered ? (
              <span>{labor.description}</span>
            ) : (
              <input
                type="text"
                value={labor.description || ""}
                onChange={(e) =>
                  handleLaborChange(index, "description", e.target.value)
                }
                placeholder="Descripción del trabajo"
                required
                className={styles.mobileInput}
              />
            )}
          </div>

          <div className={styles.cardField}>
            <label>Precio:</label>
            {isDelivered ? (
              <span>{formatPrice(labor.price)}</span>
            ) : (
              <input
                type="number"
                min="0"
                step="0.01"
                value={labor.price || ""}
                onChange={(e) =>
                  handleLaborChange(index, "price", e.target.value)
                }
                placeholder="0.00"
                className={styles.mobileInput}
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );

  // ----------------- RENDERIZADO DE REPUESTOS EN DESKTOP (TABLA) -----------------
  const renderDesktopParts = () => (
    <table className={styles.proformaTable}>
      <thead>
        <tr>
          <th>Cantidad</th>
          <th>Nombre</th>
          <th>Precio</th>
          <th>Nº Factura</th>
          {!isDelivered && <th>Acciones</th>}
        </tr>
      </thead>
      <tbody>
        {formData.parts.map((part, index) => (
          <tr key={`part-${index}`}>
            <td>
              {isDelivered ? (
                <span>{part.amount}</span>
              ) : (
                <input
                  type="number"
                  min="1"
                  required
                  value={part.amount || ""}
                  onChange={(e) =>
                    handlePartChange(index, "amount", e.target.value)
                  }
                />
              )}
            </td>
            <td>
              {isDelivered ? (
                <span>{part.name}</span>
              ) : (
                <input
                  type="text"
                  required
                  value={part.name || ""}
                  onChange={(e) =>
                    handlePartChange(index, "name", e.target.value)
                  }
                />
              )}
            </td>
            <td>
              {isDelivered ? (
                <span>{formatPrice(part.price)}</span>
              ) : (
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={part.price || ""}
                  onChange={(e) =>
                    handlePartChange(index, "price", e.target.value)
                  }
                />
              )}
            </td>
            <td>
              {isDelivered ? (
                <span>{part.invoice_number || "N/A"}</span>
              ) : (
                <input
                  type="text"
                  value={part.invoice_number || ""}
                  onChange={(e) =>
                    handlePartChange(index, "invoice_number", e.target.value)
                  }
                  placeholder="Número de factura"
                />
              )}
            </td>
            {!isDelivered && (
              <td>
                <button
                  type="button"
                  onClick={() => removePart(index, part.id)}
                  className={styles.removeButton}
                  disabled={loading}
                >
                  <FiTrash2 />
                </button>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );

  // ----------------- RENDERIZADO DE MANO DE OBRA EN DESKTOP (TABLA) -----------------
  const renderDesktopLabors = () => (
    <table className={styles.proformaTable}>
      <thead>
        <tr>
          <th>Cantidad</th>
          <th>Descripción</th>
          <th>Precio</th>
          {!isDelivered && <th>Acciones</th>}
        </tr>
      </thead>
      <tbody>
        {formData.labors.map((labor, index) => (
          <tr key={`labor-${index}`}>
            <td>
              {isDelivered ? (
                <span>{labor.amount}</span>
              ) : (
                <input
                  type="number"
                  required
                  min="1"
                  value={labor.amount || ""}
                  onChange={(e) =>
                    handleLaborChange(index, "amount", e.target.value)
                  }
                />
              )}
            </td>
            <td>
              {isDelivered ? (
                <span>{labor.description}</span>
              ) : (
                <input
                  type="text"
                  required
                  value={labor.description || ""}
                  onChange={(e) =>
                    handleLaborChange(index, "description", e.target.value)
                  }
                />
              )}
            </td>
            <td>
              {isDelivered ? (
                <span>{formatPrice(labor.price)}</span>
              ) : (
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={labor.price || ""}
                  onChange={(e) =>
                    handleLaborChange(index, "price", e.target.value)
                  }
                />
              )}
            </td>
            {!isDelivered && (
              <td>
                <button
                  type="button"
                  onClick={() => removeLabor(index, labor.id)}
                  className={styles.removeButton}
                  disabled={loading}
                >
                  <FiTrash2 />
                </button>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <form onSubmit={!isDelivered ? handleSaveChanges : (e) => e.preventDefault()} className={styles.serviceForm}>
      {/* Campos básicos */}
      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label>Fecha estimada de finalización</label>
          {isReadOnly ? (
            <span>{formData.end_date}</span>
          ) : (
            <input
              type="date"
              name="end_date"
              value={formatDateForInput(formData.end_date) || ""}
              onChange={handleDateChange}
            />
          )}
        </div>

        {isDelivered && service.delivery_datetime && (
          <div className={styles.formGroup}>
            <label>Fecha y hora de entrega</label>
            {formatDeliveryDateTime(service.delivery_datetime)}
          </div>
        )}

        <div className={styles.formGroup}>
          <label>Ubicación del vehículo</label>
          {isDelivered ? (
            <span>{formData.vehicle_location}</span>
          ) : (
            <input
              type="text"
              name="vehicle_location"
              value={formData.vehicle_location || ""}
              onChange={handleInputChange}
            />
          )}
        </div>
      </div>

      {/* Mecánicos asignados */}
      <div className={styles.formGroup}>
        <label>Mecánicos asignados</label>
        {isReadOnly ? (
          <div className={styles.mechanicsTags}>
            {formData.mechanics.map((mechanic, index) => (
              <span key={index} className={styles.mechanicTag}>
                {mechanic}
              </span>
            ))}
          </div>
        ) : (
          <div className={styles.mechanicsInputContainer}>
            <div className={styles.mechanicsTags}>
              {formData.mechanics.map((mechanic, index) => (
                <span key={index} className={styles.mechanicTag}>
                  {mechanic}
                  <button
                    type="button"
                    onClick={() => removeMechanic(mechanic)}
                    className={styles.removeTagButton}
                  >
                    <FiX />
                  </button>
                </span>
              ))}
            </div>
            <div className={styles.mechanicInputWrapper}>
              <input
                type="text"
                value={mechanicInput}
                onChange={(e) => setMechanicInput(e.target.value)}
                onKeyPress={handleMechanicKeyPress}
                placeholder="Escriba el nombre y presione Enter"
                className={styles.mechanicInput}
              />
              <button
                type="button"
                onClick={addMechanic}
                className={styles.addMechanicButton}
                disabled={!mechanicInput.trim()}
              >
                <FiPlus />
              </button>
            </div>
            <small className={styles.helpText}>
              Presione Enter o el botón (+) para agregar mecánico
            </small>
          </div>
        )}
      </div>

      {/* Sección de Observaciones */}
      <div className={styles.formGroup}>
        <label>Observaciones</label>
        {isDelivered ? (
          <div className={styles.observationsText}>
            {formData.observations || "No hay observaciones registradas"}
          </div>
        ) : (
          <textarea
            name="observations"
            value={formData.observations || ""}
            onChange={handleInputChange}
            placeholder="Ingrese observaciones adicionales (opcional)"
            maxLength={255}
            rows={3}
            className={styles.textArea}
          />
        )}
        {!isDelivered && (
          <small className={styles.characterCount}>
            {(formData.observations || "").length}/255 caracteres
          </small>
        )}
      </div>

      {/* Sección de Repuestos */}
      <div className={styles.proformaSection}>
        <h3>Repuestos ({formData.parts.length})</h3>
        {formData.parts.length > 0 ? (
          isMobileView ? (
            renderMobileParts()
          ) : (
            renderDesktopParts()
          )
        ) : (
          <p className={styles.noData}>No se registraron repuestos</p>
        )}
        {!isDelivered && (
          <button
            type="button"
            onClick={addNewPart}
            className={styles.addButton}
          >
            <FiPlus /> Agregar Repuesto
          </button>
        )}
      </div>

      {/* Sección de Mano de Obra */}
      <div className={styles.proformaSection}>
        <h3>Mano de Obra ({formData.labors.length})</h3>
        {formData.labors.length > 0 ? (
          isMobileView ? (
            renderMobileLabors()
          ) : (
            renderDesktopLabors()
          )
        ) : (
          <p className={styles.noData}>No se registró mano de obra</p>
        )}
        {!isDelivered && (
          <button
            type="button"
            onClick={addNewLabor}
            className={styles.addButton}
          >
            <FiPlus /> Agregar Mano de Obra
          </button>
        )}
      </div>

      {/* Total General */}
      <div className={styles.grandTotal}>
        <div className={styles.grandTotalContent}>
          <div>
            <span className={styles.grandTotalLabel}>Subtotal: </span>
            <span className={styles.grandTotalValue}>
              {formatPrice(subtotal)}
            </span>
          </div>
          <div>
            <span className={styles.grandTotalLabel}>IVA (13%): </span>
            <span className={styles.grandTotalValue}>
              {formatPrice(ivaAmount)}
            </span>
          </div>
          <div>
            <span className={styles.grandTotalLabel}>TOTAL GENERAL: </span>
            <span className={styles.grandTotalValue}>
              {formatPrice(totalWithIVA)}
            </span>
          </div>
        </div>
      </div>

      {/* Datos de Entrega - SOLO visible para Administrador o Encargado Flotilla */}
      {canSeeDeliveryData && (service.status_service.name === "Finalizado" || isDelivered) && (
        <div className={styles.deliverySection}>
          <h3>Datos de Entrega</h3>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Número de Factura</label>
              {isDelivered ? (
                <span>{deliveryData?.invoice_number}</span>
              ) : (
                <input
                  type="text"
                  name="invoice_number"
                  value={deliveryData?.invoice_number || ""}
                  onChange={handleDeliveryDataChange}
                />
              )}
            </div>

            <div className={styles.formGroup}>
              <label>Método de Pago</label>
              {isDelivered ? (
                <span>{deliveryData?.payment_method}</span>
              ) : (
                <select
                  name="payment_method"
                  value={deliveryData?.payment_method || ""}
                  onChange={handleDeliveryDataChange}
                >
                  <option value="" disabled>
                    Seleccione
                  </option>
                  <option value="Efectivo">Efectivo</option>
                  <option value="Tarjeta">Tarjeta</option>
                  <option value="Sinpe">Sinpe</option>
                  <option value="Transferencia">Transferencia</option>
                </select>
              )}
            </div>
          </div>
        </div>
      )}

      {/* BOTONES - OCULTOS CUANDO EL SERVICIO ESTÁ ENTREGADO */}
      {!isDelivered && (
        <div className={styles.buttonGroup}>
          <button
            type="button"
            onClick={handleDeleteService}
            disabled={buttonStates.deleteService}
            className={styles.deleteButton}
          >
            <FiTrash2 /> {buttonStates.deleteService ? "Eliminando..." : "Eliminar Servicio"}
          </button>

          <div className={styles.rightButtons}>
            <button 
              type="submit" 
              disabled={buttonStates.saveChanges} 
              className={styles.button}
              title="Guardar cambios sin validar campos requeridos"
            >
              <FiSave /> {buttonStates.saveChanges ? "Guardando..." : "Guardar Cambios"}
            </button>
            {renderActionButtons()}
          </div>
        </div>
      )}

      {error && <p className={styles.error}>{error}</p>}
    </form>
  );
};

export default ServiceEditForm;