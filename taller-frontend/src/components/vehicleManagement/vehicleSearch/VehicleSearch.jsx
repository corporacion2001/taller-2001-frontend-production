import React, { useState, useEffect } from "react";
import VehicleDetails from "../vehicleDetails/VehicleDetails";
import styles from "./vehicleSearch.module.css";
import { vehiclesApi } from "../../../services/vehicles.api";
import { tiposPlaca, getCodigosParaTipo } from "../../../utils/tiposPlaca"; // ✅ IMPORT
import { FiSearch } from "react-icons/fi";
import { useNotification } from "../../../contexts/NotificationContext";
import LoadingSpinner from "../../ui/spinner/LoadingSpinner";
import { useSearchParams } from "react-router-dom";

const VehicleSearch = () => {
  const [searchParams] = useSearchParams();
  const vehicleId = searchParams.get("vehicleId");
  const [plate, setPlate] = useState("");
  const [tipoPlaca, setTipoPlaca] = useState(" "); 
  const [codigoSeleccionado, setCodigoSeleccionado] = useState(""); 
  const [codigosDisponibles, setCodigosDisponibles] = useState(null);
  const [vehicleData, setVehicleData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState("");
  const { showNotification } = useNotification();

  useEffect(() => {
    if (vehicleId) {
      loadVehicleFromService(vehicleId);
    }
  }, [vehicleId]);

  const loadVehicleFromService = async (id) => {
    setLoading(true);
    try {
      const res = await vehiclesApi.getVehicleById(id);
      if (res.success && res.data) {
        setVehicleData(res.data);
        
        const fullPlate = res.data.plate;
        const parts = fullPlate.split("-");
        
        if (parts.length === 1) {
          // Particular: "ABC123"
          setTipoPlaca(" ");
          setPlate(fullPlate);
          setCodigoSeleccionado("");
        } else if (parts.length === 2) {
          // Sin código: "AB-123456"
          setTipoPlaca(parts[0]);
          setPlate(parts[1]);
          setCodigoSeleccionado("");
        } else if (parts.length === 3) {
          // Con código: "PE-02-123456"
          setTipoPlaca(parts[0]);
          setCodigoSeleccionado(parts[1]);
          setPlate(parts[2]);
          
          // Cargar códigos disponibles
          const codigos = getCodigosParaTipo(parts[0]);
          setCodigosDisponibles(codigos);
        }
      }
    } catch (error) {
      showNotification("Error al cargar vehículo", "error");
    } finally {
      setLoading(false);
    }
  };

  const formatPlate = (plateNumber, tipoPlacaValue = tipoPlaca, codigoValue = codigoSeleccionado) => {
    if (tipoPlacaValue === " ") {
      return plateNumber;
    }
    
    if (codigoValue) {
      return `${tipoPlacaValue}-${codigoValue}-${plateNumber}`;
    }
    
    return `${tipoPlacaValue}-${plateNumber}`;
  };

  const getPlateForSearch = (plateNumber, tipoPlacaValue, codigoValue = codigoSeleccionado) => {
    if (tipoPlacaValue === " ") {
      return plateNumber;
    }
    
    if (codigoValue) {
      return `${tipoPlacaValue}-${codigoValue}-${plateNumber}`;
    }
    
    return `${tipoPlacaValue}-${plateNumber}`;
  };

  const handleTipoPlacaChange = (nuevoTipo) => {
    setTipoPlaca(nuevoTipo);
    
    const codigos = getCodigosParaTipo(nuevoTipo);
    setCodigosDisponibles(codigos);
    
    if (codigos && codigos.length > 0) {
      setCodigoSeleccionado(codigos[0].value);
    } else {
      setCodigoSeleccionado("");
    }
  };

  const validatePlate = (value) => {
    if (!value) return "La placa es requerida";
    if (value.length < 1 || value.length > 6)
      return "Debe tener entre 1 y 6 caracteres";
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
    if (vehicleId) {
      const newUrl = window.location.pathname;
      window.history.replaceState({}, "", newUrl);
    }
    const validationMsg = validatePlate(plate);
    if (validationMsg) {
      setValidationError(validationMsg);
      return;
    }

    setValidationError("");
    setLoading(true);
    setError(null);

    try {
      const plateForSearch = getPlateForSearch(plate, tipoPlaca, codigoSeleccionado); 

      const res = await vehiclesApi.getVehicleByPlate(plateForSearch);
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
            {/* Select de tipo de placa */}
            <select
              value={tipoPlaca}
              onChange={(e) => handleTipoPlacaChange(e.target.value)} 
              className={styles.searchInput}
            >
              {tiposPlaca.map((tipo) => (
                <option key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </option>
              ))}
            </select>

            {codigosDisponibles && (
              <select
                value={codigoSeleccionado}
                onChange={(e) => setCodigoSeleccionado(e.target.value)}
                className={styles.searchInput}
              >
                {codigosDisponibles.map((codigo) => (
                  <option key={codigo.value} value={codigo.value}>
                    {codigo.label}
                  </option>
                ))}
              </select>
            )}

            <FiSearch className={styles.searchIcon} />
            <input
              type="text"
              className={`${styles.searchInput} ${
                validationError ? styles.invalidInput : ""
              }`}
              placeholder="Número de placa"
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
        {loading && <LoadingSpinner />}
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