import api from './api';
export const statusAPI = {
  //ENDPOINT PARA OBTENER TODOS LOS ROLES EXISTENTES
  getStatus: () => api.get('/statusUser').then(res => res.data)
};