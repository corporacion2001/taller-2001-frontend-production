import React, { useState } from "react";
import { FiLock, FiCheck, FiArrowLeft } from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";
import SmallSpinner from "../../ui/smallSpinner/SmallSpinner";
import styles from "./resetPassword.module.css";
import { AuthAPI } from "../../../services/auth.api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const query = useQuery();
  const token = query.get("token");

  const validatePassword = () => {
    if (password.length < 8 || password.length > 15) {
      toast.error("La contraseña debe tener entre 8 y 15 caracteres");
      return false;
    }
    if (!/[A-Z]/.test(password)) {
      toast.error("Debe contener al menos una letra mayúscula");
      return false;
    }
    if (!/[a-z]/.test(password)) {
      toast.error("Debe contener al menos una letra minúscula");
      return false;
    }
    if (!/\d/.test(password)) {
      toast.error("Debe contener al menos un número");
      return false;
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      toast.error("Debe contener al menos un carácter especial");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error("Token inválido o no proporcionado");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }
    

    if (!validatePassword()) {
      return;
    }

    try {
      setLoading(true);
      await AuthAPI.resetPassword(token, { newPassword: password });
      toast.success("Contraseña restablecida con éxito");
      navigate("/login", {
        state: { success: "Contraseña restablecida con éxito" },
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Error al restablecer la contraseña");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.formPanel}>
      <div className={styles.formContent}>
        <div className={styles.logoContainer}>
          <img
            src="https://res.cloudinary.com/dzj9vcedu/image/upload/v1749926589/corporacionlogowhitebk_ezpvra.png"
            alt="Logo Corporación 2001"
            className={styles.centeredLogo}
          />
        </div>

        <div className={styles.formHeader}>
          <h2>Restablecer Contraseña</h2>
          <p>Ingresa tu nueva contraseña y confirma para continuar</p>
        </div>

        <form className={styles.loginForm} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.inputLabel}>
              Nueva contraseña
            </label>
            <div className={styles.inputField}>
              <FiLock className={styles.inputIcon} />
              <input
                type="password"
                id="password"
                name="password"
                placeholder="********"
                value={password}
                minLength={8}
                maxLength={15}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
                autoComplete="new-password"
              />
            </div>
            <div className={styles.passwordHint}>
              La contraseña debe contener: 8-15 caracteres, mayúsculas,
              minúsculas, números y al menos un carácter especial.
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="confirmPassword" className={styles.inputLabel}>
              Confirmar contraseña
            </label>
            <div className={styles.inputField}>
              <FiCheck className={styles.inputIcon} />
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="********"
                minLength={8}
                maxLength={15}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                required
                autoComplete="new-password"
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
                Procesando...
              </>
            ) : (
              "Restablecer Contraseña"
            )}
          </button>

          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => navigate("/login")}
            disabled={loading}
          >
            <FiArrowLeft className={styles.buttonIcon} />
            Volver al inicio de sesión
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
