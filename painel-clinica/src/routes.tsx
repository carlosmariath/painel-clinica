import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import MainLayout from "./layouts/MainLayout";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import Appointments from "./pages/Appointments";
import Clients from "./pages/Clients";
import Therapists from "./pages/Therapists";
import { JSX } from "react";
import TherapistSchedule from "./pages/TherapistSchedule";

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/" />;
};

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route element={<PrivateRoute><MainLayout /></PrivateRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/therapists" element={<Therapists />} />
          <Route path="/therapist-schedule" element={<TherapistSchedule />} /> {/* 🔹 Adicionando a rota */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;