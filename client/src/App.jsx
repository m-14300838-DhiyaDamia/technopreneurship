import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './auth/AuthContext.jsx';
import { AppShell } from './components/AppShell.jsx';
import { ProtectedRoute, homeFor } from './components/ProtectedRoute.jsx';
import { Spinner } from './components/ui.jsx';
import LoginPage from './pages/LoginPage.jsx';
import AccountPage from './pages/AccountPage.jsx';
import StudentDashboard from './pages/student/StudentDashboard.jsx';
import AssessmentPage from './pages/student/AssessmentPage.jsx';
import LecturerDashboard from './pages/lecturer/LecturerDashboard.jsx';
import StudentManager from './pages/lecturer/StudentManager.jsx';
import GroupManager from './pages/lecturer/GroupManager.jsx';
import AssessmentManager from './pages/lecturer/AssessmentManager.jsx';
import LiveMonitoring from './pages/lecturer/LiveMonitoring.jsx';
import MarkingList from './pages/lecturer/MarkingList.jsx';
import MarkingPanel from './pages/lecturer/MarkingPanel.jsx';
import ProposalsOverview from './pages/lecturer/ProposalsOverview.jsx';
import ProposalPage from './pages/lecturer/ProposalPage.jsx';
import ReportsPage from './pages/lecturer/ReportsPage.jsx';
import IndividualStudentReport from './pages/lecturer/IndividualStudentReport.jsx';
import GroupReport from './pages/lecturer/GroupReport.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';

const STAFF = ['lecturer', 'admin'];

export default function App() {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={homeFor(user.role)} replace /> : <LoginPage />} />

      <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
        <Route path="/account" element={<AccountPage />} />
      </Route>

      <Route element={<ProtectedRoute roles={['student']}><AppShell /></ProtectedRoute>}>
        <Route path="/student" element={<StudentDashboard />} />
      </Route>
      <Route element={<ProtectedRoute roles={['student']}><AppShell wide hideNav /></ProtectedRoute>}>
        <Route path="/student/assessments/:id" element={<AssessmentPage />} />
      </Route>

      <Route element={<ProtectedRoute roles={STAFF}><AppShell wide /></ProtectedRoute>}>
        <Route path="/lecturer" element={<LecturerDashboard />} />
        <Route path="/lecturer/students" element={<StudentManager />} />
        <Route path="/lecturer/groups" element={<GroupManager />} />
        <Route path="/lecturer/assessments" element={<AssessmentManager />} />
        <Route path="/lecturer/assessments/:id" element={<AssessmentManager />} />
        <Route path="/lecturer/monitoring" element={<LiveMonitoring />} />
        <Route path="/lecturer/marking" element={<MarkingList />} />
        <Route path="/lecturer/marking/:attemptId" element={<MarkingPanel />} />
        <Route path="/lecturer/proposals" element={<ProposalsOverview />} />
        <Route path="/lecturer/proposals/:assessmentId/:groupId" element={<ProposalPage />} />
        <Route path="/lecturer/reports" element={<ReportsPage />} />
        <Route path="/lecturer/reports/individual/:attemptId" element={<IndividualStudentReport />} />
        <Route path="/lecturer/reports/group/:assessmentId/:groupId" element={<GroupReport />} />
      </Route>

      <Route element={<ProtectedRoute roles={['admin']}><AppShell wide /></ProtectedRoute>}>
        <Route path="/admin" element={<AdminDashboard />} />
      </Route>

      <Route path="*" element={<Navigate to={user ? homeFor(user.role) : '/login'} replace />} />
    </Routes>
  );
}
