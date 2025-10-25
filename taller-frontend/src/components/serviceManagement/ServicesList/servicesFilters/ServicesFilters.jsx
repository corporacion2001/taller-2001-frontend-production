import styles from "../servicesList.module.css";

const ServicesFilters = ({
  showFilters,
  setShowFilters,
  filters,
  updateFilter,
  resetFilters,
  isAdmin,
  isFleetMgr,
  activeTab,
  usersList,
  nonAdminsList,
}) => {
  const paymentMethods = [
    { value: "", label: "Todos los métodos" },
    { value: "Efectivo", label: "Efectivo" },
    { value: "Tarjeta", label: "Tarjeta" },
    { value: "Sinpe", label: "Sinpe" },
    { value: "Transferencia", label: "Transferencia" },
  ];

  const areas = [
    { value: "", label: "Todas las áreas" },
    { value: "Encargado Livianos", label: "Livianos" },
    { value: "Encargado Pesados", label: "Pesados" },
    { value: "Encargado Enderezado y Pintura", label: "Enderezado y Pintura" },
    { value: "Encargado Metalmecánica", label: "Metalmecánica" },
    { value: "Encargado Todo Frenos y Cluth", label: "Frenos y Clutch" },
    { value: "Encargado Hidráulica", label: "Hidráulica" },
  ];

  const workshops = [
    { value: "", label: "Todos los talleres" },
    { value: "Moravia", label: "Moravia" },
    { value: "Guadalupe", label: "Guadalupe" },
  ];

  if (!showFilters) return null;

  return (
    <div className={styles.filtersPanel}>
      <div className={styles.filtersHeader}>
        <button
          onClick={() => {
            resetFilters();
            setShowFilters(false);
          }}
          className={styles.clearFilters}
        >
          Limpiar
        </button>
      </div>

      <div className={styles.filtersGrid}>
        <div className={styles.filterGroup}>
          <label>Fecha de entrada</label>
          <div className={styles.dateRange}>
            <input
              type="date"
              value={filters.entryDateStart}
              onChange={(e) => updateFilter("entryDateStart", e.target.value)}
              className={styles.dateInput}
            />
            <span>a</span>
            <input
              type="date"
              value={filters.entryDateEnd}
              onChange={(e) => updateFilter("entryDateEnd", e.target.value)}
              min={filters.entryDateStart}
              className={styles.dateInput}
            />
          </div>
        </div>

        <div className={styles.filterGroup}>
          <label>Fecha de salida</label>
          <div className={styles.dateRange}>
            <input
              type="date"
              value={filters.endDateStart}
              onChange={(e) => updateFilter("endDateStart", e.target.value)}
              className={styles.dateInput}
            />
            <span>a</span>
            <input
              type="date"
              value={filters.endDateEnd}
              onChange={(e) => updateFilter("endDateEnd", e.target.value)}
              min={filters.endDateStart}
              className={styles.dateInput}
            />
          </div>
        </div>

        <div className={styles.filterGroup}>
          <label>Recibido por</label>
          <select
            value={filters.userReceivedId}
            onChange={(e) => updateFilter("userReceivedId", e.target.value)}
            className={styles.selectInput}
          >
            <option value="">Todos los usuarios</option>
            {usersList.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} {user.lastname1}
              </option>
            ))}
          </select>
        </div>

        {(isAdmin || isFleetMgr) &&
          (activeTab === "Finalizado" || activeTab === "Todos") && (
            <div className={styles.filterGroup}>
              <label>Método de pago</label>
              <select
                value={filters.paymentMethod}
                onChange={(e) => updateFilter("paymentMethod", e.target.value)}
                className={styles.selectInput}
              >
                {paymentMethods.map((method) => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </select>
            </div>
          )}

        <div className={styles.filterGroup}>
          <label>Área</label>
          <select
            value={filters.area}
            onChange={(e) => updateFilter("area", e.target.value)}
            className={styles.selectInput}
          >
            {areas.map((areaOption) => (
              <option key={areaOption.value} value={areaOption.value}>
                {areaOption.label}
              </option>
            ))}
          </select>
        </div>

        {(isAdmin || isFleetMgr) && (
          <div className={styles.filterGroup}>
            <label>Asignado a</label>
            <select
              value={filters.userAssignedId}
              onChange={(e) => updateFilter("userAssignedId", e.target.value)}
              className={styles.selectInput}
            >
              <option value="">Todos los encargados</option>
              {nonAdminsList.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} {user.lastname1}
                </option>
              ))}
            </select>
          </div>
        )}

        {isAdmin && (
          <div className={styles.filterGroup}>
            <label>Taller</label>
            <select
              value={filters.workshop}
              onChange={(e) => updateFilter("workshop", e.target.value)}
              className={styles.selectInput}
            >
              {workshops.map((workshopOption) => (
                <option key={workshopOption.value} value={workshopOption.value}>
                  {workshopOption.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServicesFilters;
