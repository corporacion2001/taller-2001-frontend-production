import api from './api';

export const quoteAPI = {
  // Enviar solicitud de cotización
  sendQuoteRequest: (quoteData) => 
    api.post('/quotes/request', { orderData: quoteData }).then(res => res.data),
};