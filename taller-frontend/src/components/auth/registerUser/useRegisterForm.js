import { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { rolesAPI } from "../../../services/roles.api";
import { workshopsAPI } from "../../../services/workshops.api";
import { useNotification } from "../../../contexts/NotificationContext";

export const useRegisterForm = () => {
  const { register } = useAuth();
  const { showNotification } = useNotification();
  
  const [formData, setFormData] = useState({
    name: "",
    lastname1: "",
    lastname2: "",
    email: "",
    password_hash: "",
    phone: "",
    identification: "",
    address: "",
    workshop_id: "",
    roles: [],
    start_date: new Date().toISOString().split("T")[0],
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [availableWorkshops, setAvailableWorkshops] = useState([]);
  const [loadingWorkshops, setLoadingWorkshops] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setLoadingRoles(true);
        setLoadingWorkshops(true);
        
        const [roles, workshops] = await Promise.all([
          rolesAPI.getRoles(),
          workshopsAPI.getWorkshops()
        ]);

        if (isMounted) {
          setAvailableRoles(roles);
          setAvailableWorkshops(workshops.data);
        }
      } catch (error) {
        if (isMounted) {
          setErrors(prev => ({
            ...prev,
            roles: "Error al cargar los roles",
            workshop_id: "Error al cargar los talleres"
          }));
          showNotification("No se pudieron cargar los datos necesarios. Por favor, intente recargar la página.", "error");
        }
      } finally {
        if (isMounted) {
          setLoadingRoles(false);
          setLoadingWorkshops(false);
        }
      }
    };

    loadData();
    return () => { isMounted = false };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let sanitizedValue = value;
    
    if (['name', 'lastname1', 'lastname2', 'address'].includes(name)) {
      sanitizedValue = value.replace(/[<>]/g, '');
    }

    setFormData(prev => ({ ...prev, [name]: sanitizedValue }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }

    if (success) setSuccess(false);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Nombre es obligatorio";
    else if (formData.name.length < 3 || formData.name.length > 75) {
      newErrors.name = "Nombre debe tener 3-75 caracteres";
    }

    if (!formData.lastname1.trim()) newErrors.lastname1 = "Primer apellido es obligatorio";
    else if (formData.lastname1.length < 3 || formData.lastname1.length > 75) {
      newErrors.lastname1 = "Apellido debe tener 3-75 caracteres";
    }

    if (!formData.email.trim()) newErrors.email = "Correo es obligatorio";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Correo electrónico inválido";
    }

    if (!formData.password_hash) newErrors.password_hash = "Contraseña es obligatoria";
    else if (formData.password_hash.length < 8 || formData.password_hash.length > 15) {
      newErrors.password_hash = "Debe tener 8-15 caracteres";
    } else if (!/[A-Z]/.test(formData.password_hash)) {
      newErrors.password_hash = "Debe contener al menos una mayúscula";
    } else if (!/[a-z]/.test(formData.password_hash)) {
      newErrors.password_hash = "Debe contener al menos una minúscula";
    } else if (!/[0-9]/.test(formData.password_hash)) {
      newErrors.password_hash = "Debe contener al menos un número";
    } else if (!/[\W_]/.test(formData.password_hash)) {
      newErrors.password_hash = "Debe contener al menos un carácter especial";
    }

    if (!formData.phone.trim()) newErrors.phone = "Teléfono es obligatorio";
    else if (!/^[0-9]{8}$/.test(formData.phone)) {
      newErrors.phone = "Debe tener 8 dígitos numéricos";
    }

    if (!formData.identification.trim()) newErrors.identification = "Identificación es obligatoria";
    else if (formData.identification.length < 9 || formData.identification.length > 12) {
      newErrors.identification = "Debe tener 9-12 caracteres";
    }

    if (!formData.address.trim()) newErrors.address = "Dirección es obligatoria";
    else if (formData.address.length > 255) {
      newErrors.address = "Máximo 255 caracteres permitidos";
    }

    if (!formData.roles || formData.roles.length === 0) {
      newErrors.roles = "Seleccione al menos un rol";
    } else {
      const invalidRoles = formData.roles.filter(
        roleId => !availableRoles.some(role => role.id === roleId)
      );
      if (invalidRoles.length > 0) {
        newErrors.roles = "Contiene roles no válidos";
      }
    }

    const isAdmin = availableRoles.some(
      role => formData.roles.includes(role.id) && role.name === "Administrador"
    );
    
    if (!isAdmin && !formData.workshop_id) {
      newErrors.workshop_id = "Seleccione un taller";
    }

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      showNotification("Por favor, revise los errores en el formulario", "error");
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});
    setSuccess(false);

    try {
      const dataToSend = {
        ...formData,
        lastname2: formData.lastname2.trim() || undefined,
        phone: formData.phone.trim(),
        identification: formData.identification.trim()
      };

      const result = await register(dataToSend);

      if (result.success) {
        setSuccess(true);
        setFormData({
          name: "",
          lastname1: "",
          lastname2: "",
          email: "",
          password_hash: "",
          phone: "",
          identification: "",
          address: "",
          workshop_id: "",
          roles: [],
          start_date: new Date().toISOString().split("T")[0],
        });
      } else {
        handleBackendErrors(result);
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackendErrors = (result) => {
    const ERROR_MESSAGES = {
      DUPLICATE_EMAIL: "El correo electrónico ya está registrado",
      DUPLICATE_PHONE: "El número de teléfono ya está en uso",
      DUPLICATE_IDENTIFICATION: "La identificación ya está registrada",
      INVALID_ROLE: "Rol seleccionado no válido",
      WORKSHOP_REQUIRED: "Debe seleccionar un taller para este rol",
      DEFAULT: "Ocurrió un error al procesar el registro"
    };

    const errorCode = result.errorCode || result.response?.data?.errorCode;
    const errorMessage = ERROR_MESSAGES[errorCode] || ERROR_MESSAGES.DEFAULT;

    showNotification(errorMessage, "error");

    // Mapeo de errores para el formulario
    const errorMapping = {
      DUPLICATE_EMAIL: { field: "email", message: ERROR_MESSAGES.DUPLICATE_EMAIL },
      DUPLICATE_PHONE: { field: "phone", message: ERROR_MESSAGES.DUPLICATE_PHONE },
      DUPLICATE_IDENTIFICATION: { field: "identification", message: ERROR_MESSAGES.DUPLICATE_IDENTIFICATION },
      INVALID_ROLE: { field: "roles", message: ERROR_MESSAGES.INVALID_ROLE },
      WORKSHOP_REQUIRED: { field: "workshop_id", message: ERROR_MESSAGES.WORKSHOP_REQUIRED }
    };

    if (errorCode && errorMapping[errorCode]) {
      setErrors({ [errorMapping[errorCode].field]: errorMapping[errorCode].message });
    } else {
      setErrors({ general: errorMessage });
    }
  };

  const handleApiError = (error) => {
    if (error.response?.data?.errorCode) {
      handleBackendErrors(error.response);
    } else {
      showNotification("Error de conexión con el servidor. Por favor, intente más tarde.", "error");
      setErrors({ general: "Error de conexión. Intente nuevamente." });
    }
  };

  return {
    formData,
    errors,
    loading,
    success,
    availableRoles,
    loadingRoles,
    availableWorkshops,
    loadingWorkshops,
    handleChange,
    handleSubmit,
  };
};