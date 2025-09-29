import React, { useState, useEffect } from "react";
import styles from "./step1Client.module.css";
import { clientLocation } from "../../../../services/clientLocation.api";

const ClientForm = ({ onSubmit, initialData, onCancel }) => {
  const [formData, setFormData] = useState({
    name: "",
    lastname1: "",
    lastname2: "",
    email: "",
    phone: "",
    identification: "",
    province_id: "",
    canton_id: "",
    birthday: "",
    ...initialData,
  });

  const [provinces, setProvinces] = useState([]);
  const [allCantons, setAllCantons] = useState([]);
  const [filteredCantons, setFilteredCantons] = useState([]);
  const [loading, setLoading] = useState({
    form: false,
    provinces: true,
    cantons: true,
  });
  const [errors, setErrors] = useState({
    name: "",
    lastname1: "",
    lastname2: "",
    email: "",
    phone: "",
    identification: "",
    province_id: "",
    canton_id: "",
    birthday: "",
  });

  // Función para validar solo los campos requeridos
  const validateForm = () => {
    const newErrors = {
      name: "",
      lastname1: "",
      lastname2: "",
      email: "",
      phone: "",
      identification: "",
      province_id: "",
      canton_id: "",
      birthday: "",
    };

    let isValid = true;

    // Validación de nombre (REQUERIDO)
    if (!formData.name.trim()) {
      newErrors.name = "El nombre es requerido";
      isValid = false;
    } else if (formData.name.length > 75) {
      newErrors.name = "Máximo 75 caracteres";
      isValid = false;
    }

    // Validación de primer apellido (OPCIONAL)
    if (formData.lastname1 && formData.lastname1.length > 75) {
      newErrors.lastname1 = "Máximo 75 caracteres";
      isValid = false;
    }

    // Validación de segundo apellido (OPCIONAL)
    if (formData.lastname2 && formData.lastname2.length > 75) {
      newErrors.lastname2 = "Máximo 75 caracteres";
      isValid = false;
    }

    // Validación de email (OPCIONAL)
    if (formData.email && formData.email.length > 100) {
      newErrors.email = "Máximo 100 caracteres";
      isValid = false;
    } else if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email no válido";
      isValid = false;
    }

    // Validación de teléfono (OPCIONAL)
    if (formData.phone && !/^[0-9]{8}$/.test(formData.phone)) {
      newErrors.phone = "Debe tener exactamente 8 dígitos";
      isValid = false;
    }

    // Validación de identificación (REQUERIDO)
    if (!formData.identification.trim()) {
      newErrors.identification = "La identificación es requerida";
      isValid = false;
    }

    // Validación de provincia (OPCIONAL)
    if (formData.province_id && !formData.canton_id) {
      newErrors.canton_id = "Si selecciona una provincia, debe seleccionar un cantón";
      isValid = false;
    }

    // Validación de cantón (OPCIONAL)
    if (formData.canton_id && !formData.province_id) {
      newErrors.province_id = "Si selecciona un cantón, debe seleccionar una provincia";
      isValid = false;
    }

    // Validación de fecha de nacimiento (OPCIONAL)
    if (formData.birthday) {
      const birthdayDate = new Date(formData.birthday);
      const today = new Date();
      if (birthdayDate > today) {
        newErrors.birthday = "La fecha no puede ser futura";
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  useEffect(() => {
    const loadLocationData = async () => {
      try {
        const provincesResponse = await clientLocation.getProvinces();
        setProvinces(provincesResponse.data || []);

        const cantonsResponse = await clientLocation.getCantons();
        setAllCantons(cantonsResponse.data || []);

        if (initialData?.province_id) {
          const cantonsForProvince = cantonsResponse.data.filter(
            (canton) =>
              canton.province_id.toString() ===
              initialData.province_id.toString()
          );
          setFilteredCantons(cantonsForProvince);
        }
      } catch (err) {
        console.error("Error fetching location data:", err);
        setErrors((prev) => ({
          ...prev,
          form: "Error al cargar datos de ubicación",
        }));
      } finally {
        setLoading((prev) => ({
          ...prev,
          provinces: false,
          cantons: false,
        }));
      }
    };

    loadLocationData();
  }, [initialData]);

  const handleProvinceChange = (e) => {
    const provinceId = e.target.value;
    setFormData((prev) => ({
      ...prev,
      province_id: provinceId,
      canton_id: "",
    }));
    setErrors((prev) => ({ ...prev, province_id: "", canton_id: "" }));

    if (!provinceId) {
      setFilteredCantons([]);
      return;
    }

    const cantonsForProvince = allCantons.filter(
      (canton) => canton.province_id.toString() === provinceId
    );
    setFilteredCantons(cantonsForProvince);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Validación en tiempo real para campos específicos
    if (name === "phone") {
      // Solo permite números y limita a 8 caracteres
      const numericValue = value.replace(/[^0-9]/g, "").slice(0, 8);
      setFormData((prev) => ({ ...prev, [name]: numericValue }));
      setErrors((prev) => ({ ...prev, [name]: "" }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading((prev) => ({ ...prev, form: true }));
    setErrors((prev) => ({ ...prev, form: "" }));

    try {
      // Crear copia de los datos del formulario convirtiendo los IDs a números si existen
      const formDataToSend = {
        ...formData,
        province_id: formData.province_id ? parseInt(formData.province_id, 10) : null,
        canton_id: formData.canton_id ? parseInt(formData.canton_id, 10) : null,
        // Convertir campos vacíos a null para consistencia
        lastname1: formData.lastname1 || null,
        lastname2: formData.lastname2 || null,
        email: formData.email || null,
        phone: formData.phone || null,
        birthday: formData.birthday || null,
      };

      await onSubmit(formDataToSend);
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        form: err.message || "Error al crear cliente",
      }));
    } finally {
      setLoading((prev) => ({ ...prev, form: false }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.clientForm}>
      <div className={styles.formGrid}>
        {/* Nombre (REQUERIDO) */}
        <div className={styles.formGroup}>
          <label htmlFor="name">Nombre: <span className={styles.required}>*</span></label>
          <input
            id="name"
            type="text"
            name="name"
            placeholder="Ej: Juan"
            value={formData.name}
            onChange={handleInputChange}
            disabled={loading.form}
            required
            maxLength={75}
          />
          {errors.name && (
            <span className={styles.errorText}>{errors.name}</span>
          )}
        </div>

        {/* Primer Apellido (OPCIONAL) */}
        <div className={styles.formGroup}>
          <label htmlFor="lastname1">Primer Apellido:</label>
          <input
            id="lastname1"
            type="text"
            name="lastname1"
            placeholder="Ej: Rodríguez"
            value={formData.lastname1}
            onChange={handleInputChange}
            disabled={loading.form}
            maxLength={75}
          />
          {errors.lastname1 && (
            <span className={styles.errorText}>{errors.lastname1}</span>
          )}
        </div>

        {/* Segundo Apellido (OPCIONAL) */}
        <div className={styles.formGroup}>
          <label htmlFor="lastname2">Segundo Apellido:</label>
          <input
            id="lastname2"
            type="text"
            name="lastname2"
            placeholder="Ej: Vargas"
            value={formData.lastname2}
            onChange={handleInputChange}
            disabled={loading.form}
            maxLength={75}
          />
          {errors.lastname2 && (
            <span className={styles.errorText}>{errors.lastname2}</span>
          )}
        </div>

        {/* Identificación (REQUERIDO) */}
        <div className={styles.formGroup}>
          <label htmlFor="identification">Identificación: <span className={styles.required}>*</span></label>
          <input
            id="identification"
            type="text"
            name="identification"
            placeholder="Ej: 184937298"
            value={formData.identification}
            onChange={handleInputChange}
            disabled
            required
          />
          {errors.identification && (
            <span className={styles.errorText}>{errors.identification}</span>
          )}
        </div>

        {/* Teléfono (OPCIONAL) */}
        <div className={styles.formGroup}>
          <label htmlFor="phone">Teléfono:</label>
          <input
            id="phone"
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            disabled={loading.form}
            maxLength={8}
            placeholder="Ej: 89876847"
          />
          {errors.phone && (
            <span className={styles.errorText}>{errors.phone}</span>
          )}
        </div>

        {/* Email (OPCIONAL) */}
        <div className={styles.formGroup}>
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            type="email"
            name="email"
            placeholder="Ej: ejemplo@taller.com"
            value={formData.email}
            onChange={handleInputChange}
            disabled={loading.form}
            maxLength={100}
          />
          {errors.email && (
            <span className={styles.errorText}>{errors.email}</span>
          )}
        </div>

        {/* Provincia (OPCIONAL) */}
        <div className={styles.formGroup}>
          <label htmlFor="province_id">Provincia:</label>
          <select
            id="province_id"
            name="province_id"
            value={formData.province_id}
            onChange={handleProvinceChange}
            disabled={loading.provinces || loading.form}
          >
            <option value="">Seleccione una provincia (opcional)</option>
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
        <div className={styles.formGroup}>
          <label htmlFor="canton_id">Cantón:</label>
          <select
            id="canton_id"
            name="canton_id"
            value={formData.canton_id}
            onChange={handleInputChange}
            disabled={!formData.province_id || loading.cantons || loading.form}
          >
            <option value="">Seleccione un cantón (opcional)</option>
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
        <div className={styles.formGroup}>
          <label htmlFor="birthday">Fecha de Nacimiento:</label>
          <input
            id="birthday"
            type="date"
            name="birthday"
            value={formData.birthday}
            onChange={handleInputChange}
            disabled={loading.form}
            max={new Date().toISOString().split("T")[0]}
          />
          {errors.birthday && (
            <span className={styles.errorText}>{errors.birthday}</span>
          )}
        </div>
      </div>

      <div className={styles.buttonGroup}>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading.form}
          className={styles.secondaryButton}
        >
          Atrás
        </button>
        <button
          type="submit"
          disabled={loading.form}
          className={styles.primaryButton}
        >
          {loading.form ? "Guardando..." : "Siguiente"}
        </button>
      </div>

      {errors.form && <p className={styles.error}>{errors.form}</p>}
    </form>
  );
};

export default ClientForm;