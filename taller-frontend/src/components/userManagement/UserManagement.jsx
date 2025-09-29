import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiPlus } from "react-icons/fi";
import { usersAPI } from "../../services/user.api";
import { workshopsAPI } from "../../services/workshops.api";
import Spinner from "../ui/spinner/LoadingSpinner";
import UserFilters from "./UserFilters";
import UserTable from "./UserTable";
import UserPagination from "./UserPagination";
import styles from "./userManagement.module.css";
import { useNotification } from "../../contexts/NotificationContext";

const UserManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [availableWorkshops, setAvailableWorkshops] = useState([]);
  const [loadingWorkshops, setLoadingWorkshops] = useState(false);
  const [error, setError] = useState(null);
  const { showNotification } = useNotification();

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    search: "",
    role: "",
    status: "",
    workshop_id: "",
  });

  const loadWorkshops = async () => {
    try {
      setLoadingWorkshops(true);
      const response = await workshopsAPI.getWorkshops();
      setAvailableWorkshops(response.data);
    } catch (error) {
      console.error("Error cargando talleres:", error);
    } finally {
      setLoadingWorkshops(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { page, limit } = pagination;
      const { search, role, status, workshop_id } = filters; // ← Aquí corregido

      const response = await usersAPI.getUsers({
        page,
        limit,
        search,
        role,
        status,
        workshop_id,
      });

      setUsers(response.data);
      setPagination({
        page: response.pagination.page,
        limit: response.pagination.limit,
        total: response.pagination.total,
      });
    } catch (err) {
      showNotification("Error al cargar los usuarios", "error");
      setError("Error al cargar los usuarios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkshops(); // Se carga solo UNA VEZ al montar
  }, []);

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, filters]);

  const handleRegisterClick = () => navigate("/dashboard/register-user");
  const handlePageChange = (newPage) =>
    setPagination((prev) => ({ ...prev, page: newPage }));

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleEditUser = (id) => navigate(`/dashboard/edit-user/${id}`);

  return (
    <div className={styles.frame}>
      <header className={styles.header}>
        <h2 className={styles.title}>Gestión de Usuarios</h2>
        <button onClick={handleRegisterClick} className={styles.primaryButton}>
          <FiPlus /> Nuevo Usuario
        </button>
      </header>

      <UserFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        availableWorkshops={availableWorkshops}
        styles={styles}
      />

      {loading ? (
        <div className={styles.loadingContainer}>
          <Spinner />
        </div>
      ) : error ? (
        <div className={styles.errorMessage}>{error}</div>
      ) : (
        <>
          <UserTable users={users} onEdit={handleEditUser} styles={styles} />
          <UserPagination
            pagination={pagination}
            onPageChange={handlePageChange}
            styles={styles}
          />
        </>
      )}
    </div>
  );
};

export default UserManagement;
