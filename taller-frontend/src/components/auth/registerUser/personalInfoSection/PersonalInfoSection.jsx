import React from "react";
import { FiUser } from "react-icons/fi";
import styles from "../registerUser.module.css";
import FormInput from "../../../ui/formInput/FormInput";

const PersonalInfoSection = ({ formData, errors, loading, handleChange }) => {
  return (
    <div className={styles.formSection}>
      <h2 className={styles.sectionTitle}>
        <FiUser /> Información Personal
      </h2>

      <div className={styles.formRow}>
        <FormInput
          id="name"
          label="Nombre"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          disabled={loading}
          required
          minLength={3}
          placeholder="Ej: Juan Carlos"
          maxLength={75} 
        />

        <FormInput
          id="lastname1"
          label="Primer Apellido"
          name="lastname1"
          value={formData.lastname1}
          onChange={handleChange}
          error={errors.lastname1}
          disabled={loading}
          required
          placeholder="Ej: González"
          minLength={3}
          maxLength={75} // VARCHAR(75) en BD
        />
      </div>

      <div className={styles.formRow}>
        <FormInput
          id="lastname2"
          label="Segundo Apellido"
          name="lastname2"
          value={formData.lastname2}
          onChange={handleChange}
          error={errors.lastname2}
          disabled={loading}
          placeholder="Ej: Rodríguez (opcional)"
          maxLength={75} // VARCHAR(75) en BD
        />
      </div>
    </div>
  );
};

export default PersonalInfoSection;
