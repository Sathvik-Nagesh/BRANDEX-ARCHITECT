import { db } from './connection'
import { systemSettings } from './schema/system'
import { v4 as uuidv4 } from 'uuid'

export function runSeeders() {
  // Check if system settings exist
  const existingSettings = db.select().from(systemSettings).all()
  if (existingSettings.length > 0) {
    return // Already seeded
  }

  const now = new Date()

  // Seed default company info
  db.insert(systemSettings).values({
    id: uuidv4(),
    key: 'company_info',
    category: 'company',
    value: JSON.stringify({
      companyName: 'Brandex',
      address: 'Bangalore, Karnataka, India',
      phone: '',
      email: '',
      website: '',
      gstNumber: '',
      panNumber: '',
      upiId: '',
      bankDetails: '',
      socialLinks: {}
    }),
    createdAt: now,
    updatedAt: now
  }).run()

  // Seed default AI config
  db.insert(systemSettings).values({
    id: uuidv4(),
    key: 'ai_config',
    category: 'ai',
    value: JSON.stringify({
      defaultProvider: 'gemini',
      geminiApiKey: '',
      openRouterApiKey: '',
      nimApiKey: '',
      modelSelection: {
        gemini: 'gemini-1.5-pro',
        openRouter: 'anthropic/claude-3.5-sonnet',
        nim: 'meta/llama3-70b-instruct'
      },
      temperature: 0.7,
      maxTokens: 4096
    }),
    createdAt: now,
    updatedAt: now
  }).run()

  // Seed default theme
  db.insert(systemSettings).values({
    id: uuidv4(),
    key: 'theme_prefs',
    category: 'theme',
    value: JSON.stringify({
      mode: 'light',
      accentColor: '#2B2D6E',
      typography: 'Inter'
    }),
    createdAt: now,
    updatedAt: now
  }).run()

  // Seed templates if none exist
  const { templates } = require('./schema/templates')
  const existingTemplates = db.select().from(templates).all()
  if (existingTemplates.length === 0) {
    const templateList = [
      { id: uuidv4(), name: 'Standard Invoice', type: 'Invoice', content: '<h1>Invoice {{invoice_number}}</h1>', variables: JSON.stringify(['invoice_number', 'client_name', 'total']), createdAt: now, updatedAt: now },
      { id: uuidv4(), name: 'Agency Proposal V2', type: 'Proposal', content: '<h1>Proposal for {{client_name}}</h1><p>We are excited to work with you.</p>', variables: JSON.stringify(['client_name']), createdAt: now, updatedAt: now },
      { id: uuidv4(), name: 'Web Dev SOW', type: 'SOW', content: '<h1>Statement of Work</h1><p>Project: {{project_name}}</p>', variables: JSON.stringify(['project_name']), createdAt: now, updatedAt: now },
      { id: uuidv4(), name: 'Discovery Report', type: 'Report', content: '<h1>Discovery Report</h1><p>Findings...</p>', variables: JSON.stringify([]), createdAt: now, updatedAt: now },
      { id: uuidv4(), name: 'Client Onboarding', type: 'Onboarding', content: '<h1>Welcome!</h1><p>Let\'s get started.</p>', variables: JSON.stringify([]), createdAt: now, updatedAt: now },
    ]
    templateList.forEach(t => db.insert(templates).values(t).run())
    console.log('Templates seeded.')
  }

  console.log('Database seeded with default Brandex settings.')
}
