import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import styles from "./welcomeSection.module.css";
import SmartAvatar from "../../ui/smartAvatar/SmartAvatar";
import { useAuth } from "../../../contexts/AuthContext";
import { AnalyticsAPI } from "../../../services/analyticsAPI";
import LoadingSpinner from '../../ui/spinner/LoadingSpinner';

const WelcomeSection = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [areaData, setAreaData] = useState([]);
  const [clientsData, setClientsData] = useState([]);
  const [revenuePeriod, setRevenuePeriod] = useState('monthly');
  const [loading, setLoading] = useState(true);
  const [showDashboard, setShowDashboard] = useState(false);

  const periodOptions = [
    { value: 'daily', label: 'Diario', defaultRange: 7 },
    { value: 'weekly', label: 'Semanal', defaultRange: 4 },
    { value: 'monthly', label: 'Mensual', defaultRange: 6 },
  ];

  const statusColors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4'];

  // Verificar si el usuario puede ver el dashboard
  useEffect(() => {
    if (user && user.roles) {
      const userRoles = user.roles.map(role => role);
      const isAdmin = userRoles.includes("Administrador");
      const isFleetMgr = userRoles.includes("Encargado Flotilla");
      
      if (isAdmin || isFleetMgr) {
        setShowDashboard(true);
        fetchDashboardData();
        fetchRevenueData(revenuePeriod);
        fetchAreaData();
        fetchClientsData();
      } else {
        setLoading(false);
      }
    }
  }, [user]);

  useEffect(() => {
    if (showDashboard) {
      fetchRevenueData(revenuePeriod);
    }
  }, [revenuePeriod, showDashboard]);

  const fetchDashboardData = async () => {
    try {
      const response = await AnalyticsAPI.getDashboard();
      if (response.data.success) {
        setDashboardData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:',);
    }
  };

  const fetchRevenueData = async (period) => {
    try {
      const option = periodOptions.find(opt => opt.value === period);
      const response = await AnalyticsAPI.getRevenue({
        period,
        range: option.defaultRange
      });
      if (response.data.success) {
        setRevenueData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching revenue data');
    }
  };

  const fetchAreaData = async () => {
    try {
      const response = await AnalyticsAPI.getServicesByArea({
        period: 'monthly',
        range: 1
      });
      if (response.data.success) {
        setAreaData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching area data:', error);
    }
  };

  const fetchClientsData = async () => {
    try {
      const response = await AnalyticsAPI.getTopClients({ limit: 5 });
      if (response.data.success) {
        setClientsData(response.data.data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching clients data:', error);
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'CRC'
    }).format(value);
  };

  const handlePeriodChange = (newPeriod) => {
    setRevenuePeriod(newPeriod);
  };

  if (loading) {
    return (
      <div className={styles.frame}>
        <div className={styles.welcomeHeader}>
          <SmartAvatar 
            size="md" 
            className={styles.welcomeAvatar}
          />
          <h1 className={styles.welcomeTitle}>
            Hola,{" "}
            <span className={styles.userName}>{user?.name || "Usuario"}</span>
          </h1>
        </div>
               <LoadingSpinner />

      </div>
    );
  }

  return (
    <>
      {/* Welcome Header - Siempre visible */}
      <div className={styles.frame}>
        <div className={styles.welcomeHeader}>
          <SmartAvatar 
            size="md" 
            className={styles.welcomeAvatar}
          />
          <h1 className={styles.welcomeTitle}>
            Hola,{" "}
            <span className={styles.userName}>{user?.name || "Usuario"}</span>
          </h1>
        </div>
        <p className={styles.welcomeMessage}>
          Bienvenido al panel de control de Corporación 2001
        </p>
      </div>

      {/* Dashboard - Solo visible para usuarios autorizados */}
      {showDashboard && (
        <div className={styles.analyticsContainer}>
          
          {/* Métricas principales */}
          {dashboardData && (
            <div className={styles.metricsGrid}>
              <div className={styles.metricCard}>
                <h3 className={styles.metricLabel}>TOTAL SERVICIOS</h3>
                <p className={styles.metricValue}>{dashboardData.totalServices}</p>
              </div>
              
              <div className={styles.metricCard}>
                <h3 className={styles.metricLabel}>INGRESOS DEL MES</h3>
                <p className={`${styles.metricValue} ${styles.metricRevenue}`}>
                  {formatCurrency(dashboardData.monthlyRevenue)}
                </p>
              </div>
              
              <div className={styles.metricCard}>
                <h3 className={styles.metricLabel}>COMPLETADOS HOY</h3>
                <p className={`${styles.metricValue} ${styles.metricCompleted}`}>
                  {dashboardData.completedToday}
                </p>
              </div>
            </div>
          )}

          {/* Gráficos principales */}
          <div className={styles.chartsGrid}>
            
            {/* Gráfico de ingresos */}
            <div className={styles.chartCard}>
              <div className={styles.chartHeader}>
                <h3 className={styles.chartTitle}>Ingresos</h3>
                <select 
                  value={revenuePeriod} 
                  onChange={(e) => handlePeriodChange(e.target.value)}
                  className={styles.periodSelector}
                >
                  {periodOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className={styles.chartContainer}>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f2f5" />
                    <XAxis dataKey="period" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      formatter={(value) => [formatCurrency(value), 'Ingresos']}
                      labelStyle={{ color: '#121035' }}
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #ddd', 
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="#4ecdc4" 
                      strokeWidth={3}
                      dot={{ fill: '#4ecdc4', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#4ecdc4', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Gráfico de estados de servicio */}
            {dashboardData?.statusDistribution && (
              <div className={styles.chartCard}>
                <h3 className={styles.chartTitle}>Estado de Servicios</h3>
                
                <div className={styles.chartContainer}>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={dashboardData.statusDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {dashboardData.statusDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={statusColors[index % statusColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value, name) => [value, name]}
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #ddd', 
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

          {/* Gráficos secundarios */}
          <div className={styles.chartsGrid}>
            
            {/* Servicios por área */}
            {areaData.length > 0 && (
              <div className={styles.chartCard}>
                <h3 className={styles.chartTitle}>Servicios por Área</h3>
                
                <div className={styles.chartContainer}>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={areaData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f2f5" />
                      <XAxis dataKey="area" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip 
                        formatter={(value) => [value, 'Servicios']}
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #ddd', 
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                      />
                      <Bar dataKey="count" fill="#8884d8" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Top clientes */}
            {clientsData.length > 0 && (
              <div className={styles.chartCard}>
                <h3 className={styles.chartTitle}>Top Clientes</h3>
                
                <div className={styles.chartContainer}>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={clientsData} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f2f5" />
                      <XAxis type="number" tick={{ fontSize: 12 }} />
                      <YAxis 
                        dataKey="client" 
                        type="category" 
                        tick={{ fontSize: 11 }} 
                        width={120}
                      />
                      <Tooltip 
                        formatter={(value) => [value, 'Servicios']}
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #ddd', 
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                      />
                      <Bar dataKey="services" fill="#82ca9d" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default WelcomeSection;
