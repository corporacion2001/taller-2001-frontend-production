import api from "./api";

export const AuthAPI = {
  //ENDPOINT PARA INICIAR SESION
  login: (credentials) => api.post("/auth/login", credentials),
  //ENDPOINT PARA REGISTRAR UN USUARIO, SOLO ADMINISTRADORES
  register: (userData) => api.post("/auth/register", userData),
  //ENDPOINT PARA ENVIAR RESTABLECER CONTRASEÑA
  forgotPassword: (userData) => api.post("/auth/forgot-password", userData),
  //ENDPOINT PARA ENVIAR RESTABLECER CONTRASEÑA
  resetPassword: (token, data) =>api.post(`/auth/reset-password?token=${token}`, data),
  //ENDPOINT PARA CERRAR SESION, ESTE BORRA LA COOKIE
  logout: () => api.post("/auth/logout"),
  //ENDPOINT PARAOBTNER DATOS DE USUARIO, ESTE SE HACE POR EL COOKIE
  getProfile: () => api.get("/profile/me"),
  //ENDPOINT PARA UPDATE DE USUARIOS A SI MISMOS
  updateProfile: (userData) => api.put("/profile/me", userData),
};
