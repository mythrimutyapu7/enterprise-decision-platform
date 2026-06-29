import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import IncidentListPage from './pages/IncidentListPage';
import CreateIncidentPage from './pages/CreateIncidentPage';
import IncidentDetailsPage from './pages/IncidentDetailsPage';
import AnalysisPage from './pages/AnalysisPage';
import PlannerPage from './pages/PlannerPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';
import PlaybooksPage from './pages/PlaybooksPage';
import ThreatIntelPage from './pages/ThreatIntelPage';
import ReportsPage from './pages/ReportsPage';
import UsersRolesPage from './pages/UsersRolesPage';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './routes/ProtectedRoute';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="incidents" element={<IncidentListPage />} />
        <Route path="incidents/new" element={<CreateIncidentPage />} />
        <Route path="incidents/:id" element={<IncidentDetailsPage />} />
        <Route path="analysis" element={<AnalysisPage />} />
        <Route path="planner" element={<PlannerPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="playbooks" element={<PlaybooksPage />} />
        <Route path="threat-intelligence" element={<ThreatIntelPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="users-roles" element={<UsersRolesPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="403" element={<NotFoundPage code={403} />} />
      <Route path="500" element={<NotFoundPage code={500} />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default App;
