import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import IncidentListPage from './pages/IncidentListPage';
import CreateIncidentPage from './pages/CreateIncidentPage';
import IncidentDetailsPage from './pages/IncidentDetailsPage';
import AnalysisPage from './pages/AnalysisPage';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './routes/ProtectedRoute';

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="incidents" element={<IncidentListPage />} />
        <Route path="incidents/new" element={<CreateIncidentPage />} />
        <Route path="incidents/:id" element={<IncidentDetailsPage />} />
        <Route path="analysis" element={<AnalysisPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="403" element={<NotFoundPage code={403} />} />
      <Route path="500" element={<NotFoundPage code={500} />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default App;
