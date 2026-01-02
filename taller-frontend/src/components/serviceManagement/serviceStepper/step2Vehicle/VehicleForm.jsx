import React, { useState } from "react";
import styles from "./step2Vehicle.module.css";
import { vehiclesApi } from "../../../../services/vehicles.api";
import { tiposPlaca, getCodigosParaTipo } from "../../../../utils/tiposPlaca";

const VehicleForm = ({
  formData,
  onInputChange,
  onSubmit,
  onCancel,
  loading,
  tipoPlaca,
  onTipoPlacaChange,
  codigoSeleccionado,     // ✅ NUEVA PROP
  onCodigoChange,         // ✅ NUEVA PROP
}) => {
  const [errors, setErrors] = useState({
    plate: "",
    brand: "",
    model: "",
    year: "",
    chassis: "",
    engine: "",
    mileage: "",
    fuel_type: "",
    scraping: "",
  });

  const [scrapingLoading, setScrapingLoading] = useState(false);

  // ✅ Estado local para códigos disponibles
  const [codigosDisponibles, setCodigosDisponibles] = useState(
    getCodigosParaTipo(tipoPlaca)
  );

  // Función para obtener solo la parte antes del guión del tipo de placa
  const getTipoPlacaPrefix = (tipoPlacaValue) => {
    // Lista de tipos que NO deben tener prefijo
    const noPrefixTypes = ["PARTICULAR", " - PARTICULAR"];

    if (noPrefixTypes.includes(tipoPlacaValue.trim())) {
      return "";
    }

    const parts = tipoPlacaValue.split("-");
    return parts.length > 1
      ? parts[0].trim() + "-"
      : tipoPlacaValue.trim() + "-";
  };

  // Función para formatear la placa completa
  const formatPlate = (plateNumber) => {
    const prefix = getTipoPlacaPrefix(tipoPlaca);
    return prefix + plateNumber;
  };

  // ✅ FUNCIÓN MODIFICADA para manejar cambio de tipo
  const handleTipoPlacaChange = (nuevoTipo) => {
    onTipoPlacaChange(nuevoTipo);
    
    const codigos = getCodigosParaTipo(nuevoTipo);
    setCodigosDisponibles(codigos);
    
    if (codigos && codigos.length > 0) {
      onCodigoChange(codigos[0].value);
    } else {
      onCodigoChange("");
    }
  };

  const validateForm = () => {
    const newErrors = {
      plate: "",
      brand: "",
      model: "",
      year: "",
      chassis: "",
      engine: "",
      mileage: "",
      fuel_type: "",
      scraping: "",
    };

    let isValid = true;

    if (!formData.plate.trim()) {
      newErrors.plate = "La placa es requerida";
      isValid = false;
    } else if (formData.plate.length > 10) {
      newErrors.plate = "Máximo 10 caracteres permitidos";
      isValid = false;
    }

    if (!formData.brand.trim()) {
      newErrors.brand = "La marca es requerida";
      isValid = false;
    } else if (formData.brand.length > 255) {
      newErrors.brand = "Máximo 255 caracteres permitidos";
      isValid = false;
    }

    if (!formData.model.trim()) {
      newErrors.model = "El modelo es requerido";
      isValid = false;
    } else if (formData.model.length > 255) {
      newErrors.model = "Máximo 255 caracteres permitidos";
      isValid = false;
    }

    if (!formData.year) {
      newErrors.year = "El año es requerido";
      isValid = false;
    } else {
      const currentYear = new Date().getFullYear();
      const yearNum = parseInt(formData.year);
      if (isNaN(yearNum) || yearNum < 1900 || yearNum > currentYear + 1) {
        newErrors.year = `Ingrese un año válido (1900-${currentYear + 1})`;
        isValid = false;
      }
    }

    if (!formData.chassis.trim()) {
      newErrors.chassis = "El chasis es requerido";
      isValid = false;
    } else if (formData.chassis.length > 255) {
      newErrors.chassis = "Máximo 255 caracteres permitidos";
      isValid = false;
    }

    if (!formData.engine.trim()) {
      newErrors.engine = "El motor es requerido";
      isValid = false;
    } else if (formData.engine.length > 255) {
      newErrors.engine = "Máximo 255 caracteres permitidos";
      isValid = false;
    }

    if (!formData.mileage && formData.mileage !== 0) {
      newErrors.mileage = "El kilometraje es requerido";
      isValid = false;
    } else {
      const mileageNum = parseInt(formData.mileage);
      if (isNaN(mileageNum)) {
        newErrors.mileage = "Debe ser un número";
        isValid = false;
      } else if (mileageNum < 0 || mileageNum > 2000000) {
        newErrors.mileage = "No puede ser negativo o mayor a 2,000,000";
        isValid = false;
      }
    }
    if (!formData.fuel_type) {
      newErrors.fuel_type = "El tipo de combustible es requerido";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleScraping = async () => {
    if (!formData.plate.trim()) {
      setErrors((prev) => ({ ...prev, scraping: "Ingrese la placa primero" }));
      return;
    }

    setScrapingLoading(true);
    setErrors((prev) => ({ ...prev, scraping: "" }));

    try {
      const plateForScraping = formatPlate(formData.plate);

      const response = await vehiclesApi.scrapeVehicleData(
        formData.plate,
        tipoPlaca,
        codigoSeleccionado || null // ✅ PASAR CÓDIGO
      );

      if (response?.success) {
        const {
          brand,
          model,
          year,
          chassis,
          engine,
          traccion,
          combustible,
          color,
          cilindros,
          nombre,
          carroceria,
          categoria,
          vin,
        } = response.data;

        // Mapear combustible del scraping al formato de fuel_type
        const fuelTypeMap = {
          GASOLINA: "Gasolina",
          DIESEL: "Diesel",
          ELECTRICO: "Electrico",
          HIBRIDO: "Hibrido",
          GAS: "Gas",
        };

        onInputChange({ target: { name: "brand", value: brand || "" } });
        onInputChange({ target: { name: "model", value: model || "" } });
        onInputChange({ target: { name: "year", value: year || "" } });
        onInputChange({ target: { name: "chassis", value: chassis || "" } });
        onInputChange({ target: { name: "engine", value: engine || "" } });
        onInputChange({ target: { name: "traccion", value: traccion || "" } });
        onInputChange({
          target: {
            name: "fuel_type",
            value: fuelTypeMap[combustible?.toUpperCase()] || "Gasolina",
          },
        });
        onInputChange({ target: { name: "color", value: color || "" } });
        onInputChange({
          target: { name: "cilindros", value: cilindros || "" },
        });
        onInputChange({
          target: { name: "nombre_propietario", value: nombre || "" },
        });
        onInputChange({
          target: { name: "carroceria", value: carroceria || "" },
        });
        onInputChange({
          target: { name: "categoria", value: categoria || "" },
        });
        onInputChange({ target: { name: "vin", value: vin || "" } });

        setErrors((prev) => ({
          ...prev,
          scraping: "✓ Datos obtenidos correctamente",
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          scraping:
            response?.message || "No se encontraron datos para esta placa",
        }));
      }
    } catch (error) {
      console.error("Error en scraping:", error);
      setErrors((prev) => ({
        ...prev,
        scraping: error.message || "Error al consultar el registro nacional",
      }));
    } finally {
      setScrapingLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleNumericChange = (e) => {
    const { name, value } = e.target;
    const numericValue = value.replace(/[^0-9]/g, "");
    let limitedValue = numericValue;
    if (limitedValue !== "") {
      const num = parseInt(limitedValue, 10);
      if (num > 2000000) limitedValue = "2000000";
    }
    onInputChange({ target: { name, value: limitedValue } });
  };

  return (
    <form onSubmit={handleSubmit} className={styles.vehicleForm}>
      <div className={styles.scrapingSection}>
        <h4>Consultar datos del Registro Nacional</h4>
        <div className={styles.scrapingForm}>
          <div className={styles.formGroup}>
            <label>Tipo de placa*</label>
            <select
              value={tipoPlaca}
              onChange={(e) => handleTipoPlacaChange(e.target.value)} 
              disabled={scrapingLoading || loading}
              className={styles.scrapingSelect}
            >
              {tiposPlaca.map((tipo) => (
                <option key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </option>
              ))}
            </select>
          </div>

          {codigosDisponibles && (
            <div className={styles.formGroup}>
              <label>Código*</label>
              <select
                value={codigoSeleccionado}
                onChange={(e) => onCodigoChange(e.target.value)} 
                disabled={scrapingLoading || loading}
                className={styles.scrapingSelect}
              >
                {codigosDisponibles.map((codigo) => (
                  <option key={codigo.value} value={codigo.value}>
                    {codigo.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            type="button"
            onClick={handleScraping}
            disabled={scrapingLoading || loading || !formData.plate.trim()}
            className={styles.scrapingButton}
          >
            {scrapingLoading ? "Consultando..." : "Consultar Datos"}
          </button>
        </div>
        {errors.scraping && (
          <p
            className={
              errors.scraping.includes("✓")
                ? styles.successText
                : styles.errorText
            }
          >
            {errors.scraping}
          </p>
        )}
      </div>

      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label>Placa*</label>
          <input
            type="text"
            name="plate"
            value={formData.plate}
            onChange={onInputChange}
            required
            minLength={1}
            maxLength={6}
            disabled
          />
          {errors.plate && (
            <span className={styles.errorText}>{errors.plate}</span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label>Marca*</label>
          <input
            type="text"
            name="brand"
            placeholder="Ej: Toyota"
            value={formData.brand}
            onChange={onInputChange}
            required
            minLength={1}
            maxLength={255}
            disabled={loading}
          />
          {errors.brand && (
            <span className={styles.errorText}>{errors.brand}</span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label>Modelo*</label>
          <input
            type="text"
            name="model"
            placeholder="Ej: Corolla"
            value={formData.model}
            onChange={onInputChange}
            required
            maxLength={255}
            minLength={1}
            disabled={loading}
          />
          {errors.model && (
            <span className={styles.errorText}>{errors.model}</span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label>Año*</label>
          <input
            type="number"
            name="year"
            placeholder="Ej: 2020"
            value={formData.year}
            onChange={(e) => {
              const value = e.target.value;
              if (value.length <= 4) {
                onInputChange(e);
              }
            }}
            required
            min={1900}
            max={new Date().getFullYear() + 1}
            disabled={loading}
          />

          {errors.year && (
            <span className={styles.errorText}>{errors.year}</span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label>Chasis*</label>
          <input
            type="text"
            name="chassis"
            placeholder="Ej: 1HGBH41JXMN109186"
            value={formData.chassis}
            onChange={onInputChange}
            required
            maxLength={255}
            minLength={1}
            disabled={loading}
          />
          {errors.chassis && (
            <span className={styles.errorText}>{errors.chassis}</span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label>Motor*</label>
          <input
            type="text"
            name="engine"
            placeholder="Ej: 1600 C.C"
            value={formData.engine}
            onChange={onInputChange}
            required
            maxLength={255}
            minLength={1}
            disabled={loading}
          />
          {errors.engine && (
            <span className={styles.errorText}>{errors.engine}</span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label>Kilometraje*</label>
          <input
            type="text"
            name="mileage"
            placeholder="Ej: 150000"
            value={formData.mileage}
            onChange={handleNumericChange}
            required
            min={0}
            max={2000000}
            disabled={loading}
          />
          {errors.mileage && (
            <span className={styles.errorText}>{errors.mileage}</span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label>Combustible*</label>
          <select
            name="fuel_type"
            value={formData.fuel_type}
            onChange={onInputChange}
            required
            disabled={loading}
          >
            <option value="">Seleccione...</option>
            <option value="Gasolina">Gasolina</option>
            <option value="Diesel">Diésel</option>
            <option value="Electrico">Eléctrico</option>
            <option value="Hibrido">Híbrido</option>
            <option value="Gas">Gas</option>
            <option value="Otro">Otro</option>
          </select>
          {errors.fuel_type && (
            <span className={styles.errorText}>{errors.fuel_type}</span>
          )}
        </div>
      </div>

      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label>Tracción</label>
          <input
            type="text"
            name="traccion"
            placeholder="Ej: 4x4"
            value={formData.traccion || ""}
            onChange={onInputChange}
            maxLength={50}
            disabled={loading}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Color</label>
          <input
            type="text"
            name="color"
            placeholder="Ej: Blanco"
            value={formData.color || ""}
            onChange={onInputChange}
            maxLength={50}
            disabled={loading}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Cilindros</label>
          <input
            type="text"
            name="cilindros"
            placeholder="Ej: 4"
            value={formData.cilindros || ""}
            onChange={onInputChange}
            maxLength={10}
            disabled={loading}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Nombre Propietario</label>
          <input
            type="text"
            name="nombre_propietario"
            placeholder="Nombre completo"
            value={formData.nombre_propietario || ""}
            onChange={onInputChange}
            maxLength={255}
            disabled={loading}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Carrocería</label>
          <input
            type="text"
            name="carroceria"
            placeholder="Ej: Sedán"
            value={formData.carroceria || ""}
            onChange={onInputChange}
            maxLength={100}
            disabled={loading}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Categoría</label>
          <input
            type="text"
            name="categoria"
            placeholder="Ej: Particular"
            value={formData.categoria || ""}
            onChange={onInputChange}
            maxLength={100}
            disabled={loading}
          />
        </div>

        <div className={styles.formGroup}>
          <label>VIN</label>
          <input
            type="text"
            name="vin"
            placeholder="Número VIN"
            value={formData.vin || ""}
            onChange={onInputChange}
            maxLength={255}
            disabled={loading}
          />
        </div>
      </div>

      <div className={styles.buttonGroup}>
        <button
          type="button"
          onClick={onCancel}
          className={styles.secondaryButton}
          disabled={loading}
        >
          Cambiar Vehículo
        </button>
        <button
          type="submit"
          disabled={loading}
          className={styles.primaryButton}
        >
          {loading ? "Procesando..." : "Siguiente"}
        </button>
      </div>
    </form>
  );
};

export default VehicleForm;