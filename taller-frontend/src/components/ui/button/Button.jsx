// components/shared/Button.jsx
import styles from './button.module.css';

const Button = ({ 
  children, 
  icon: Icon, 
  variant = 'default',
  loading = false,
  className = '',
  ...props 
}) => (
  <button 
    className={`${styles.button} ${styles[variant]} ${className}`}
    disabled={loading}
    {...props}
  >
    {Icon && <Icon className={styles.icon} />}
    {loading ? 'Cargando...' : children}
  </button>
);

export default Button;