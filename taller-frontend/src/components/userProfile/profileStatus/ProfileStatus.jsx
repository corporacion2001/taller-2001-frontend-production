// components/UserProfile/ProfileStatus/ProfileStatus.jsx
import React from "react";
import { FiCheckCircle, FiCalendar } from "react-icons/fi";
import { format, parseISO, isValid } from "date-fns";
import styles from "./profileStatus.module.css";

const ProfileStatus = ({ status = "Estado no definido", start_date }) => {
  // Función segura para formatear fechas
  const formatDateSafe = (dateString) => {
    try {
      if (!dateString) return "Fecha no disponible";

      const date = parseISO(dateString);
      return isValid(date) ? format(date, "dd/MM/yyyy") : dateString;
    } catch (error) {
      console.error("Error formateando fecha:", error);
      return dateString || "Fecha no disponible";
    }
  };

  const formattedDate = formatDateSafe(start_date);

  return (
    <div className={styles.profileStatus}>
      <span
        className={`${styles.statusBadge} ${
          status === "Activo" ? styles.active : ""
        }`}
      >
        <FiCheckCircle /> {status}
      </span>
      <span className={styles.memberSince}>
        <FiCalendar /> Miembro desde: {formattedDate}
      </span>
    </div>
  );
};

export default ProfileStatus;
