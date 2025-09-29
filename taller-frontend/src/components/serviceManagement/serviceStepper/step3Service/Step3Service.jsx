import React, { useState, useEffect } from "react";
import styles from "./step3Service.module.css";
import ServiceForm from "./ServiceForm";
import Camera from "../../../ui/camera/Camera";
import { workshopsAPI } from "../../../../services/workshops.api";
import { usersAPI } from "../../../../services/user.api";
import { useNotification } from "../../../../contexts/NotificationContext";
import { useAuth } from "../../../../contexts/AuthContext";
import heic2any from "heic2any";

const Step3Service = ({
  onBack,
  initialData = {},
  initialPhotos = [],
  clientId,
  vehicleId,
  onComplete,
}) => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const isAdmin = user?.roles?.includes("Administrador");

  // Estados para carga y errores
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadingWorkshops, setLoadingWorkshops] = useState(false);
  const [loadingEncargados, setLoadingEncargados] = useState(false);

  // Datos del formulario
  const [formData, setFormData] = useState({
    entry_date: new Date().toISOString().split("T")[0],
    entry_time: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    workshop_id: user?.workshop?.id || "",
    user_assigned_id: "",
    client_id: clientId,
    vehicle_id: vehicleId,
    area_id: "",
    order_number: "",
    observations: "",
    parts: [],
    labors: [],
    ...initialData,
  });

  const [photos, setPhotos] = useState(initialPhotos);
  const [showCamera, setShowCamera] = useState(false);
  const [availableWorkshops, setAvailableWorkshops] = useState([]);
  const [encargados, setEncargados] = useState([]);
  const [filteredAreas, setFilteredAreas] = useState([]);

  // Efecto para inicialización completa
  useEffect(() => {
    const newFormData = {
      entry_date: new Date().toISOString().split("T")[0],
      entry_time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      workshop_id: user?.workshop?.id || "",
      user_assigned_id: "",
      client_id: clientId,
      vehicle_id: vehicleId,
      area_id: "",
      order_number: "",
      observations: "",
      parts: [],
      labors: [],
      ...initialData,
    };

    setFormData(newFormData);
    setPhotos(initialPhotos || []);
  }, [initialData, initialPhotos, clientId, vehicleId, user]);

  // Cargar talleres disponibles
  useEffect(() => {
    const loadWorkshops = async () => {
      try {
        setLoadingWorkshops(true);
        const response = await workshopsAPI.getWorkshops();
        setAvailableWorkshops(response.data);
      } catch (error) {
        console.error("Error cargando talleres:", error);
        setError("Error al cargar talleres");
      } finally {
        setLoadingWorkshops(false);
      }
    };

    loadWorkshops();
  }, []);

  // Cargar encargados según taller
  useEffect(() => {
    const loadEncargados = async () => {
      try {
        const workshopId = isAdmin ? formData.workshop_id : user?.workshop?.id;
        if (!workshopId) {
          setEncargados([]);
          return;
        }

        setLoadingEncargados(true);
        const response = await usersAPI.getEncargados(workshopId);

        if (response.success) {
          setEncargados(response.data || []);
        } else {
          throw new Error(response.message || "Error al obtener encargados");
        }
      } catch (error) {
        console.error("Error cargando encargados:", error);
        showNotification("Error al cargar técnicos", "error");
        setEncargados([]);
      } finally {
        setLoadingEncargados(false);
      }
    };

    loadEncargados();
  }, [formData.workshop_id, user?.workshop?.id, isAdmin]);

  // Filtrar áreas según encargado seleccionado
  useEffect(() => {
    if (formData.user_assigned_id) {
      const encargado = encargados.find(
        (e) => e.id === formData.user_assigned_id
      );
      setFilteredAreas(
        encargado?.roles?.map((role) => ({
          id: role.id,
          name: role.name.replace("Encargado ", ""),
        })) || []
      );
    } else {
      setFilteredAreas([]);
    }
  }, [formData.user_assigned_id, encargados]);

  // Handlers para el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUserChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      user_assigned_id: e.target.value,
      area_id: "",
    }));
  };

  // Función para convertir HEIC a JPG
  const convertHeicToJpg = async (file) => {
    // Si no es HEIC, devolver el archivo original
    const isHeic =
      file.name.toLowerCase().endsWith(".heic") ||
      file.type.includes("heic") ||
      file.name.toLowerCase().endsWith(".heif") ||
      file.type.includes("heif");

    if (!isHeic) {
      return file;
    }

    try {
      showNotification("Convirtiendo imagen HEIC a JPG...", "info");

      // Convertir HEIC a JPG usando heic2any
      const conversionResult = await heic2any({
        blob: file,
        toType: "image/jpeg",
        quality: 0.8, // Calidad de 0 a 1
      });

      // Crear nuevo archivo con extensión JPG
      const newFileName = file.name.replace(/\.[^/.]+$/, ".jpg");
      const newFile = new File([conversionResult], newFileName, {
        type: "image/jpeg",
        lastModified: new Date().getTime(),
      });

      return newFile;
    } catch (error) {
      console.error("Error convirtiendo HEIC a JPG:", error);
      showNotification(
        "Error al convertir imagen. Se usará el formato original.",
        "error"
      );
      return file; // En caso de error, devolver el archivo original
    }
  };

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files).slice(0, 15 - photos.length);

    if (files.length === 0) return;

    setLoading(true);

    try {
      const processedPhotos = [];

      for (const file of files) {
        // Convertir HEIC a JPG si es necesario
        const processedFile = await convertHeicToJpg(file);

        // Crear objeto de foto
        const photoObject = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: processedFile.name,
          url: URL.createObjectURL(processedFile),
          file: processedFile,
        };

        processedPhotos.push(photoObject);
      }

      setPhotos((prev) => [...prev, ...processedPhotos]);
    } catch (error) {
      console.error("Error procesando imágenes:", error);
      showNotification("Error al procesar algunas imágenes", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePhoto = (index) => {
    setPhotos((prev) => {
      const newPhotos = [...prev];
      URL.revokeObjectURL(newPhotos[index].url);
      newPhotos.splice(index, 1);
      return newPhotos;
    });
  };

  const handlePhotosCaptured = (newPhotos) => {
    setPhotos((prev) => [
      ...prev,
      ...newPhotos.map((photo) => ({
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        url: photo,
        file: null,
      })),
    ]);
  };

  // Handlers para partes y mano de obra
  const handleAddPart = () => {
    setFormData((prev) => ({
      ...prev,
      parts: [
        ...prev.parts,
        { amount: 1, name: "", price: 0, invoice_number: "" },
      ],
    }));
  };

  const handleAddLabor = () => {
    setFormData((prev) => ({
      ...prev,
      labors: [...prev.labors, { amount: 1, description: "", price: 0 }],
    }));
  };

  const handlePartChange = (index, field, value) => {
    setFormData((prev) => {
      const newParts = [...prev.parts];
      newParts[index] = {
        ...newParts[index],
        [field]:
          field === "amount" || field === "price" ? Number(value) : value,
      };
      return { ...prev, parts: newParts };
    });
  };

  const handleLaborChange = (index, field, value) => {
    setFormData((prev) => {
      const newLabors = [...prev.labors];
      newLabors[index] = {
        ...newLabors[index],
        [field]:
          field === "amount" || field === "price" ? Number(value) : value,
      };
      return { ...prev, labors: newLabors };
    });
  };

  const handleRemovePart = (index) => {
    setFormData((prev) => ({
      ...prev,
      parts: prev.parts.filter((_, i) => i !== index),
    }));
  };

  const handleRemoveLabor = (index) => {
    setFormData((prev) => ({
      ...prev,
      labors: prev.labors.filter((_, i) => i !== index),
    }));
  };

  const validateServiceData = (serviceData) => {
    const errors = {};
    let isValid = true;

    // Validación de fecha y hora
    if (!serviceData.entry_date) {
      errors.entry_date = "La fecha de entrada es requerida";
      isValid = false;
    } else {
      const entryDate = new Date(serviceData.entry_date);
      if (isNaN(entryDate.getTime())) {
        errors.entry_date = "Fecha inválida";
        isValid = false;
      }
    }

    if (!serviceData.entry_time) {
      errors.entry_time = "La hora de entrada es requerida";
      isValid = false;
    } else if (
      !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(serviceData.entry_time)
    ) {
      errors.entry_time = "Formato de hora inválido (HH:MM)";
      isValid = false;
    }

    // Validación del número de orden
    if (!serviceData.order_number?.trim()) {
      errors.order_number = "El número de orden es requerido";
      isValid = false;
    } else if (serviceData.order_number.trim().length > 255) {
      errors.order_number =
        "El número de orden no puede exceder 255 caracteres";
      isValid = false;
    }

    // Validación de observaciones (opcional pero con límite)
    if (serviceData.observations && serviceData.observations.length > 255) {
      errors.observations =
        "Las observaciones no pueden exceder 255 caracteres";
      isValid = false;
    }

    // Validación de técnico asignado
    if (!serviceData.user_assigned_id) {
      errors.user_assigned_id = "Debe asignar un técnico";
      isValid = false;
    }

    // Validación de área
    if (!serviceData.area_id) {
      errors.area_id = "Debe seleccionar un área";
      isValid = false;
    }

    // Validación de taller
    if (!serviceData.workshop_id) {
      errors.workshop_id = "Debe seleccionar un taller";
      isValid = false;
    }

    // Validación de repuestos
    if (serviceData.parts?.length > 0) {
      serviceData.parts.forEach((part, index) => {
        if (!part.name?.trim()) {
          errors[`parts.${index}.name`] = "Nombre de repuesto requerido";
          isValid = false;
        } else if (part.name.length > 255) {
          errors[`parts.${index}.name`] = "Máximo 255 caracteres permitidos";
          isValid = false;
        }

        if (!part.amount || part.amount <= 0) {
          errors[`parts.${index}.amount`] = "Cantidad inválida (debe ser > 0)";
          isValid = false;
        }

        if (part.price === undefined || part.price < 0) {
          errors[`parts.${index}.price`] = "Precio inválido (debe ser ≥ 0)";
          isValid = false;
        } else if (part.price.toString().split(".")[1]?.length > 2) {
          errors[`parts.${index}.price`] = "Máximo 2 decimales permitidos";
          isValid = false;
        }

        // Validación del número de factura para repuestos
        if (part.invoice_number && part.invoice_number.length > 255) {
          errors[`parts.${index}.invoice_number`] =
            "Número de factura no puede exceder 255 caracteres";
          isValid = false;
        }
      });
    }

    // Validación de mano de obra
    if (serviceData.labors?.length > 0) {
      serviceData.labors.forEach((labor, index) => {
        if (!labor.description?.trim()) {
          errors[`labors.${index}.description`] = "Descripción requerida";
          isValid = false;
        } else if (labor.description.length > 255) {
          errors[`labors.${index}.description`] =
            "Máximo 255 caracteres permitidos";
          isValid = false;
        }

        if (!labor.amount || labor.amount <= 0) {
          errors[`labors.${index}.amount`] = "Cantidad inválida (debe ser > 0)";
          isValid = false;
        }

        if (labor.price === undefined || labor.price < 0) {
          errors[`labors.${index}.price`] = "Precio inválido (debe ser ≥ 0)";
          isValid = false;
        } else if (labor.price.toString().split(".")[1]?.length > 2) {
          errors[`labors.${index}.price`] = "Máximo 2 decimales permitidos";
          isValid = false;
        }
      });
    }

    return { isValid, errors };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validar datos del servicio
      const { isValid, errors } = validateServiceData(formData);
      if (!isValid) {
        // Construir mensaje de error más amigable
        const errorMessages = Object.values(errors).join(", ");
        setError(`Por favor corrija los siguientes errores: ${errorMessages}`);
        throw new Error("Por favor corrija los errores en el formulario");
      }

      // Preparar datos para enviar
      const serviceToSend = {
        ...formData,
        workshop_id: isAdmin ? formData.workshop_id : user.workshop.id,
        user_received_id: user.id,
        order_number: formData.order_number.trim(),
        observations: formData.observations?.trim() || "",
        parts: formData.parts
          .filter((part) => part.name?.trim())
          .map((part) => ({
            name: part.name.trim(),
            amount: Number(part.amount) || 1,
            price: parseFloat(part.price).toFixed(2),
            invoice_number: part.invoice_number?.trim() || "",
          })),
        labors: formData.labors
          .filter((labor) => labor.description?.trim())
          .map((labor) => ({
            description: labor.description.trim(),
            amount: Number(labor.amount) || 1,
            price: parseFloat(labor.price).toFixed(2),
          })),
      };

      onComplete({
        service: serviceToSend,
        photos: photos.map((photo) => ({
          url: photo.url,
          file: photo.file,
        })),
      });
    } catch (error) {
      console.error("Error en el formulario:", error);
      setError(error.message);
      showNotification(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Datos del Servicio</h2>

      <ServiceForm
        formData={formData}
        encargados={encargados}
        areas={filteredAreas}
        photos={photos}
        onInputChange={handleInputChange}
        onUserChange={handleUserChange}
        onPhotoUpload={handlePhotoUpload}
        onRemovePhoto={handleRemovePhoto}
        onAddPart={handleAddPart}
        onAddLabor={handleAddLabor}
        onPartChange={handlePartChange}
        onLaborChange={handleLaborChange}
        onRemovePart={handleRemovePart}
        onRemoveLabor={handleRemoveLabor}
        onSubmit={handleSubmit}
        onBack={onBack}
        onOpenCamera={() => setShowCamera(true)}
        loading={loading}
        error={error}
        availableWorkshops={availableWorkshops}
        loadingWorkshops={loadingWorkshops}
        loadingEncargados={loadingEncargados}
      />

      {showCamera && (
        <Camera
          onCapture={handlePhotosCaptured}
          onClose={() => setShowCamera(false)}
        />
      )}
    </div>
  );
};

export default Step3Service;
