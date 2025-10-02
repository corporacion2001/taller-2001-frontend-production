import React, { useState } from "react";
import { FiMail, FiArrowLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import SmallSpinner from "../../ui/smallSpinner/SmallSpinner";
import "react-toastify/dist/ReactToastify.css";
import { AuthAPI } from "../../../services/auth.api";

import styles from "./forgotPassword.module.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [instructionsSent, setInstructionsSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.warning("Por favor introduce tu correo electrónico.");
      return;
    }
    if (!email.trim() || email.length > 100) {
      toast.warning("Ingresa un correo válido de máximo 100 caracteres.");
      return;
    }
    try {
      setLoading(true);
      await AuthAPI.forgotPassword({ email });
      setInstructionsSent(true);
      toast.success("Instrucciones enviadas. Revisa tu correo.");
    } catch (error) {
      toast.error("Error al enviar el correo. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.formPanel}>
      <div className={styles.formContent}>
        <div className={styles.logoContainer}>
          <img
            src="https://res.cloudinary.com/dzj9vcedu/image/upload/v1759382203/lightbackground_1_hel9zn.webp"
            alt="Logo Corporación 2001"
            className={styles.centeredLogo}
          />
        </div>

        <div className={styles.formHeader}>
          <h2>Recuperar Contraseña</h2>
          <p>Introduce tu correo y sigue las instrucciones</p>
        </div>

        {instructionsSent ? (
          <div className={styles.successContainer}>
            <p className={styles.successMessage}>
              ✔ Revisa tu correo electrónico para continuar con el proceso de
              recuperación.
            </p>
            <button
              type="button"
              className={styles.backButton}
              onClick={() => navigate("/login")}
            >
              <FiArrowLeft className={styles.buttonIcon} />
              Regresar al login
            </button>
          </div>
        ) : (
          <form className={styles.loginForm} onSubmit={handleSubmit}>
            <div className={styles.inputGroup}>
              <label htmlFor="email" className={styles.inputLabel}>
                Correo electrónico
              </label>
              <div className={styles.inputField}>
                <FiMail className={styles.inputIcon} />
                <input
                  type="email"
                  id="email"
                  name="email"
                  maxLength={100}
                  placeholder="tucorreo@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <button
              type="submit"
              className={styles.loginButton}
              disabled={loading}
            >
              {loading ? (
                <>
                  <SmallSpinner />
                  Enviando...
                </>
              ) : (
                <>Enviar Instrucciones</>
              )}
            </button>

            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => navigate("/login")}
            >
              Volver al inicio de sesión
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
