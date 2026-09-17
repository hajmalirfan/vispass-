import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegistrationPage from './pages/RegistrationPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import HostDashboardLayout from './layouts/HostDashboardLayout';
import MyEventsPage from './pages/host/MyEventsPage';
import CreateEventPage from './pages/host/CreateEventPage';
import VisitorRequestsPage from './pages/host/VisitorRequestsPage';
import AcceptedVisitorsPage from './pages/host/AcceptedVisitorsPage';
import RejectedVisitorsPage from './pages/host/RejectedVisitorsPage';
import AttendancePage from './pages/host/AttendancePage';
import ReportsPage from './pages/host/ReportsPage';
import VisitorDashboardLayout from './layouts/VisitorDashboardLayout';
import AvailableEventsPage from './pages/visitor/AvailableEventsPage';
import MyApplicationsPage from './pages/visitor/MyApplicationsPage';
import QrPassPage from './pages/visitor/QrPassPage';
import ProfilePage from './pages/visitor/ProfilePage';
import EventRegisterPage from './pages/visitor/EventRegisterPage';
import CheckerDashboardLayout from './layouts/CheckerDashboardLayout';
import QrScannerPage from './pages/checker/QrScannerPage';
import TodaysEntriesPage from './pages/checker/TodaysEntriesPage';
import AdminDashboardLayout from './layouts/AdminDashboardLayout';
import AdminOverviewPage from './pages/admin/AdminOverviewPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/register" element={<RegistrationPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Host Dashboard */}
          <Route path="/dashboard/host" element={<HostDashboardLayout><MyEventsPage /></HostDashboardLayout>} />
          <Route path="/dashboard/host/events/new" element={<HostDashboardLayout><CreateEventPage /></HostDashboardLayout>} />
          <Route path="/dashboard/host/events/:id/edit" element={<HostDashboardLayout><CreateEventPage /></HostDashboardLayout>} />
          <Route path="/dashboard/host/visitor-requests" element={<HostDashboardLayout><VisitorRequestsPage /></HostDashboardLayout>} />
          <Route path="/dashboard/host/accepted" element={<HostDashboardLayout><AcceptedVisitorsPage /></HostDashboardLayout>} />
          <Route path="/dashboard/host/rejected" element={<HostDashboardLayout><RejectedVisitorsPage /></HostDashboardLayout>} />
          <Route path="/dashboard/host/attendance" element={<HostDashboardLayout><AttendancePage /></HostDashboardLayout>} />
          <Route path="/dashboard/host/reports" element={<HostDashboardLayout><ReportsPage /></HostDashboardLayout>} />

          {/* Visitor */}
          <Route path="/dashboard/visitor" element={<VisitorDashboardLayout><AvailableEventsPage /></VisitorDashboardLayout>} />
          <Route path="/dashboard/visitor/applications" element={<VisitorDashboardLayout><MyApplicationsPage /></VisitorDashboardLayout>} />
          <Route path="/dashboard/visitor/qr-pass" element={<VisitorDashboardLayout><QrPassPage /></VisitorDashboardLayout>} />
          <Route path="/dashboard/visitor/profile" element={<VisitorDashboardLayout><ProfilePage /></VisitorDashboardLayout>} />
          <Route path="/events/:id/register" element={<EventRegisterPage />} />

          {/* Checker */}
          <Route path="/dashboard/checker" element={<CheckerDashboardLayout><QrScannerPage /></CheckerDashboardLayout>} />
          <Route path="/dashboard/checker/today" element={<CheckerDashboardLayout><TodaysEntriesPage /></CheckerDashboardLayout>} />

          {/* Admin (OTP login only) */}
          <Route path="/dashboard/admin" element={<AdminDashboardLayout><AdminOverviewPage /></AdminDashboardLayout>} />
          <Route path="/dashboard/admin/users" element={<AdminDashboardLayout><AdminUsersPage /></AdminDashboardLayout>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
