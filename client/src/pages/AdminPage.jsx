import React from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { AdminPanel } from '../components/admin/AdminPanel';
import { Navigate } from 'react-router-dom';

export const AdminPage = () => {
  const { isAdmin, loading } = useWorkspace();

  if (loading) return null;

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="space-y-6">
      <AdminPanel />
    </div>
  );
};
