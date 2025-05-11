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
import TimeGridCalendarPage from "./pages/TimeGridCalendarPage";
import KnowledgeEntries from "./pages/KnowledgeEntries";
import Categories from "./pages/Categories";
import FrequentQuestions from "./pages/FrequentQuestions";
import AppointmentCalendar from "./pages/AppointmentCalendar";
import Branches from "./pages/Branches";
import Services from "./pages/Services";
import Users from "./pages/Users";
import Roles from "./pages/Roles";

const PrivateRoute = ({ children, requiredRoles = [] }: { children: JSX.Element, requiredRoles?: string[] }) => {
  const { token, user } = useAuth();
  
  if (!token) return <Navigate to="/" />;
  
  // Se houver roles requeridas, verificar se o usuário tem permissão
  if (requiredRoles.length > 0 && (!user?.role || !requiredRoles.includes(user.role))) {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};

// Componente para redirecionar usuários já autenticados que acessam a página de login
const PublicRoute = ({ children }: { children: JSX.Element }) => {
  const { token } = useAuth();
  return token ? <Navigate to="/dashboard" /> : children;
};

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route element={<PrivateRoute><MainLayout /></PrivateRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/therapists" element={<Therapists />} />
          <Route path="/therapist-schedule" element={<TherapistSchedule />} />
          <Route path="/calendar" element={<TimeGridCalendarPage />} />
          <Route path="/appointment-calendar" element={<AppointmentCalendar />} />
          <Route path="/branches" element={
            <PrivateRoute requiredRoles={['ADMIN']}>
              <Branches />
            </PrivateRoute>
          } />
          <Route path="/services" element={<Services />} />
          <Route path="/users" element={
            <PrivateRoute requiredRoles={['ADMIN']}>
              <Users />
            </PrivateRoute>
          } />
          <Route path="/roles" element={
            <PrivateRoute requiredRoles={['ADMIN']}>
              <Roles />
            </PrivateRoute>
          } />
          <Route path="/system-settings" element={<Navigate to="/system-settings" replace />} />
          
          {/* Rotas da Base de Conhecimento */}
          <Route path="/knowledge-entries" element={<KnowledgeEntries />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/frequent-questions" element={<FrequentQuestions />} />
        </Route>
        {/* Rota de fallback - redireciona para dashboard ou login dependendo da autenticação */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;