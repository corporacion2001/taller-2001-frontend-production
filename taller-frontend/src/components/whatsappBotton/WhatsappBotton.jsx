// src/componentes/WhatsAppButton/WhatsAppButton.js
import React from "react";
import { FaWhatsapp } from "react-icons/fa";
import "./whatsAppButton.css";

function WhatsAppButton() {
  const phoneNumber = "+50663349458"; // Cambiá esto por tu número real

  return (
    <a
      href={`https://wa.me/${phoneNumber}`}
      className="whatsapp-float"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chatear por WhatsApp"
    >
      <FaWhatsapp size={28} />
    </a>
  );
}

export default WhatsAppButton;
