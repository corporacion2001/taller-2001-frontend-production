import { FiSearch, FiFilter } from "react-icons/fi";
import { useState } from "react";

const UserFilters = ({
  filters,
  onFilterChange,
  styles,
  availableWorkshops,
}) => {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className={styles.filtersContainer}>
      <div className={styles.searchBar}>
        <div className={styles.searchInput}>
          <FiSearch className={styles.searchIcon} />
          <input
            type="text"
            maxLength={60}
            placeholder="Buscar usuarios..."
            value={filters.search}
            onChange={(e) =>
              onFilterChange({ ...filters, search: e.target.value })
            }
            onKeyPress={(e) => {
              if (e.key === "Enter") onFilterChange({ ...filters });
            }}
          />
        </div>
        <button
          className={styles.filterToggle}
          onClick={() => setShowFilters((s) => !s)}
        >
          <FiFilter /> Filtros
        </button>
      </div>

      {showFilters && (
        <div className={styles.advancedFilters}>
          <div className={styles.filterGroup}>
            <label>Rol:</label>
            <select
              value={filters.role}
              onChange={(e) =>
                onFilterChange({ ...filters, role: e.target.value })
              }
            >
              <option value="">Todos los roles</option>
              <option value="Administrador">Administrador</option>
              <option value="Encargado Todo Frenos y Cluth">
                Encargado Todo Frenos y Cluth
              </option>
              <option value="Encargado Livianos">Encargado Livianos</option>
              <option value="Monitoreo Hidráulica">Monitoreo Hidráulica</option>
              <option value="Monitoreo Enderezado y Pintura">
                Monitoreo Enderezado y Pintura
              </option>
              <option value="Monitoreo Pesados">Monitoreo Pesados</option>
              <option value="Encargado Pesados">Encargado Pesados</option>
              <option value="Monitoreo Metalmecánica">
                Monitoreo Metalmecánica
              </option>
              <option value="Encargado Enderezado y Pintura">
                Encargado Enderezado y Pintura
              </option>
              <option value="Encargado Metalmecánica">
                Encargado Metalmecánica
              </option>
              <option value="Monitoreo Livianos">Monitoreo Livianos</option>
              <option value="Encargado Hidráulica">Encargado Hidráulica</option>
              <option value="Encargado Flotilla">Encargado Flotilla</option>
              <option value="Monitoreo Todo Frenos y Clutch">
                Monitoreo Todo Frenos y Clutch
              </option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label>Estado:</label>
            <select
              value={filters.status}
              onChange={(e) =>
                onFilterChange({ ...filters, status: e.target.value })
              }
            >
              <option value="">Todos los estados</option>
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
              <option value="Suspendido">Suspendido</option>
              <option value="Bloqueado">Bloqueado</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label>Taller:</label>
            <select
              value={filters.workshop_id}
              onChange={(e) =>
                onFilterChange({ ...filters, workshop_id: e.target.value })
              }
            >
              <option value="">Todos los talleres</option>
              {availableWorkshops.map((workshop) => (
                <option key={workshop.id} value={workshop.id}>
                  {workshop.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterButtons}>
            <button
              onClick={() => setShowFilters(false)}
              className={styles.applyButton}
            >
              Aplicar Filtros
            </button>
            <button
              onClick={() =>
                onFilterChange({
                  search: "",
                  role: "",
                  status: "",
                  workshop_id: "",
                })
              }
              className={styles.resetButton}
            >
              Limpiar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserFilters;
