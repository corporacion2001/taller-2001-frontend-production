import React from "react";
import "./footer.css";
import {
  FaFacebookF,
  FaInstagram,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaClock,
} from "react-icons/fa";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Top Section */}
        <div className="footer-top">
          <div className="footer-about">
            <h3 className="footer-logo">
              <span>Corporación-  </span>
              <span className="logo-dot">2001</span>
            
            </h3>
            <p className="footer-about-text">
              Especialistas en mantenimiento y reparación automotriz con los más
              altos estándares de calidad y tecnología de punta.
            </p>
            <div className="footer-social">
              <a
                href="https://www.facebook.com/p/Corporaci%C3%B3n-2001-61577977937583/"
                className="social-icon"
                aria-label="Facebook"
              >
                <FaFacebookF />
              </a>

              <a
                href="https://www.instagram.com/corporacion2001?igsh=eTM0ZWFkcXJ5OXUy"
                className="social-icon"
                aria-label="Instagram"
              >
                <FaInstagram />
              </a>
            </div>
          </div>

          <div className="footer-links">
            <h3 className="footer-title">Enlaces Rápidos</h3>
            <ul className="footer-list">
              <li>
                <a href="#home">Inicio</a>
              </li>
              <li>
                <a href="#services">Servicios</a>
              </li>
              <li>
                <a href="#about">Nosotros</a>
              </li>
              <li>
                <a href="#contact">Contacto</a>
              </li>
            </ul>
          </div>

          <div className="footer-services">
            <h3 className="footer-title">Nuestros Servicios</h3>
            <ul className="footer-list">
              <li>
                <p>Mecánica liviana</p>
              </li>
              <li>
                <p>Mecánica pesada</p>
              </li>
              <li>
                <p>Metalmecánica</p>
              </li>
              <li>
                <p>Enderezado y pintura</p>
              </li>
              <li>
                <p>Hidráulica</p>
              </li>
              <li>
                <p>Todo frenos y clutch</p>
              </li>
              <li>
                <p>Repuestos automotriz</p>
              </li>
            </ul>
          </div>

          <div className="footer-contact">
            <h3 className="footer-title">Contacto</h3>
            <ul className="footer-list">
              <li className="contact-item">
                <FaMapMarkerAlt className="contact-icon" />
                <span>
                  Guadalupe, Frente a Torre Médica Latinoamericana (Antiguo
                  Hospital Jerusalem), San José, Costa Rica
                </span>
              </li>
              <li className="contact-item">
                <FaPhoneAlt className="contact-icon" />
                <a href="tel:+50622450292">+506 2245 0292</a>
              </li>
              <li className="contact-item">
                <FaEnvelope className="contact-icon" />
                <a href="mailto:infotfc2001@gmail.com">infotfc2001@gmail.com</a>
              </li>
              <li className="contact-item">
                <FaClock className="contact-icon" />
                <span>
                  Lun-Vie: 7:30am - 5:30pm
                  <br />
                  Sáb: 7:30am - 2:00pm
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="footer-bottom">
          <div className="footer-copyright">
            &copy; {currentYear} Corporación 2001. Todos los derechos
            reservados.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
