import React, { useState, useEffect } from "react";
import styles from "./step1Client.module.css";
import { clientsAPI } from "../../../../services/client.api";
import ClientForm from "./ClientForm";
import ConfirmationModal from "../../../ui/confirmationModal/ConfirmationModal";

const Step1Client = ({ onNext, initialData, showSearch, onBack }) => {
  const [identification, setIdentification] = useState(
    initialData?.identification || ""
  );
  const [clientData, setClientData] = useState(initialData || null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationError, setValidationError] = useState("");
  const [showResetModal, setShowResetModal] = useState(false);

  // Validación de cédula
  const validateIdentification = (id) => {
    if (!id) return "La cédula es requerida";
    if (!/^\d+$/.test(id)) return "La cédula debe contener solo números";
    if (id.length < 9 || id.length > 12)
      return "La cédula debe tener entre 9 y 12 dígitos";
    return "";
  };

  useEffect(() => {
    console.log("initialData cambió:", initialData);

    if (initialData) {
      setClientData(initialData);
      if (initialData.isExisting === false) {
        setShowForm(true);
      }
    } else {
      // Resetear estado cuando initialData es null
      setClientData(null);
      setShowForm(false);
      setIdentification("");
    }
  }, [initialData]);

  const handleSearch = async (e) => {
    e.preventDefault();

    const validationMsg = validateIdentification(identification);
    if (validationMsg) {
      setValidationError(validationMsg);
      return;
    }
    setValidationError("");

    setLoading(true);
    setError(null);

    try {
      const { data } = await clientsAPI.client(identification);
      if (data?.id) {
        setClientData({ ...data, isExisting: true });
      } else {
        setShowForm(true);
      }
    } catch (err) {
      setError("Error al buscar cliente");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitForm = (formData) => {
    const validationMsg = validateIdentification(formData.identification);
    if (validationMsg) {
      setValidationError(validationMsg);
      return;
    }
    setValidationError("");

    const newClientData = { ...formData, isExisting: false };
    setClientData(newClientData);
    onNext(newClientData, "client");
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
      <h2 className={styles.title}>Datos del Cliente</h2>

      {showSearch && !clientData && !showForm ? (
        <>
          <div className={styles.searchContainer}>
            <form onSubmit={handleSearch}>
              <div className={styles.formGroup}>
                <label>Cédula:</label>
                <input
                  type="text"
                  value={identification}
                  onChange={(e) => {
                    // Solo permite números
                    const value = e.target.value.replace(/[^0-9]/g, "");
                    setIdentification(value);
                    setValidationError(""); // Limpiar error al escribir
                  }}
                  required
                  minLength={8}
                  maxLength={12}
                  placeholder="Ej: 123456789"
                />
                {validationError && (
                  <p className={styles.error}>{validationError}</p>
                )}
              </div>
              {error && <p className={styles.error}>{error}</p>}
            </form>
          </div>
          <div className={styles.buttonGroup}>
            <button
              onClick={handleSearch}
              disabled={loading || !identification.trim()}
              className={styles.primaryButton}
            >
              {loading ? "Buscando..." : "Siguiente"}
            </button>
          </div>
        </>
      ) : clientData?.isExisting && !showForm ? (
        <>
          <div className={styles.clientCard}>
            <h3>Cliente registrado</h3>
            <div className={styles.clientDetails}>
              <p>
                <strong>Nombre:</strong> {clientData.name}{" "}
                {clientData.lastname1}
              </p>
              <p>
                <strong>Cédula:</strong> {clientData.identification}
              </p>
              <p>
                <strong>Teléfono:</strong> {clientData.phone}
              </p>
            </div>
          </div>
          <div className={styles.buttonGroup}>
            <button
              onClick={handleResetSearch}
              className={styles.secondaryButton}
            >
              Cambiar Cliente
            </button>
            <button
              onClick={() => onNext(clientData, "client")}
              className={styles.primaryButton}
            >
              Siguiente
            </button>
          </div>
        </>
      ) : (
        <ClientForm
          onSubmit={handleSubmitForm}
          onCancel={handleResetSearch}
          initialData={
            clientData?.isExisting === false ? clientData : { identification }
          }
          key={identification}
          validationError={validationError}
          setValidationError={setValidationError}
          validateIdentification={validateIdentification}
        />
      )}
    </div>
  );
};

export default Step1Client;