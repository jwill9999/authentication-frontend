import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { protectedAPI } from '../services/api';
import './Dashboard.css';

type ProfileData = Record<string, unknown>;

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Failed to load profile';
};

const Dashboard = (): React.JSX.Element => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async (): Promise<void> => {
      try {
        const data = await protectedAPI.getProfile(token!);
        setProfile(data);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchProfile();
    }
  }, [token]);

  const handleLogout = (): void => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <nav className="navbar">
        <h2>My Dashboard</h2>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </nav>

      <div className="dashboard-content">
        <div className="welcome-card">
          <h1>Welcome to your Dashboard!</h1>
          <p>
            You are logged in as: <strong>{user?.email}</strong>
          </p>

          {loading && <p className="loading">Loading profile...</p>}

          {error && (
            <div className="error-box">
              <p>Error loading profile: {error}</p>
            </div>
          )}

          {profile && (
            <div className="profile-box">
              <h3>Profile Information</h3>
              <pre>{JSON.stringify(profile, null, 2)}</pre>
            </div>
          )}

          <div className="info-box">
            <p>
              This is a protected route. Only authenticated users can access
              this page.
            </p>
            <p>
              <strong>JWT Token:</strong> {token?.substring(0, 20)}...
            </p>
          </div>
        </div>

        <div className="cards-grid">
          <div className="card">
            <h3>Profile</h3>
            <p>Manage your account settings</p>
          </div>
          <div className="card">
            <h3>Analytics</h3>
            <p>View your statistics</p>
          </div>
          <div className="card">
            <h3>Settings</h3>
            <p>Configure your preferences</p>
          </div>
          <div className="card">
            <h3>Help</h3>
            <p>Get support and documentation</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
