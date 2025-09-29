import React from "react";
import styles from "./formField.module.css";

const FormField = ({
  label,
  name,
  value,
  error,
  editing = false,
  onChange,
  type = "text",
  required = false,
  disabled = false,
  loading = false,
  placeholder = "",
  maxLength,
  minLength,
  ...props
}) => {
  return (
    <div className={styles.formGroup}>
      <label htmlFor={name}>
        {label}
        {required && <span className={styles.requiredIndicator}> *</span>}
      </label>

      {editing ? (
        <input
          id={name}
          name={name}
          type={type}
          value={value || ""}
          onChange={onChange}
          disabled={disabled || loading}
          required={required}
          placeholder={placeholder}
          minLength={minLength}
          maxLength={maxLength}
          className={`${styles.formInput} ${error ? styles.errorInput : ""}`}
          {...props}
        />
      ) : (
        <p className={styles.fieldValue}>
          {value || <span className={styles.emptyValue}>No especificado</span>}
        </p>
      )}

      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
};

export default FormField;
