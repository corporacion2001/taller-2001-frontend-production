import api from './api';
export const rolesAPI = {
  //ENDPOINT PARA OBTENER TODOS LOS ROLES EXISTENTES
  getRoles: () => api.get('/role/getRoles').then(res => res.data.data.roles),
};