import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

import Home from "./pages/Home";
import StudentEditProfile from "./pages/StudentEditProfile";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import PublicPortfolio from "./pages/PublicPortfolio";
import FacultyDashboard from "./pages/FacultyDashboard";
import FacultyAnalytics from "./pages/FacultyAnalytics";
import FacultyReports from "./pages/FacultyReports";
import FacultySettings from "./pages/FacultySettings";
import AllStudents from "./pages/AllStudents";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";
import UnifiedLogin from "./pages/UnifiedLogin";
import ForgotPassword from "./pages/ForgotPassword";
import ProtectedRoute from "./components/ProtectedRoute";
import StudentDetails from "./pages/StudentDetails";

function GlobalShortcuts() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onKeyDown = (event) => {
      const isAdminShortcut = (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "a") || (event.altKey && event.key.toLowerCase() === "a");
      if (!isAdminShortcut) return;

      const activeTag = document.activeElement?.tagName?.toLowerCase();
      const isTyping = activeTag === "input" || activeTag === "textarea" || document.activeElement?.isContentEditable;
      if (isTyping) return;

      event.preventDefault();

      const hasAdminSession = Boolean(localStorage.getItem("admin"));
      const targetPath = hasAdminSession ? "/admin" : "/admin-login";
      if (location.pathname !== targetPath) {
        navigate(targetPath);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [navigate, location.pathname]);

  return null;
}

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <GlobalShortcuts />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<UnifiedLogin />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/student-login" element={<UnifiedLogin />} />
        <Route path="/student-edit" element={<StudentEditProfile />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['student']}><Dashboard /></ProtectedRoute>} />
        <Route path="/all-students" element={<ProtectedRoute allowedRoles={['staff', 'admin']}><AllStudents /></ProtectedRoute>} />
        <Route path="/portfolio/:studentId" element={<PublicPortfolio />} />
        <Route path="/staff-login" element={<UnifiedLogin />} />
        <Route path="/staff-register" element={<Register />} />
        <Route path="/staff-dashboard" element={<ProtectedRoute allowedRoles={['staff']}><FacultyDashboard /></ProtectedRoute>} />
        <Route path="/faculty-analytics" element={<ProtectedRoute allowedRoles={['staff']}><FacultyAnalytics /></ProtectedRoute>} />
        <Route path="/faculty-reports" element={<ProtectedRoute allowedRoles={['staff']}><FacultyReports /></ProtectedRoute>} />
        <Route path="/faculty-settings" element={<ProtectedRoute allowedRoles={['staff']}><FacultySettings /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><Admin /></ProtectedRoute>} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/student-details/:studentId" element={<ProtectedRoute allowedRoles={['staff', 'admin']}><StudentDetails /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
