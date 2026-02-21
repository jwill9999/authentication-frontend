import React, { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({
  children,
}: ProtectedRouteProps): React.JSX.Element => {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        Loading...
      </div>
    );
  }

  // Require both an in-memory token and a known user
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
