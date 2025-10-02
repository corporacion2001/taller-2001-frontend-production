import {
  FiPlus,
  FiSearch,
  FiFilter,
  FiChevronLeft,
  FiChevronRight,
  FiGrid,
  FiList,
} from "react-icons/fi";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { serviceAPI } from "../../../services/service.api";
import { usersAPI } from "../../../services/user.api";
import ServicesFilters from "./servicesFilters/ServicesFilters";
import ServicesCard from "./servicesCard/ServicesCard";
import styles from "./servicesList.module.css";
import ServicesTable from "./servicesTable/ServicesTable";

const ServicesList = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("Todos");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState("cards");
  const [totalServices, setTotalServices] = useState(0);
  const [filters, setFilters] = useState({
    paymentMethod: "",
    entryDateStart: "",
    entryDateEnd: "",
    endDateStart: "",
    endDateEnd: "",
    userReceivedId: "",
    userAssignedId: "",
    area: "",
    workshop: "",
  });
  const [usersList, setUsersList] = useState([]);
  const [nonAdminsList, setNonAdminsList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isFleetMgr, setIsFleetMgr] = useState(false);
  const { user } = useAuth();
  const searchInputRef = useRef(null);

  // Función para obtener estilo de estado
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

  // Función para formatear precio
  const formatPrice = (price) => {
    return parseFloat(price).toLocaleString("es-CR", {
      style: "currency",
      currency: "CRC",
      minimumFractionDigits: 2,
    });
  };

  // Función para formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return "Sin asignar";
    const [day, month, year] = dateString.split("/");
    return `${day}/${month}/${year}`;
  };

  useEffect(() => {
    const checkUserRoles = () => {
      setIsAdmin(user?.roles?.includes("Administrador"));
      setIsFleetMgr(user?.roles?.includes("Encargado Flotilla"));
    };

    checkUserRoles();
  }, [user]);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const workshopIdToSend = isAdmin
          ? undefined
          : user?.workshop_id ?? user?.workshop?.id ?? user?.workshopId ?? "";

        const usersResponse = await usersAPI.getBasicProfiles(workshopIdToSend);
        const usersPayload =
          usersResponse?.data?.data ??
          usersResponse?.data ??
          usersResponse ??
          [];
        setUsersList(Array.isArray(usersPayload) ? usersPayload : []);

        if (isAdmin || isFleetMgr) {
          const nonAdminsResponse = await usersAPI.getEncargados(
            workshopIdToSend
          );
          const nonAdminsPayload =
            nonAdminsResponse?.data ?? nonAdminsResponse ?? [];
          setNonAdminsList(
            Array.isArray(nonAdminsPayload) ? nonAdminsPayload : []
          );
        }
      } catch (err) {
        console.error("Error cargando usuarios:", err);
      }
    };

    loadUsers();
  }, [isAdmin, isFleetMgr, user]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);

        setTimeout(() => {
          if (searchInputRef.current) {
            searchInputRef.current.focus();
          }
        }, 100);

        const statusMap = {
          Pendiente: "Pendiente",
          "En Proceso": "En proceso",
          Finalizado: "Finalizado",
        };

        const statusName = activeTab === "Todos" ? null : statusMap[activeTab];
        const sendPaymentMethod =
          activeTab === "Finalizado" || activeTab === "Todos"
            ? filters.paymentMethod
            : "";

        const params = {
          page: currentPage,
          limit: 10,
          search: searchTerm,
          entry_date_start: filters.entryDateStart || null,
          entry_date_end: filters.entryDateEnd || null,
          end_date_start: filters.endDateStart || null,
          end_date_end: filters.endDateEnd || null,
          user_received_id: filters.userReceivedId,
          user_assigned_id: filters.userAssignedId,
          area: filters.area,
          workshop: isAdmin ? filters.workshop : "",
          payment_method: sendPaymentMethod,
          statusName: statusName,
        };

        const cleanParams = {};
        Object.keys(params).forEach((key) => {
          if (
            params[key] !== null &&
            params[key] !== undefined &&
            params[key] !== ""
          ) {
            cleanParams[key] = params[key];
          }
        });

        const response = await serviceAPI.getAllServices(cleanParams);
        setTotalServices(response.data.pagination.total);
        const servicesWithPhotos = await Promise.all(
          response.data.data.map(async (service) => {
            try {
              const photosResponse = await serviceAPI.getServicePhotos(
                service.id
              );
              return {
                ...service,
                photos: photosResponse.data.data || [],
              };
            } catch (photoError) {
              console.error(
                `Error obteniendo fotos para servicio ${service.id}:`,
                photoError
              );
              return {
                ...service,
                photos: [],
              };
            }
          })
        );

        setServices(servicesWithPhotos);
        setFilteredServices(servicesWithPhotos);
        setTotalPages(
          Math.ceil(
            response.data.pagination.total / response.data.pagination.limit
          )
        );
      } catch (err) {
        setError("Error al cargar los servicios");
        console.error("Error fetching services:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [activeTab, currentPage, searchTerm, filters, isAdmin]);

  const handleGoToService = () => {
    navigate("/dashboard/nuevo-servicio");
  };

  const resetFilters = () => {
    setFilters({
      paymentMethod: "",
      entryDateStart: "",
      entryDateEnd: "",
      endDateStart: "",
      endDateEnd: "",
      userReceivedId: "",
      userAssignedId: "",
      area: "",
      workshop: "",
    });
    setCurrentPage(1);
  };

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Gestión de Servicios</h2>
        <div className={styles.actions}>
          <div className={styles.searchContainer}>
            <FiSearch className={styles.searchIcon} />
            <input
              ref={searchInputRef}
              type="text"
              maxLength={60}
              placeholder="Buscar por placa, cliente, factura..."
              className={styles.searchInput}
              aria-label="Buscar servicios"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          {/* Selector de vista */}
          <div className={styles.viewToggle}>
            <button
              className={`${styles.viewButton} ${
                viewMode === "cards" ? styles.activeView : ""
              }`}
              onClick={() => setViewMode("cards")}
              aria-label="Vista de tarjetas"
            >
              <FiGrid />
            </button>
            <button
              className={`${styles.viewButton} ${
                viewMode === "table" ? styles.activeView : ""
              }`}
              onClick={() => setViewMode("table")}
              aria-label="Vista de tabla"
            >
              <FiList />
            </button>
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={styles.filterButton}
          >
            <FiFilter />
            Filtros
          </button>
          <button onClick={handleGoToService} className={styles.primaryButton}>
            <FiPlus />
            Nuevo Servicio
          </button>
        </div>
      </div>

      <ServicesFilters
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        filters={filters}
        updateFilter={updateFilter}
        resetFilters={resetFilters}
        isAdmin={isAdmin}
        isFleetMgr={isFleetMgr}
        activeTab={activeTab}
        usersList={usersList}
        nonAdminsList={nonAdminsList}
      />

      <div className={styles.tabsContainer}>
        <div className={styles.tabs}>
          {["Todos", "Pendiente", "En Proceso", "Finalizado"].map((tab) => (
            <button
              key={tab}
              className={`${styles.tab} ${
                activeTab === tab ? styles.activeTab : ""
              }`}
              onClick={() => {
                setActiveTab(tab);
                setCurrentPage(1);
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Contenedor de servicios según el modo de vista */}
      {loading ? (
        <div className={styles.loading}>Cargando servicios...</div>
      ) : viewMode === "cards" ? (
        <div className={styles.cardsContainer}>
          {filteredServices.length > 0 ? (
            filteredServices.map((service) => (
              <ServicesCard
                key={service.id}
                service={service}
                getStatusStyle={getStatusStyle}
                formatPrice={formatPrice}
                formatDate={formatDate}
              />
            ))
          ) : (
            <div className={styles.noResults}>
              No se encontraron servicios{" "}
              {activeTab !== "Todos" ? `en estado ${activeTab} ` : ""}que
              coincidan con la búsqueda
            </div>
          )}
        </div>
      ) : (
        <ServicesTable
          services={filteredServices}
          getStatusStyle={getStatusStyle}
          formatPrice={formatPrice}
          formatDate={formatDate}
        />
      )}
      <div className={styles.totalServices}>
        Total: {totalServices} servicio{totalServices !== 1 ? "s" : ""}
      </div>
      {filteredServices.length > 0 && (
        <div className={styles.pagination}>
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className={styles.paginationButton}
          >
            <FiChevronLeft />
            Anterior
          </button>

          <span className={styles.pageInfo}>
            Página {currentPage} de {totalPages}
          </span>

          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className={styles.paginationButton}
          >
            Siguiente <FiChevronRight />
          </button>
        </div>
      )}
    </div>
  );
};

export default ServicesList;
