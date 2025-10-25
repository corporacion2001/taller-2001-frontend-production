import React, { useState } from "react";
import styles from "./stepper.module.css";
import Step1Client from "./step1Cliente/Step1Client";
import Step2Vehicle from "./step2Vehicle/Step2Vehicle";
import Step3Service from "./step3Service/Step3Service";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { clientsAPI } from "../../../services/client.api";
import { vehiclesApi } from "../../../services/vehicles.api";
import { serviceAPI } from "../../../services/service.api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../../../contexts/AuthContext"; // Importar el contexto de autenticación

const ServiceStepper = () => {
  const [activeStep, setActiveStep] = useState(0);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    client: null,
    vehicle: null,
    service: null,
    photos: [],
  });
  const [completedSteps, setCompletedSteps] = useState({
    client: false,
    vehicle: false,
    service: false,
  });

  const [globalLoading, setGlobalLoading] = useState(false);

  const isReceptor = user?.roles?.includes("Ingresador Servicios");

  const handleNext = (stepData, stepName) => {
    const newFormData = {
      ...formData,
      [stepName]: {
        ...stepData,
        completed: true,
      },
    };

    setFormData(newFormData);
    setCompletedSteps((prev) => ({
      ...prev,
      [stepName]: true,
    }));

    if (activeStep < 2) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (activeStep === 0) {
      if (
        window.confirm("¿Volver al inicio? Los datos no guardados se perderán")
      ) {
        navigate("/dashboard/gestion/servicios");
      }
      return;
    }
    setActiveStep((prev) => prev - 1);
  };

  const handleCompleteService = async ({ service, photos }) => {
    try {
      setFormData((prev) => ({
        ...prev,
        service: { ...service, completed: true },
        photos: photos,
      }));

      if (!formData.client || !formData.vehicle) {
        throw new Error("Faltan datos del cliente o vehículo");
      }
      let clientId = formData.client.id;
      let vehicleId = formData.vehicle?.id || null;
      let serviceId = null;
      let newClientId = null;

      const createdEntities = {
        client: !formData.client.id,
        vehicle: !formData.vehicle.id,
        service: false,
        photos: false,
      };

      // 1. Registrar cliente (si es nuevo)
      if (!clientId) {
        try {
          const clientResponse = await clientsAPI.clientRegister({
            ...formData.client,
            isExisting: undefined,
            completed: undefined,
          });

          if (clientResponse.data?.success === false) {
            throw handleClientError(
              clientResponse.data.errorCode,
              formData.client
            );
          }
          newClientId = clientResponse.data.client_id;
          clientId = newClientId;
        } catch (clientError) {
          if (clientError.response?.data?.errorCode) {
            throw handleClientError(
              clientError.response.data.errorCode,
              formData.client
            );
          }
          throw new Error(
            clientError.response?.data?.message ||
              clientError.message ||
              "Error al registrar cliente"
          );
        }
      }

      // 2. Registrar vehículo (si es nuevo)
      if (!vehicleId) {
        try {
          const vehicleResponse = await vehiclesApi.vehicleRegister({
            ...formData.vehicle,
            isExisting: undefined,
            completed: undefined,
          });

          if (vehicleResponse.data?.success === false) {
            throw handleVehicleError(
              vehicleResponse.data.errorCode,
              formData.vehicle
            );
          }

          vehicleId = vehicleResponse.data.vehicle_id;
        } catch (vehicleError) {
          // Rollback cliente si falla vehículo
          if (newClientId) {
            try {
              await clientsAPI.deleteClient(newClientId);
            } catch (deleteError) {}
          }

          if (vehicleError.response?.data?.errorCode) {
            throw handleVehicleError(
              vehicleError.response.data.errorCode,
              formData.vehicle
            );
          }
          throw new Error(
            vehicleError.response?.data?.message ||
              vehicleError.message ||
              "Error al registrar vehículo"
          );
        }
      }

      // 3. Registrar servicio
      try {
        setGlobalLoading(true);
        const serviceResponse = await serviceAPI.serviceRegister({
          ...service,
          client_id: clientId,
          vehicle_id: vehicleId,
          status: "pending",
        });

        if (serviceResponse.data?.success === false) {
          throw handleServiceError(serviceResponse.data.message);
        }

        serviceId = serviceResponse.data.service_id;
        createdEntities.service = true;
      } catch (serviceError) {
        // Rollback si falla el servicio
        if (newClientId) {
          try {
            await clientsAPI.deleteClient(newClientId);
          } catch (deleteError) {}
        }
        if (createdEntities.vehicle) {
          try {
            await vehiclesApi.deleteVehicle(vehicleId);
          } catch (deleteError) {}
        }

        if (serviceError.response?.data?.message) {
          throw handleServiceError(serviceError.response.data.message);
        }
        throw new Error(
          serviceError.response?.data?.message ||
            serviceError.message ||
            "Error al registrar servicio"
        );
      }

      // 4. Subir fotos si hay
      if (photos && photos.length > 0) {
        for (const photo of photos) {
          try {
            const uploadUrlResponse = await serviceAPI.getPhotoUploadUrl(
              serviceId
            );
            const { uploadUrl, key } = uploadUrlResponse.data.data;
            if (!uploadUrl || !key) {
              continue;
            }

            let fileToUpload;
            if (photo.file) fileToUpload = photo.file;
            else if (photo instanceof Blob) fileToUpload = photo;
            else fileToUpload = await fetch(photo.url).then((r) => r.blob());

            const uploadResponse = await fetch(uploadUrl, {
              method: "PUT",
              body: fileToUpload,
              headers: { "Content-Type": fileToUpload.type || "image/jpeg" },
            });

            if (!uploadResponse.ok) {
              throw new Error(
                `Error subiendo foto a S3: ${uploadResponse.statusText}`
              );
            }

            await serviceAPI.registerPhotoInDatabase({
              reference: key,
              service_id: serviceId,
            });
          } catch (photoError) {
            // Rollback completo si falla alguna foto
            if (createdEntities.service) {
              try {
                await serviceAPI.deleteService(serviceId);
              } catch (deleteError) {}
            }
            if (createdEntities.vehicle) {
              try {
                await vehiclesApi.deleteVehicle(vehicleId);
              } catch (deleteError) {}
            }
            if (newClientId) {
              try {
                await clientsAPI.deleteClient(newClientId);
              } catch (deleteError) {}
            }

            throw new Error("Error subiendo fotos, el registro fue revertido");
          }
        }
        createdEntities.photos = true;
      }

      toast.success("Servicio registrado con éxito");

      // Redirigir según el tipo de usuario
      if (isReceptor) {
        // El receptor vuelve al inicio para crear otro servicio
        navigate("/dashboard");
      } else {
        // Los demás usuarios van a la lista de servicios
        navigate("/dashboard/gestion/servicios");
      }
    } catch (error) {
      toast.error(error.message || "Error al registrar servicio");
    } finally {
      setGlobalLoading(false);
    }
  };

  // Manejador de errores específicos del servicio
  const handleServiceError = (message) => {
    const errorMapping = {
      "Faltan campos obligatorios": "Complete todos los campos requeridos",
      "Usuario asignado no encontrado": "El técnico asignado no existe",
      "Cliente no encontrado": "El cliente no existe en el sistema",
      "Vehículo no encontrado": "El vehículo no existe en el sistema",
      "Área no encontrada": "El área seleccionada no existe",
      "Taller no encontrado": "El taller seleccionado no existe",
      "El usuario asignado no tiene el rol requerido para esta área":
        "El técnico no tiene permiso para esta área de trabajo",
    };

    return new Error(
      errorMapping[message] || message || "Error al registrar el servicio"
    );
  };

  // Función para manejar errores específicos de vehículos
  const handleVehicleError = (errorCode, vehicleData) => {
    const errorMessages = {
      DUPLICATE_PLATE: `La placa ${vehicleData.plate} ya está registrada`,
      INVALID_CLIENT: "El cliente asociado no existe",
      INVALID_VEHICLE_TYPE: "Tipo de vehículo no válido",
      default: "Error al registrar el vehículo",
    };

    return new Error(errorMessages[errorCode] || errorMessages.default);
  };

  // Función para manejar errores específicos de cliente
  const handleClientError = (errorCode, clientData) => {
    const defaultMsg = "Error al procesar cliente";

    const errorMessages = {
      DUPLICATE_EMAIL: `El correo ${clientData.email} ya está registrado`,
      DUPLICATE_PHONE: `El teléfono ${clientData.phone} ya está registrado`,
      DUPLICATE_IDENTIFICATION: `La identificación ${clientData.identification} ya está registrada`,
      INVALID_PROVINCE: "La provincia seleccionada no es válida",
      INVALID_CANTON: "El cantón seleccionado no es válido",
      CLIENT_HAS_SERVICES: "Cliente ya registrado con servicios asociados",
      CLIENT_NOT_FOUND: "Cliente no encontrado",
      default: defaultMsg,
    };

    return new Error(errorMessages[errorCode] || errorMessages.default);
  };
  const steps = [
    {
      label: "Cliente",
      component: (
        <Step1Client
          key={`client-${formData.client?.id || "new"}`}
          onNext={(data) => handleNext(data, "client")}
          initialData={formData.client}
          showSearch={!completedSteps.client}
          onBack={() => {
            // Para el receptor, no mostrar confirmación de volver
            if (isReceptor) {
              navigate("/dashboard");
            } else {
              navigate("/dashboard/gestion/servicios");
            }
          }}
        />
      ),
    },
    {
      label: "Vehículo",
      component: (
        <Step2Vehicle
          key={`vehicle-${formData.vehicle?.id || "new"}`}
          onNext={(data) => handleNext(data, "vehicle")}
          onBack={handleBack}
          initialData={formData.vehicle}
          showSearch={!completedSteps.vehicle}
          clientId={formData.client?.id}
        />
      ),
    },
    {
      label: "Servicio",
      component: (
        <Step3Service
          key={`service-${formData.vehicle?.id}-${formData.client?.id}-${
            formData.service?.entry_date || "new"
          }`}
          onBack={handleBack}
          initialData={formData.service || {}}
          initialPhotos={formData.photos}
          clientId={formData.client?.id}
          vehicleId={formData.vehicle?.id}
          onComplete={handleCompleteService}
          loading={globalLoading}
        />
      ),
    },
  ];

  return (
    <div className={styles.stepperContainer}>
      {!isReceptor && (
        <button
          onClick={() => navigate("/dashboard/gestion/servicios")}
          className={styles.backButton}
        >
          <FiArrowLeft /> Volver
        </button>
      )}

      <div className={styles.stepperHeader}>
        {steps.map((step, index) => (
          <div
            key={index}
            className={`${styles.stepIndicator} ${
              index <= activeStep ? styles.active : ""
            }`}
          >
            <div className={styles.stepNumber}>{index + 1}</div>
            <div className={styles.stepLabel}>{step.label}</div>
          </div>
        ))}
      </div>

      <div className={styles.stepContent}>{steps[activeStep].component}</div>
    </div>
  );
};

export default ServiceStepper;
