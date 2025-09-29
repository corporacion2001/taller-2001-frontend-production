import { Link } from "react-router-dom";
import styles from "../servicesList.module.css";

const ServicesCard = ({ service }) => {
  const getStatusStyle = (statusName) => {
    switch (statusName.toLowerCase()) {
      case "finalizado":
        return styles.statusCompleted;
      case "en proceso":
        return styles.statusInProgress;
      case "pendiente":
        return styles.statusPending;
      case "entregado":
        return styles.statusDelivered;
      default:
        return styles.statusPending;
    }
  };

  const formatPrice = (price) => {
    return parseFloat(price).toLocaleString("es-CR", {
      style: "currency",
      currency: "CRC",
      minimumFractionDigits: 2,
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Sin definir";
    const [day, month, year] = dateString.split("/");
    return `${day}/${month}/${year}`;
  };
  // Función para verificar si la fecha de finalización es hoy o ya pasó
  const isEndDateTodayOrPast = (dateString) => {
    if (!dateString) return false;

    // Verificar si el estado es "En proceso" o "Pendiente"
    const status = service.status_service.name.toLowerCase();
    const shouldCheckDate = status === "en proceso" || status === "pendiente";

    if (!shouldCheckDate) return false;

    // Convertir la fecha del servicio a objeto Date
    const [day, month, year] = dateString.split("/");
    const endDate = new Date(year, month - 1, day); // mes -1 porque en JS los meses van de 0 a 11

    // Fecha actual (sin horas, minutos, segundos)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Comparar fechas
    return endDate <= today;
  };

  return (
    <div className={styles.serviceCard}>
      <div className={styles.cardImageContainer}>
        {service.photos.length > 0 ? (
          <img
            src={service.photos[0].downloadUrl}
            alt={`${service.vehicle.brand} ${service.vehicle.model} - ${service.vehicle.plate}`}
            className={styles.cardImage}
            onError={(e) => {
              e.target.onerror = null;
            }}
          />
        ) : (
          <div className={styles.noImage}>
            <span>Sin imágenes</span>
          </div>
        )}
      </div>

      <div className={styles.cardContent}>
        <div className={styles.titleRow}>
          <h3 className={styles.cardTitle}>
            {service.vehicle.brand} {service.vehicle.model}
          </h3>
          <span
            className={`${styles.cardStatus} ${getStatusStyle(
              service.status_service.name
            )}`}
          >
            {service.status_service.name}
          </span>
        </div>
        <p className={styles.cardPlate}>Placa: {service.vehicle.plate}</p>

        <div className={styles.cardInfo}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Cliente:</span>
            <span>
              {service.client.name} {service.client.lastname1}
            </span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Taller:</span>
            <span>{service.workshop?.name}</span>
          </div>
          <div className={styles.infoItem}>
            <span
              className={`${styles.infoLabel} ${
                isEndDateTodayOrPast(service.end_date)
                  ? styles.endDateWarning
                  : ""
              }`}
            >
              Fecha de finalización:
            </span>
            <span
              className={
                isEndDateTodayOrPast(service.end_date)
                  ? styles.endDateToday
                  : ""
              }
            >
              {formatDate(service.end_date)}
            </span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Número de orden:</span>
            <span>{service.order_number}</span>
          </div>
        </div>

        <div className={styles.cardFooter}>
          <div className={styles.cardTotal}>
            {formatPrice(service.total_price)}
          </div>
          <Link
            to={`/dashboard/servicios/${service.id}`}
            className={styles.detailLink}
            aria-label={`Ver detalles del servicio ${service.id}`}
          >
            Ver Detalles
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ServicesCard;
