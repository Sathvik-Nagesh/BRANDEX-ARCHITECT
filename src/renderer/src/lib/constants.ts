// Navigation items
export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', path: '/' },
  { id: 'clients', label: 'Clients', icon: 'Users', path: '/clients' },
  { id: 'projects', label: 'Projects', icon: 'FolderKanban', path: '/projects' },
  { id: 'features', label: 'Features', icon: 'Layers', path: '/features' },
  { id: 'documents', label: 'Documents', icon: 'FileText', path: '/documents' },
  { id: 'decisions', label: 'Decisions', icon: 'GitBranch', path: '/decisions' },
  { id: 'meetings', label: 'Meetings', icon: 'MessageSquare', path: '/meetings' },
  { id: 'memory', label: 'Memory', icon: 'Brain', path: '/memory' },
  { id: 'proposals', label: 'Proposals', icon: 'FileSignature', path: '/proposals' },
  { id: 'invoices', label: 'Invoices', icon: 'ReceiptText', path: '/invoices' },
  { id: 'playbook', label: 'Playbook', icon: 'BookOpen', path: '/playbook' },
  { id: 'onboarding', label: 'Onboarding', icon: 'Rocket', path: '/onboarding' },
  { id: 'templates', label: 'Templates', icon: 'LayoutTemplate', path: '/templates' },
  { id: 'assets', label: 'Assets', icon: 'Package', path: '/assets' },
  { id: 'settings', label: 'Settings', icon: 'Settings', path: '/settings' },
] as const

export type NavItemId = typeof NAV_ITEMS[number]['id']

// Feature statuses
export const FEATURE_STATUSES = [
  { value: 'draft', label: 'Draft', color: 'bg-gray-400' },
  { value: 'review', label: 'Review', color: 'bg-amber-400' },
  { value: 'approved', label: 'Approved', color: 'bg-blue-500' },
  { value: 'building', label: 'Building', color: 'bg-purple-500' },
  { value: 'testing', label: 'Testing', color: 'bg-orange-500' },
  { value: 'released', label: 'Released', color: 'bg-emerald-500' },
] as const

// Project statuses
export const PROJECT_STATUSES = [
  { value: 'active', label: 'Active', color: 'bg-emerald-500' },
  { value: 'planning', label: 'Planning', color: 'bg-blue-500' },
  { value: 'paused', label: 'Paused', color: 'bg-amber-400' },
  { value: 'completed', label: 'Completed', color: 'bg-gray-400' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-400' },
] as const

// Document types
export const DOCUMENT_TYPES = [
  { value: 'prd', label: 'PRD' },
  { value: 'tdd', label: 'Technical Design' },
  { value: 'db-design', label: 'Database Design' },
  { value: 'api-design', label: 'API Design' },
  { value: 'user-stories', label: 'User Stories' },
  { value: 'acceptance-criteria', label: 'Acceptance Criteria' },
  { value: 'testing-plan', label: 'Testing Plan' },
  { value: 'risk-assessment', label: 'Risk Assessment' },
  { value: 'implementation-plan', label: 'Implementation Plan' },
] as const

// Meeting source types
export const MEETING_SOURCES = [
  { value: 'whatsapp', label: 'WhatsApp Chat' },
  { value: 'meeting', label: 'Meeting Notes' },
  { value: 'email', label: 'Email' },
  { value: 'call', label: 'Call Transcript' },
  { value: 'discovery', label: 'Discovery Notes' },
  { value: 'other', label: 'Other' },
] as const

// Animation constants for Framer Motion
export const MOTION = {
  fast: { duration: 0.15, ease: [0.25, 0.1, 0.25, 1] as const },
  normal: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] as const },
  smooth: { duration: 0.3, ease: [0.16, 1, 0.3, 1] as const },
  spring: { type: 'spring' as const, stiffness: 400, damping: 30 },
  page: {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -4 },
    transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] }
  },
  sidebar: {
    initial: { opacity: 0, x: -10 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] }
  },
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.2 }
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.96 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] }
  },
  stagger: {
    animate: { transition: { staggerChildren: 0.04 } }
  },
  listItem: {
    initial: { opacity: 0, y: 6 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.2 }
  }
}
