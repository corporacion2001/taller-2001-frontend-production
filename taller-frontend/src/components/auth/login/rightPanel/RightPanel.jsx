import React, { useState, useEffect } from "react";
import { FiMail, FiLock, FiEye, FiArrowRight } from "react-icons/fi";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../../../contexts/AuthContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SmallSpinner from "../../../ui/smallSpinner/SmallSpinner";
import styles from "./rightPanel.module.css";

const RightPanel = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, actionLoading, initialLoading } = useAuth();

  // Efecto para redirección idéntico al original
  useEffect(() => {
    if (!initialLoading && isAuthenticated) {
      const redirectTo = "/dashboard";
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, initialLoading, navigate, location]);

  // Función de submit idéntica al original
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.warning("Por favor completa todos los campos");
      return;
    }
    if (password.length < 8 || password.length > 15) {
      toast.warning("La contraseña debe tener entre 8 y 15 caracteres");
      return;
    }
    if (email.length > 100) {
      toast.warning("El correo electrónico no debe exceder los 100 caracteres");
      return;
    }

    try {
      await login({ email, password });
    } catch (error) {
      setPassword("");
      toast.error(error.message || "Error al iniciar sesión");
    }
  };

  if (initialLoading) {
    return (
      <div className={styles.loginLoading}>
        <SmallSpinner />
      </div>
    );
  }

  return (
    <div className={styles.formPanel}>
      <div className={styles.formContent}>
        <img
          src="https://res.cloudinary.com/dzj9vcedu/image/upload/v1749926589/corporacionlogowhitebk_ezpvra.png"
          alt="Logo Corporación 2001"
          className={styles.responsiveLogo}
        />
        <div className={styles.formHeader}>
          <h2>Inicio de sesión</h2>
          <p>Solo personal autorizado</p>
        </div>

        <form className={styles.loginForm} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.inputLabel}>
              Correo electrónico
            </label>
            <div className={styles.inputField}>
              <FiMail className={styles.inputIcon} />
              <input
                id="email"
                type="email"
                name="email"
                placeholder="tucorreo@ejemplo.com"
                required
                value={email}
                maxLength={100}
                onChange={(e) => setEmail(e.target.value)}
                disabled={actionLoading}
                autoComplete="username"
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.inputLabel}>
              Contraseña
            </label>
            <div className={styles.inputField}>
              <FiLock className={styles.inputIcon} />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                required
                minLength="8"
                maxLength={15}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={actionLoading}
                autoComplete="current-password"
              />
              <button
                type="button"
                className={styles.passwordToggle}
                aria-label={
                  showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                }
                onClick={() => setShowPassword(!showPassword)}
                disabled={actionLoading}
              >
                <FiEye />
              </button>
            </div>
            <div className={styles.forgotPassword}>
              <Link to="/forgot-password" className={styles.forgotLink}>
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            className={styles.loginButton}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <>
                <SmallSpinner />
                Procesando...
              </>
            ) : (
              <>
                Iniciar Sesión <FiArrowRight className={styles.buttonIcon} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RightPanel;
