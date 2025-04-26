import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true' &&
        sessionStorage.getItem('isAuthenticated') === 'true';

    if (!isAuthenticated) {
        // Clear any stale auth data
        localStorage.removeItem('isAuthenticated');
        sessionStorage.removeItem('isAuthenticated');
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;