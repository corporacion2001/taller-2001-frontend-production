import React from "react";
import { FiShoppingCart, FiSend } from "react-icons/fi";
import styles from "./ProcessActions.module.css";

const ProcessActions = ({ onCotizarRepuesto, onEnviarProforma, showEnviarProforma = true }) => {
  return (
    <div className={styles.processActions}>
      <button onClick={onCotizarRepuesto} className={styles.actionButton}>
        <FiShoppingCart /> Cotizar repuesto
      </button>

      {showEnviarProforma && (
        <button onClick={onEnviarProforma} className={styles.actionButton}>
          <FiSend /> Enviar proforma cliente
        </button>
      )}
    </div>
  );
};

export default ProcessActions;
