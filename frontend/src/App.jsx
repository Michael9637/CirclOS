import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AuthProvider from './components/AuthProvider'
import ProtectedRoute from './components/ProtectedRoute'
import ErrorBoundary from './components/ErrorBoundary'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import ListWaste from './pages/ListWaste'
import Profile from './pages/Profile'
import ComplianceDashboard from './pages/ComplianceDashboard'
import Login from './pages/Login'
import Scanner from './pages/Scanner'
import EvidenceRecords from './pages/EvidenceRecords'
import { apiConfigError } from './api'
import { supabaseConfigError } from './supabase'

export default function App() {
  const configErrors = [supabaseConfigError, apiConfigError].filter(Boolean)

  return (
    <ErrorBoundary>
      <AuthProvider>
        {configErrors.length > 0 && <ConfigBanner messages={configErrors} />}
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/*" element={<AuthenticatedApp />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  )
}

function AuthenticatedApp() {
  return (
    <>
      <Navbar />
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '32px 24px' }}>
        <Routes>
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/list" element={<ProtectedRoute><ListWaste /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/register" element={<Navigate to="/profile" replace />} />
          <Route path="/compliance" element={<ProtectedRoute><ComplianceDashboard /></ProtectedRoute>} />
          <Route path="/scanner" element={<ProtectedRoute><Scanner /></ProtectedRoute>} />
          <Route path="/evidence" element={<ProtectedRoute><EvidenceRecords /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </>
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