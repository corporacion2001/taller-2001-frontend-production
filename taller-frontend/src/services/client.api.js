import api from "./api";

export const clientsAPI = {
  // ENDPOINT PARA CONSULTAR SI EXISTE EL CLIENTE POR IDENTIFICACIÓN
  client: (identification) =>
    api.get(`/clients`, { params: { identification } }).then((res) => res.data),
  clientRegister: (clientData) => api.post("/clients", clientData), // Crear nuevo cliente
  updateClient: (clientId, updateData) =>
    api.patch(`/clients/${clientId}`, updateData).then((res) => res.data),
  deleteClient: (clientId) =>
    api.delete(`/clients/${clientId}`).then((res) => res.data),
};
