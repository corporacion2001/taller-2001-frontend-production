// services/hooks/useServiceData.js
import { useState, useEffect, useCallback } from "react";
import { serviceAPI } from "../../../../services/service.api";

export const useServiceData = (serviceId) => {
  const [service, setService] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchServiceData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (
        !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
          serviceId
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
          serviceResponse.data.message || "Error al obtener el servicio"
        );
      }

      setService(serviceResponse.data.data);
      setPhotos(photosResponse.data.data || []);
    } catch (err) {
      setError(err.message || "Error al cargar los datos del servicio");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  }, [serviceId]);

  useEffect(() => {
    fetchServiceData();
  }, [fetchServiceData]);

  const refetch = () => {
    fetchServiceData();
  };

  return {
    service,
    photos,
    loading,
    error,
    refetch,
  };
};