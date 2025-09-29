import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usersAPI } from "../../../services/user.api";
import { rolesAPI } from "../../../services/roles.api";
import { statusAPI } from "../../../services/status.api";
import Spinner from "../../ui/spinner/LoadingSpinner";
import FormInput from "../../../components/ui/formInput/FormInput";
import ChipSelect from "../../../components/ui/chipSelect/ChipSelect";
import styles from "./editUser.module.css";
import { FiSave, FiArrowLeft } from "react-icons/fi";
import { useNotification } from "../../../contexts/NotificationContext";
import UserListAvatar from "../../ui/userListAvatar/UserListAvatar";

const EditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [statusOptions, setStatusOptions] = useState([]);
  const { showNotification } = useNotification();
  const [formData, setFormData] = useState({
    name: "",
    lastname1: "",
    lastname2: "",
    email: "",
    phone: "",
    identification: "",
    address: "",
    start_date: "",
    photo_reference: "",
    roles: [],
    status_user_id: "",
  });

  const [errors, setErrors] = useState({});

  // Cargar roles disponibles
  const loadRoles = async () => {
    try {
      setLoadingRoles(true);
      const response = await rolesAPI.getRoles();
      setAvailableRoles(response.data || response);
    } catch (error) {
      showNotification("Error al cargar los roles disponibles", "error");
    } finally {
      setLoadingRoles(false);
    }
  };

  // Cargar estados disponibles
  const loadStatusOptions = async () => {
    try {
      setLoadingStatus(true);
      const response = await statusAPI.getStatus();
      const statusData = response.Data || response.data || response;
      setStatusOptions(
        statusData.map((status) => ({
          id: status.id,
          label: status.name,
        }))
      );
    } catch (error) {
      showNotification("Error al cargar los estados disponibles", "error");
    } finally {
      setLoadingStatus(false);
    }
  };

  // Cargar datos iniciales del usuario
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        await loadStatusOptions();
        await loadRoles();

        const [userResponse, rolesResponse] = await Promise.all([
          usersAPI.getProfileById(id),
          rolesAPI.getRoles(),
        ]);

        const userData = userResponse.data || userResponse;
        const rolesData = rolesResponse.data || rolesResponse;

        // Normalizar roles
        const normalizeRoles = (userRoles, allRoles) => {
          if (!userRoles || !allRoles) return [];
          return userRoles
            .map((roleName) => {
              const foundRole = allRoles.find((role) => role.name === roleName);
              return foundRole ? foundRole.id : null;
            })
            .filter((id) => id !== null);
        };

        const userRolesNormalized = normalizeRoles(userData.roles, rolesData);

        // Obtener el status_user_id correctamente
        const initialStatus = userData.status_user?.id?.toString() || "";

        setFormData({
          name: userData.name || "",
          lastname1: userData.lastname1 || "",
          lastname2: userData.lastname2 || "",
          email: userData.email || "",
          phone: userData.phone || "",
          identification: userData.identification || "",
          address: userData.address || "",
          start_date: userData.start_date
            ? new Date(userData.start_date).toISOString().split("T")[0]
            : "",
          photo_reference: userData.photo_reference || null,
          roles: userRolesNormalized,
          status_user_id: initialStatus,
        });
      } catch (err) {
        showNotification("Error al cargar los datos del usuario", "error");
        navigate("/dashboard/user-management");
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [id]);

  // Identificar el rol de administrador
  const adminRole = availableRoles.find((r) => r.name === "Administrador");
  const isAdminSelected = adminRole && formData.roles.includes(adminRole.id);

  // Manejar cambios en los inputs
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  // Manejar cambios en los roles (ChipSelect)
  const handleRolesChange = (selectedIds) => {
    const newSelectedIds = Array.isArray(selectedIds) ? selectedIds : [];
    const wasAdminSelected = formData.roles.includes(adminRole?.id);
    const isNowAdminSelected = newSelectedIds.includes(adminRole?.id);

    // Si seleccionó Administrador (y antes no lo estaba)
    if (isNowAdminSelected && !wasAdminSelected) {
      setFormData((prev) => ({
        ...prev,
        roles: [adminRole.id], // Solo dejamos Administrador
      }));
      return;
    }

    // Si deseleccionó Administrador (y antes lo estaba)
    if (wasAdminSelected && !isNowAdminSelected) {
      setFormData((prev) => ({
        ...prev,
        roles: newSelectedIds,
      }));
      return;
    }

    // Si ya tenía Administrador seleccionado y está intentando agregar otro rol
    if (wasAdminSelected && newSelectedIds.length > 1) {
      return; // No permitimos cambios
    }

    // Caso normal (sin Administrador involucrado)
    setFormData((prev) => ({
      ...prev,
      roles: newSelectedIds,
    }));

    if (errors.roles) {
      setErrors((prev) => ({
        ...prev,
        roles: undefined,
      }));
    }
  };

  // Validación del formulario
  const validateForm = () => {
    const newErrors = {};

    // Campos obligatorios
    const requiredFields = {
      name: "Nombre es obligatorio",
      lastname1: "Primer apellido es obligatorio",
      email: "Email es obligatorio",
      phone: "Teléfono es obligatorio",
      identification: "Identificación es obligatoria",
      address: "Dirección es obligatoria",
      start_date: "Fecha de ingreso es obligatoria",
      status_user_id: "Estado es obligatorio",
    };

    Object.entries(requiredFields).forEach(([field, message]) => {
      if (!formData[field]?.toString().trim()) {
        newErrors[field] = message;
      }
    });

    // Validar roles
    if (formData.roles.length === 0) {
      newErrors.roles = "Debe seleccionar al menos un rol";
    }

    // Validar formatos
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Por favor ingrese un email válido";
    }

    if (formData.phone && !/^\d{8,}$/.test(formData.phone)) {
      newErrors.phone = "El teléfono debe tener al menos 8 dígitos";
    }

    if (
      formData.identification &&
      !/^\d{9,12}$/.test(formData.identification)
    ) {
      newErrors.identification =
        "La identificación debe tener entre 9 y 12 dígitos";
    }
    if (formData.lastname1 && formData.lastname1.length < 3) {
      newErrors.lastname1 = "El primer apellido debe tener al menos 3 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);

      // Preparar datos para el backend
      const dataToSend = {
        name: formData.name,
        lastname1: formData.lastname1,
        lastname2: formData.lastname2 || null,
        email: formData.email,
        phone: formData.phone,
        identification: formData.identification,
        address: formData.address,
        start_date: formData.start_date || null,
        status_user_id: parseInt(formData.status_user_id) || 1,
        roles: formData.roles
          .map((roleId) => {
            const role = availableRoles.find((r) => r.id === roleId);
            return role ? role.id : null;
          })
          .filter((name) => name !== null),
      };

      await usersAPI.updateProfile(id, dataToSend);

      showNotification("Usuario actualizado correctamente", "success");
      navigate("/dashboard/user-management");
    } catch (err) {
      const errorMessage =
        err.response?.data?.errorCode === "DUPLICATE_EMAIL"
          ? "El correo electrónico ya está en uso"
          : err.response?.data?.errorCode === "DUPLICATE_PHONE"
          ? "El teléfono ya está en uso"
          : err.response?.data?.errorCode === "DUPLICATE_IDENTIFICATION"
          ? "La identificación ya está en uso"
          : "Error al actualizar el usuario";

      showNotification(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner fullPage />;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button
          className={styles.backButton}
          onClick={() => navigate("/dashboard/user-management")}
        >
          <FiArrowLeft /> Volver
        </button>
        <h1 className={styles.title}>Editar Usuario</h1>
        {/* Elemento vacío para balancear el grid */}
        <div></div>
      </div>

      <div className={styles.avatarContainer}>
        <UserListAvatar
          id={id}
          name={formData.name}
          lastname={formData.lastname1}
          photoReference={formData.photo_reference}
          size="lg"
        />
      </div>
      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Sección de Información Personal */}
        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>Información Personal</h2>

          <div className={styles.formRow}>
            <FormInput
              label="Nombre*"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              required
              minLength={3}
              placeholder="Ej: Juan Carlos"
              maxLength={75}
            />

            <FormInput
              label="Primer Apellido*"
              name="lastname1"
              value={formData.lastname1}
              onChange={handleChange}
              error={errors.lastname1}
              required
              minLength={3}
              placeholder="Ej: González"
              maxLength={75}
            />

            <FormInput
              label="Segundo Apellido (opcional)"
              name="lastname2"
              value={formData.lastname2}
              onChange={handleChange}
              placeholder="Ej: Rodríguez"
              maxLength={75}
            />
          </div>

          <div className={styles.formRow}>
            <FormInput
              label="Email*"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              required
              placeholder="usuario@empresa.com"
              maxLength={100}
            />

            <FormInput
              label="Teléfono*"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              error={errors.phone}
              required
              placeholder="88889999"
              minLength={8}
              maxLength={8}
            />

            <FormInput
              label="Identificación*"
              name="identification"
              value={formData.identification}
              onChange={handleChange}
              error={errors.identification}
              required
              placeholder="Ej: 123456789"
              minLength={9}
              maxLength={12}
            />
          </div>
        </div>

        {/* Sección de Información Laboral */}
        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>Información Laboral</h2>

          <div className={styles.formRow}>
            <FormInput
              label="Dirección*"
              name="address"
              value={formData.address}
              onChange={handleChange}
              error={errors.address}
              required
              placeholder="Ej: Calle 123, Ciudad"
              maxLength={255}
            />

            <FormInput
              label="Fecha de Ingreso*"
              name="start_date"
              type="date"
              value={formData.start_date}
              onChange={handleChange}
              error={errors.start_date}
              required
            />
          </div>

          <div className={styles.formRow}>
            <div
              className={`${styles.formGroup} ${
                errors.roles ? styles.error : ""
              }`}
            >
              <label>Roles*</label>
              {loadingRoles ? (
                <div>Cargando roles...</div>
              ) : (
                <ChipSelect
                  options={availableRoles.map((role) => ({
                    value: role.id,
                    label: role.name,
                  }))}
                  selected={formData.roles}
                  onChange={handleRolesChange}
                  placeholder="Seleccione roles..."
                  error={errors.roles}
                  isAdminSelected={isAdminSelected}
                />
              )}
              {errors.roles && (
                <div className={styles.errorText}>{errors.roles}</div>
              )}
            </div>

            <div
              className={`${styles.formGroup} ${
                errors.status_user_id ? styles.error : ""
              }`}
            >
              <label>Estado*</label>
              {loadingStatus ? (
                <div>Cargando estados...</div>
              ) : (
                <select
                  name="status_user_id"
                  value={formData.status_user_id}
                  onChange={handleChange}
                  required
                  className={styles.select}
                >
                  <option value="">Seleccione un estado</option>
                  {statusOptions.map((option) => (
                    <option key={option.id} value={option.id.toString()}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}
              {errors.status_user_id && (
                <div className={styles.errorText}>{errors.status_user_id}</div>
              )}
            </div>
          </div>
        </div>

        <div className={styles.formActions}>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => navigate("/dashboard/user-management")}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className={styles.primaryButton}
            disabled={loading}
          >
            <FiSave /> {loading ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditUser;
