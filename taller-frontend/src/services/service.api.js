import api from "./api";

export const serviceAPI = {
  // ENDPOINT PARA CONSULTAR SI EXISTE EL CLIENTE POR IDENTIFICACIÓN
  serviceRegister: (serviceData) => api.post("/services", serviceData),

  getPhotoUploadUrl: (serviceId) =>
    api.post(`/services/${serviceId}/photos/upload-url`),
  deletePhoto: (photoId) => api.delete(`/vehicle-photos/${photoId}`),

  registerPhotoInDatabase: (photoData) =>
    api.post("/vehicle-photos", photoData),

  // Método para subir directamente a S3 (opcional)
  uploadToS3: (uploadUrl, file) =>
    api.put(uploadUrl, file, {
      headers: {
        "Content-Type": file.type || "image/jpeg",
      },
    }),
  getAllServices: (params) => {
    // Limpiamos los parámetros que estén vacíos
    const cleanParams = {};
    for (const key in params) {
      if (
        params[key] !== null &&
        params[key] !== undefined &&
        params[key] !== ""
      ) {
        cleanParams[key] = params[key];
      }
    }
    return api.get("/services", { params: cleanParams });
  },
  getServicePhotos: (serviceId) =>
    api.get(`/vehicle-photos?service_id=${serviceId}`),
  getServiceById: (serviceId) => api.get(`/services/${serviceId}`),
  // Nuevo método para actualizar el servicio
  updateService: (serviceId, serviceData) =>
    api.patch(`/services/${serviceId}`, serviceData),
  markServiceInProcess: (serviceId) =>
    api.patch(`/services/${serviceId}/mark-in-process`),
  getMonitoringServices: () => api.get("/services/monitoring-services"),
  markServiceFinished: (serviceId) =>
    api.patch(`/services/${serviceId}/mark-finished`),
  markServiceDelivered: (serviceId, deliveryData) =>
    api.patch(`/services/${serviceId}/mark-delivered`, deliveryData),
  deleteService: (serviceId) =>
    api.delete(`/services/${serviceId}`).then((res) => res.data),
  deletePart: (partId) => api.delete(`/parts/${partId}`),
  deleteLabor: (laborId) => api.delete(`/labors/${laborId}`),
  deletePaidLabor: (paidLaborId) => api.delete(`/paid-labors/${paidLaborId}`),
};
