import React from "react";
import "./locationSection.css";

const LocationSection = () => {
  return (
    <section id="location" className="location-section">
      <div className="location-container">
        <div className="section-header">
          <h2 className="section-title">Ubicación</h2>
          <p className="section-subtitle">Encuentra nuestra sede en el mapa</p>
        </div>

        <div className="location-content">
          <div className="location-info">
            <h3 className="info-title">Dirección</h3>
            <p>
              Guadalupe, Frente a Torre Médica Latinoamericana (Antiguo Hospital
              Jerusalem), San José, Costa Rica
              <br />
            </p>
          </div>

          <div className="location-map">
            <div className="map-wrapper">
              <iframe
                title="Corporación 2001"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3929.680170127713!2d-84.03967412520696!3d9.960545490142898!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8fa0e538e68440f3%3A0x6ed5f2aec08d7e3d!2sCORPORACION2001!5e0!3m2!1ses-419!2scr!4v1750266232988!5m2!1ses-419!2scr"
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                className="map-iframe"
              ></iframe>
              <a
                href="https://maps.app.goo.gl/gBiXWjQiLD37Zp7F8"
                target="_blank"
                rel="noopener noreferrer"
                className="map-link-overlay"
                aria-label="Abrir ubicación en Google Maps"
              ></a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LocationSection;
