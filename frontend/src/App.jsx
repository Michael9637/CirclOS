import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AuthProvider from './components/AuthProvider'
import ProtectedRoute from './components/ProtectedRoute'
import ErrorBoundary from './components/ErrorBoundary'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import Dashboard from './pages/Dashboard'
import ListWaste from './pages/ListWaste'
import Profile from './pages/Profile'
import ComplianceDashboard from './pages/ComplianceDashboard'
import Login from './pages/Login'
import Scanner from './pages/Scanner'
import EvidenceRecords from './pages/EvidenceRecords'
import { apiConfigError } from './api'
import { supabaseConfigError } from './supabase'
import styles from './App.module.css'

export default function App() {
  const configErrors = [supabaseConfigError, apiConfigError].filter(Boolean)

  return (
    <ErrorBoundary>
      <AuthProvider>
        {configErrors.length > 0 && <ConfigBanner messages={configErrors} />}
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
            <Route path="/list" element={<Navigate to="/app/list" replace />} />
            <Route path="/profile" element={<Navigate to="/app/profile" replace />} />
            <Route path="/register" element={<Navigate to="/app/profile" replace />} />
            <Route path="/registercompany" element={<Navigate to="/login?mode=signup" replace />} />
            <Route path="/compliance" element={<Navigate to="/app/compliance" replace />} />
            <Route path="/scanner" element={<Navigate to="/app/scanner" replace />} />
            <Route path="/evidence" element={<Navigate to="/app/evidence" replace />} />
            <Route path="/app/*" element={<AuthenticatedApp />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  )
}

function AuthenticatedApp() {
  return (
    <div className={styles.appShell}>
      <Navbar />
      <main className={styles.appMain}>
        <Routes>
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/list" element={<ProtectedRoute><ListWaste /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/register" element={<Navigate to="/app/profile" replace />} />
          <Route path="/compliance" element={<ProtectedRoute><ComplianceDashboard /></ProtectedRoute>} />
          <Route path="/scanner" element={<ProtectedRoute><Scanner /></ProtectedRoute>} />
          <Route path="/evidence" element={<ProtectedRoute><EvidenceRecords /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  )
}

function ConfigBanner({ messages }) {
  return (
    <div
      style={{
        background: '#fff4e5',
        borderBottom: '1px solid #f8d7a8',
        color: '#8a4b00',
        padding: '10px 16px',
        fontSize: '13px',
      }}
    >
      <strong>Deployment config required:</strong> {messages.join(' ')}
    </div>
  )
}