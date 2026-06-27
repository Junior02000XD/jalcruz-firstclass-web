import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/Auth/LoginPage';
import Dashboard from './pages/Dashboard';
import WorkersPage from './pages/jalcruz/WorkersPage';
import { ProtectedRoute } from './routes/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import WorkAreasPage from './pages/jalcruz/WorkAreasPage';
import PayrollsPage from './pages/jalcruz/PayrollsPage';
import PayrollDetailsPage from './pages/jalcruz/PayrollDetailsPage';
import CompaniesPage from './pages/jalcruz/CompaniesPage';
import UsersPage from './pages/admin/UsersPage';
import RegisterPage from './pages/Auth/RegisterPage';
// First Class (CRM)
import CrmDashboardPage from './pages/firstclass/CrmDashboardPage';
import ProspectsPage from './pages/firstclass/ProspectsPage';
import TrialClassesPage from './pages/firstclass/TrialClassesPage';
import SalesPage from './pages/firstclass/SalesPage';
import CampaignsPage from './pages/firstclass/CampaignsPage';
import TeachersPage from './pages/firstclass/TeachersPage';
import ProductsPage from './pages/firstclass/ProductsPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Rutas con el diseño del Panel (Sidebar + Topbar) */}
        <Route element={<AppLayout />}>

          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />

          {/* ───── Módulo Jalcruz (RRHH) ───── */}
          <Route path="/jalcruz/trabajadores" element={
            <ProtectedRoute requiredRole="HR Admin"><WorkersPage /></ProtectedRoute>
          } />
          <Route path="/jalcruz/areas" element={
            <ProtectedRoute requiredRole="HR Admin"><WorkAreasPage /></ProtectedRoute>
          } />
          <Route path="/jalcruz/planillas" element={
            <ProtectedRoute requiredRole="HR Admin"><PayrollsPage /></ProtectedRoute>
          } />
          <Route path="/jalcruz/planillas/:id" element={
            <ProtectedRoute requiredRole="HR Admin"><PayrollDetailsPage /></ProtectedRoute>
          } />
          <Route path="/jalcruz/empresas" element={
            <ProtectedRoute requiredRole="HR Admin"><CompaniesPage /></ProtectedRoute>
          } />

          {/* ───── Módulo First Class (CRM) ───── */}
          <Route path="/firstclass" element={
            <ProtectedRoute requiredRole="CRM Admin"><CrmDashboardPage /></ProtectedRoute>
          } />
          <Route path="/firstclass/prospectos" element={
            <ProtectedRoute requiredRole="CRM Admin"><ProspectsPage /></ProtectedRoute>
          } />
          <Route path="/firstclass/clases" element={
            <ProtectedRoute requiredRole="CRM Admin"><TrialClassesPage /></ProtectedRoute>
          } />
          <Route path="/firstclass/ventas" element={
            <ProtectedRoute requiredRole="CRM Admin"><SalesPage /></ProtectedRoute>
          } />
          <Route path="/firstclass/campanas" element={
            <ProtectedRoute requiredRole="CRM Admin"><CampaignsPage /></ProtectedRoute>
          } />
          <Route path="/firstclass/profesores" element={
            <ProtectedRoute requiredRole="CRM Admin"><TeachersPage /></ProtectedRoute>
          } />
          <Route path="/firstclass/productos" element={
            <ProtectedRoute requiredRole="CRM Admin"><ProductsPage /></ProtectedRoute>
          } />

          {/* ───── Admin ───── */}
          <Route path="/admin/users" element={
            <ProtectedRoute requiredRole="Super Admin"><UsersPage /></ProtectedRoute>
          } />

        </Route>

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
