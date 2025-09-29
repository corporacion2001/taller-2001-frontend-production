import React, { useState, useRef, useEffect } from "react";
import styles from "./chipSelect.module.css";

const ChipSelect = ({
  options = [],
  selected = [],
  onChange,
  disabled = false,
  isAdminSelected = false,
  error = false,
  placeholder = "Selecciona roles..."
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const toggleOption = (optionValue) => {
    if (disabled) return;
    
    const newSelected = selected.includes(optionValue)
      ? selected.filter(item => item !== optionValue)
      : [...selected, optionValue];
    
    onChange(newSelected);
  };

  const handleContainerClick = () => {
    if (!disabled) setIsOpen(!isOpen);
  };

useEffect(() => {
  const handleClickOutside = (event) => {
    if (containerRef.current && !containerRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  const handleScroll = (event) => {
    // Si el scroll viene de dentro del dropdown, no lo cierres
    if (containerRef.current && containerRef.current.contains(event.target)) {
      return;
    }
    setIsOpen(false);
  };

  document.addEventListener("mousedown", handleClickOutside);
  window.addEventListener("scroll", handleScroll, true);

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
    window.removeEventListener("scroll", handleScroll, true);
  };
}, []);


  return (
    <div ref={containerRef} className={`${styles.container} ${error ? styles.error : ''}`}>
      <div 
        className={`${styles.select} ${disabled ? styles.disabled : ''}`}
        onClick={handleContainerClick}
      >
        {selected.length === 0 ? (
          <span className={styles.placeholder}>{placeholder}</span>
        ) : (
          <div className={styles.chips}>
            {selected.map(value => {
              const option = options.find(opt => opt.value === value);
              return option ? (
                <span key={value} className={styles.chip}>
                  {option.label}
                  {!disabled && (!isAdminSelected || option.label === "Administrador") && (
                    <button 
                      type="button"
                      className={styles.removeChip}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleOption(value);
                      }}
                      aria-label={`Quitar ${option.label}`}
                    >
                      ×
                    </button>
                  )}
                </span>
              ) : null;
            })}
          </div>
        )}
      </div>

      {isOpen && !disabled && (
        <div className={styles.dropdown}>
          {options.map(option => (
            <div
              key={option.value}
              className={`${styles.option} ${
                selected.includes(option.value) ? styles.selected : ''
              } ${
                isAdminSelected && option.label !== "Administrador" 
                  ? styles.disabledOption 
                  : ''
              }`}
              onClick={() => {
                if (!isAdminSelected || option.label === "Administrador") {
                  toggleOption(option.value);
                }
              }}
            >
              {option.label}
              {option.label === "Administrador" && (
                <span className={styles.adminNote}> (Acceso completo)</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChipSelect;
