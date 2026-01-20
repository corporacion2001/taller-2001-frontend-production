import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { serviceAPI } from "../../../services/service.api";
import ServiceHeader from "./serviceHeader/ServiceHeader";
import ServiceEditForm from "./serviceEditForm/ServiceEditForm";
import ServicePhotos from "./servicePhotos/ServicePhotos";
import ConfirmationModal from "../../ui/confirmationModal/ConfirmationModal";
import styles from "./serviceDetails.module.css";
import { useNotification } from "../../../contexts/NotificationContext";
import { quoteAPI } from "../../../services/quoteAPI";
import { proformaAPI } from "../../../services/proformaAPI";
import { usersAPI } from "../../../services/user.api";
import LoadingSpinner from "../../ui/spinner/LoadingSpinner";
import { useAuth } from "../../../contexts/AuthContext";
// Helper functions fuera del componente
const formatPrice = (price) => {
  return new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
  }).format(price || 0);
};

const normalizeDate = (dateString) => {
  if (!dateString) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString;
  if (dateString.includes("/")) {
    const [day, month, year] = dateString.split("/");
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }
  return dateString;
};

// Función para comparar arrays de objetos profundamente
const areArraysEqual = (arr1, arr2) => {
  if (arr1.length !== arr2.length) return false;

  return arr1.every((obj1, index) => {
    const obj2 = arr2[index];
    if (!obj2) return false;

    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) return false;

    return keys1.every((key) => {
      // Comparar números y strings de forma segura
      const val1 = obj1[key];
      const val2 = obj2[key];

      if (typeof val1 === "number" && typeof val2 === "number") {
        return val1 === val2;
      }

      return String(val1 || "") === String(val2 || "");
    });
  });
};

