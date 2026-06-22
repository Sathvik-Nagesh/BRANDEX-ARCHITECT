import React from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { MainLayout } from '@/components/layout/MainLayout'
import { useAppStore } from '@/stores/useAppStore'
import { Toaster } from 'sonner'

// Pages
import Dashboard from '@/pages/Dashboard'
import Clients from '@/pages/Clients'
import Projects from '@/pages/Projects'
import Features from '@/pages/Features'
import FeatureDetail from '@/pages/FeatureDetail'
import Documents from '@/pages/Documents'
import Decisions from '@/pages/Decisions'
import Meetings from '@/pages/Meetings'
import Memory from '@/pages/Memory'
import Proposals from '@/pages/Proposals'
import Onboarding from '@/pages/Onboarding'
import Templates from '@/pages/Templates'
import Assets from '@/pages/Assets'
import Playbook from '@/pages/Playbook'
import Invoices from '@/pages/Invoices'
import AIWorkspace from '@/pages/AIWorkspace'
import Settings from '@/pages/Settings'
import FirstRun from '@/pages/FirstRun'
import ClientDetail from '@/pages/ClientDetail'
import ProjectDetail from '@/pages/ProjectDetail'

function AppRoutes() {
  const isFirstRun = useAppStore(state => state.isFirstRun)

  if (isFirstRun) {
    return (
      <Routes>
        <Route path="*" element={<FirstRun />} />
      </Routes>
    )
  }

  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/clients/:id" element={<ClientDetail />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:id" element={<ProjectDetail />} />
        <Route path="/features" element={<Features />} />
        <Route path="/features/:id" element={<FeatureDetail />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/decisions" element={<Decisions />} />
        <Route path="/meetings" element={<Meetings />} />
        <Route path="/memory" element={<Memory />} />
        <Route path="/proposals" element={<Proposals />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/templates" element={<Templates />} />
        <Route path="/assets" element={<Assets />} />
        <Route path="/playbook" element={<Playbook />} />
        <Route path="/invoices" element={<Invoices />} />
        <Route path="/ai" element={<AIWorkspace />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, color: 'red', fontFamily: 'monospace' }}>
          <h2>Renderer Crashed</h2>
          <pre>{this.state.error?.message}</pre>
          <pre>{this.state.error?.stack}</pre>
        </div>
      )
    }
    return this.props.children
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
      <Toaster position="bottom-right" />
    </ErrorBoundary>
  )
}
