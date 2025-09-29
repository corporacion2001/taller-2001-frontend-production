import api from "./api";

export const AnalyticsAPI = {
  // ENDPOINT PARA OBTENER MÉTRICAS DEL DASHBOARD
  getDashboard: () => api.get("/analytics/dashboard"),

  // ENDPOINT PARA OBTENER INGRESOS POR PERÍODO
  getRevenue: (params = {}) => {
    const { period = 'monthly', range = 6 } = params;
    return api.get(`/analytics/revenue?period=${period}&range=${range}`);
  },

  // ENDPOINT PARA OBTENER SERVICIOS AGRUPADOS POR ÁREA
  getServicesByArea: (params = {}) => {
    const { period = 'monthly', range = 1 } = params;
    return api.get(`/analytics/services/by-area?period=${period}&range=${range}`);
  },

  // ENDPOINT PARA OBTENER TOP CLIENTES
  getTopClients: (params = {}) => {
    const { period = 'monthly', range = 3, limit = 5 } = params;
    return api.get(`/analytics/clients/top?period=${period}&range=${range}&limit=${limit}`);
  },
};