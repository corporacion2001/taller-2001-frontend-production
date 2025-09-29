import React, { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import styles from "./sidebar.module.css";
import {
  FiHome,
  FiUserPlus,
  FiLogOut,
  FiX,
  FiChevronDown,
  FiChevronRight,
  FiTool,
  FiTruck,
  FiUser,
  FiMonitor,
} from "react-icons/fi";
import { useAuth } from "../../../contexts/AuthContext";

const NavItem = ({ to, icon, text, onClick, isSubItem = false }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `${styles.navItem} ${isActive ? styles.active : ""} ${
          isSubItem ? styles.subItem : ""
        }`
      }
      end
      onClick={onClick}
    >
      {React.cloneElement(icon, { className: styles.navIcon })}
      <span className={styles.navText}>{text}</span>
    </NavLink>
  );
};

const CollapsibleMenu = ({ title, icon, children, routes = [] }) => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const isActive = routes.some((route) => location.pathname.startsWith(route));

  return (
    <div className={styles.collapsibleContainer}>
      <div
        className={`${styles.navItem} ${isActive ? styles.active : ""} ${
          styles.collapsibleHeader
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {React.cloneElement(icon, { className: styles.navIcon })}
        <span className={styles.navText}>{title}</span>
        {isOpen ? (
          <FiChevronDown className={styles.chevronIcon} />
        ) : (
          <FiChevronRight className={styles.chevronIcon} />
        )}
      </div>
      <div className={`${styles.subMenu} ${isOpen ? styles.open : ""}`}>
        {children}
      </div>
    </div>
  );
};

const Sidebar = ({ user, closeSidebar, isMobileOpen }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const isAdmin = user?.roles?.includes("Administrador");
  const isMonitor = user?.roles?.some((role) => role.startsWith("Monitoreo"));
  const isEncargado = user?.roles?.some((role) =>
    [
      "Encargado Flotilla",
      "Encargado Livianos",
      "Encargado Pesados",
      "Encargado Enderezado y Pintura",
      "Encargado Metalmecánica",
      "Encargado Todo Frenos y Cluth",
      "Encargado Hidráulica",
    ].includes(role)
  );
  
  // Verificar si el usuario puede ver la opción de Clientes
  const canSeeClients = isAdmin || user?.roles?.includes("Encargado Flotilla");

  const handleNavClick = () => {
    if (window.innerWidth <= 768 && closeSidebar) {
      closeSidebar();
    }
  };

  const handleLogout = async () => {
    try {
      await logout(); // intenta cerrar sesión en el backend
    } catch (error) {
      console.warn("Error al cerrar sesión en backend");
    } finally {
      if (closeSidebar) closeSidebar();
      navigate("/login", { replace: true });
    }
  };

  return (
    <div
      className={`${styles.sidebar} ${isMobileOpen ? styles.mobileOpen : ""}`}
    >
      <div className={styles.sidebarHeader}>
        <div className={styles.logoContainer}>
          <a href="/dashboard" className={styles.navbarLogo}>
            <img
              src="https://res.cloudinary.com/dzj9vcedu/image/upload/v1749708920/corporacionlogo_aoppj5.png"
              alt="logo"
              className={styles.logoImage}
            />
          </a>
        </div>
        <button
          className={styles.closeButton}
          onClick={closeSidebar}
          aria-label="Cerrar menú"
        >
          <FiX className={styles.closeIcon} />
        </button>
      </div>

      <nav className={styles.navMenu}>
        <NavItem
          to="/dashboard"
          icon={<FiHome />}
          text="Inicio"
          onClick={handleNavClick}
        />

        {(isAdmin || isEncargado) && (
          <CollapsibleMenu
            title="Gestión"
            icon={<FiTool />}
            routes={[
              "/dashboard/gestion/servicios",
              "/dashboard/gestion/clientes",
              "/dashboard/gestion/vehiculos",
            ]}
          >
            <NavItem
              to="/dashboard/gestion/servicios"
              icon={<FiTool />}
              text="Servicios"
              onClick={handleNavClick}
              isSubItem
            />
            
            {/* Opción de Clientes solo visible para Admin o Encargado Flotilla */}
            {canSeeClients && (
              <NavItem
                to="/dashboard/gestion/clientes"
                icon={<FiUser />}
                text="Clientes"
                onClick={handleNavClick}
                isSubItem
              />
            )}
            
            <NavItem
              to="/dashboard/gestion/vehicles"
              icon={<FiTruck />}
              text="Vehículos"
              onClick={handleNavClick}
              isSubItem
            />
          </CollapsibleMenu>
        )}

        {isAdmin && (
          <NavItem
            to="/dashboard/user-management"
            icon={<FiUserPlus />}
            text="Usuarios"
            onClick={handleNavClick}
          />
        )}

        {isMonitor && (
          <NavItem
            to="/monitoring"
            icon={<FiMonitor />}
            text="Monitoreo"
            onClick={handleNavClick}
          />
        )}
      </nav>

      <div className={styles.bottomSection}>
        <button
          className={styles.logoutButton}
          onClick={handleLogout}
          type="button"
        >
          <FiLogOut className={styles.navIcon} />
          <span className={styles.navText}>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;