import { useEffect, useState, useRef } from "react";
import styles from "./monitoringServices.module.css";
import { serviceAPI } from "../../services/service.api";

const MonitoringServices = () => {
  const [services, setServices] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [autoScroll, setAutoScroll] = useState(true);
  const contentRef = useRef(null);
  const scrollIntervalRef = useRef(null);
  const isScrollingToTopRef = useRef(false);
  const scrollSpeedRef = useRef(0.5);
  const servicesPaginationRef = useRef({});
  
  // Función para formatear fecha de YYYY-MM-DD a DD/MM/YYYY
  const formatDateToDDMMYYYY = (dateString) => {
    if (!dateString) return "--/--/----";
    
    try {
      const [year, month, day] = dateString.split("-");
      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error("Error formateando fecha:", dateString, error);
      return dateString; // Devolver original si hay error
    }
  };

  // Función para verificar si la fecha ya pasó (incluyendo hoy)
  const isDateTodayOrPast = (dateString, now) => {
    if (!dateString) return false;
    
    try {
      // Parsear la fecha en formato YYYY-MM-DD
      const [year, month, day] = dateString.split("-").map(Number);
      const givenDate = new Date(year, month - 1, day);
      
      // Fecha actual (sin tiempo)
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);
      
      // Ajustar ambas fechas a UTC para evitar problemas de zona horaria
      const givenUTC = Date.UTC(givenDate.getFullYear(), givenDate.getMonth(), givenDate.getDate());
      const todayUTC = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
      
      return givenUTC <= todayUTC;
    } catch (error) {
      console.error("Error parsing date:", dateString, error);
      return false;
    }
  };

  const fetchServices = async () => {
    try {
      const res = await serviceAPI.getMonitoringServices();
      if (res.data.success) {
        const servicesData = res.data.data;
        setServices(servicesData);

        // Inicializar paginación para cada servicio
        servicesData.forEach((service) => {
          if (!servicesPaginationRef.current[service.id]) {
            servicesPaginationRef.current[service.id] = {
              currentPage: 0,
              totalPages:
                service.parts && service.parts.length > 8
                  ? Math.ceil(service.parts.length / 8)
                  : 1,
              interval: null,
            };

            if (service.parts && service.parts.length > 8) {
              servicesPaginationRef.current[service.id].interval = setInterval(
                () => {
                  servicesPaginationRef.current[service.id].currentPage =
                    (servicesPaginationRef.current[service.id].currentPage +
                      1) %
                    servicesPaginationRef.current[service.id].totalPages;
                  setServices((prev) => [...prev]);
                },
                5000
              );
            }
          }
        });
      }
    } catch (error) {
      console.error("Error al obtener servicios:", error);
    }
  };

  useEffect(() => {
    fetchServices();
    const intervalFetch = setInterval(fetchServices, 30000);
    const intervalTime = setInterval(() => setCurrentTime(new Date()), 1000);

    return () => {
      clearInterval(intervalFetch);
      clearInterval(intervalTime);
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
      }

      Object.values(servicesPaginationRef.current).forEach(
        (servicePagination) => {
          if (servicePagination.interval) {
            clearInterval(servicePagination.interval);
          }
        }
      );
    };
  }, []);

  // Efecto para el auto-scroll continuo y suave
  useEffect(() => {
    if (!autoScroll || services.length === 0) return;

    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
    }

    let lastScrollTime = 0;

    const scrollStep = () => {
      if (!contentRef.current || !autoScroll) return;

      const now = Date.now();
      if (now - lastScrollTime < 30) {
        scrollIntervalRef.current = requestAnimationFrame(scrollStep);
        return;
      }

      lastScrollTime = now;

      const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
      const maxScroll = scrollHeight - clientHeight;

      // Si estamos cerca del final y no estamos ya haciendo scroll hacia arriba
      if (scrollTop >= maxScroll - 10 && !isScrollingToTopRef.current) {
        isScrollingToTopRef.current = true;

        // Hacer scroll suave al inicio
        contentRef.current.scrollTo({
          top: 0,
          behavior: "smooth",
        });

        // Esperar a que termine el scroll suave antes de continuar
        setTimeout(() => {
          isScrollingToTopRef.current = false;
          scrollIntervalRef.current = requestAnimationFrame(scrollStep);
        }, 1000);

        return;
      }

      // Si no estamos haciendo scroll hacia arriba, continuar scroll normal
      if (!isScrollingToTopRef.current) {
        contentRef.current.scrollTop += scrollSpeedRef.current;
      }

      scrollIntervalRef.current = requestAnimationFrame(scrollStep);
    };

    scrollIntervalRef.current = requestAnimationFrame(scrollStep);

    return () => {
      if (scrollIntervalRef.current) {
        cancelAnimationFrame(scrollIntervalRef.current);
      }
    };
  }, [autoScroll, services]);

  const renderServiceRow = (data) => {
    const vehicleFullName = `${data.vehicle.brand} ${data.vehicle.model} ${data.vehicle.year}`;

    const paginationInfo = servicesPaginationRef.current[data.id] || {
      currentPage: 0,
      totalPages: 1,
    };

    const currentPage = paginationInfo.currentPage;
    const totalPartsPages = paginationInfo.totalPages;
    const partsPerPage = 8;

    const visibleParts =
      data.parts && data.parts.length > 0
        ? data.parts.slice(
            currentPage * partsPerPage,
            (currentPage + 1) * partsPerPage
          )
        : [];

    const leftColumnParts = visibleParts.filter((_, index) => index % 2 === 0);
    const rightColumnParts = visibleParts.filter((_, index) => index % 2 === 1);

    // Verificar si la fecha debe resaltarse
    const shouldHighlight = isDateTodayOrPast(data.end_date, currentTime);

    return (
      <div className={styles.serviceRow} key={data.id}>
        {/* Imagen del vehículo */}
        <div className={styles.vehicleImage}>
          {data.firstPhotoUrl ? (
            <img src={data.firstPhotoUrl} alt="Vehículo" />
          ) : (
            <div className={styles.imagePlaceholder}>
              <div className={styles.placeholderIcon}>Foto no disponible</div>
            </div>
          )}
        </div>

        {/* Información del vehículo */}
        <div className={styles.vehicleInfo}>
          <div className={styles.vehicleTitle}>{vehicleFullName}</div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>PLACA:</span>
            <span className={styles.infoValue}>{data.vehicle.plate}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>UBICACIÓN:</span>
            <span className={styles.infoValue}>{data.vehicle_location}</span>
          </div>
        </div>

        {/* Fechas */}
        <div className={styles.datesContainer}>
          <div className={styles.dateCard}>
            <div className={styles.dateLabel}>INGRESO</div>
            <div className={styles.dateValue}>
              {formatDateToDDMMYYYY(data.entry_date)}
            </div>
          </div>
          <div className={styles.dateCard}>
            <div className={styles.dateLabel}>ESTIMADO SALIDA</div>
            <div
              className={`${styles.dateValue} ${
                shouldHighlight ? styles.alertDate : ""
              }`}
            >
              {formatDateToDDMMYYYY(data.end_date)}
            </div>
          </div>
        </div>

        {/* Partes requeridas */}
        <div className={styles.partsContainer}>
          <div className={styles.sectionHeader}>
            REPUESTOS
            {totalPartsPages > 1 && (
              <span className={styles.paginationIndicator}>
                ({currentPage + 1}/{totalPartsPages})
              </span>
            )}
          </div>

          {data.parts && data.parts.length > 0 ? (
            <div className={styles.twoColumnsContainer}>
              <div className={styles.partsColumn}>
                {leftColumnParts.map((p) => (
                  <div key={p.id} className={styles.partItem}>
                    <span className={styles.partName}>{p.name}</span>
                    <span className={styles.partAmount}>{p.amount}u</span>
                  </div>
                ))}
              </div>
              <div className={styles.partsColumn}>
                {rightColumnParts.map((p) => (
                  <div key={p.id} className={styles.partItem}>
                    <span className={styles.partName}>{p.name}</span>
                    <span className={styles.partAmount}>{p.amount}u</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className={styles.emptySection}>No requiere partes</div>
          )}

          {data.parts && data.parts.length > partsPerPage && (
            <div className={styles.moreItems}>
              Mostrando{" "}
              {Math.min(
                partsPerPage,
                data.parts.length - currentPage * partsPerPage
              )}{" "}
              de {data.parts.length} repuestos
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.displayContainer}>
      {/* Encabezado */}
      <div className={styles.displayHeader}>
        <div className={styles.logoContainer}>
          <img
            src="https://res.cloudinary.com/dzj9vcedu/image/upload/v1749708920/corporacionlogo_aoppj5.png"
            alt="Logo Taller"
            className={styles.systemLogo}
          />
        </div>
        <h1 className={styles.screenTitle}>MONITOREO DE SERVICIOS</h1>
        <div className={styles.headerRight}>
          <div className={styles.timeDisplay}>
            {currentTime.toLocaleTimeString("es-CR", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })}
          </div>
          <button
            className={`${styles.scrollButton} ${
              autoScroll ? styles.scrollActive : ""
            }`}
            onClick={() => setAutoScroll(!autoScroll)}
            title={autoScroll ? "Pausar scroll" : "Reanudar scroll"}
          >
            {autoScroll ? "⏸️" : "▶️"}
          </button>
        </div>
      </div>

      {/* Contenido - Lista de servicios con scroll */}
      <div className={styles.displayContent} ref={contentRef}>
        <div className={styles.servicesGrid}>
          {services.length > 0 ? (
            services.map(renderServiceRow)
          ) : (
            <div className={styles.noServices}>No hay servicios en curso</div>
          )}
        </div>
      </div>

      {/* Pie de página */}
      <div className={styles.displayFooter}>
        <div className={styles.servicesCount}>
          TOTAL SERVICIOS: {services.length}
        </div>
        <div className={styles.dateDisplay}>
          {currentTime
            .toLocaleDateString("es-ES", {
              weekday: "short",
              day: "numeric",
              month: "short",
              year: "numeric",
            })
            .toUpperCase()}
        </div>
      </div>
    </div>
  );
};

export default MonitoringServices;