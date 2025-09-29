import api from './api';
export const workshopsAPI = {
  //ENDPOINT PARA OBTENER TODOS LOS ROLES EXISTENTES
  getWorkshops: () => api.get('/workshop').then(res => res.data)
};