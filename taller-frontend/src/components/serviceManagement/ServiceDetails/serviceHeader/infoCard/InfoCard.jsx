import React from "react";
import styles from "./InfoCard.module.css"; // Crear este archivo CSS

const InfoCard = ({ title, children }) => {
  return (
    <div className={styles.card}>
      <h3 className={styles.cardTitle}>{title}</h3>
      <div className={styles.cardContent}>{children}</div>
    </div>
  );
};

export default InfoCard;