import React, { useState, useEffect } from "react";
import styles from "./step2Vehicle.module.css";
import { vehiclesApi } from "../../../../services/vehicles.api";
import VehicleForm from "./VehicleForm";

const Step2Vehicle = ({
  onNext,
  onBack,
  initialData,
  showSearch,
  clientId,
}) => {
  const [plate, setPlate] = useState("");
  const [vehicleData, setVehicleData] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationError, setValidationError] = useState("");
  const [currentMileage, setCurrentMileage] = useState("");

  const [formData, setFormData] = useState({
    plate: "",
    year: 0,
    model: "",
    chassis: "",
    brand: "",
    engine: "",
    mileage: "",
    fuel_type: "Gasolina",
    traccion: "",
    color: "",
    cilindros: "",
    nombre_propietario: "",
    carroceria: "",
    categoria: "",
    vin: "",
  });

  const validatePlate = (plate) => {
    if (!plate.trim()) return "La placa es requerida";
    if (plate.length > 6) return "La placa debe tener 6 caracteres";
    return "";
  };

  useEffect(() => {
    if (!initialData) {
      setVehicleData(null);
      setShowForm(false);
      setPlate("");
      setFormData({
        plate: "",
        year: "",
        model: "",
        chassis: "",
        brand: "",
        engine: "",
        mileage: "",
        fuel_type: "",
        traccion: "",
        color: "",
        cilindros: "",
        nombre_propietario: "",
        carroceria: "",
        categoria: "",
        vin: "",
      });
      setCurrentMileage("");
    } else {
      setVehicleData(initialData);
      setShowForm(initialData.isExisting === false);
      setPlate(initialData.plate || "");
      setFormData({
        plate: initialData.plate || "",
        year: initialData.year || "",
        model: initialData.model || "",
        chassis: initialData.chassis || "",
        brand: initialData.brand || "",
        engine: initialData.engine || "",
        mileage: initialData.mileage || "",
        fuel_type: initialData.fuel_type || "",
        traccion: initialData.traccion || "",
        color: initialData.color || "",
        cilindros: initialData.cilindros || "",
        nombre_propietario: initialData.nombre_propietario || "",
        carroceria: initialData.carroceria || "",
        categoria: initialData.categoria || "",
        vin: initialData.vin || "",
      });
      setCurrentMileage(
        initialData.currentMileage || initialData.mileage || ""
      );
    }
  }, [initialData]);

  const handleSearch = async (e) => {
    e?.preventDefault();

    const plateError = validatePlate(plate);
    if (plateError) {
      setValidationError(plateError);
      return;
    }
    setValidationError("");

    setLoading(true);
    setError(null);

    try {
      const response = await vehiclesApi.getVehicleByPlate(plate);

      if (response?.success) {
        const vehicleInfo = response.data.data || response.data;

        setVehicleData({
          ...vehicleInfo,
          isExisting: true,
          plate: vehicleInfo.plate || plate,
        });

        setShowForm(false);
        setFormData({
          ...vehicleInfo,
          plate: vehicleInfo.plate || plate,
        });

        setCurrentMileage(vehicleInfo.mileage || "");
      } else {
        setVehicleData(null);
        setFormData((prev) => ({ ...prev, plate }));
        setShowForm(true);
        setCurrentMileage("");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error al buscar vehículo");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitExistingVehicle = async () => {
    if (!vehicleData?.id) {
      setError("No se encontró ID del vehículo");
      return;
    }

    if (!currentMileage || isNaN(currentMileage)) {
      setValidationError("Ingrese un kilometraje válido");
      return;
    }

    setLoading(true);

    try {
      await vehiclesApi.updateVehicle(vehicleData.id, {
        mileage: currentMileage,
      });

      onNext(
        {
          ...vehicleData,
          mileage: currentMileage,
          currentMileage: currentMileage,
          isExisting: true,
        },
        "vehicle"
      );
    } catch (error) {
      setError("Error al actualizar kilometraje: " + (error.message || ""));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const parsedValue =
      name === "year" || name === "mileage" ? parseInt(value, 10) || 0 : value;
    setFormData((prev) => ({ ...prev, [name]: parsedValue }));
  };

  const handleSubmitNewVehicle = (e) => {
    e.preventDefault();
    onNext({ ...formData, isExisting: false }, "vehicle");
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Datos del Vehículo</h2>

      {showSearch && !vehicleData && !showForm ? (
        <>
          <div className={styles.searchContainer}>
            <form onSubmit={handleSearch}>
              <div className={styles.formGroup}>
                <label>Placa*</label>
                <input
                  type="text"
                  value={plate}
                  onChange={(e) => {
                    const value = e.target.value.slice(0, 6);
                    setPlate(value);
                    setValidationError("");
                  }}
                  required
                  placeholder="Ej: ABC123"
                  maxLength={6}
                />
                {validationError && (
                  <span className={styles.errorText}>{validationError}</span>
                )}
              </div>
              {error && <p className={styles.error}>{error}</p>}
            </form>
          </div>
          <div className={styles.buttonGroup}>
            <button onClick={onBack} className={styles.secondaryButton}>
              Atrás
            </button>
            <button
              onClick={handleSearch}
              disabled={loading || !plate.trim()}
              className={styles.primaryButton}
            >
              {loading ? "Buscando..." : "Siguiente"}
            </button>
          </div>
        </>
      ) : vehicleData && vehicleData.isExisting ? (
        <>
          <div className={styles.vehicleCard}>
            <h3>Vehículo registrado</h3>
            <div className={styles.vehicleDetails}>
              <p>
                <strong>Placa:</strong> {vehicleData.plate}
              </p>
              <p>
                <strong>Marca:</strong> {vehicleData.brand}
              </p>
              <p>
                <strong>Modelo:</strong> {vehicleData.model}
              </p>
              <p>
                <strong>Año:</strong> {vehicleData.year}
              </p>
              <p>
                <strong>Chasis:</strong> {vehicleData.chassis}
              </p>
              <p>
                <strong>Motor:</strong> {vehicleData.engine}
              </p>
                       {vehicleData.traccion && (
                <p>
                  <strong>Tracción:</strong> {vehicleData.traccion}
                </p>
              )}
              {vehicleData.color && (
                <p>
                  <strong>Color:</strong> {vehicleData.color}
                </p>
              )}
              {vehicleData.cilindros && (
                <p>
                  <strong>Cilindros:</strong> {vehicleData.cilindros}
                </p>
              )}
              {vehicleData.carroceria && (
                <p>
                  <strong>Carrocería:</strong> {vehicleData.carroceria}
                </p>
              )}
              {vehicleData.categoria && (
                <p>
                  <strong>Categoría:</strong> {vehicleData.categoria}
                </p>
              )}
            </div>
          </div>
          <div className={styles.mileageUpdate}>
            <label>Kilometraje de entrada*</label>
            <input
              type="number"
              value={currentMileage}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, "");
                setCurrentMileage(value);
                setValidationError("");
              }}
              placeholder={`Kilometraje actual: ${vehicleData?.mileage || "0"}`}
              min="0"
            />
            {validationError && (
              <span className={styles.errorText}>{validationError}</span>
            )}
          </div>

          <div className={styles.buttonGroup}>
            <button onClick={onBack} className={styles.secondaryButton}>
              Atrás
            </button>
            <button
              onClick={handleSubmitExistingVehicle}
              disabled={loading || !currentMileage}
              className={styles.primaryButton}
            >
              {loading ? "Actualizando..." : "Siguiente"}
            </button>
          </div>
        </>
      ) : (
        <VehicleForm
          formData={formData}
          onInputChange={handleInputChange}
          onSubmit={handleSubmitNewVehicle}
          onCancel={onBack}
          loading={loading}
          error={error}
        />
      )}
    </div>
  );
};

export default Step2Vehicle;
