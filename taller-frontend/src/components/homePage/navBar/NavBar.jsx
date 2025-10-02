import React, { useState, useEffect } from "react";
import styles from "./navbar.module.css";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showNavbar, setShowNavbar] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Lógica para mostrar/ocultar navbar
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scroll hacia abajo
        setShowNavbar(false);
      } else {
        // Scroll hacia arriba
        setShowNavbar(true);
      }

      // Efecto de reducción al hacer scroll
      setIsScrolled(currentScrollY > 50);

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const closeMenu = () => {
    setIsMenuOpen(false); // Cierra el menú
  };

  return (
    <nav
      className={`${styles.navbar} ${isScrolled ? styles.scrolled : ""} ${
        !showNavbar ? styles.hidden : ""
      }`}
    >
      <div className={styles.navbarContainer}>
        <a href="/" className={styles.navbarLogo}>
          <img
            src="https://res.cloudinary.com/dzj9vcedu/image/upload/v1759382203/darkbackground_1_evdepb.webp"
            alt="logo"
            className={styles.logoImage}
          />
        </a>

        <div className={`${styles.navMenu} ${isMenuOpen ? styles.active : ""}`}>
          <a href="#home" className={styles.navLink} onClick={closeMenu}>
            Inicio
          </a>
          <a href="#services" className={styles.navLink} onClick={closeMenu}>
            Servicios
          </a>
          <a href="#about" className={styles.navLink} onClick={closeMenu}>
            Nosotros
          </a>
          <a href="#contact" className={styles.navLink} onClick={closeMenu}>
            Contacto
          </a>
          <a
            href="/login"
            className={styles.navButton}
            onClick={closeMenu}
            target="_blank"
            rel="noopener noreferrer"
          >
            Acceso
          </a>
        </div>

        <div
          className={`${styles.hamburger} ${isMenuOpen ? styles.active : ""}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span className={styles.bar}></span>
          <span className={styles.bar}></span>
          <span className={styles.bar}></span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
