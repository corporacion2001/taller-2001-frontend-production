import React, { useState } from "react";
import ClientDetails from "../clientDetails/ClientDetails";
import styles from "./clientSearch.module.css";
import { clientsAPI } from "../../../services/client.api";
import { FiSearch } from "react-icons/fi";
import { useNotification } from "../../../contexts/NotificationContext";

const ClientSearch = () => {
  const [cedula, setCedula] = useState("");
  const [clientData, setClientData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState("");
  const { showNotification } = useNotification();

  const validateCedula = (value) => {
    if (!value) return "La cédula es requerida";
    if (value.length < 9 || value.length > 12) return "Debe tener entre 9 y 12 dígitos";
    return "";
  };

  const isButtonDisabled = () => {
    return cedula.length < 9 || cedula.length > 12 || loading;
  };

  const handleCedulaChange = (e) => {
    const numbersOnly = e.target.value.replace(/\D/g, "");
    setCedula(numbersOnly);
    if (validationError) setValidationError("");
  };

  const handleSearch = async () => {
    const validationMsg = validateCedula(cedula);
    if (validationMsg) {
      setValidationError(validationMsg);
      return;
    }
    
    setValidationError("");
    setLoading(true);
    setError(null);
    
    try {
      const res = await clientsAPI.client(cedula);
      if (res.success && res.data) {
        setClientData(res.data);
      } else {
        setClientData(null);
        showNotification("Cliente no encontrado", "info");
      }
    } catch {
      showNotification("Error al buscar cliente", "error");
      setClientData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !isButtonDisabled()) {
      handleSearch();
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Gestión de Clientes</h2>
        <div className={styles.actions}>
          <div className={styles.searchContainer}>
            <FiSearch className={styles.searchIcon} />
            <input
              type="text"
              className={`${styles.searchInput} ${
                validationError ? styles.invalidInput : ""
              }`}
              placeholder="Cédula del cliente"
              value={cedula}
              onChange={handleCedulaChange}
              onKeyPress={handleKeyPress}
              maxLength={12}
            />
          </div>
          <button
            className={styles.primaryButton}
            onClick={handleSearch}
            disabled={isButtonDisabled()}
          >
            {loading ? "Buscando..." : "Consultar"}
          </button>
        </div>
        {validationError && (
          <span className={styles.validationMessage}>{validationError}</span>
        )}
      </div>

      <div className={styles.resultContainer}>
        {loading && <p className={styles.loading}>Cargando...</p>}
        {!loading && error && <p className={styles.error}>{error}</p>}
        {!loading && !error && !clientData && (
          <p className={styles.noResults}>
            Ingrese una cédula válida (9-12 dígitos) para buscar un cliente
          </p>
        )}
        {!loading && clientData && <ClientDetails client={clientData} />}
      </div>
    </div>
  );
};

export default ClientSearch;