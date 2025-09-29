import React from "react";
import "./servicesSection.css";
import {
  FaCar,
  FaTruckMoving,
  FaIndustry,
  FaPaintRoller,
  FaCogs,
  FaTools,
  FaShoppingCart,
} from "react-icons/fa"; // Agrega estos si no están aún

const ServicesSection = () => {
  const services = [
    {
      icon: <FaCar className="service-icon" />,
      title: "Mecánica liviana",
      description:
        "Reparaciones rápidas y mantenimiento básico para mantener tu vehículo en óptimas condiciones.",
      color: "#1532ba",
    },
    {
      icon: <FaTruckMoving className="service-icon" />,
      title: "Mecánica pesada",
      description:
        "Diagnóstico y reparación de sistemas complejos en vehículos de gran tamaño o carga.",
      color: "#FF6B00",
    },
    {
      icon: <FaIndustry className="service-icon" />,
      title: "Metalmecánica ",
      description:
        "Fabricación, soldadura y reparación de piezas metálicas para estructuras vehiculares.",
      color: "#121035",
    },
    {
      icon: <FaPaintRoller className="service-icon" />,
      title: "Enderezado y pintura",
      description:
        "Restauración estética y estructural de carrocería, con acabados profesionales.",
      color: "#1532ba",
    },
    {
      icon: <FaCogs className="service-icon" />,
      title: "Hidráulica",
      description:
        "Diagnóstico y reparación de sistemas hidráulicos, incluyendo dirección asistida y frenos hidráulicos para un manejo seguro y preciso.",
      color: "#FF6B00",
    },
    {
      icon: <FaTools className="service-icon" />,
      title: "Todo frenos y clutch",
      description:
        "Servicio especializado en el mantenimiento y reemplazo de sistemas de frenos y clutch para asegurar una conducción eficiente y sin contratiempos.",
      color: "#121035",
    },
    {
      icon: <FaShoppingCart className="service-icon" />,
      title: "Repuestos automotriz",
      description:
        "Venta e instalación de repuestos originales y genéricos para todo tipo de vehículos, garantizando calidad y compatibilidad.",
      color: "#1532ba",
    },
  ];

  return (
    <section id="services" className="services-section">
      <div className="services-container">
        <div className="section-header">
          <h2 className="section-title">Nuestras especialidades</h2>
          <p className="section-subtitle">
            Calidad y precisión en cada reparación
          </p>
        </div>

        <div className="services-grid">
          {services.map((service, index) => (
            <div
              className="service-card"
              key={index}
              style={{ "--card-color": service.color }}
            >
              <div className="service-icon-container">{service.icon}</div>
              <h3 className="service-title">{service.title}</h3>
              <p className="service-description">{service.description}</p>
              <div className="service-hover-effect"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
