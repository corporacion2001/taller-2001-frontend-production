import api from './api';

export const proformaAPI = {
  // Enviar proforma al cliente
  sendProformaToClient: (proformaData) => 
    api.post('/proforma/send', { proformaData }).then(res => res.data),
};