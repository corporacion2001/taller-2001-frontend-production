import React, { useState } from "react";
import VehicleDetails from "../vehicleDetails/VehicleDetails";
import styles from "./vehicleSearch.module.css";
import { vehiclesApi } from "../../../services/vehicles.api";
import { FiSearch } from "react-icons/fi";
import { useNotification } from "../../../contexts/NotificationContext";

const VehicleSearch = () => {
  const [plate, setPlate] = useState("");
  const [vehicleData, setVehicleData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState("");
  const { showNotification } = useNotification();

  const validatePlate = (value) => {
    if (!value) return "La placa es requerida";
    if (value.length < 1 || value.length > 6) return "Debe tener entre 1 y 6 caracteres";
    return "";
  };

  const isButtonDisabled = () => {
    return plate.length < 1 || plate.length > 6 || loading;
  };

  const handlePlateChange = (e) => {
    const value = e.target.value.toUpperCase(); 
    setPlate(value);
    if (validationError) setValidationError("");
  };

  const handleSearch = async () => {
    const validationMsg = validatePlate(plate);
    if (validationMsg) {
      setValidationError(validationMsg);
      return;
    }
    
    setValidationError("");
    setLoading(true);
    setError(null);
    
    try {
      const res = await vehiclesApi.getVehicleByPlate(plate);
      if (res.success && res.data) {
        setVehicleData(res.data);
      } else {
        setVehicleData(null);
        showNotification("Vehículo no encontrado", "info");
      }
    } catch {
      showNotification("Error al buscar vehículo", "error");
      setVehicleData(null);
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
        <h2 className={styles.title}>Gestión de Vehículos</h2>
        <div className={styles.actions}>
          <div className={styles.searchContainer}>
            <FiSearch className={styles.searchIcon} />
            <input
              type="text"
              className={`${styles.searchInput} ${
                validationError ? styles.invalidInput : ""
              }`}
              placeholder="Placa del vehículo"
              value={plate}
              onChange={handlePlateChange}
              onKeyPress={handleKeyPress}
              maxLength={6}
              minLength={1}
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
        {!loading && !error && !vehicleData && (
          <p className={styles.noResults}>
            Ingrese una placa válida (1-6 caracteres) para buscar un vehículo
          </p>
        )}
        {!loading && vehicleData && <VehicleDetails vehicle={vehicleData} />}
      </div>
    </div>
  );
};

export default VehicleSearch;