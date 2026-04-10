import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * ProtectedRoute Component
 * @param {Object} props
 * @param {React.ReactNode} props.children - The component to render if authorized
 * @param {string} props.role - The required role to access this route ('student', 'staff', 'admin')
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
    const studentUser = localStorage.getItem('user');
    const staffUser = localStorage.getItem('staff');
    const adminUser = localStorage.getItem('admin');

    // Normalize allowedRoles to an array
    const allowed = Array.isArray(allowedRoles) ? allowedRoles : (allowedRoles ? [allowedRoles] : []);

    // Determine current user's role with proper priority
    let userRole = null;
    if (adminUser) {
        userRole = 'admin';
    } else if (staffUser) {
        // Clear student data if logged in as staff to avoid role conflicts
        if (studentUser) localStorage.removeItem('user');
        userRole = 'staff';
    } else if (studentUser) {
        // Clear staff data if logged in as student to avoid role conflicts
        if (staffUser) localStorage.removeItem('staff');
        userRole = 'student';
    }

    // Check if user's role is in the allowed list
    if (userRole && allowed.includes(userRole)) {
        return children;
    }

    // Redirect if not authorized
    if (!userRole) {
        // Not logged in at all - choose redirect based on allowed roles
        if (allowed.includes('admin')) return <Navigate to="/admin-login" replace />;
        return <Navigate to="/" replace />;
    }

    // Logged in but as the wrong role
    console.warn(`Access Denied: Your role (${userRole}) does not have permission to access this page.`);
    return <Navigate to="/" replace />;
};


export default ProtectedRoute;
