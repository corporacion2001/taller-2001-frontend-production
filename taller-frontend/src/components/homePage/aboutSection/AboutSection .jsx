import React, { useEffect, useState } from "react";
import "./aboutSection.css";
import { FaAward, FaCarAlt, FaUserFriends } from "react-icons/fa";

const AboutSection = () => {
  const [years, setYears] = useState(0);

  // Función para manejar la animación de años
  const countYears = () => {
    let count = 0;
    const interval = setInterval(() => {
      if (count < 25) {
        count++;
        setYears(count);
      } else {
        clearInterval(interval);
      }
    }, 50); // Controla la velocidad de incremento (50ms por cada número)
  };

  useEffect(() => {
    // Activamos la animación solo cuando la sección es visible
    const aboutSection = document.getElementById("about");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          countYears();
        }
      },
      { threshold: 0.5 } // Cuando el 50% de la sección sea visible
    );

    if (aboutSection) {
      observer.observe(aboutSection);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section id="about" className="about-section">
      <div className="about-container">
        <div className="about-image">
          <div className="image-border"></div>
          <img
            src="https://res.cloudinary.com/dzj9vcedu/image/upload/v1759382203/pexels-daniel-andraski-197681005-13065699_slmfv3.webp"
            alt="Taller mecánico"
            className="main-image"
          />
        </div>

        <div className="about-content">
          <div className="section-header">
            <h2 className="section-title">Sobre Nuestro Taller</h2>
          </div>

          <p className="about-text">
            En <strong>Corporación 2001</strong> nos especializamos en brindar
            soluciones automotrices integrales con los más altos estándares de
            calidad. Nuestro equipo de profesionales certificados garantiza un
            servicio confiable y personalizado.
          </p>

          <ul className="about-features">
            <li>
              <FaCarAlt className="feature-icon" />
              <span>Tecnología de diagnóstico avanzada</span>
            </li>
            <li>
              <FaUserFriends className="feature-icon" />
              <span>Mecánicos capacitados</span>
            </li>
            <li>
              <FaAward className="feature-icon" />
              <span>Garantía en todos nuestros servicios</span>
            </li>
          </ul>

          <div className="stats-container">
            <div className="stat-item">
              <div className="stat-number" data-count="25">
                {years}+
              </div>
              <div className="stat-label">Años de experiencia</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
