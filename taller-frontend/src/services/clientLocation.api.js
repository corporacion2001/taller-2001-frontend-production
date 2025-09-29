import api from "./api";
export const clientLocation = {
  //ENDPOINT PARA OBTENER TODOS LOS ROLES EXISTENTES
  getProvinces: () => api.get("/provinces").then((res) => res.data),
  getCantons: () => api.get("/cantons").then((res) => res.data),
};
