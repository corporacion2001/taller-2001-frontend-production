import React from "react";
import { FiArrowLeft, FiDownload } from "react-icons/fi";
import { generateServicePDF } from "../../../../utils/pdfGenerator";
import { generateServiceWord } from "../../../../utils/wordGenerator";
import ProcessActions from "./processActions/ProcessActions";
import InfoCard from "./infoCard/InfoCard";
import styles from "./serviceHeader.module.css";
import { quoteAPI } from "../../../../services/quoteAPI";
import { proformaAPI } from "../../../../services/proformaAPI"; // NUEVO IMPORT
import { useNotification } from "../../../../contexts/NotificationContext";
import { serviceAPI } from "../../../../services/service.api";

const ServiceHeader = ({ service, navigate, onQuoteParts, onSendProforma }) => {
  const { showNotification } = useNotification();
  const formatPrice = (price) => {
    return new Intl.NumberFormat("es-CR", {
      style: "currency",
      currency: "CRC",
    }).format(price || 0);
  };

  const handleCotizarRepuesto = async () => {
    onQuoteParts();
  };

  const handleEnviarProforma = async () => {
    onSendProforma(); // Usa la función del padre
  };

  const handleExportToPDF = () => {
    const doc = generateServicePDF(service, formatPrice);
    doc.save(`servicio_${service.order_number}.pdf`);
  };

  // ✅ Exportar a Word
  const handleExportToWord = async () => {
    try {
      await generateServiceWord(service);
      showNotification("Documento Word generado exitosamente.", "success");
    } catch (error) {
      console.error("Error exportando a Word:", error);
      showNotification("Error al generar el documento Word.", "error");
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
      <div className={styles.headerActions}>
        <button
          onClick={() => navigate("/dashboard/gestion/servicios")}
          className={styles.backButton}
        >
          <FiArrowLeft /> Volver
        </button>

        <div className={styles.exportButtons}>
          <button onClick={handleExportToPDF} className={styles.pdfButton}>
            <FiDownload /> Exportar PDF
          </button>
          <button onClick={handleExportToWord} className={styles.wordButton}>
            <FiDownload /> Exportar Word
          </button>
        </div>
      </div>

      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>
            Número de orden: {service.order_number}
          </h1>
          <div
            className={`${styles.statusBadge} ${getStatusBadgeClass(
              service.status_service.name
            )}`}
            data-status={service.status_service.name}
          >
            {service.status_service.name}
          </div>
        </div>
        <div className={styles.vehiclePlate}>
          Placa: {service.vehicle.plate}
        </div>
      </header>

      {service.status_service.name === "Pendiente" && (
        <ProcessActions
          onCotizarRepuesto={handleCotizarRepuesto}
          showEnviarProforma={false}
        />
      )}

      {(service.status_service.name === "En proceso" ||
        service.status_service.name === "Finalizado") && (
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
              {service.entry_date} a las {service.entry_time}
            </span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.label}>Taller:</span>
            <span>{service.workshop.name}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.label}>Total:</span>
            <span className={styles.highlight}>
              {formatPrice(service.total_price)}
            </span>
          </div>
        </InfoCard>

        <InfoCard title="Vehículo">
          <div className={styles.infoItem}>
            <span className={styles.label}>Marca/Modelo:</span>
            <span>
              {service.vehicle.brand} {service.vehicle.model}
            </span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.label}>Año/KM:</span>
            <span>
              {service.vehicle.year} •{" "}
              {service.vehicle.mileage.toLocaleString()} km
            </span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.label}>Motor:</span>
            <span>{service.vehicle.engine}</span>
          </div>
        </InfoCard>

        <InfoCard title="Cliente">
          <div className={styles.infoItem}>
            <span className={styles.label}>Nombre:</span>
            <span>
              {service.client.name} {service.client.lastname1}
            </span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.label}>Contacto:</span>
            <span>
              {service.client.phone} • {service.client.email}
            </span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.label}>Identificación:</span>
            <span>{service.client.identification}</span>
          </div>
        </InfoCard>
      </div>

      <section className={styles.section}>
        <h2>Personal</h2>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <span className={styles.label}>Recibido por:</span>
            <span>
              {service.received_by.name} {service.received_by.lastname1}
            </span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.label}>Asignado a:</span>
            <span>
              {service.assigned_to.name} {service.assigned_to.lastname1}
            </span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.label}>Área:</span>
            <span>{service.area.name}</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ServiceHeader;
