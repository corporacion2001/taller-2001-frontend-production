import React, { useEffect } from "react";
import { FiKey } from "react-icons/fi";
import styles from "../registerUser.module.css";
import FormInput from "../../../ui/formInput/FormInput";

const SecuritySection = ({ formData, errors, loading, handleChange }) => {
  const [idValue, setIdValue] = React.useState("");

  // Sincronizar con el formData cuando cambie
  useEffect(() => {
    setIdValue(formData.identification || "");
  }, [formData.identification]);

  const handleIdChange = (e) => {
    const numbersOnly = e.target.value.replace(/\D/g, "");
    setIdValue(numbersOnly);

    // Envía solo los números al formulario padre
    handleChange({
      target: {
        name: e.target.name,
        value: numbersOnly,
      },
    });
  };

  return (
    <div className={styles.formSection}>
      <h2 className={styles.sectionTitle}>
        <FiKey /> Seguridad
      </h2>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <FormInput
            id="password_hash"
            label="Contraseña"
            name="password_hash"
            type="password"
            value={formData.password_hash || ""}
            onChange={handleChange}
            error={errors.password_hash}
            disabled={loading}
            required
            placeholder="Mínimo 8 caracteres"
            minLength={8}
            maxLength={15}
          />
          <div className={styles.passwordHint}>
            La contraseña debe contener: 8-15 caracteres, mayúsculas,
            minúsculas, números y al menos un carácter especial.
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="identification">
            Identificación <span className={styles.requiredAsterisk}>*</span>
          </label>
          <input
            id="identification"
            type="text"
            name="identification"
            value={idValue}
            onChange={handleIdChange}
            disabled={loading}
            className={`${styles.input} ${
              errors.identification ? styles.errorInput : ""
            }`}
            placeholder="Ej: 123456789"
            minLength={9}
            maxLength={12}
            aria-invalid={!!errors.identification}
          />
          {errors.identification && (
            <span className={styles.errorMessage} role="alert">
              {errors.identification}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default SecuritySection;
