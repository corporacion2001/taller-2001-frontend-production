import React, { useState, useEffect } from "react";
import styles from "./step1Client.module.css";
import { clientsAPI } from "../../../../services/client.api";
import ClientForm from "./ClientForm";

const Step1Client = ({ onNext, initialData, showSearch, onBack }) => {
  const [searchMode, setSearchMode] = useState("name"); // 'name' o 'identification'
  const [searchQuery, setSearchQuery] = useState("");
  const [identification, setIdentification] = useState(initialData?.identification || "");
  const [searchResults, setSearchResults] = useState([]);
  const [clientData, setClientData] = useState(initialData || null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationError, setValidationError] = useState("");
  const [searchTimeout, setSearchTimeout] = useState(null);

  // Validación de cédula
  const validateIdentification = (id) => {
    if (!id) return "La cédula es requerida";
    if (!/^\d+$/.test(id)) return "La cédula debe contener solo números";
    if (id.length < 9 || id.length > 12)
      return "La cédula debe tener entre 9 y 12 dígitos";
    return "";
  };

  useEffect(() => {
    if (initialData) {
      setClientData(initialData);
      if (initialData.isExisting === false) {
        setShowForm(true);
      }
    } else {
      setClientData(null);
      setShowForm(false);
      setIdentification("");
      setSearchQuery("");
      setSearchResults([]);
    }
  }, [initialData]);

  // Auto-búsqueda cuando cambia searchQuery (debounce)
  useEffect(() => {
    if (searchMode === "name" && searchQuery.trim().length >= 2) {
      // Limpiar timeout anterior
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }

      // Crear nuevo timeout
      const timeout = setTimeout(() => {
        handleSearchByName();
      }, 500); // Espera 500ms después de que el usuario deja de escribir

      setSearchTimeout(timeout);

      // Cleanup
      return () => clearTimeout(timeout);
    } else if (searchQuery.trim().length < 2 && searchQuery.trim().length > 0) {
      setValidationError("Ingrese al menos 2 caracteres");
      setSearchResults([]);
    } else if (searchQuery.trim().length === 0) {
      setSearchResults([]);
      setValidationError("");
      setError(null);
    }
  }, [searchQuery, searchMode]);

  // Búsqueda por nombre (se llama automáticamente por el useEffect)
  const handleSearchByName = async () => {
    setValidationError("");
    setLoading(true);
    setError(null);

    try {
      const response = await clientsAPI.searchClients(searchQuery);
      
      if (response.success && response.data.length > 0) {
        setSearchResults(response.data);
      } else {
        setSearchResults([]);
        setError("No se encontraron clientes");
      }
    } catch (err) {
      setError("Error al buscar clientes");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Búsqueda por cédula
  const handleSearchByIdentification = async () => {
    const validationMsg = validateIdentification(identification);
    if (validationMsg) {
      setValidationError(validationMsg);
      return;
    }
    setValidationError("");

    setLoading(true);
    setError(null);

    try {
      const response = await clientsAPI.client(identification);
      if (response?.id) {
        setClientData({ ...response, isExisting: true });
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

  // Seleccionar cliente de los resultados
  const handleSelectClient = (client) => {
    setClientData({ ...client, isExisting: true });
    setSearchResults([]);
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

  // Manejar Enter en input de cédula
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && searchMode === 'identification') {
      e.preventDefault();
      handleSearchByIdentification();
    }
  };

  // Vista principal de búsqueda
  if (showSearch && !clientData && !showForm) {
    return (
      <div className={styles.container}>
        <h2 className={styles.title}>Buscar Cliente</h2>

        {/* Selector de modo de búsqueda */}
        <div className={styles.searchModeSelector}>
          <button
            className={`${styles.modeButton} ${searchMode === "name" ? styles.active : ""}`}
            onClick={() => {
              setSearchMode("name");
              setSearchResults([]);
              setError(null);
              setValidationError("");
            }}
          >
            Buscar por Nombre
          </button>
          <button
            className={`${styles.modeButton} ${searchMode === "identification" ? styles.active : ""}`}
            onClick={() => {
              setSearchMode("identification");
              setSearchResults([]);
              setError(null);
              setValidationError("");
            }}
          >
            Buscar por Cédula
          </button>
        </div>

        <div className={styles.searchContainer}>
          {searchMode === "name" ? (
            // Búsqueda por nombre (automática)
            <div>
              <div className={styles.formGroup}>
                <label>Nombre o Apellido:</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setValidationError("");
                  }}
                  placeholder="Ej: Carlos, Pérez, etc."
                  autoFocus
                  maxLength={75}
                />
                {loading && (
                  <p className={styles.loadingText}>Buscando...</p>
                )}
                {validationError && (
                  <p className={styles.error}>{validationError}</p>
                )}
              </div>
            </div>
          ) : (
            // Búsqueda por cédula
            <div>
              <div className={styles.formGroup}>
                <label>Cédula:</label>
                <input
                  type="text"
                  value={identification}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, "");
                    setIdentification(value);
                    setValidationError("");
                  }}
                  onKeyPress={handleKeyPress}
                  placeholder="Ej: 123456789"
                  autoFocus
                  minLength={9}
                  maxLength={12}
                />
                {validationError && (
                  <p className={styles.error}>{validationError}</p>
                )}
              </div>
            </div>
          )}

          {error && <p className={styles.error}>{error}</p>}
        </div>

        {/* Resultados de búsqueda por nombre */}
        {searchMode === "name" && searchResults.length > 0 && (
          <div className={styles.searchResultsContainer}>
            <h3 className={styles.resultsTitle}>Resultados ({searchResults.length})</h3>
            <div className={styles.resultsList}>
              {searchResults.map((client) => (
                <div
                  key={client.id}
                  className={styles.resultCard}
                  onClick={() => handleSelectClient(client)}
                >
                  <div className={styles.resultName}>
                    {client.name} {client.lastname1} {client.lastname2}
                  </div>
                  <div className={styles.resultId}>
                    Cédula: {client.identification}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className={styles.buttonGroup}>
          <button onClick={onBack} className={styles.secondaryButton}>
            Atrás
          </button>
          {searchMode === "identification" && (
            <button
              onClick={handleSearchByIdentification}
              disabled={loading || !identification.trim()}
              className={styles.primaryButton}
            >
              {loading ? "Buscando..." : "Buscar"}
            </button>
          )}
        </div>
      </div>
    );
  }

  // Vista de cliente encontrado
  if (clientData?.isExisting && !showForm) {
    return (
      <div className={styles.container}>
        <h2 className={styles.title}>Datos del Cliente</h2>
        <div className={styles.clientCard}>
          <h3>Cliente Registrado</h3>
          <div className={styles.clientDetails}>
            <p>
              <strong>Nombre:</strong> {clientData.name} {clientData.lastname1}
            </p>
            <p>
              <strong>Cédula:</strong> {clientData.identification}
            </p>
            <p>
              <strong>Teléfono:</strong> {clientData.phone || "No registrado"}
            </p>
            <p>
              <strong>Email:</strong> {clientData.email || "No registrado"}
            </p>
          </div>
        </div>
        <div className={styles.buttonGroup}>
          <button onClick={onBack} className={styles.secondaryButton}>
            Atrás
          </button>
          <button
            onClick={() => onNext(clientData, "client")}
            className={styles.primaryButton}
          >
            Siguiente
          </button>
        </div>
      </div>
    );
  }

  // Vista de formulario de nuevo cliente
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Datos del Cliente</h2>
      <ClientForm
        onSubmit={handleSubmitForm}
        initialData={
          clientData?.isExisting === false ? clientData : { identification }
        }
        onCancel={onBack}
        key={identification}
        validationError={validationError}
        setValidationError={setValidationError}
        validateIdentification={validateIdentification}
      />
    </div>
  );
};

export default Step1Client;