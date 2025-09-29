import React, { useState, useEffect } from "react";
import { FiMail } from "react-icons/fi";
import styles from "../registerUser.module.css";
import FormInput from "../../../ui/formInput/FormInput";

const ContactInfoSection = ({ formData, errors, loading, handleChange }) => {
  const [phoneValue, setPhoneValue] = useState("");

  // Sincronizar con el formData cuando cambie
  useEffect(() => {
    setPhoneValue(formData.phone || "");
  }, [formData.phone]);

  const formatPhone = (input) => {
    const numbers = input.replace(/\D/g, "");
    if (numbers.length <= 4) return numbers;
    return `${numbers.slice(0, 4)}-${numbers.slice(4, 8)}`;
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhone(e.target.value);
    setPhoneValue(formatted);

    handleChange({
      target: {
        name: e.target.name,
        value: formatted.replace(/\D/g, ""),
      },
    });
  };

  return (
    <div className={styles.formSection}>
      <h2 className={styles.sectionTitle}>
        <FiMail /> Información de Contacto
      </h2>

      <div className={styles.formRow}>
        <FormInput
          id="email"
          label="Correo Electrónico"
          name="email"
          type="email"
          value={formData.email || ""}
          onChange={handleChange}
          error={errors.email}
          disabled={loading}
          required
          placeholder="Ej: usuario@empresa.com"
          maxLength={100}
        />

        <div className={styles.formGroup}>
          <label htmlFor="phone">
            Teléfono <span className={styles.requiredAsterisk}>*</span>
          </label>
          <div className={styles.phoneWrapper}>
            <span className={styles.countryCode}></span>
            <input
              id="phone"
              type="tel"
              name="phone"
              value={formatPhone(phoneValue)}
              onChange={handlePhoneChange}
              disabled={loading}
              className={`${styles.input} ${
                errors.phone ? styles.errorInput : ""
              }`}
              placeholder="Ej: 8888-9999"
              maxLength={9}
              aria-invalid={!!errors.phone}
            />
          </div>
          {errors.phone && (
            <span className={styles.errorMessage} role="alert">
              {errors.phone}
            </span>
          )}
        </div>
      </div>

      <FormInput
        id="address"
        label="Dirección"
        name="address"
        value={formData.address || ""}
        onChange={handleChange}
        error={errors.address}
        disabled={loading}
        required
        placeholder="Ej: Calle 123, Ciudad, Provincia"
        maxLength={255}
      />
    </div>
  );
};

export default ContactInfoSection;
