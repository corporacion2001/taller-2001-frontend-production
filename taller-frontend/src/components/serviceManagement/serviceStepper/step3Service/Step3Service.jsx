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
  loading = false, // <-- Recibe el loading del Stepper
}) => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const isAdmin = user?.roles?.includes("Administrador");

  // Estados para carga y errores
  const [error, setError] = useState(null);
  const [loadingWorkshops, setLoadingWorkshops] = useState(false);
  const [loadingEncargados, setLoadingEncargados] = useState(false);
  const [photoProcessing, setPhotoProcessing] = useState(false); // <-- Solo para procesamiento de fotos

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
    observations: "",
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
      observations: "",
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

    setPhotoProcessing(true);

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
      setPhotoProcessing(false);
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
    setPhotos((prev) => {
      const processedPhotos = newPhotos.map((photo, index) => {
        // Si la foto ya viene como objeto con url (desde Camera)
        if (typeof photo === "object" && photo.url) {
          return {
            id: `${Date.now()}-${index}-${Math.random()
              .toString(36)
              .substr(2, 9)}`,
            url: photo.url,
            file: photo.file || null,
            name: photo.name || `camera_${Date.now()}_${index}.jpg`,
          };
        }
        // Si viene como string (data URL)
        return {
          id: `${Date.now()}-${index}-${Math.random()
            .toString(36)
            .substr(2, 9)}`,
          url: photo,
          file: null,
          name: `camera_${Date.now()}_${index}.jpg`,
        };
      });

      const updatedPhotos = [...prev, ...processedPhotos];
      console.log("Fotos actualizadas después de cámara:", updatedPhotos);
      return updatedPhotos;
    });
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

    return { isValid, errors };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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

      // Validación de fotos
      if (photos.length < 10) {
        throw new Error("Debe subir al menos 10 fotos del vehículo");
      }

      // Preparar datos para enviar
      const serviceToSend = {
        ...formData,
        workshop_id: isAdmin ? formData.workshop_id : user.workshop.id,
        user_received_id: user.id,
        observations: formData.observations?.trim() || "",
      };

      // onComplete es manejado por el padre (Stepper) y debe activar globalLoading allí
      await onComplete({
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
        onSubmit={handleSubmit}
        onBack={onBack}
        onOpenCamera={() => setShowCamera(true)}
        loading={Boolean(loading || photoProcessing)} // <-- Combina loading del Stepper + procesamiento de fotos
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
