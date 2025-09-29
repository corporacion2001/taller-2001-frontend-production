import { useState } from 'react';
import { Outlet } from 'react-router-dom'; 
import styles from "./dashboard.module.css";
import Sidebar from "./sidebar/Sidebar";
import TopBar from "./topbar/TopBar";
import { useAuth } from "../../contexts/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className={styles.dashboardContainer}>
      <Sidebar 
        user={user} 
        closeSidebar={() => setSidebarOpen(false)}
        isMobileOpen={sidebarOpen}
      />
      <div className={styles.mainContent}>
        <TopBar user={user} toggleSidebar={toggleSidebar} />
        <div className={styles.contentArea}>
          <Outlet /> 
        </div>
        {sidebarOpen && (
          <div 
            className={styles.overlay}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
