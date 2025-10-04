import { lazy, Suspense } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import AdminLayout from '../components/layouts/AdminLayout';
import { LoadingSpinner } from '../components/loading/loading';

const Dashboard = lazy(() => import('../pages/Dashboard'));
const Users = lazy(() => import('../pages/Users'));
const Chat = lazy(() => import('../pages/Chat'));
const Documents = lazy(() => import('../pages/Documents'));

export default function AppRouter() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        <Route path="/" element={<AdminLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="chat" element={<Chat />} />
          <Route path="documents" element={<Documents />} />
        </Route>
      </Routes>
    </Suspense>
  );
}