import { Link } from "react-router-dom";
import styles from "./servicesTable.module.css";

const ServicesTable = ({ services, getStatusStyle, formatPrice, formatDate }) => {
  // Función para verificar si la fecha de finalización es hoy o ya pasó
  const isEndDateTodayOrPast = (dateString, statusName) => {
    if (!dateString) return false;
    
    // Verificar si el estado es "En proceso" o "Pendiente"
    const status = statusName.toLowerCase();
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
    <div className={styles.tableContainer}>
      <table className={styles.servicesTable}>
        <thead>
          <tr>
            <th className={styles.columnVehicle}>Vehículo</th>
            <th className={styles.columnClient}>Cliente</th>
            <th className={styles.columnPlate}>Placa</th>
            <th className={styles.columnWorkshop}>Taller</th>
            <th className={styles.columnDate}>Fecha Finalización</th>
            <th className={styles.columnStatus}>Estado</th>
            <th className={styles.columnTotal}>Total</th>
            <th className={styles.columnActions}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {services.map((service) => {
            const shouldHighlightDate = isEndDateTodayOrPast(
              service.end_date, 
              service.status_service.name
            );
            
            return (
              <tr key={service.id}>
                <td className={styles.cellVehicle}>
                  <div className={styles.vehicleInfo}>
                    {service.photos.length > 0 ? (
                      <img
                        src={service.photos[0].downloadUrl}
                        alt={`${service.vehicle.brand} ${service.vehicle.model}`}
                        className={styles.tableImage}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    {service.photos.length === 0 && (
                      <div className={styles.tableNoImage}>
                        <span>Sin imagen</span>
                      </div>
                    )}
                    <div className={styles.vehicleText}>
                      <div className={styles.vehicleName} title={`${service.vehicle.brand} ${service.vehicle.model}`}>
                        {service.vehicle.brand} {service.vehicle.model}
                      </div>
                      <div className={styles.vehicleYear}>{service.vehicle.year}</div>
                    </div>
                  </div>
                </td>
                <td className={styles.cellClient}>
                  <div className={styles.textEllipsis} title={`${service.client.name} ${service.client.lastname1}`}>
                    {service.client.name} {service.client.lastname1}
                  </div>
                </td>
                <td className={styles.cellPlate}>
                  <div className={styles.textEllipsis} title={service.vehicle.plate}>
                    {service.vehicle.plate}
                  </div>
                </td>
                <td className={styles.cellWorkshop}>
                  <div className={styles.textEllipsis} title={service.workshop?.name}>
                    {service.workshop?.name}
                  </div>
                </td>
                <td className={styles.cellDate}>
                  <span className={shouldHighlightDate ? styles.endDateToday : ""}>
                    {formatDate(service.end_date)}
                  </span>
                </td>
                <td className={styles.cellStatus}>
                  <span className={`${styles.statusBadge} ${getStatusStyle(service.status_service.name)}`}>
                    {service.status_service.name}
                  </span>
                </td>
                <td className={styles.cellTotal}>
                  {formatPrice(service.total_price)}
                </td>
                <td className={styles.cellActions}>
                  <Link
                    to={`/dashboard/servicios/${service.id}`}
                    className={styles.tableDetailLink}
                  >
                    Ver Detalles
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ServicesTable;