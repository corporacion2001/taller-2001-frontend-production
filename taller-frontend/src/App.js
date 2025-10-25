import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import PrivateRoute from "./utils/privateRoute.js";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import HomePage from "./components/homePage/HomePage";
import Login from "./components/auth/login/Login.jsx";
import ForgotPassword from "./components/auth/forgotPassword/ForgotPassword";
import ResetPassword from "./components/auth/resetPassword/ResetPassword.jsx";

import Dashboard from "./components/dashboard/Dashboard.jsx";
import WelcomeSection from "./components/dashboard/welcomeSection/WelcomeSection.jsx";
import UserManagement from "./components/userManagement/UserManagement.jsx";
import ServicesList from "./components/serviceManagement/ServicesList/ServicesList.jsx";

import UserProfile from "./components/userProfile/UserProfile.jsx";
import RegisterUser from "./components/auth/registerUser/RegisterUser.jsx";
import EditUser from "./components/userManagement/editUser/EditUser.jsx";
import Stepper from "./components/serviceManagement/serviceStepper/Stepper.jsx";
import ServiceDetails from "./components/serviceManagement/ServiceDetails/ServiceDetails.jsx";

import MonitoringServices from "./components/monitoring/MonitoringServices.jsx";
import ClientSearch from "./components/clientManagement/clientSearch/ClientSearch.jsx";
import VehicleSearch from "./components/vehicleManagement/vehicleSearch/VehicleSearch.jsx";

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <ToastContainer
            position="bottom-right"
            autoClose={5000}
            limit={10} // Limita el número de toasts visibles
          />
          <Routes>
            {/* Rutas públicas */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Rutas protegidas */}

            {/* MONITOREO */}
            <Route
              element={
                <PrivateRoute
                  allowedRoles={[
                    "Monitoreo Livianos",
                    "Monitoreo Pesados",
                    "Monitoreo Enderezado y Pintura",
                    "Monitoreo Metalmecánica",
                    "Monitoreo Todo Frenos y Clutch",
                    "Monitoreo Hidráulica",
                  ]}
                />
              }
            >
              <Route path="/monitoring" element={<MonitoringServices />} />
            </Route>

            {/* Rutas accesibles para todos los usuarios autenticados */}
            <Route element={<PrivateRoute />}>
              <Route element={<Dashboard />}>
                <Route path="/dashboard" element={<WelcomeSection />} />
              </Route>
            </Route>

            {/* PROFILE */}
            <Route
              element={
                <PrivateRoute
                  allowedRoles={[
                    "Administrador",
                    "Encargado Flotilla",
                    "Encargado Livianos",
                    "Encargado Pesados",
                    "Encargado Enderezado y Pintura",
                    "Encargado Metalmecánica",
                    "Encargado Todo Frenos y Cluth",
                    "Encargado Hidráulica",
                    "Monitoreo Livianos",
                    "Monitoreo Pesados",
                    "Monitoreo Enderezado y Pintura",
                    "Monitoreo Metalmecánica",
                    "Monitoreo Todo Frenos y Clutch",
                    "Monitoreo Hidráulica",
                    "Ingresador Servicios",
                    "Gestor Repuestos",
                  ]}
                />
              }
            >
              <Route element={<Dashboard />}>
                <Route path="/dashboard/profile" element={<UserProfile />} />
              </Route>
            </Route>

            {/* ADMINISTRADOR */}
            <Route element={<PrivateRoute allowedRoles={["Administrador"]} />}>
              <Route element={<Dashboard />}>
                <Route
                  path="/dashboard/user-management"
                  element={<UserManagement />}
                />
                <Route
                  path="/dashboard/register-user"
                  element={<RegisterUser />}
                />
                <Route path="/dashboard/edit-user/:id" element={<EditUser />} />
              </Route>
            </Route>

            {/* ENCARGADOS */}
            <Route
              element={
                <PrivateRoute
                  allowedRoles={[
                    "Administrador",
                    "Encargado Flotilla",
                    "Encargado Livianos",
                    "Encargado Pesados",
                    "Encargado Enderezado y Pintura",
                    "Encargado Metalmecánica",
                    "Encargado Todo Frenos y Cluth",
                    "Encargado Hidráulica",
                    "Ingresador Servicios",
                    "Gestor Repuestos",
                  ]}
                />
              }
            >
              <Route element={<Dashboard />}>
                <Route path="/dashboard/nuevo-servicio" element={<Stepper />} />
              </Route>
            </Route>

            <Route
              element={
                <PrivateRoute
                  allowedRoles={[
                    "Administrador",
                    "Encargado Flotilla",
                    "Encargado Livianos",
                    "Encargado Pesados",
                    "Encargado Enderezado y Pintura",
                    "Encargado Metalmecánica",
                    "Encargado Todo Frenos y Cluth",
                    "Encargado Hidráulica",
                    "Gestor Repuestos",
                  ]}
                />
              }
            >
              <Route element={<Dashboard />}>
                <Route
                  path="/dashboard/gestion/servicios"
                  element={<ServicesList />}
                />
                <Route
                  path="/dashboard/servicios/:serviceId"
                  element={<ServiceDetails />}
                />

                <Route
                  path="/dashboard/gestion/clientes"
                  element={<ClientSearch />}
                />
                <Route
                  path="/dashboard/gestion/vehicles"
                  element={<VehicleSearch />}
                />
              </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
