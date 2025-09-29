import React from "react";
import styles from "./heroSection.module.css";

const HeroSection = () => {
  return (
    <section id="home" className={styles.heroSection}>
      <div className={styles.heroContainer}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            <span className={styles.titleHighlight}>Mecánica Automotriz</span>{" "}
            de
            <br />
            <span className={styles.titleAccent}>Alta Precisión</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Reparaciones expertas, resultados garantizados.
          </p>
        </div>
        <div className={styles.heroImage}>
          <div className={styles.imageFrame}>
            <img
              src="https://res.cloudinary.com/dzj9vcedu/image/upload/v1747374154/istockphoto-1347150429-612x612_f0nex0.jpg"
              alt="Taller mecánico moderno"
              className={styles.carImage}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
