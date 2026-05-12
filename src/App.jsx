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

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Agrupamos todas las rutas que llevan el diseño del Panel (Sidebar + Topbar) */}
        <Route element={ <AppLayout /> }>
            
            <Route path="/dashboard" element={
                <ProtectedRoute>
                    <Dashboard />
                </ProtectedRoute>
            } />
            
            <Route path="/jalcruz/trabajadores" element={
                <ProtectedRoute requiredRole="HR Admin">
                    <WorkersPage />
                </ProtectedRoute>
            } />

            <Route path="/jalcruz/areas" element={
                <ProtectedRoute requiredRole="HR Admin">
                    <WorkAreasPage />
                </ProtectedRoute>
            } />

            <Route path="/jalcruz/planillas" element={
                <ProtectedRoute requiredRole="HR Admin">
                    <PayrollsPage />
                </ProtectedRoute>
            } />

            <Route path="/jalcruz/planillas" element={
                <ProtectedRoute requiredRole="HR Admin">
                    <PayrollsPage />
                </ProtectedRoute>
            } />

            <Route path="/jalcruz/planillas/:id" element={
                <ProtectedRoute requiredRole="HR Admin">
                    <PayrollDetailsPage />
                </ProtectedRoute>
            } />

            <Route path="/jalcruz/empresas" element={
                <ProtectedRoute requiredRole="HR Admin">
                    <CompaniesPage />
                </ProtectedRoute>
            } />

            <Route path="/admin/users" element={
                <ProtectedRoute requiredRole="Super Admin">
                    <UsersPage />
                </ProtectedRoute>
            } />

        </Route>

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;