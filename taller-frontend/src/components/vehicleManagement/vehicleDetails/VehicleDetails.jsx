import React, { useState, useEffect } from "react";
import styles from "./vehicleDetails.module.css";
import { useNotification } from "../../../contexts/NotificationContext";
import { vehiclesApi } from "../../../services/vehicles.api";

const VehicleDetails = ({ vehicle }) => {
  const { showNotification } = useNotification();
  const [isEditable, setIsEditable] = useState(false);
  const [formData, setFormData] = useState({ ...vehicle });
  const [originalData, setOriginalData] = useState({ ...vehicle });
  const [loading, setLoading] = useState({ save: false });
  const [errors, setErrors] = useState({
    plate: "",
    year: "",
    model: "",
    chassis: "",
    brand: "",
    engine: "",
    mileage: "",
    fuel_type: "",
    traccion: "",
    color: "",
    cilindros: "",
    nombre_propietario: "",
    carroceria: "",
    categoria: "",
    vin: "",
  });

  useEffect(() => {
    setFormData({ ...vehicle });
    setOriginalData({ ...vehicle });
  }, [vehicle]);

  const validateField = (name, value) => {
    switch (name) {
      case "plate":
        if (!value.trim()) return "La placa es requerida";
        if (value.length > 6) return "Máximo 6 caracteres";
        return "";
      case "year":
        if (!value) return "Año requerido";
        if (value < 1900 || value > new Date().getFullYear() + 1)
          return `Año debe estar entre 1900 y ${new Date().getFullYear() + 1}`;
        return "";
      case "model":
      case "brand":
      case "engine":
      case "chassis":
        if (!value.trim()) return "Este campo es requerido";
        if (value.length > 255) return "Máximo 255 caracteres";
        return "";
      case "mileage":
        if (!value) return "Kilometraje requerido";
        if (value < 0) return "No puede ser negativo";
        return "";
      case "fuel_type":
        if (!value) return "Tipo de combustible requerido";
        return "";
      case "traccion":
        if (value && value.length > 50) return "Máximo 50 caracteres";
        return "";
      case "color":
        if (value && value.length > 50) return "Máximo 50 caracteres";
        return "";
      case "cilindros":
        if (value && value.length > 10) return "Máximo 10 caracteres";
        return "";
      case "nombre_propietario":
        if (value && value.length > 255) return "Máximo 255 caracteres";
        return "";
      case "carroceria":
        if (value && value.length > 100) return "Máximo 100 caracteres";
        return "";
      case "categoria":
        if (value && value.length > 100) return "Máximo 100 caracteres";
        return "";
      case "vin":
        if (value && value.length > 255) return "Máximo 255 caracteres";
        return "";
      default:
        return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Si el campo es la placa, no permitir cambios
    if (name === "plate") return;

    // Manejo especial para campos numéricos
    if (name === "year" || name === "mileage") {
      const numericValue = value.replace(/\D/g, "");
      setFormData((prev) => ({ ...prev, [name]: numericValue }));
      setErrors((prev) => ({
        ...prev,
        [name]: validateField(name, numericValue),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const validateForm = () => {
    const newErrors = {
      plate: validateField("plate", formData.plate),
      year: validateField("year", formData.year),
      model: validateField("model", formData.model),
      chassis: validateField("chassis", formData.chassis),
      brand: validateField("brand", formData.brand),
      engine: validateField("engine", formData.engine),
      mileage: validateField("mileage", formData.mileage),
      fuel_type: validateField("fuel_type", formData.fuel_type),
      traccion: validateField("traccion", formData.traccion),
      color: validateField("color", formData.color),
      cilindros: validateField("cilindros", formData.cilindros),
      nombre_propietario: validateField(
        "nombre_propietario",
        formData.nombre_propietario
      ),
      carroceria: validateField("carroceria", formData.carroceria),
      categoria: validateField("categoria", formData.categoria),
      vin: validateField("vin", formData.vin),
    };

    setErrors(newErrors);

    // Excluir la placa y campos opcionales de la validación general
    const requiredFields = [
      "year",
      "model",
      "chassis",
      "brand",
      "engine",
      "mileage",
      "fuel_type",
    ];
    const hasRequiredErrors = requiredFields.some((field) => newErrors[field]);

    return !hasRequiredErrors;
  };

  const hasChanges = () => {
    return Object.keys(formData).some((key) => {
      // Excluir la placa de la verificación de cambios
      if (key === "plate") return false;

      // Convertir valores vacíos a string vacía para ambos
      const current = formData[key] == null ? "" : formData[key];
      const original = originalData[key] == null ? "" : originalData[key];

      return current !== original;
    });
  };

  const handleEdit = () => setIsEditable(true);

  const handleCancel = () => {
    setFormData(originalData);
    setIsEditable(false);
    setErrors({
      plate: "",
      year: "",
      model: "",
      chassis: "",
      brand: "",
      engine: "",
      mileage: "",
      fuel_type: "",
      traccion: "",
      color: "",
      cilindros: "",
      nombre_propietario: "",
      carroceria: "",
      categoria: "",
      vin: "",
    });
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    if (!hasChanges()) {
      showNotification("No hay cambios para guardar", "info");
      return;
    }

    setLoading((prev) => ({ ...prev, save: true }));

    try {
      const changes = {};
      Object.keys(formData).forEach((key) => {
        // Excluir la placa de los cambios a enviar
        if (key !== "plate" && formData[key] !== originalData[key]) {
          changes[key] = formData[key];
        }
      });
      console.log("Changes to save:", changes);

      await vehiclesApi.updateVehicle(vehicle.id, changes);
      showNotification("Vehículo actualizado correctamente", "success");
      setIsEditable(false);
      setOriginalData({ ...formData });
    } catch (error) {
      showNotification("Error al actualizar vehículo", "error");
    } finally {
      setLoading((prev) => ({ ...prev, save: false }));
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Datos del Vehículo</h3>
        <div className={styles.buttonGroup}>
          {!isEditable ? (
            <button className={styles.editButton} onClick={handleEdit}>
              Editar
            </button>
          ) : (
            <>
              <button className={styles.cancelButton} onClick={handleCancel}>
                Cancelar
              </button>
              <button className={styles.saveButton} onClick={handleSave}>
                {loading.save ? "Guardando..." : "Guardar"}
              </button>
            </>
          )}
        </div>
      </div>

      <div className={styles.grid}>
        {/* Placa - Siempre deshabilitada */}
        <div className={styles.inputGroup}>
          <label>Placa*</label>
          <input
            maxLength={6}
            name="plate"
            value={formData.plate || ""}
            onChange={handleChange}
            disabled={true}
          />
          {errors.plate && (
            <span className={styles.errorText}>{errors.plate}</span>
          )}
        </div>

        {/* Marca */}
        <div className={styles.inputGroup}>
          <label>Marca*</label>
          <input
            maxLength={255}
            name="brand"
            value={formData.brand || ""}
            onChange={handleChange}
            disabled={!isEditable}
          />
          {errors.brand && (
            <span className={styles.errorText}>{errors.brand}</span>
          )}
        </div>

        {/* Modelo */}
        <div className={styles.inputGroup}>
          <label>Modelo*</label>
          <input
            maxLength={255}
            name="model"
            value={formData.model || ""}
            onChange={handleChange}
            disabled={!isEditable}
          />
          {errors.model && (
            <span className={styles.errorText}>{errors.model}</span>
          )}
        </div>

        {/* Año */}
        <div className={styles.inputGroup}>
          <label>Año*</label>
          <input
            name="year"
            value={formData.year || ""}
            onChange={handleChange}
            disabled={!isEditable}
            maxLength={4}
          />
          {errors.year && (
            <span className={styles.errorText}>{errors.year}</span>
          )}
        </div>

        {/* Chasis */}
        <div className={styles.inputGroup}>
          <label>Número de Chasis*</label>
          <input
            maxLength={255}
            name="chassis"
            value={formData.chassis || ""}
            onChange={handleChange}
            disabled={!isEditable}
          />
          {errors.chassis && (
            <span className={styles.errorText}>{errors.chassis}</span>
          )}
        </div>

        {/* Motor */}
        <div className={styles.inputGroup}>
          <label>Motor*</label>
          <input
            maxLength={255}
            name="engine"
            value={formData.engine || ""}
            onChange={handleChange}
            disabled={!isEditable}
          />
          {errors.engine && (
            <span className={styles.errorText}>{errors.engine}</span>
          )}
        </div>

        {/* Kilometraje */}
        <div className={styles.inputGroup}>
          <label>Kilometraje*</label>
          <input
            name="mileage"
            value={formData.mileage || ""}
            onChange={handleChange}
            disabled={!isEditable}
          />
          {errors.mileage && (
            <span className={styles.errorText}>{errors.mileage}</span>
          )}
        </div>

        {/* Tipo de Combustible */}
        <div className={styles.inputGroup}>
          <label>Tipo de Combustible*</label>
          <select
            name="fuel_type"
            value={formData.fuel_type || ""}
            onChange={handleChange}
            disabled={!isEditable}
          >
            <option value="">Seleccione...</option>
            <option value="Gasolina">Gasolina</option>
            <option value="Diesel">Diésel</option>
            <option value="Electrico">Eléctrico</option>
            <option value="Hibrido">Híbrido</option>
            <option value="Gas">Gas</option>
            <option value="Otro">Otro</option>
          </select>
          {errors.fuel_type && (
            <span className={styles.errorText}>{errors.fuel_type}</span>
          )}
        </div>
      </div>

      <div className={styles.grid}>
        {/* Tracción */}
        <div className={styles.inputGroup}>
          <label>Tracción</label>
          <input
            maxLength={50}
            name="traccion"
            value={formData.traccion || ""}
            onChange={handleChange}
            disabled={!isEditable}
            placeholder="Ej: 4x4"
          />
          {errors.traccion && (
            <span className={styles.errorText}>{errors.traccion}</span>
          )}
        </div>

        {/* Color */}
        <div className={styles.inputGroup}>
          <label>Color</label>
          <input
            maxLength={50}
            name="color"
            value={formData.color || ""}
            onChange={handleChange}
            disabled={!isEditable}
            placeholder="Ej: Blanco"
          />
          {errors.color && (
            <span className={styles.errorText}>{errors.color}</span>
          )}
        </div>

        {/* Cilindros */}
        <div className={styles.inputGroup}>
          <label>Cilindros</label>
          <input
            maxLength={10}
            name="cilindros"
            value={formData.cilindros || ""}
            onChange={handleChange}
            disabled={!isEditable}
            placeholder="Ej: 4"
          />
          {errors.cilindros && (
            <span className={styles.errorText}>{errors.cilindros}</span>
          )}
        </div>

        {/* Nombre Propietario */}
        <div className={styles.inputGroup}>
          <label>Nombre Propietario</label>
          <input
            maxLength={255}
            name="nombre_propietario"
            value={formData.nombre_propietario || ""}
            onChange={handleChange}
            disabled={!isEditable}
            placeholder="Nombre completo"
          />
          {errors.nombre_propietario && (
            <span className={styles.errorText}>
              {errors.nombre_propietario}
            </span>
          )}
        </div>

        {/* Carrocería */}
        <div className={styles.inputGroup}>
          <label>Carrocería</label>
          <input
            maxLength={100}
            name="carroceria"
            value={formData.carroceria || ""}
            onChange={handleChange}
            disabled={!isEditable}
            placeholder="Ej: Sedán"
          />
          {errors.carroceria && (
            <span className={styles.errorText}>{errors.carroceria}</span>
          )}
        </div>

        {/* Categoría */}
        <div className={styles.inputGroup}>
          <label>Categoría</label>
          <input
            maxLength={100}
            name="categoria"
            value={formData.categoria || ""}
            onChange={handleChange}
            disabled={!isEditable}
            placeholder="Ej: Particular"
          />
          {errors.categoria && (
            <span className={styles.errorText}>{errors.categoria}</span>
          )}
        </div>

        {/* VIN */}
        <div className={styles.inputGroup}>
          <label>VIN</label>
          <input
            maxLength={255}
            name="vin"
            value={formData.vin || ""}
            onChange={handleChange}
            disabled={!isEditable}
            placeholder="Número VIN"
          />
          {errors.vin && <span className={styles.errorText}>{errors.vin}</span>}
        </div>
      </div>
    </div>
  );
};

export default VehicleDetails;
