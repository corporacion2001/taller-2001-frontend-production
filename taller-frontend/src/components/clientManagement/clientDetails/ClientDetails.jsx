import React, { useState, useEffect } from "react";
import styles from "./clientDetails.module.css";
import { clientLocation } from "../../../services/clientLocation.api";
import { useNotification } from "../../../contexts/NotificationContext";
import { clientsAPI } from "../../../services/client.api";

const ClientDetails = ({ client }) => {
  const { showNotification } = useNotification();
  const [isEditable, setIsEditable] = useState(false);
  const [formData, setFormData] = useState({ ...client });
  const [originalData, setOriginalData] = useState({ ...client });
  const [provinces, setProvinces] = useState([]);
  const [allCantons, setAllCantons] = useState([]);
  const [filteredCantons, setFilteredCantons] = useState([]);
  const [loading, setLoading] = useState({
    provinces: true,
    cantons: true,
    save: false,
  });
  const [errors, setErrors] = useState({
    name: "",
    lastname1: "",
    email: "",
    phone: "",
    province_id: "",
    canton_id: "",
  });

  useEffect(() => {
    const loadLocationData = async () => {
      try {
        const [provincesRes, cantonsRes] = await Promise.all([
          clientLocation.getProvinces(),
          clientLocation.getCantons(),
        ]);

        setProvinces(provincesRes.data || []);
        setAllCantons(cantonsRes.data || []);

        if (client.province_id) {
          const cantonsForProvince = cantonsRes.data.filter(
            (c) => c.province_id.toString() === client.province_id.toString()
          );
          setFilteredCantons(cantonsForProvince);
        }
      } catch (error) {
        showNotification("Error al cargar datos de ubicación", "error");
      } finally {
        setLoading((prev) => ({ ...prev, provinces: false, cantons: false }));
      }
    };

    loadLocationData();

    // Asegurarse de que los campos null se conviertan a string vacío
    const sanitizedClient = { ...client };
    Object.keys(sanitizedClient).forEach(key => {
      if (sanitizedClient[key] === null) {
        sanitizedClient[key] = "";
      }
    });

    setFormData(sanitizedClient);
    setOriginalData(sanitizedClient);
  }, [client, showNotification]);

  // Función segura para validar campos que pueden ser null
  const validateField = (name, value) => {
    // Convertir null a string vacío para evitar errores
    const safeValue = value === null ? "" : value;
    
    switch (name) {
      case "name":
        if (!safeValue.toString().trim()) return "El nombre es requerido";
        if (safeValue.length > 75) return "Máximo 75 caracteres";
        return "";
      
      case "lastname1":
        // Primer apellido ahora es opcional, solo validar si tiene contenido
        if (safeValue && safeValue.toString().trim() && safeValue.length > 75) {
          return "Máximo 75 caracteres";
        }
        return "";
      
      case "email":
        // Email opcional, solo validar si tiene contenido
        if (safeValue && safeValue.toString().trim()) {
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(safeValue)) return "Email inválido";
          if (safeValue.length > 100) return "Máximo 100 caracteres";
        }
        return "";
      
      case "phone":
        // Teléfono opcional, solo validar si tiene contenido
        if (safeValue && safeValue.toString().trim()) {
          if (!/^[0-9]{8,15}$/.test(safeValue)) return "Teléfono inválido (8-15 dígitos)";
        }
        return "";
      
      case "province_id":
        // Provincia opcional
        return "";
      
      case "canton_id":
        // Cantón opcional
        return "";
      
      default:
        return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      const numericValue = value.replace(/\D/g, "");
      setFormData((prev) => ({ ...prev, [name]: numericValue }));
      setErrors((prev) => ({ ...prev, [name]: validateField(name, numericValue) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const handleProvinceChange = (e) => {
    const provinceId = e.target.value;
    setFormData((prev) => ({
      ...prev,
      province_id: provinceId,
      canton_id: "",
    }));
    setErrors((prev) => ({
      ...prev,
      province_id: validateField("province_id", provinceId),
      canton_id: validateField("canton_id", ""),
    }));

    if (provinceId) {
      const cantonsForProvince = allCantons.filter(
        (c) => c.province_id.toString() === provinceId
      );
      setFilteredCantons(cantonsForProvince);
    } else {
      setFilteredCantons([]);
    }
  };

  const validateForm = () => {
    const newErrors = {
      name: validateField("name", formData.name),
      lastname1: validateField("lastname1", formData.lastname1),
      email: validateField("email", formData.email),
      phone: validateField("phone", formData.phone),
      province_id: validateField("province_id", formData.province_id),
      canton_id: validateField("canton_id", formData.canton_id),
    };

    setErrors(newErrors);
    
    // Solo el nombre es requerido
    const hasRequiredErrors = newErrors.name !== "";
    const hasOtherErrors = Object.values(newErrors).some(error => error !== "");
    
    return !hasRequiredErrors && !hasOtherErrors;
  };

  const hasChanges = () => {
    return Object.keys(formData).some(
      (key) => formData[key] !== originalData[key]
    );
  };

  const handleEdit = () => setIsEditable(true);

  const handleCancel = () => {
    setFormData(originalData);
    setIsEditable(false);
    setErrors({
      name: "",
      lastname1: "",
      email: "",
      phone: "",
      province_id: "",
      canton_id: "",
    });
  };

  const handleSave = async () => {
    if (!validateForm()) {
      showNotification("Por favor corrija los errores antes de guardar", "error");
      return;
    }
    
    if (!hasChanges()) {
      showNotification("No hay cambios para guardar", "info");
      setIsEditable(false);
      return;
    }

    setLoading((prev) => ({ ...prev, save: true }));

    try {
      const changes = {};
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== originalData[key]) {
          // Convertir campos vacíos a null para la base de datos
          changes[key] = formData[key] === "" ? null : formData[key];
        }
      });

      await clientsAPI.updateClient(client.id, changes);
      showNotification("Cliente actualizado correctamente", "success");
      setIsEditable(false);
      
      // Actualizar originalData con los nuevos valores (convirtiendo null a string vacío para consistencia)
      const updatedOriginalData = { ...formData };
      setOriginalData(updatedOriginalData);
    } catch (error) {
      showNotification("Error al actualizar cliente", "error");
    } finally {
      setLoading((prev) => ({ ...prev, save: false }));
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Datos del Cliente</h3>
        <div className={styles.buttonGroup}>
          {!isEditable ? (
            <button className={styles.editButton} onClick={handleEdit}>
              Editar
            </button>
          ) : (
            <>
              <button 
                className={styles.cancelButton} 
                onClick={handleCancel}
                disabled={loading.save}
              >
                Cancelar
              </button>
              <button
                className={styles.saveButton}
                onClick={handleSave}
                disabled={loading.save}
              >
                {loading.save ? "Guardando..." : "Guardar"}
              </button>
            </>
          )}
        </div>
      </div>

      <div className={styles.grid}>
        {/* Nombre (REQUERIDO) */}
        <div className={styles.inputGroup}>
          <label>Nombre <span className={styles.required}>*</span></label>
          <input
            minLength={2}
            maxLength={75}
            name="name"
            value={formData.name || ""}
            onChange={handleChange}
            disabled={!isEditable}
            required
          />
          {errors.name && <span className={styles.errorText}>{errors.name}</span>}
        </div>

        {/* Primer Apellido (OPCIONAL) */}
        <div className={styles.inputGroup}>
          <label>Primer Apellido</label>
          <input
            minLength={2}
            maxLength={75}
            name="lastname1"
            value={formData.lastname1 || ""}
            onChange={handleChange}
            disabled={!isEditable}
          />
          {errors.lastname1 && (
            <span className={styles.errorText}>{errors.lastname1}</span>
          )}
        </div>

        {/* Segundo Apellido (OPCIONAL) */}
        <div className={styles.inputGroup}>
          <label>Segundo Apellido</label>
          <input
            minLength={2}
            maxLength={75}
            name="lastname2"
            value={formData.lastname2 || ""}
            onChange={handleChange}
            disabled={!isEditable}
          />
        </div>

        {/* Cédula (REQUERIDA pero no editable) */}
        <div className={styles.inputGroup}>
          <label>Cédula <span className={styles.required}>*</span></label>
          <input value={formData.identification || ""} disabled />
        </div>

        {/* Email (OPCIONAL) */}
        <div className={styles.inputGroup}>
          <label>Correo Electrónico</label>
          <input
            minLength={5}
            maxLength={100}
            name="email"
            type="email"
            value={formData.email || ""}
            onChange={handleChange}
            disabled={!isEditable}
          />
          {errors.email && (
            <span className={styles.errorText}>{errors.email}</span>
          )}
        </div>

        {/* Teléfono (OPCIONAL) */}
        <div className={styles.inputGroup}>
          <label>Teléfono</label>
          <input
            name="phone"
            value={formData.phone || ""}
            onChange={handleChange}
            disabled={!isEditable}
            maxLength={15}
            placeholder="8-15 dígitos"
          />
          {errors.phone && (
            <span className={styles.errorText}>{errors.phone}</span>
          )}
        </div>

        {/* Provincia (OPCIONAL) */}
        <div className={styles.inputGroup}>
          <label>Provincia</label>
          <select
            name="province_id"
            value={formData.province_id || ""}
            onChange={handleProvinceChange}
            disabled={!isEditable || loading.provinces}
          >
            <option value="">Seleccione... (opcional)</option>
            {provinces.map((province) => (
              <option key={province.id} value={province.id}>
                {province.name}
              </option>
            ))}
          </select>
          {errors.province_id && (
            <span className={styles.errorText}>{errors.province_id}</span>
          )}
        </div>

        {/* Cantón (OPCIONAL) */}
        <div className={styles.inputGroup}>
          <label>Cantón</label>
          <select
            name="canton_id"
            value={formData.canton_id || ""}
            onChange={handleChange}
            disabled={!isEditable || !formData.province_id || loading.cantons}
          >
            <option value="">Seleccione... (opcional)</option>
            {filteredCantons.map((canton) => (
              <option key={canton.id} value={canton.id}>
                {canton.name}
              </option>
            ))}
          </select>
          {errors.canton_id && (
            <span className={styles.errorText}>{errors.canton_id}</span>
          )}
        </div>

        {/* Fecha de Nacimiento (OPCIONAL) */}
        <div className={styles.inputGroup}>
          <label>Fecha de Nacimiento</label>
          <input
            type="date"
            name="birthday"
            value={formData.birthday || ""}
            onChange={handleChange}
            disabled={!isEditable}
            max={new Date().toISOString().split("T")[0]}
          />
        </div>
      </div>
    </div>
  );
};

export default ClientDetails;