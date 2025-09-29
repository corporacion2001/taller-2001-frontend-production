import React from "react";
import styles from "../../auth/registerUser/registerUser.module.css";

const FormInput = ({
  id,
  label,
  name,
  type = "text",
  value,
  onChange,
  error,
  disabled,
  required = false,
  placeholder = "",
  maxLength,
  minLength,
}) => {
  return (
    <div className={styles.formGroup}>
      <label htmlFor={id}>
        {label}
        {required && <span className={styles.requiredAsterisk}> *</span>}
      </label>
      <input
        id={id}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={error ? styles.errorInput : ""}
        aria-invalid={!!error}
        placeholder={placeholder}
        minLength={minLength}
        maxLength={maxLength} // <- Se usa directamente
      />
      {error && (
        <span className={styles.errorMessage} role="alert">
          {error}
        </span>
      )}
    </div>
  );
};

export default FormInput;
