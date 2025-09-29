import api from "./api";
import axios from "axios";

export const usersAPI = {
  //ENDPOINT PARA OBTENER TODOS LOS DATOS DE LOS USUARIOS EXISTENTES
  getUsers: (params) => api.get("/profile", { params }).then((res) => res.data),
  //ENDPOINT PARA OBTENER USUARIO POR ID
  getProfileById: (id) => api.get(`/profile/${id}`).then((res) => res.data),
  //ENDPOINT PARA QUE EL ADMINISTRADOR PUEDA EDITAR LOS USUARIOS
  updateProfile: (id, data) => api.put(`/profile/${id}`, data),
  getEncargados: (workshopId) =>
    api
      .get(
        `/profile/non-admins${workshopId ? `?workshop_id=${workshopId}` : ""}`
      )
      .then((res) => res.data),
  // Nuevos endpoints para manejo de fotos
  getUploadUrl: (userId) =>
    api.post(`/users/${userId}/photo/upload-url`).then((res) => res.data),

  // CORRECCIÓN: Usar axios directamente para S3 con los headers adecuados
  uploadPhotoToS3: (url, file) =>
    axios.put(url, file, {
      headers: {
        "Content-Type": file.type,
      },
    }),
  // Actualiza la referencia de la foto en la base de datos
  updatePhotoReference: (userId, reference) =>
    api.post(`/users/${userId}/photo`, { reference }),
  getPhoto: (userId) =>
    api.get(`/users/${userId}/photo`).then((res) => res.data),
  deletePhoto: (userId) =>
    api.delete(`/users/${userId}/photo`).then((res) => res.data),
  getBasicProfiles: (workshopId) =>
    api
      .get(
        `/profile/list/basic${workshopId ? `?workshop_id=${workshopId}` : ""}`
      )
      .then((res) => res.data),
};
