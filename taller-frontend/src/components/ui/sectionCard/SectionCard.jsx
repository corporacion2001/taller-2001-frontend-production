import styles from './sectionCard.module.css';

export const SectionCard = ({ title, icon: Icon, children }) => (
  <div className={styles.sectionCard}>
    <h2 className={styles.sectionTitle}>
      <Icon className={styles.sectionIcon} /> {title}
    </h2>
    {children}
  </div>
);