const ServiceDetails = () => {
  const { showNotification } = useNotification();
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);
  const { user } = useAuth();

  // Estados para los modales de confirmación
  const [showDeleteServiceModal, setShowDeleteServiceModal] = useState(false);
  const [showDeletePartModal, setShowDeletePartModal] = useState(false);
  const [showDeleteLaborModal, setShowDeleteLaborModal] = useState(false);
  const [showMarkInProcessModal, setShowMarkInProcessModal] = useState(false);
  const [showMarkFinishedModal, setShowMarkFinishedModal] = useState(false);
  const [showMarkDeliveredModal, setShowMarkDeliveredModal] = useState(false);
  const [showQuotePartsModal, setShowQuotePartsModal] = useState(false);
  const [showSendProformaModal, setShowSendProformaModal] = useState(false);
  const [showUnsavedChangesModal, setShowUnsavedChangesModal] = useState(false);
  const [showDeletePaidLaborModal, setShowDeletePaidLaborModal] =
    useState(false);
  const [pendingPaidLaborIndex, setPendingPaidLaborIndex] = useState(null);
  const [pendingPaidLaborId, setPendingPaidLaborId] = useState(null);

  // Estados para almacenar datos temporales de confirmación
  const [pendingPartIndex, setPendingPartIndex] = useState(null);
  const [pendingPartId, setPendingPartId] = useState(null);
  const [pendingLaborIndex, setPendingLaborIndex] = useState(null);
  const [pendingLaborId, setPendingLaborId] = useState(null);
  const [pendingNavigation, setPendingNavigation] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [initialFormData, setInitialFormData] = useState(null);
  const [initialDeliveryData, setInitialDeliveryData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [quoteMessage, setQuoteMessage] = useState("");
  // Estados del formulario
  const [formData, setFormData] = useState({
    parts: [],
    labors: [],
    paidLabors: [],
    end_date: "",
    vehicle_location: "",
    mechanics: [],
    observations: "",
  });

  const [assignmentData, setAssignmentData] = useState({
    user_assigned_id: "",
    area_id: "",
  });

  // Estados para encargados y áreas
  const [encargados, setEncargados] = useState([]);
  const [filteredAreas, setFilteredAreas] = useState([]);
  const [loadingEncargados, setLoadingEncargados] = useState(false);

  const [deliveryData, setDeliveryData] = useState({
    invoice_number: "",
    payment_method: "",
  });

  // Nuevos estados para controlar los botones individualmente
  const [buttonStates, setButtonStates] = useState({
    deleteService: false,
    saveChanges: false,
    markStatus: false,
  });

  // Funciones de cálculo
  const calculatePartsTotal = (parts = formData.parts) => {
    return parts.reduce(
      (total, part) => total + part.amount * parseFloat(part.price),
      0,
    );
  };

  const calculateLaborsTotal = (labors = formData.labors) => {
    return labors.reduce(
      (total, labor) => total + labor.amount * parseFloat(labor.price),
      0,
    );
  };

  const calculatePaidLaborsTotal = (paidLabors = formData.paidLabors) => {
    return paidLabors.reduce(
      (total, paidLabor) => total + parseFloat(paidLabor.price || 0),
      0,
    );
  };

  // MODIFICACIÓN: Función para verificar si hay al menos un repuesto o mano de obra válida
  const hasValidPartsOrLabors = () => {
    const validParts = formData.parts.every(
      (p) => p.amount > 0 && p.name && p.name.trim() !== "",
    );
    const validLabors = formData.labors.every(
      (l) => l.amount > 0 && l.description && l.description.trim() !== "",
    );

    // Al menos uno de los dos grupos debe tener registros válidos
    return (
      (formData.parts.length > 0 && validParts) ||
      (formData.labors.length > 0 && validLabors)
    );
  };

  const hasValidParts = () => {
    const validParts = formData.parts.every(
      (p) => p.amount > 0 && p.name && p.name.trim() !== "",
    );

    // Debe haber al menos un repuesto y que todos sean válidos
    return formData.parts.length > 0 && validParts;
  };

  // MODIFICACIÓN: Función para validar campos requeridos para "En Proceso"
  const isFormCompleteForProcess = () => {
    const baseValidation =
      formData.end_date &&
      formData.vehicle_location?.trim() &&
      formData.mechanics.length > 0 &&
      hasValidPartsOrLabors();

    // NUEVO: Técnico y área son OBLIGATORIOS para marcar como "En Proceso"
    const assignmentValid =
      assignmentData.user_assigned_id && assignmentData.area_id;

    return baseValidation && assignmentValid;
  };

  // MODIFICACIÓN: Función para validar campos requeridos para "Entregado"
  const isFormCompleteForDelivered = () => {
    return (
      deliveryData.invoice_number?.trim() &&
      deliveryData.payment_method?.trim() &&
      hasValidPartsOrLabors() // MODIFICADO: usa la nueva función
    );
  };

  useEffect(() => {
    // Verificar si hay una notificación pendiente en sessionStorage
    const pendingNotification = sessionStorage.getItem("pendingNotification");
    if (pendingNotification) {
      const notification = JSON.parse(pendingNotification);
      showNotification(notification.message, notification.type);
      // Limpiar después de mostrar
      sessionStorage.removeItem("pendingNotification");
    }
  }, [showNotification]);

  // Función mejorada para detectar cambios
  const hasFormChanges = () => {
    if (!initialFormData || !initialDeliveryData) return false;

    // Verificar cambios en formData básico
    const basicFormChanges =
      formData.end_date !== initialFormData.end_date ||
      formData.vehicle_location !== initialFormData.vehicle_location ||
      formData.observations !== initialFormData.observations ||
      formData.iva !== initialFormData.iva ||
      formData.discount !== initialFormData.discount ||
      JSON.stringify(formData.mechanics) !==
        JSON.stringify(initialFormData.mechanics);

    // Verificar cambios en asignación de técnico
    const initialAssignedId = service?.assigned_to?.id || "";
    const initialAreaId = service?.area?.id || "";
    const assignmentChanged =
      assignmentData.user_assigned_id !== initialAssignedId ||
      assignmentData.area_id !== initialAreaId;

    // Verificar cambios en partes (repuestos) - COMPARACIÓN PROFUNDA
    const partsChanged = !areArraysEqual(formData.parts, initialFormData.parts);

    // Verificar cambios en mano de obra - COMPARACIÓN PROFUNDA
    const laborsChanged = !areArraysEqual(
      formData.labors,
      initialFormData.labors,
    );

    const paidLaborsChanged = !areArraysEqual(
      formData.paidLabors,
      initialFormData.paidLabors,
    );

    // Verificar cambios en datos de entrega (para servicios Finalizados)
    const deliveryDataChanged =
      deliveryData.invoice_number !== initialDeliveryData.invoice_number ||
      deliveryData.payment_method !== initialDeliveryData.payment_method;

    return (
      basicFormChanges ||
      partsChanged ||
      laborsChanged ||
      paidLaborsChanged ||
      deliveryDataChanged ||
      assignmentChanged
    );
  };

  // Efecto para detectar cambios no guardados
  useEffect(() => {
    if (initialFormData && initialDeliveryData && !isSaving) {
      const changesDetected = hasFormChanges();
      setHasUnsavedChanges(changesDetected);
    }
  }, [
    formData,
    deliveryData,
    assignmentData,
    initialFormData,
    initialDeliveryData,
    isSaving,
  ]);

  // Manejar navegación con confirmación
  const handleNavigation = (navigationAction) => {
    if (hasUnsavedChanges && !isSaving) {
      setPendingNavigation(() => navigationAction);
      setShowUnsavedChangesModal(true);
    } else {
      navigationAction();
    }
  };

  const handleConfirmNavigation = () => {
    setShowUnsavedChangesModal(false);
    setHasUnsavedChanges(false);
    if (pendingNavigation) {
      pendingNavigation();
    }
    setPendingNavigation(null);
  };

  const handleCancelNavigation = () => {
    setShowUnsavedChangesModal(false);
    setPendingNavigation(null);
  };

  // Efecto para manejar el evento beforeunload y navegación del navegador
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (hasUnsavedChanges && !isSaving) {
        event.preventDefault();
        event.returnValue =
          "Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?";
        return "Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?";
      }
    };

    // Manejar el botón de retroceso/avance del navegador
    const handlePopState = (event) => {
      if (hasUnsavedChanges && !isSaving) {
        event.preventDefault();
        setPendingNavigation(() => () => window.history.go(-1));
        setShowUnsavedChangesModal(true);

        // Revertir el cambio de historia
        window.history.pushState(null, "", window.location.href);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);

    // Configurar el estado inicial del historial
    window.history.pushState(null, "", window.location.href);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [hasUnsavedChanges, isSaving]);

  // Función para navegar de forma segura
  const safeNavigate = (path) => {
    handleNavigation(() => navigate(path));
  };

  // Función para retroceder de forma segura
  const safeGoBack = () => {
    handleNavigation(() => navigate(-1));
  };

  const handleDeleteService = async () => {
    setShowDeleteServiceModal(true);
  };

  const handleConfirmDeleteService = async () => {
    setShowDeleteServiceModal(false);
    setButtonStates({
      deleteService: true,
      saveChanges: false,
      markStatus: false,
    });
    setLoading(true);
    setError(null);

    try {
      const response = await serviceAPI.deleteService(serviceId);
      if (!response.success) {
        throw new Error(response.data.message, "Error al eliminar el servicio");
      }

      showNotification("Servicio eliminado correctamente", "success");
      navigate("/dashboard/gestion/servicios");
    } catch (err) {
      setError(err.message, "Error al eliminar el servicio");
      showNotification("Error al eliminar el servicio", "error");
    } finally {
      setLoading(false);
      setButtonStates({
        deleteService: false,
        saveChanges: false,
        markStatus: false,
      });
    }
  };

  const handleQuoteParts = async (message) => {
    if (!hasValidParts()) {
      showNotification(
        "Debe agregar al menos un repuesto válido para cotizar",
        "warning",
      );
      return;
    }
    // Guardar el mensaje para usarlo en la confirmación
    setQuoteMessage(message);
    setShowQuotePartsModal(true);
  };

  const handleConfirmQuoteParts = async () => {
    setShowQuotePartsModal(false);
    setActionLoading(true);
    setActionError(null);

    try {
      const quoteData = {
        order_number: service.order_number,
        workshop_name: service.workshop.name,
        vehicle_plate: service.vehicle.plate,
        vehicle_brand: service.vehicle.brand,
        vehicle_model: service.vehicle.model,
        vehicle_year: service.vehicle.year,
        sender_name: `${user.name} ${user.lastname1} ${user.lastname2}`,
        sender_email: user.email,
        message: quoteMessage, // Usar el mensaje del estado
        parts: formData.parts
          .filter(
            (part) => part.name?.trim() && part.amount > 0 && part.price >= 0,
          )
          .map((part) => ({
            name: part.name,
            quantity: part.amount,
          })),
      };

      const result = await quoteAPI.sendQuoteRequest(quoteData);

      if (result.success) {
        showNotification("Cotización enviada exitosamente.", "success");
        setQuoteMessage(""); // Limpiar el mensaje después de enviar
      } else {
        throw new Error(result.message || "Error al enviar cotización");
      }
    } catch (err) {
      setActionError(err.message || "Error al enviar cotización");
      showNotification("Error al enviar cotización.", "error");
      console.error("Error al cotizar repuestos:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendProforma = async () => {
    if (!hasValidPartsOrLabors()) {
      // MODIFICADO: usa la nueva función
      showNotification(
        "Debe agregar al menos un repuesto o mano de obra válida para enviar la proforma",
        "warning",
      );
      return;
    }

    if (!service.client.email) {
      showNotification("El cliente no tiene email registrado.", "error");
      return;
    }

    setShowSendProformaModal(true);
  };

  const handleConfirmSendProforma = async () => {
    setShowSendProformaModal(false);
    setActionLoading(true);
    setActionError(null);

    try {
      const validParts = formData.parts.filter(
        (part) => part.name && part.amount && part.price !== undefined,
      );

      const validLabors = formData.labors.filter(
        (labor) =>
          labor.description && labor.amount && labor.price !== undefined,
      );

      if (validParts.length === 0 && validLabors.length === 0) {
        throw new Error(
          "Los repuestos y servicios deben tener precios asignados para enviar la proforma.",
        );
      }

      const proformaData = {
        order_number: service.order_number,
        workshop_name: service.workshop.name,
        client_name: service.client.name,
        client_lastname1: service.client.lastname1,
        client_lastname2: service.client.lastname2 || "",
        client_identification: service.client.identification,
        client_phone: service.client.phone,
        client_email: service.client.email,
        vehicle_plate: service.vehicle.plate,
        vehicle_brand: service.vehicle.brand,
        vehicle_model: service.vehicle.model,
        vehicle_year: service.vehicle.year,
        parts: validParts.map((part) => ({
          name: part.name,
          amount: part.amount || 1,
          price: part.price || "0.00",
          subtotal: (parseFloat(part.price || 0) * (part.amount || 1)).toFixed(
            2,
          ),
        })),
        labors: validLabors.map((labor) => ({
          description: labor.description,
          amount: labor.amount || 1,
          price: labor.price || "0.00",
          subtotal: (
            parseFloat(labor.price || 0) * (labor.amount || 1)
          ).toFixed(2),
        })),
        total_price: formatPrice(
          calculatePartsTotal() + calculateLaborsTotal(),
        ),
      };

      const result = await proformaAPI.sendProformaToClient(proformaData);

      if (result.success) {
        showNotification(
          `Proforma enviada exitosamente a ${service.client.email}`,
          "success",
        );
      } else {
        throw new Error(result.message || "Error al enviar proforma");
      }
    } catch (err) {
      setActionError(err.message || "Error al enviar proforma");
      showNotification("Error al enviar proforma al cliente.", "error");
      console.error("Error al enviar proforma:", err);
    } finally {
      setActionLoading(false);
    }
  };

  // Efecto para cargar datos
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (
          !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
            serviceId,
          )
        ) {
          throw new Error("ID de servicio inválido");
        }

        const [serviceResponse, photosResponse] = await Promise.all([
          serviceAPI.getServiceById(serviceId),
          serviceAPI.getServicePhotos(serviceId),
        ]);

        if (!serviceResponse.data.success) {
          throw new Error(
            serviceResponse.data.message || "Error al obtener el servicio",
          );
        }

        const serviceData = serviceResponse.data.data;
        setService(serviceData);

        // Cargar encargados del taller
        if (serviceData.workshop?.id) {
          await loadEncargados(serviceData.workshop.id);
        }

        const initialData = {
          parts: serviceData.parts || [],
          labors: serviceData.labors || [],
          paidLabors: serviceData.paid_labors || [],
          end_date: serviceData.end_date || "",
          vehicle_location: serviceData.vehicle_location || "",
          mechanics: serviceData.mechanics || [],
          observations: serviceData.observations || "",
          iva: serviceData.iva,
          discount: serviceData.discount || 0,
        };

        const initialAssignment = {
          user_assigned_id: serviceData.assigned_to?.id || "",
          area_id: serviceData.area?.id || "",
        };

        const initialDelivery = {
          invoice_number: serviceData.invoice_number || "",
          payment_method: serviceData.payment_method || "",
        };

        setFormData(initialData);
        setInitialFormData(JSON.parse(JSON.stringify(initialData))); // Deep copy
        setDeliveryData(initialDelivery);
        setInitialDeliveryData(JSON.parse(JSON.stringify(initialDelivery))); // Deep copy
        setAssignmentData(initialAssignment);

        setPhotos(photosResponse.data.data || []);
      } catch (err) {
        setError(err.message || "Error al cargar los datos del servicio");
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [serviceId]);

  // Handlers de UI
  const openImageModal = (imageUrl) => setSelectedImage(imageUrl);
  const closeImageModal = () => setSelectedImage(null);

  // Handlers del formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const loadEncargados = async (workshopId) => {
    if (!workshopId) {
      setEncargados([]);
      return;
    }

    try {
      setLoadingEncargados(true);
      const response = await usersAPI.getEncargados(workshopId);

      if (response.success) {
        setEncargados(response.data || []);
      } else {
        throw new Error(response.message || "Error al obtener técnicos");
      }
    } catch (error) {
      console.error("Error cargando técnicos:", error);
      setEncargados([]);
    } finally {
      setLoadingEncargados(false);
    }
  };

  const handlePartChange = (index, field, value) => {
    const updatedParts = [...formData.parts];
    updatedParts[index] = {
      ...updatedParts[index],
      [field]:
        field === "amount" || field === "price"
          ? parseFloat(value) || 0
          : value,
    };
    setFormData((prev) => ({ ...prev, parts: updatedParts }));
  };

  const handleLaborChange = (index, field, value) => {
    const updatedLabors = [...formData.labors];
    updatedLabors[index] = {
      ...updatedLabors[index],
      [field]:
        field === "amount" || field === "price"
          ? parseFloat(value) || 0
          : value,
    };
    setFormData((prev) => ({ ...prev, labors: updatedLabors }));
  };

  const addNewPart = () => {
    setFormData((prev) => ({
      ...prev,
      parts: [
        ...prev.parts,
        { name: "", amount: 1, price: 0, invoice_number: "" },
      ],
    }));
  };

  const addNewLabor = () => {
    setFormData((prev) => ({
      ...prev,
      labors: [...prev.labors, { description: "", amount: 1, price: 0 }],
    }));
  };

  const removePart = async (index, partId) => {
    if (partId) {
      setPendingPartIndex(index);
      setPendingPartId(partId);
      setShowDeletePartModal(true);
    } else {
      setFormData((prev) => ({
        ...prev,
        parts: prev.parts.filter((_, i) => i !== index),
      }));
    }
  };

  const handleConfirmDeletePart = async () => {
    setShowDeletePartModal(false);
    setActionLoading(true);

    try {
      // 1. Eliminar el part del backend
      await serviceAPI.deletePart(pendingPartId);

      // 2. Actualizar el estado local eliminando el repuesto
      const updatedParts = formData.parts.filter(
        (_, i) => i !== pendingPartIndex,
      );

      setFormData((prev) => ({
        ...prev,
        parts: updatedParts,
      }));

      const payload = {
        parts: updatedParts.map((part) => ({
          id: part.id || undefined,
          amount: part.amount,
          name: part.name,
          price: parseFloat(part.price),
          invoice_number: part.invoice_number || "",
        })),
      };
      //Para que sea actualice el total_price
      const response = await serviceAPI.updateService(serviceId, payload);

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Error al actualizar el servicio",
        );
      }

      // 6. Actualizar los datos iniciales
      setInitialFormData(
        JSON.parse(
          JSON.stringify({
            ...formData,
            parts: updatedParts,
          }),
        ),
      );
      setHasUnsavedChanges(false);

      showNotification("Repuesto eliminado correctamente", "success");

      // 7. Recargar el servicio para obtener los datos actualizados
      const serviceResponse = await serviceAPI.getServiceById(serviceId);
      if (serviceResponse.data.success) {
        setService(serviceResponse.data.data);
      }
    } catch (err) {
      setActionError(err.message || "Error al eliminar el repuesto");
      showNotification("Error al eliminar el repuesto", "error");
    } finally {
      setActionLoading(false);
      setPendingPartIndex(null);
      setPendingPartId(null);
    }
  };

  const removeLabor = async (index, laborId) => {
    if (laborId) {
      setPendingLaborIndex(index);
      setPendingLaborId(laborId);
      setShowDeleteLaborModal(true);
    } else {
      setFormData((prev) => ({
        ...prev,
        labors: prev.labors.filter((_, i) => i !== index),
      }));
    }
  };

  const handleConfirmDeleteLabor = async () => {
    setShowDeleteLaborModal(false);
    setActionLoading(true);

    try {
      // 1. Eliminar el labor del backend
      await serviceAPI.deleteLabor(pendingLaborId);

      // 2. Actualizar el estado local eliminando la mano de obra
      const updatedLabors = formData.labors.filter(
        (_, i) => i !== pendingLaborIndex,
      );

      setFormData((prev) => ({
        ...prev,
        labors: updatedLabors,
      }));

      const payload = {
        labors: updatedLabors.map((labor) => ({
          id: labor.id || undefined,
          amount: labor.amount,
          description: labor.description,
          price: parseFloat(labor.price),
        })),
      };

      const response = await serviceAPI.updateService(serviceId, payload);

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Error al actualizar el servicio",
        );
      }

      // 6. Actualizar los datos iniciales
      setInitialFormData(
        JSON.parse(
          JSON.stringify({
            ...formData,
            labors: updatedLabors,
          }),
        ),
      );
      setHasUnsavedChanges(false);

      showNotification("Mano de obra eliminada correctamente", "success");

      // 7. Recargar el servicio para obtener los datos actualizados
      const serviceResponse = await serviceAPI.getServiceById(serviceId);
      if (serviceResponse.data.success) {
        setService(serviceResponse.data.data);
      }
    } catch (err) {
      setActionError(err.message || "Error al eliminar la mano de obra");
      showNotification("Error al eliminar la mano de obra", "error");
    } finally {
      setActionLoading(false);
      setPendingLaborIndex(null);
      setPendingLaborId(null);
    }
  };

  // AGREGAR: Handlers para PaidLabors
  const handlePaidLaborChange = (index, field, value) => {
    const updatedPaidLabors = [...formData.paidLabors];
    updatedPaidLabors[index] = {
      ...updatedPaidLabors[index],
      [field]: field === "price" ? parseFloat(value) || 0 : value,
    };
    setFormData((prev) => ({ ...prev, paidLabors: updatedPaidLabors }));
  };

  const addNewPaidLabor = () => {
    setFormData((prev) => ({
      ...prev,
      paidLabors: [...prev.paidLabors, { description: "", price: 0 }],
    }));
  };

  const removePaidLabor = async (index, paidLaborId) => {
    if (paidLaborId) {
      setPendingPaidLaborIndex(index);
      setPendingPaidLaborId(paidLaborId);
      setShowDeletePaidLaborModal(true);
    } else {
      setFormData((prev) => ({
        ...prev,
        paidLabors: prev.paidLabors.filter((_, i) => i !== index),
      }));
    }
  };

  const handleConfirmDeletePaidLabor = async () => {
    setShowDeletePaidLaborModal(false);
    setActionLoading(true);

    try {
      // 1. Eliminar el paidLabor del backend
      await serviceAPI.deletePaidLabor(pendingPaidLaborId);

      // 2. Actualizar el estado local eliminando la labor pagada
      const updatedPaidLabors = formData.paidLabors.filter(
        (_, i) => i !== pendingPaidLaborIndex,
      );

      setFormData((prev) => ({
        ...prev,
        paidLabors: updatedPaidLabors,
      }));

      // Actualizar los datos iniciales
      setInitialFormData(
        JSON.parse(
          JSON.stringify({
            ...formData,
            paidLabors: updatedPaidLabors,
          }),
        ),
      );
      setHasUnsavedChanges(false);

      showNotification(
        "Mano de obra pagada eliminada correctamente",
        "success",
      );

      // Recargar el servicio para obtener los datos actualizados
      const serviceResponse = await serviceAPI.getServiceById(serviceId);
      if (serviceResponse.data.success) {
        setService(serviceResponse.data.data);
      }
    } catch (err) {
      setActionError(err.message || "Error al eliminar la mano de obra pagada");
      showNotification("Error al eliminar la mano de obra pagada", "error");
    } finally {
      setActionLoading(false);
      setPendingPaidLaborIndex(null);
      setPendingPaidLaborId(null);
    }
  };

  const handleMechanicsChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      mechanics: e.target.value
        .split(",")
        .map((m) => m.trim())
        .filter((m) => m),
    }));
  };

  const handleDeliveryDataChange = (e) => {
    const { name, value } = e.target;
    setDeliveryData((prev) => ({ ...prev, [name]: value }));
  };

  // MODIFICACIÓN: Handler para Guardar Cambios (sin validación de campos requeridos)
  const handleSaveChanges = async (e) => {
    e.preventDefault();
    if (!hasFormChanges()) {
      showNotification("No hay cambios que guardar", "info");
      return;
    }

    // Validar que si hay técnico asignado, también haya área
    if (assignmentData.user_assigned_id && !assignmentData.area_id) {
      showNotification(
        "Debe seleccionar un área para el encargado asignado",
        "warning",
      );
      return;
    }

    // Validar que el descuento no sea mayor al subtotal
    const currentSubtotal = calculatePartsTotal() + calculateLaborsTotal();
    const requestedDiscount = parseFloat(formData.discount || 0);

    if (requestedDiscount > currentSubtotal) {
      showNotification(
        "El descuento no puede ser mayor que el subtotal",
        "error",
      );
      return;
    }

    setIsSaving(true);
    setButtonStates({
      deleteService: false,
      saveChanges: true,
      markStatus: false,
    });
    setActionLoading(true);
    setActionError(null);

    try {
      const payload = {
        end_date: formData.end_date ? normalizeDate(formData.end_date) : null,
        vehicle_location: formData.vehicle_location,
        mechanics: formData.mechanics,
        observations: formData.observations,
        iva: parseFloat(formData.iva),
        discount: parseFloat(formData.discount || 0),
        invoice_number: deliveryData.invoice_number || null,
        payment_method: deliveryData.payment_method || null,
        user_assigned_id: assignmentData.user_assigned_id || null, // NUEVO
        area_id: assignmentData.area_id || null, // NUEVO
        parts: formData.parts.map((part) => ({
          id: part.id || undefined,
          amount: part.amount,
          name: part.name,
          price: parseFloat(part.price),
          invoice_number: part.invoice_number || "",
        })),
        labors: formData.labors.map((labor) => ({
          id: labor.id || undefined,
          amount: labor.amount,
          description: labor.description,
          price: parseFloat(labor.price),
        })),
        paidLabors: formData.paidLabors.map((paidLabor) => ({
          id: paidLabor.id || undefined,
          description: paidLabor.description,
          price: parseFloat(paidLabor.price),
        })),
      };

      const totalPrice = calculatePartsTotal() + calculateLaborsTotal();
      payload.total_price = totalPrice;

      const response = await serviceAPI.updateService(serviceId, payload);

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Error al actualizar el servicio",
        );
      }

      // Actualizar los datos iniciales después de guardar
      setInitialFormData(JSON.parse(JSON.stringify(formData)));
      setInitialDeliveryData(JSON.parse(JSON.stringify(deliveryData)));
      setHasUnsavedChanges(false);

      sessionStorage.setItem(
        "pendingNotification",
        JSON.stringify({
          message: "Servicio actualizado correctamente",
          type: "success",
        }),
      );

      // Recargar la página después de guardar
      window.location.reload();
    } catch (err) {
      setActionError(err.message || "Error al guardar los cambios");
      showNotification("Error al actualizar el servicio", "error");
      setButtonStates({
        deleteService: false,
        saveChanges: false,
        markStatus: false,
      });
      setActionLoading(false);
      setIsSaving(false);
    }
  };

  // MODIFICACIÓN: Handler para Marcar como En Proceso con validaciones específicas
  const handleMarkInProcess = async () => {
    const missingFields = [];

    if (!formData.end_date)
      missingFields.push("Fecha estimada de finalización");
    if (!formData.vehicle_location?.trim())
      missingFields.push("Ubicación del vehículo");
    if (!formData.mechanics?.length) missingFields.push("Mecánicos asignados");
    if (!hasValidPartsOrLabors()) {
      missingFields.push("al menos un repuesto o mano de obra completo");
    }

    // NUEVA VALIDACIÓN: Técnico y área son OBLIGATORIOS
    if (!assignmentData.user_assigned_id) {
      missingFields.push("encargado taller asignado");
    }
    if (!assignmentData.area_id) {
      missingFields.push("área del encargado");
    }

    if (missingFields.length > 0) {
      setActionError(
        `Debe completar los siguientes campos: ${missingFields.join(", ")}`,
      );
      showNotification(
        `Complete los campos requeridos: ${missingFields.join(", ")}`,
        "warning",
      );
      return;
    }

    if (service.status_service.name !== "Pendiente") {
      setActionError(
        "Solo se pueden marcar como 'En proceso' servicios pendientes",
      );
      showNotification(
        "Solo se pueden marcar como 'En proceso' servicios pendientes",
        "warning",
      );
      return;
    }

    setShowMarkInProcessModal(true);
  };

  const handleConfirmMarkInProcess = async () => {
    setIsSaving(true);
    setShowMarkInProcessModal(false);
    setButtonStates({
      deleteService: false,
      saveChanges: false,
      markStatus: true,
    });
    setActionLoading(true);
    setActionError(null);

    // Validar que si hay técnico asignado, también haya área
    if (assignmentData.user_assigned_id && !assignmentData.area_id) {
      showNotification(
        "Debe seleccionar un área para el encargado asignado",
        "warning",
      );
      return;
    }

    try {
      // Primero guardar los cambios
      const updatePayload = {
        end_date: normalizeDate(formData.end_date),
        vehicle_location: formData.vehicle_location,
        mechanics: formData.mechanics,
        observations: formData.observations,
        iva: parseFloat(formData.iva),
        discount: parseFloat(formData.discount || 0),
        user_assigned_id: assignmentData.user_assigned_id || null,
        area_id: assignmentData.area_id || null,
        parts: formData.parts.map((part) => ({
          id: part.id || undefined,
          amount: part.amount,
          name: part.name,
          price: parseFloat(part.price),
          invoice_number: part.invoice_number || "",
        })),
        labors: formData.labors.map((labor) => ({
          id: labor.id || undefined,
          amount: labor.amount,
          description: labor.description,
          price: parseFloat(labor.price),
        })),
        paidLabors: formData.paidLabors.map((paidLabor) => ({
          id: paidLabor.id || undefined,
          description: paidLabor.description,
          price: parseFloat(paidLabor.price),
        })),
      };

      updatePayload.total_price =
        calculatePartsTotal() + calculateLaborsTotal();

      const updateResponse = await serviceAPI.updateService(
        serviceId,
        updatePayload,
      );
      if (!updateResponse.data.success) {
        throw new Error(
          updateResponse.data.message || "Error al actualizar el servicio",
        );
      }

      // Luego cambiar el estado
      const markResponse = await serviceAPI.markServiceInProcess(serviceId);
      if (!markResponse.data.success) {
        throw new Error(
          markResponse.data.message || "Error al cambiar el estado",
        );
      }

      setHasUnsavedChanges(false);

      sessionStorage.setItem(
        "pendingNotification",
        JSON.stringify({
          message:
            "Servicio actualizado y marcado como 'En proceso' correctamente",
          type: "success",
        }),
      );

      window.location.reload();
    } catch (err) {
      setActionError(err.message || "Error en el proceso");
      showNotification("Error al marcar como 'En proceso'", "error");
      console.error("Error en handleMarkInProcess:", err);
      setButtonStates({
        deleteService: false,
        saveChanges: false,
        markStatus: false,
      });
      setActionLoading(false);
    }
  };

  // MODIFICACIÓN: Handler para Marcar como Finalizado con validación de repuestos/mano de obra
  const handleMarkFinished = async () => {
    setIsSaving(true);
    if (!hasValidPartsOrLabors()) {
      setActionError("Debe agregar al menos un repuesto o mano de obra válida");
      showNotification(
        "Debe agregar al menos un repuesto o mano de obra válida para finalizar el servicio",
        "warning",
      );
      return;
    }

    if (service.status_service.name !== "En proceso") {
      setActionError(
        "Solo se pueden marcar como 'Finalizado' servicios en proceso",
      );
      showNotification(
        "Solo se pueden marcar como 'Finalizado' servicios en proceso",
        "warning",
      );
      return;
    }

    setShowMarkFinishedModal(true);
  };

  const handleConfirmMarkFinished = async () => {
    setIsSaving(true);
    setShowMarkFinishedModal(false);
    setButtonStates({
      deleteService: false,
      saveChanges: false,
      markStatus: true,
    });
    setActionLoading(true);
    setActionError(null);

    try {
      // Primero guardar los cambios
      const updatePayload = {
        end_date: normalizeDate(formData.end_date),
        vehicle_location: formData.vehicle_location,
        mechanics: formData.mechanics,
        observations: formData.observations,
        iva: parseFloat(formData.iva),
        discount: parseFloat(formData.discount || 0),
        parts: formData.parts.map((part) => ({
          id: part.id || undefined,
          amount: part.amount,
          name: part.name,
          price: parseFloat(part.price),
          invoice_number: part.invoice_number || "",
        })),
        labors: formData.labors.map((labor) => ({
          id: labor.id || undefined,
          amount: labor.amount,
          description: labor.description,
          price: parseFloat(labor.price),
        })),
        paidLabors: formData.paidLabors.map((paidLabor) => ({
          id: paidLabor.id || undefined,
          description: paidLabor.description,
          price: parseFloat(paidLabor.price),
        })),
      };

      updatePayload.total_price =
        calculatePartsTotal() + calculateLaborsTotal();

      const updateResponse = await serviceAPI.updateService(
        serviceId,
        updatePayload,
      );
      if (!updateResponse.data.success) {
        throw new Error(
          updateResponse.data.message || "Error al guardar cambios",
        );
      }

      // Luego cambiar el estado
      const markResponse = await serviceAPI.markServiceFinished(serviceId);
      if (!markResponse.data.success) {
        throw new Error(
          markResponse.data.message || "Error al cambiar el estado",
        );
      }

      setHasUnsavedChanges(false);

      sessionStorage.setItem(
        "pendingNotification",
        JSON.stringify({
          message:
            "Servicio actualizado y marcado como 'Finalizado' correctamente",
          type: "success",
        }),
      );

      window.location.reload();
    } catch (err) {
      setActionError(err.message || "Error en el proceso");
      showNotification("Error al marcar como 'Finalizado'", "error");
      console.error("Error en handleMarkFinished:", err);
      setButtonStates({
        deleteService: false,
        saveChanges: false,
        markStatus: false,
      });
      setActionLoading(false);
    }
  };

  // MODIFICACIÓN: Handler para Marcar como Entregado con validaciones específicas
  const handleMarkDelivered = async () => {
    setIsSaving(true);
    const missingFields = [];

    if (!deliveryData.invoice_number?.trim())
      missingFields.push("Número de Factura");
    if (!deliveryData.payment_method?.trim())
      missingFields.push("Método de Pago");
    if (!hasValidPartsOrLabors()) {
      missingFields.push("al menos un repuesto o mano de obra completo");
    }

    if (missingFields.length > 0) {
      setActionError(
        `Debe completar los siguientes campos: ${missingFields.join(", ")}`,
      );
      showNotification(
        `Complete los campos requeridos: ${missingFields.join(", ")}`,
        "warning",
      );
      return;
    }

    if (service.status_service.name !== "Finalizado") {
      setActionError(
        "Solo se pueden marcar como 'Entregado' servicios finalizados",
      );
      showNotification(
        "Solo se pueden marcar como 'Entregado' servicios finalizados",
        "warning",
      );
      return;
    }

    setShowMarkDeliveredModal(true);
  };

  const handleConfirmMarkDelivered = async () => {
    setShowMarkDeliveredModal(false);
    setButtonStates({
      deleteService: false,
      saveChanges: false,
      markStatus: true,
    });
    setActionLoading(true);
    setActionError(null);

    try {
      // Primero guardar los cambios
      const updatePayload = {
        end_date: normalizeDate(formData.end_date),
        vehicle_location: formData.vehicle_location,
        mechanics: formData.mechanics,
        observations: formData.observations,
        iva: parseFloat(formData.iva),
        discount: parseFloat(formData.discount || 0),
        parts: formData.parts.map((part) => ({
          id: part.id || undefined,
          amount: part.amount,
          name: part.name,
          price: parseFloat(part.price),
          invoice_number: part.invoice_number || "",
        })),
        labors: formData.labors.map((labor) => ({
          id: labor.id || undefined,
          amount: labor.amount,
          description: labor.description,
          price: parseFloat(labor.price),
        })),
        paidLabors: formData.paidLabors.map((paidLabor) => ({
          id: paidLabor.id || undefined,
          description: paidLabor.description,
          price: parseFloat(paidLabor.price),
        })),
        invoice_number: deliveryData.invoice_number,
        payment_method: deliveryData.payment_method,
        total_price: calculatePartsTotal() + calculateLaborsTotal(),
      };

      const updateResponse = await serviceAPI.updateService(
        serviceId,
        updatePayload,
      );
      if (!updateResponse.data.success) {
        throw new Error(
          updateResponse.data.message || "Error al guardar cambios",
        );
      }

      // Luego cambiar el estado
      const markResponse = await serviceAPI.markServiceDelivered(serviceId, {
        invoice_number: deliveryData.invoice_number,
        payment_method: deliveryData.payment_method,
      });

      if (!markResponse.data.success) {
        throw new Error(
          markResponse.data.message || "Error al cambiar el estado",
        );
      }

      setHasUnsavedChanges(false);

      sessionStorage.setItem(
        "pendingNotification",
        JSON.stringify({
          message:
            "Servicio actualizado y marcado como 'Entregado' correctamente",
          type: "success",
        }),
      );

      window.location.reload();
    } catch (err) {
      setActionError(err.message || "Error al entregar el servicio");
      showNotification("Error al marcar como 'Entregado'", "error");
      console.error("Error en handleMarkDelivered:", err);
      setButtonStates({
        deleteService: false,
        saveChanges: false,
        markStatus: false,
      });
      setActionLoading(false);
    }
  };
  // Estados de carga y error
  if (loading) {
    return (
      <div className={styles.loading}>
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <h2>Error</h2>
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className={styles.retryButton}
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!service) {
    return (
      <div className={styles.notFound}>
        <h2>Servicio no encontrado</h2>
        <p>No se encontró el servicio con ID: {serviceId}</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Modales de confirmación */}
      <ConfirmationModal
        isOpen={showDeleteServiceModal}
        onClose={() => setShowDeleteServiceModal(false)}
        onConfirm={handleConfirmDeleteService}
        title="¿Eliminar servicio?"
        message="¿Está seguro de que desea eliminar este servicio? Esta acción no se puede deshacer."
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
      />

      <ConfirmationModal
        isOpen={showDeletePartModal}
        onClose={() => setShowDeletePartModal(false)}
        onConfirm={handleConfirmDeletePart}
        title="¿Eliminar repuesto?"
        message="¿Está seguro de que desea eliminar este repuesto?"
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
      />

      <ConfirmationModal
        isOpen={showDeleteLaborModal}
        onClose={() => setShowDeleteLaborModal(false)}
        onConfirm={handleConfirmDeleteLabor}
        title="¿Eliminar mano de obra?"
        message="¿Está seguro de que desea eliminar esta mano de obra?"
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
      />

      <ConfirmationModal
        isOpen={showDeletePaidLaborModal}
        onClose={() => setShowDeletePaidLaborModal(false)}
        onConfirm={handleConfirmDeletePaidLabor}
        title="¿Eliminar mano de obra pagada?"
        message="¿Está seguro de que desea eliminar esta mano de obra pagada?"
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
      />

      <ConfirmationModal
        isOpen={showMarkInProcessModal}
        onClose={() => setShowMarkInProcessModal(false)}
        onConfirm={handleConfirmMarkInProcess}
        title="¿Marcar como 'En proceso'?"
        message="¿Estás seguro de marcar este servicio como 'En proceso'?"
        confirmText="Sí, marcar"
        cancelText="Cancelar"
      />

      <ConfirmationModal
        isOpen={showMarkFinishedModal}
        onClose={() => setShowMarkFinishedModal(false)}
        onConfirm={handleConfirmMarkFinished}
        title="¿Marcar como 'Finalizado'?"
        message="¿Estás seguro de marcar este servicio como 'Finalizado'?"
        confirmText="Sí, marcar"
        cancelText="Cancelar"
      />

      <ConfirmationModal
        isOpen={showMarkDeliveredModal}
        onClose={() => setShowMarkDeliveredModal(false)}
        onConfirm={handleConfirmMarkDelivered}
        title="¿Marcar como 'Entregado'?"
        message="¿Estás seguro de marcar este servicio como 'Entregado'?"
        confirmText="Sí, marcar"
        cancelText="Cancelar"
      />

      <ConfirmationModal
        isOpen={showQuotePartsModal}
        onClose={() => setShowQuotePartsModal(false)}
        onConfirm={handleConfirmQuoteParts}
        title="¿Cotizar repuestos?"
        message="¿Está seguro de que desea solicitar cotización para los repuestos listados?"
        confirmText="Sí, cotizar"
        cancelText="Cancelar"
      />

      <ConfirmationModal
        isOpen={showSendProformaModal}
        onClose={() => setShowSendProformaModal(false)}
        onConfirm={handleConfirmSendProforma}
        title="¿Enviar proforma al cliente?"
        message="¿Está seguro de que desea enviar la proforma con los repuestos y mano de obra al cliente?"
        confirmText="Sí, enviar"
        cancelText="Cancelar"
      />

      <ConfirmationModal
        isOpen={showUnsavedChangesModal}
        onClose={handleCancelNavigation}
        onConfirm={handleConfirmNavigation}
        title="¿Salir sin guardar?"
        message="Tienes cambios sin guardar que se perderán. ¿Estás seguro de que quieres salir?"
        confirmText="Sí, salir"
        cancelText="Cancelar"
      />

      {selectedImage && (
        <div className={styles.imageModal} onClick={closeImageModal}>
          <div className={styles.modalContent}>
            <img src={selectedImage} alt="Ampliación de foto del servicio" />
            <button className={styles.closeButton} onClick={closeImageModal}>
              &times;
            </button>
          </div>
        </div>
      )}

      <ServiceHeader
        service={service}
        navigate={safeNavigate}
        goBack={safeGoBack}
        formatPrice={formatPrice}
        onQuoteParts={handleQuoteParts}
        onSendProforma={handleSendProforma}
        hasUnsavedChanges={hasUnsavedChanges}
      />
      <ServicePhotos photos={photos} openImageModal={openImageModal} />

      <ServiceEditForm
        service={service}
        formData={formData}
        deliveryData={deliveryData}
        assignmentData={assignmentData}
        onAssignmentChange={setAssignmentData}
        encargados={encargados}
        filteredAreas={filteredAreas}
        loadingEncargados={loadingEncargados}
        onFilteredAreasChange={setFilteredAreas}
        loading={actionLoading}
        error={actionError}
        handleSaveChanges={handleSaveChanges}
        handleMarkInProcess={handleMarkInProcess}
        handleMarkFinished={handleMarkFinished}
        handleMarkDelivered={handleMarkDelivered}
        handleDeliveryDataChange={handleDeliveryDataChange}
        handleInputChange={handleInputChange}
        handlePartChange={handlePartChange}
        handleLaborChange={handleLaborChange}
        handlePaidLaborChange={handlePaidLaborChange}
        handleMechanicsChange={handleMechanicsChange}
        handleDeleteService={handleDeleteService}
        handleQuoteParts={handleQuoteParts}
        handleSendProforma={handleSendProforma}
        addNewPart={addNewPart}
        addNewLabor={addNewLabor}
        addNewPaidLabor={addNewPaidLabor}
        removePart={removePart}
        removeLabor={removeLabor}
        removePaidLabor={removePaidLabor}
        calculatePartsTotal={calculatePartsTotal}
        calculateLaborsTotal={calculateLaborsTotal}
        calculatePaidLaborsTotal={calculatePaidLaborsTotal}
        formatPrice={formatPrice}
        hasValidPartsOrLabors={hasValidPartsOrLabors}
        hasValidParts={hasValidParts}
        isFormCompleteForProcess={isFormCompleteForProcess}
        isFormCompleteForDelivered={isFormCompleteForDelivered}
        buttonStates={buttonStates}
      />
    </div>
  );
};

export default ServiceDetails;
