import React, { useState, useRef, useEffect } from "react";
import { FiArrowLeft, FiDownload, FiChevronDown } from "react-icons/fi";
import { AiOutlineFilePdf, AiOutlineFileWord, AiOutlineFileExcel } from "react-icons/ai";
import { generateServicePDF } from "../../../../utils/pdfGenerator";
import { generateServiceWord } from "../../../../utils/wordGenerator";
import { generateServiceExcel } from "../../../../utils/excelGenerator";
import ProcessActions from "./processActions/ProcessActions";
import InfoCard from "./infoCard/InfoCard";
import styles from "./serviceHeader.module.css";
import { useNotification } from "../../../../contexts/NotificationContext";

const ServiceHeader = ({ service, navigate, onQuoteParts, onSendProforma }) => {
  const { showNotification } = useNotification();
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [quoteMessage, setQuoteMessage] = useState("");
  const exportMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
        setShowExportMenu(false);
      }
    };

    if (showExportMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showExportMenu]);

  if (!service) {
    return <p>Cargando servicio...</p>;
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat("es-CR", {
      style: "currency",
      currency: "CRC",
    }).format(price || 0);
  };

  const handleCotizarRepuesto = async () => {
    setShowMessageModal(true);
  };

  const handleConfirmQuote = () => {
    setShowMessageModal(false);
    onQuoteParts(quoteMessage);
    setQuoteMessage("");
  };

  const handleCancelQuote = () => {
    setShowMessageModal(false);
    setQuoteMessage("");
  };

  const handleEnviarProforma = async () => {
    onSendProforma();
  };

  const handleExportToPDF = () => {
    try {
      const doc = generateServicePDF(service, formatPrice);
      doc.save(`servicio_${service?.order_number}.pdf`);
      showNotification("PDF generado exitosamente.", "success");
      setShowExportMenu(false);
    } catch (error) {
      console.error("Error exportando a PDF:", error);
      showNotification("Error al generar el PDF.", "error");
    }
  };

  const handleExportToWord = async () => {
    try {
      await generateServiceWord(service);
      showNotification("Documento Word generado exitosamente.", "success");
      setShowExportMenu(false);
    } catch (error) {
      console.error("Error exportando a Word:", error);
      showNotification("Error al generar el documento Word.", "error");
    }
  };

  const handleExportToExcel = () => {
    try {
      generateServiceExcel(service);
      showNotification("Excel generado exitosamente.", "success");
      setShowExportMenu(false);
    } catch (error) {
      console.error("Error exportando a Excel:", error);
      showNotification("Error al generar el Excel.", "error");
    }
  };

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      Pendiente: styles.statusPending,
      "En proceso": styles.statusInProcess,
      Finalizado: styles.statusFinished,
      Entregado: styles.statusDelivered,
    };
    return statusMap[status] || styles.statusDefault;
  };

  return (
    <div className={styles.container}>
      {showMessageModal && (
        <div className={styles.modalOverlay} onClick={handleCancelQuote}>
          <div
            className={styles.messageModal}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Mensaje para cotización</h3>
            <p>
              Escribe un mensaje para los proveedores (máximo 100 caracteres)
            </p>
            <textarea
              value={quoteMessage}
              onChange={(e) => {
                if (e.target.value.length <= 100) {
                  setQuoteMessage(e.target.value);
                }
              }}
              placeholder="Ej: Por favor envíen cotización urgente..."
              maxLength={100}
              rows={4}
              className={styles.messageTextarea}
            />
            <div className={styles.characterCount}>
              {quoteMessage.length}/100 caracteres
            </div>
            <div className={styles.modalButtons}>
              <button
                onClick={handleCancelQuote}
                className={styles.cancelButton}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmQuote}
                className={styles.confirmButton}
              >
                Enviar Cotización
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.headerActions}>
        <button
          onClick={() => navigate("/dashboard/gestion/servicios")}
          className={styles.backButton}
        >
          <FiArrowLeft /> Volver
        </button>
        
        <div className={styles.exportContainer} ref={exportMenuRef}>
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className={styles.exportButton}
          >
            <FiDownload /> Exportar <FiChevronDown className={styles.chevron} />
          </button>
          
          {showExportMenu && (
            <div className={styles.exportMenu}>
              <button
                onClick={handleExportToPDF}
                className={styles.exportMenuItem}
              >
                <AiOutlineFilePdf className={styles.pdfIcon} />
                <span>Exportar a PDF</span>
              </button>
              <button
                onClick={handleExportToWord}
                className={styles.exportMenuItem}
              >
                <AiOutlineFileWord className={styles.wordIcon} />
                <span>Exportar a Word</span>
              </button>
              <button
                onClick={handleExportToExcel}
                className={styles.exportMenuItem}
              >
                <AiOutlineFileExcel className={styles.excelIcon} />
                <span>Exportar a Excel</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>
            Número de orden: {service?.order_number}
          </h1>
          <div
            className={`${styles.statusBadge} ${getStatusBadgeClass(
              service?.status_service?.name
            )}`}
            data-status={service?.status_service?.name}
          >
            {service?.status_service?.name}
          </div>
        </div>
        <div className={styles.vehiclePlate}>
          Placa: {service?.vehicle?.plate}
        </div>
      </header>

      {service?.status_service?.name === "Pendiente" && (
        <ProcessActions
          onCotizarRepuesto={handleCotizarRepuesto}
          showEnviarProforma={false}
        />
      )}

      {(service?.status_service?.name === "En proceso" ||
        service?.status_service?.name === "Finalizado") && (
        <ProcessActions
          onCotizarRepuesto={handleCotizarRepuesto}
          onEnviarProforma={handleEnviarProforma}
          showEnviarProforma={true}
        />
      )}

      <div className={styles.summaryCards}>
        <InfoCard title="Información General">
          <div className={styles.infoItem}>
            <span className={styles.label}>Fecha de ingreso:</span>
            <span>
              {service?.entry_date} a las {service?.entry_time}
            </span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.label}>Taller:</span>
            <span>{service?.workshop?.name}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.label}>Total:</span>
            <span className={styles.highlight}>
              {formatPrice(service?.total_price)}
            </span>
          </div>
        </InfoCard>

        <InfoCard title="Vehículo">
          <div className={styles.infoItem}>
            <span className={styles.label}>Marca/Modelo:</span>
            <span>
              {service?.vehicle?.brand} {service?.vehicle?.model}
            </span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.label}>Año/KM:</span>
            <span>
              {service?.vehicle?.year} •{" "}
              {service?.vehicle?.mileage?.toLocaleString()} km
            </span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.label}>Motor:</span>
            <span>{service?.vehicle?.engine}</span>
          </div>
        </InfoCard>

        <InfoCard title="Cliente">
          <div className={styles.infoItem}>
            <span className={styles.label}>Nombre:</span>
            <span>
              {service?.client?.name} {service?.client?.lastname1}
            </span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.label}>Contacto:</span>
            <span>
              {service?.client?.phone} • {service?.client?.email}
            </span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.label}>Identificación:</span>
            <span>{service?.client?.identification}</span>
          </div>
        </InfoCard>
      </div>

      <section className={styles.section}>
        <h2>Personal</h2>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <span className={styles.label}>Recibido por:</span>
            <span>
              {service?.received_by?.name} {service?.received_by?.lastname1}
            </span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.label}>Encargado Flotilla:</span>
            <span>
              {service?.fleetUser
                ? `${service.fleetUser.name} ${service.fleetUser.lastname1}`
                : "Sin asignar"}
            </span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.label}>Encargado taller:</span>
            <span>
              {service?.assigned_to
                ? `${service.assigned_to.name} ${service.assigned_to.lastname1}`
                : "Sin asignar"}
            </span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.label}>Área:</span>
            <span>{service?.area?.name || "Sin asignar"}</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ServiceHeader;