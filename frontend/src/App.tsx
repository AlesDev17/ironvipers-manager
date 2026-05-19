import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './features/auth/useAuth'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import LoginPage from './features/auth/LoginPage'
import DashboardPage from './features/dashboard/DashboardPage'
import ClientsPage from './features/clients/ClientsPage'
import ClientDetailPage from './features/clients/ClientDetailPage'
import MotorcyclesPage from './features/motorcycles/MotorcyclesPage'
import MotorcycleDetailPage from './features/motorcycles/MotorcycleDetailPage'
import ServiceOrdersPage from './features/service-orders/ServiceOrdersPage'
import ServiceOrderDetailPage from './features/service-orders/ServiceOrderDetailPage'
import PartsPage from './features/parts/PartsPage'
import ExpensesPage from './features/expenses/ExpensesPage'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/clients/:id" element={<ClientDetailPage />} />
            <Route path="/motorcycles" element={<MotorcyclesPage />} />
            <Route path="/motorcycles/:id" element={<MotorcycleDetailPage />} />
            <Route path="/service-orders" element={<ServiceOrdersPage />} />
            <Route path="/service-orders/:id" element={<ServiceOrderDetailPage />} />
            <Route path="/parts" element={<PartsPage />} />
            <Route path="/expenses" element={<ExpensesPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
