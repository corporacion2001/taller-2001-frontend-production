import React, { useState, useEffect } from "react";
import styles from "./step2Vehicle.module.css";
import { vehiclesApi } from "../../../../services/vehicles.api";
import VehicleForm from "./VehicleForm";
import ConfirmationModal from "../../../ui/confirmationModal/ConfirmationModal";
const Step2Vehicle = ({
  onNext,
  onBack,
  initialData,
  showSearch,
  clientId,
}) => {
  const [plate, setPlate] = useState("");
  const [tipoPlaca, setTipoPlaca] = useState(" ");
  const [vehicleData, setVehicleData] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationError, setValidationError] = useState("");
  const [currentMileage, setCurrentMileage] = useState("");
  const [showResetModal, setShowResetModal] = useState(false);

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

  const tiposPlaca = [
    { value: " ", label: " - PARTICULAR" },
    {
      value: "TAP",
      label: "TAP-AEROPUERTO INTERNACIONAL  JUAN SANTAMARIA",
    },
    {
      value: "352",
      label: "352-AGENCIA DE PROTECCION DE DATOS DE LOS HABITANTES",
    },
    { value: "AB", label: "AB-ALAJUELA BUS" },
    { value: "AP", label: "AP-ALAJUELA PUBLICO" },
    { value: "AL", label: "AL-ASAMBLEA LEGISLATIVA" },
    { value: "PEB", label: "PEB-ASAMBLEA LEGISLATIVA" },
    { value: "339", label: "339-ASAMBLEA LEGISLATIVA." },
    {
      value: "316",
      label:
        "316-ASOCIACION DE CONSERVACION Y DESARROLLO FORESTAL DE TALAMANCA",
    },
    {
      value: "297",
      label: "297-AUTORIDAD REGULADORA DE LOS SERVICIOS PUBLICOS",
    },
    { value: "051", label: "051-BANCO ANGLO COSTARRRICENSE" },
    { value: "052", label: "052-BANCO CENTRAL DE COSTA RICA" },
    { value: "053", label: "053-BANCO CREDITO AGRICOLA DE CARTAGO" },
    { value: "054", label: "054-BANCO DE COSTA RICA" },
    { value: "305", label: "305-BANCO HIPOTECARIO DE LA VIVIENDA" },
    { value: "055", label: "055-BANCO NACIONAL DE COSTA RICA" },
    { value: "056", label: "056-BANCO POPULAR Y DE DESARROLLO COMUNAL" },
    { value: "BTA", label: "BTA-BICICLETA" },
    { value: "BM", label: "BM-BICIMOTO" },
    { value: "200", label: "200-CAJA COSTARRICENSE DEL SEGURO SOCIAL" },
    { value: "CL", label: "CL-CARGA LIVIANA" },
    { value: "C", label: "C-CARGA PESADA" },
    { value: "CB", label: "CB-CARTAGO BUS" },
    { value: "CP", label: "CP-CARTAGO PUBLICO" },
    {
      value: "325",
      label: "325-CENTRO COSTARRICENSE DE PRODUCCION CINEMATOGRAFICA",
    },
    {
      value: "327",
      label: "327-CENTRO CULTURAL E HISTORICO JOSE FIGUERES FERRER",
    },
    { value: "326", label: "326-CENTRO NACIONAL DE LA MUSICA" },
    { value: "111", label: "111-CLUBES 4 - S" },
    { value: "311", label: "311-COLEGIO UNIVERSITARIO DE ALAJUELA" },
    { value: "01", label: "01-COLEGIO UNIVERSITARIO DE CARTAGO" },
    { value: "COL", label: "COL-COLEGIO UNIVERSITARIO DE CARTAGO" },
    { value: "314", label: "314-COLEGIO UNIVERSITARIO DE CARTAGO" },
    { value: "319", label: "319-COLEGIO UNIVERSITARIO DE LIMON" },
    { value: "312", label: "312-COLEGIO UNIVERSITARIO DE PUNTARENAS" },
    {
      value: "298",
      label:
        "298-COLEGIO UNIVERSITARIO PARA EL RIESGO Y EL DESARROLLO DEL TROPICO",
    },
    { value: "238", label: "238-COM.NAC.INVESTIGACION CIEN. Y TEC." },
    { value: "303", label: "303-COMISION DE ENERGIA ATOMICA DE C.R." },
    { value: "233", label: "233-COMISION NACIONAL DE ASUNTOS INDIGENAS" },
    {
      value: "057",
      label: "057-COMISION NACIONAL DE PRESTAMOS PARA LA EDUCACION",
    },
    {
      value: "322",
      label:
        "322-COMISION NACIONAL DE PREVENCION DE RIESGOS Y ATENCION EMERGENCIAS",
    },
    {
      value: "351",
      label:
        "351-COMISION PARA EL ORDENAMIENTO Y MANEJO DE LA CUENCA DEL RIO REVENTAZON",
    },
    {
      value: "353",
      label:
        "353-COMISIÓN NACIONAL PARA LA GESTION DE LA BIODIVERSIDAD (CONAGEBIO)",
    },
    { value: "107", label: "107-COMPAÑIA NACIONAL DE FUERZA Y LUZ" },
    { value: "CNF", label: "CNF-COMPAÑIA NACIONAL DE FUERZA Y LUZ" },
    { value: "012", label: "012-CONCESIONARIO DE OBRA PUBLICA" },
    { value: "344", label: "344-CONSEJO DE SALUD OCUPACIONAL" },
    { value: "260", label: "260-CONSEJO DE SEGURIDAD VIAL" },
    { value: "318", label: "318-CONSEJO DE TRANSPORTE PUBLICO" },
    { value: "323", label: "323-CONSEJO NACIONAL DE CONCESIONES" },
    {
      value: "328",
      label: "328-CONSEJO NACIONAL DE LA POLITICA PUBLICA DE LA PERSONA JOVEN",
    },
    {
      value: "240",
      label: "240-CONSEJO NACIONAL DE PERSONAS CON DISCAPACIDAD (CONAPDIS)",
    },
    { value: "100", label: "100-CONSEJO NACIONAL DE PRODUCCION" },
    { value: "239", label: "239-CONSEJO NACIONAL DE RECTORES" },
    { value: "CGR", label: "CGR-CONTRALORIA GENERAL DE LA REPUBLICA" },
    { value: "309", label: "309-CONTRATOS ACUEDUCTOS Y ALCANTARILLADO" },
    { value: "306", label: "306-CONTRATOS COMISION NAC. EMERGENCIA" },
    { value: "CRC", label: "CRC-CRUZ ROJA" },
    { value: "CC", label: "CC-CUERPO CONSULAR" },
    { value: "341", label: "341-CUERPO DE BOMBEROS DE COSTA RICA" },
    { value: "CD", label: "CD-CUERPO DIPLOMATICO" },
    {
      value: "D H",
      label: "D H-DEFENSORIA DE LOS HABITANTES DE LA REPUBLICA",
    },
    { value: "349", label: "349-DIRECCION NACIONAL DE NOTARIADO" },
    { value: "252", label: "252-EDITORIAL COSTA RICA" },
    { value: "EMB", label: "EMB-EMBAJADA DE LA REPUBLICA CHECA" },
    { value: "12", label: "12-EMPRESA CONSTRUCTORA" },
    {
      value: "101",
      label: "101-EMPRESA DE SERVICIOS PUBLICOS DE HEREDIA",
    },
    { value: "EE", label: "EE-EQUIPO ESPECIAL" },
    { value: "302", label: "302-ESCUELA CENTROAMERICANA DE GANADERIA" },
    { value: "USA", label: "USA-ESTADOS UNIDOS DE AMERICA" },
    { value: "EXP", label: "EXP-EXPORTACION" },
    {
      value: "355",
      label: "355-FONDO DE NACIONAL DE FINANCIAMIENTO FORESTAL (FONAFIFO)",
    },
    { value: "350", label: "350-FONDO NACIONAL DE BECAS" },
    {
      value: "329",
      label:
        "329-FUNDACION AYUDANOS PARA AYUDAR (CENTRO COSTARRICENSE DE LA CIENCIA Y LA CULTURA)",
    },
    { value: "MI4", label: "MI4-FUNDACION CONSEJO DE LA TIERRA" },
    { value: "FUN", label: "FUN-FUNDACION FRIEDRICH EBERT" },
    { value: "GB", label: "GB-GUANACASTE BUS" },
    { value: "GP", label: "GP-GUANACASTE PUBLICO" },
    { value: "HB", label: "HB-HEREDIA BUS" },
    { value: "HP", label: "HP-HEREDIA PUBLICO" },
    { value: "264", label: "264-I.N.S.A." },
    { value: "259", label: "259-ILLANUT" },
    { value: "250", label: "250-IMPRENTA NACIONAL" },
    { value: "317", label: "317-INAMU" },
    { value: "110", label: "110-INS. COSTARRICENSE DE FERROCARRILES" },
    { value: "257", label: "257-INS. COSTARRICENSE DE TURISMO" },
    { value: "261", label: "261-INS. MIXTO DE AYUDA SOCIAL" },
    { value: "262", label: "262-INS. NACIONAL DE APRENDIZAJE" },
    { value: "265", label: "265-INS. TECNOLOGICO DE COSTA RICA" },
    { value: "258", label: "258-INST.GEOGRAFICO NACIONAL" },
    {
      value: "INC",
      label: "INC-INSTITUTO COSTARRICENES DE PESCA Y ACUACULTURA",
    },
    {
      value: "003",
      label: "003-INSTITUTO COSTARRICENSE CONTRA EL CANCER",
    },
    {
      value: "102",
      label: "102-INSTITUTO COSTARRICENSE DE ACUEDUCTOS Y ALCATARILLADOS",
    },
    { value: "103", label: "103-INSTITUTO COSTARRICENSE DE ELECTRICIDAD" },
    {
      value: "256",
      label:
        "256-INSTITUTO COSTARRICENSE DE INVESTIGACION Y ENSEÐANZA EN NUTRICION Y SALUD",
    },
    {
      value: "313",
      label: "313-INSTITUTO COSTARRICENSE DE PESCA Y ACUACULTURA",
    },
    { value: "263", label: "263-INSTITUTO DE DESARROLLO AGRARIO" },
    {
      value: "059",
      label: "059-INSTITUTO DE FOMENTO Y ASESORIA MUNICIPAL",
    },
    { value: "104", label: "104-INSTITUTO DE PUERTOS DEL PACIFICO" },
    { value: "IAG", label: "IAG-INSTITUTO GEODESICO AMERICANO" },
    {
      value: "113",
      label: "113-INSTITUTO NACIONAL DE ESTADISTICA Y CENSOS",
    },
    { value: "060", label: "060-INSTITUTO NACIONAL DE FOMENTO" },
    {
      value: "346",
      label:
        "346-INSTITUTO NACIONAL DE INNOVACION Y TRANSFERENCIA EN TECNOLOGIA AGROPECUARIA",
    },
    { value: "061", label: "061-INSTITUTO NACIONAL DE SEGUROS" },
    {
      value: "105",
      label: "105-INSTITUTO NACIONAL DE VIVIENDA Y URBANISMO",
    },
    { value: "109", label: "109-JUN.ADM.PUER.DES.ECON. VERT.ATLANTICA" },
    {
      value: "268",
      label: "268-JUNTA ADM. DIR. NAC. DE COMUNICACIONES   S",
    },
    { value: "331", label: "331-JUNTA ADMINISTRATIVA ARCHIVO NACIONAL" },
    {
      value: "108",
      label: "108-JUNTA ADMINISTRATIVA DE SERVICIOS ELECTRICOS DE CARTAGO",
    },
    {
      value: "332",
      label: "332-JUNTA ADMINISTRATIVA DEL MUSEO HISTORICO JUAN SANTAMARIA",
    },
    { value: "310", label: "310-JUNTA ADMINISTRATIVA REGISTRO NACIONAL" },
    {
      value: "333",
      label: "333-JUNTA ADMINISTRATIVA TEATRO MELICO SALAZAR",
    },
    { value: "315", label: "315-JUNTA ADMINISTRATIVA TEATRO NACIONAL" },
    { value: "330", label: "330-JUNTA ADMINISTRATIVA TEATRO NACIONAL" },
    {
      value: "273",
      label: "273-JUNTA DE PEN. Y JUB. MAGISTERIO NACIONAL",
    },
    { value: "276", label: "276-JUNTA PROTEC.SOCIAL SAN JOSE" },
    { value: "277", label: "277-JUNTA PROTEC.SOCIAL SAN RAMON" },
    { value: "LFP", label: "LFP-LIMITACIONES FISICAS PERMANENTES" },
    { value: "LB", label: "LB-LIMON BUS" },
    { value: "LP", label: "LP-LIMON PUBLICO" },
    { value: "MD", label: "MD-MISION DIPLOMATICA" },
    { value: "MI", label: "MI-MISION INTERNACIONAL" },
    { value: "MOT", label: "MOT-MOTOCICLETAS" },
    { value: "MF", label: "MF-MUNDIAL DE FUTBOL FEMENINO 2014" },
    { value: "335", label: "335-MUSEO DE ARTE COSTARRICENSE" },
    { value: "336", label: "336-MUSEO DE ARTE Y DISEÐO CONTEMPORANEO" },
    { value: "253", label: "253-MUSEO NACIONAL" },
    { value: "337", label: "337-MUSEO RAFAEL ANGEL CALDERON GUARDIA" },
    { value: "002", label: "002-MUTUALES DE AHORRO Y PRESTAMO" },
    { value: "OP", label: "OP-OBRA PUBLICA" },
    { value: "285", label: "285-OFICINA DEL ARROZ" },
    { value: "284", label: "284-OFICINA DEL CAFE" },
    { value: "286", label: "286-OFICINA NACIONAL DE SEMILLAS" },
    { value: "290", label: "290-PATRONATO NACIONAL DE LA INFANCIA" },
    { value: "292", label: "292-PATRONATO NACIONAL DE REHABILITACION" },
    { value: "PEN", label: "PEN-PENSIONADO" },
    { value: "TAX", label: "TAX-PERMISOS DE TAXI" },
    { value: "PE", label: "PE-PODER EJECUTIVO" },
    { value: "PJ", label: "PJ-PODER JUDICIAL" },
    {
      value: "112",
      label: "112-PROGRAMA INTEGRAL DE MERCADEO AGROPECUARIO (PIMA)",
    },
    { value: "PB", label: "PB-PUNTARENAS BUS" },
    { value: "PP", label: "PP-PUNTARENAS PUBLICO" },
    { value: "106", label: "106-RADIOGRAFICA COSTARRICENSE S.A." },
    {
      value: "308",
      label: "308-REFINADORA COSTARRICENSE DE PETROLEO (RECOPE)",
    },
    { value: "RL", label: "RL-REMOLQUE LIVIANO" },
    { value: "R", label: "R-REMOLQUES" },
    { value: "296", label: "296-S.E.N.A.R.A." },
    { value: "SJB", label: "SJB-SAN JOSE BUS" },
    { value: "SJP", label: "SJP-SAN JOSE PUBLICO" },
    { value: "S", label: "S-SEMIREMOLQUE" },
    { value: "SE", label: "SE-SERVICIO ESTABLE" },
    { value: "342", label: "342-SERVICIO FITOSANITARIO DEL ESTADO" },
    { value: "SM", label: "SM-SERVICIO MUNICIPAL" },
    { value: "340", label: "340-SERVICIO NACIONAL DE SALUD ANIMAL" },
    { value: "SR", label: "SR-SERVICIO REMOLQUE" },
    { value: "348", label: "348-SISTEMA DE BANCA PARA EL DESARROLLO" },
    { value: "324", label: "324-SISTEMA DE EMERGENCIAS 911" },
    {
      value: "347",
      label: "347-SISTEMA NACIONAL DE AREAS DE CONSERVACION",
    },
    {
      value: "338",
      label: "338-SISTEMA NACIONAL DE RADIO Y TELEVISION S.A. (SINART S.A.)",
    },
    {
      value: "345",
      label: "345-SUPERINTENDENCIA DE TELECOMUNICACIONES (SUTEL)",
    },
    { value: "TA", label: "TA-TAXI DE ALAJUELA" },
    { value: "TC", label: "TC-TAXI DE CARTAGO" },
    { value: "TG", label: "TG-TAXI DE GUANACASTE" },
    { value: "TH", label: "TH-TAXI DE HEREDIA" },
    { value: "TL", label: "TL-TAXI DE LIMON" },
    { value: "TP", label: "TP-TAXI DE PUNTARENAS" },
    { value: "TSJ", label: "TSJ-TAXI DE SAN JOSE" },
    { value: "TE", label: "TE-TAXI ESTABLE" },
    { value: "321", label: "321-TRIBUNAL ADMINISTRATIVO DE TRANSPORTES" },
    { value: "320", label: "320-TRIBUNAL REGISTRAL ADMINISTRATIVO" },
    { value: "TSE", label: "TSE-TRIBUNAL SUPREMO DE ELECCIONES" },
    { value: "TUR", label: "TUR-TURISMO" },
    { value: "301", label: "301-UNIVERSIDA NACIONAL" },
    {
      value: "307",
      label: "307-UNIVERSIDAD ADVENTISTA DE CENTRO AMERICA",
    },
    { value: "299", label: "299-UNIVERSIDAD DE COSTA RICA" },
    { value: "300", label: "300-UNIVERSIDAD ESTATAL A DISTANCIA" },
    { value: "343", label: "343-UNIVERSIDAD TECNICA NACIONAL" },
    { value: "VE", label: "VE-VEHICULO ESPECIAL" },
    { value: "VH", label: "VH-VEHICULO HISTORICO" },
    { value: "D", label: "D-VEHICULOS DISCAPACITADOS" },
    { value: "ZFE", label: "ZFE-ZONAS FRANCAS DE EXPORTACION" },
  ];

  // Función para formatear la placa completa - MODIFICADA
  const formatPlate = (plateNumber, tipoPlacaValue = tipoPlaca) => {
    // Si el tipo de placa es " " (PARTICULAR), devolver solo el número
    if (tipoPlacaValue === " ") {
      return plateNumber;
    }

    // Para otros tipos: valor + guion + número
    return tipoPlacaValue + "-" + plateNumber;
  };

  // Función para determinar qué placa enviar al endpoint - MODIFICADA
  const getPlateForSearch = (plateNumber, tipoPlacaValue) => {
    // Si es PARTICULAR (valor " "), enviar solo el número
    if (tipoPlacaValue === " ") {
      return plateNumber;
    }

    // Para otros tipos: enviar valor + guion + número
    return tipoPlacaValue + "-" + plateNumber;
  };

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
      setTipoPlaca(" ");
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
      setTipoPlaca(initialData.tipoPlaca || " - PARTICULAR");
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
      const plateForSearch = getPlateForSearch(plate, tipoPlaca);

      const formattedPlate = formatPlate(plate, tipoPlaca);

      const response = await vehiclesApi.getVehicleByPlate(plateForSearch);

      if (response?.success) {
        const vehicleInfo = response.data.data || response.data;

        setVehicleData({
          ...vehicleInfo,
          isExisting: true,
          plate: vehicleInfo.plate || plate,
          tipoPlaca: tipoPlaca,
        });

        setShowForm(false);
        setFormData({
          ...vehicleInfo,
          plate: vehicleInfo.plate,
        });

        setCurrentMileage(vehicleInfo.mileage || "");
      } else {
        setVehicleData(null);
        setFormData((prev) => ({
          ...prev,
          plate: plate,
          tipoPlaca: tipoPlaca,
        }));
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
          tipoPlaca: tipoPlaca,
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

  const handleSubmitNewVehicle = (formDataWithFormattedPlate) => {
    const plateForSave = getPlateForSearch(
      formDataWithFormattedPlate.plate,
      tipoPlaca
    );

    onNext(
      {
        ...formDataWithFormattedPlate,
        plate: plateForSave,
        isExisting: false,
        tipoPlaca: tipoPlaca,
      },
      "vehicle"
    );
  };

  const handleResetSearch = () => {
    setShowResetModal(true);
  };

  const handleConfirmReset = () => {
    setShowResetModal(false);
    onBack();
  };

  return (
    <div className={styles.container}>
      <ConfirmationModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onConfirm={handleConfirmReset}
        title="¿Cambiar cliente?"
        message="Esto eliminará también los datos del vehículo y servicio asociados"
        confirmText="Sí, cambiar"
        cancelText="Cancelar"
      />
      <h2 className={styles.title}>Datos del Vehículo</h2>

      {showSearch && !vehicleData && !showForm ? (
        <>
          <div className={styles.searchContainer}>
            <div className={styles.formGroup}>
              <label>Tipo de Placa</label>
              <select
                value={tipoPlaca}
                onChange={(e) => setTipoPlaca(e.target.value)}
                className={styles.select}
              >
                {tiposPlaca.map((tipo) => (
                  <option key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </option>
                ))}
              </select>
            </div>
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
            <button
              onClick={handleResetSearch}
              className={styles.secondaryButton}
            >
              Cambiar Vehículo
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
          onCancel={handleResetSearch}
          onInputChange={handleInputChange}
          onSubmit={handleSubmitNewVehicle}
          loading={loading}
          error={error}
          tipoPlaca={tipoPlaca}
          onTipoPlacaChange={setTipoPlaca}
        />
      )}
    </div>
  );
};

export default Step2Vehicle;
