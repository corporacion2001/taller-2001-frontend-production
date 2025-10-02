import React from "react";
import styles from "./leftPanel.module.css";

const LeftPanel = () => {
  const stats = [
    { value: "12", label: "Servicios activos" },
    { value: "5", label: "En progreso" },
    { value: "8", label: "Completados hoy" },
    { value: "₡1.8M", label: "Ingresos semanales" },
  ];

  return (
    <div className={styles.leftPanel}>
      <div className={styles.content}>
        <img
          src="https://res.cloudinary.com/dzj9vcedu/image/upload/v1759382203/darkbackground_1_evdepb.webp"
          alt="Logo"
          className={styles.logo}
        />

        <h1 className={styles.welcomeTitle}>Bienvenido a</h1>
        <h2 className={styles.companyName}>
          Corporación <span className={styles.highlight}>2001</span>
        </h2>
        <p className={styles.subtitle}>
          Sistema de gestión 
        </p>

        <div className={styles.statsGrid}>
          {stats.map((stat, index) => (
            <div key={index} className={styles.statCard}>
              <span className={styles.statValue}>{stat.value}</span>
              <span className={styles.statLabel}>{stat.label}</span>
            </div>
          ))}
        </div> 
      </div>
    </div>
  );
};

export default LeftPanel;
