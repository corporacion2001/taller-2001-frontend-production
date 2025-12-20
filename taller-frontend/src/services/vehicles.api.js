import api from "./api";

export const vehiclesApi = {
  // ENDPOINT PARA CONSULTAR SI EXISTE EL CLIENTE POR IDENTIFICACIÓN
  getVehicleByPlate: (plate) =>
    api.get(`/vehicles`, { params: { plate } }).then((res) => res.data),
  getVehicleById: (id) => api.get(`/vehicles/${id}`).then((res) => res.data),
  scrapeVehicleData: (plate, tipoPlaca) =>
    api
      .get(`/vehicles/consulta`, {
        params: {
          placa: plate,
          tipo_placa: tipoPlaca,
        },
      })
      .then((res) => res.data)
      .catch((error) => {
        console.error("Error en scraping:", error);
        throw error;
      }),
  vehicleRegister: (vehicleData) => api.post("/vehicles", vehicleData),
  updateVehicle: async (id, changes) => {
    try {
      const response = await api.put(`/vehicles/${id}`, changes);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
  deleteVehicle: (vehicleId) =>
    api.delete(`/vehicles/${vehicleId}`).then((res) => res.data),
};
