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
  
  // Seed premium templates if they don't exist
  const premiumTemplateNames = ['Strategic Discovery Report', 'Technical Architecture SOW', 'Brand Identity Guidelines']
  const existingPremium = db.select().from(templates).where(require('drizzle-orm').inArray(templates.name, premiumTemplateNames)).all()
  
  if (existingPremium.length < 3) {
    const premiumTemplates = [
      {
        id: uuidv4(),
        name: 'Strategic Discovery Report',
        type: 'Report',
        variables: JSON.stringify(['client_name', 'project_name', 'target_audience']),
        content: `
          <div style="font-family: 'Inter', sans-serif; color: #1e293b; line-height: 1.6; max-width: 800px; margin: 0 auto;">
            <h1 style="color: #0f172a; font-size: 36px; font-weight: 800; border-bottom: 2px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 32px;">Strategic Discovery Report</h1>
            <p style="font-size: 18px; color: #64748b; margin-bottom: 40px;">Prepared for <strong>{{client_name}}</strong> | Project: <strong>{{project_name}}</strong></p>

            <h2 style="color: #334155; font-size: 24px; font-weight: 700; margin-top: 40px; margin-bottom: 16px;">1. Executive Summary</h2>
            <p>This report outlines the foundational strategy and insights gathered during the discovery phase. Our goal is to align the project deliverables with the core business objectives of {{client_name}}.</p>

            <h2 style="color: #334155; font-size: 24px; font-weight: 700; margin-top: 40px; margin-bottom: 16px;">2. Target Audience Analysis</h2>
            <div style="background: #f8fafc; padding: 24px; border-radius: 12px; border: 1px solid #e2e8f0;">
              <h3 style="margin-top: 0; color: #0f172a;">Primary Demographic: {{target_audience}}</h3>
              <ul style="padding-left: 20px;">
                <li style="margin-bottom: 8px;"><strong>Pain Points:</strong> Lack of intuitive user experience, slow load times.</li>
                <li style="margin-bottom: 8px;"><strong>Motivations:</strong> Efficiency, premium feel, reliability.</li>
              </ul>
            </div>

            <h2 style="color: #334155; font-size: 24px; font-weight: 700; margin-top: 40px; margin-bottom: 16px;">3. Competitive Landscape</h2>
            <p>Based on our market research, the primary competitors are focusing heavily on price, leaving a massive opportunity for {{client_name}} to capture the premium market segment through superior design and customer experience.</p>
            
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 40px 0;" />
            <p style="text-align: center; color: #94a3b8; font-size: 14px;">Brandex Architect &copy; ${new Date().getFullYear()}</p>
          </div>
        `,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Technical Architecture SOW',
        type: 'SOW',
        variables: JSON.stringify(['client_name', 'project_name']),
        content: `
          <div style="font-family: 'Inter', sans-serif; color: #1e293b; line-height: 1.6; max-width: 800px; margin: 0 auto;">
            <h1 style="color: #0f172a; font-size: 36px; font-weight: 800; border-bottom: 2px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 32px;">Statement of Work (SOW)</h1>
            <p style="font-size: 18px; color: #64748b; margin-bottom: 40px;">Technical Implementation for <strong>{{project_name}}</strong></p>

            <h2 style="color: #334155; font-size: 24px; font-weight: 700; margin-top: 40px; margin-bottom: 16px;">1. Project Scope</h2>
            <p>This SOW defines the deliverables, timelines, and technical architecture required to successfully deploy the {{project_name}} platform for {{client_name}}.</p>

            <h2 style="color: #334155; font-size: 24px; font-weight: 700; margin-top: 40px; margin-bottom: 16px;">2. Technical Stack</h2>
            <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
              <thead>
                <tr>
                  <th style="text-align: left; padding: 12px; border-bottom: 2px solid #e2e8f0; color: #64748b; font-size: 12px; text-transform: uppercase;">Layer</th>
                  <th style="text-align: left; padding: 12px; border-bottom: 2px solid #e2e8f0; color: #64748b; font-size: 12px; text-transform: uppercase;">Technology</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="padding: 12px; border-bottom: 1px solid #f1f5f9;"><strong>Frontend</strong></td>
                  <td style="padding: 12px; border-bottom: 1px solid #f1f5f9;">React / TypeScript / Tailwind CSS</td>
                </tr>
                <tr>
                  <td style="padding: 12px; border-bottom: 1px solid #f1f5f9;"><strong>Backend</strong></td>
                  <td style="padding: 12px; border-bottom: 1px solid #f1f5f9;">Node.js / Express</td>
                </tr>
                <tr>
                  <td style="padding: 12px; border-bottom: 1px solid #f1f5f9;"><strong>Database</strong></td>
                  <td style="padding: 12px; border-bottom: 1px solid #f1f5f9;">PostgreSQL / Drizzle ORM</td>
                </tr>
              </tbody>
            </table>

            <h2 style="color: #334155; font-size: 24px; font-weight: 700; margin-top: 40px; margin-bottom: 16px;">3. Delivery Phases & Milestones</h2>
            <ul style="padding-left: 20px;">
              <li style="margin-bottom: 12px;"><strong>Phase 1 (Weeks 1-2):</strong> UI/UX Design & Prototyping</li>
              <li style="margin-bottom: 12px;"><strong>Phase 2 (Weeks 3-6):</strong> Core Backend Architecture & Database Schema</li>
              <li style="margin-bottom: 12px;"><strong>Phase 3 (Weeks 7-10):</strong> Frontend Integration & API Wiring</li>
              <li style="margin-bottom: 12px;"><strong>Phase 4 (Weeks 11-12):</strong> QA Testing & Production Deployment</li>
            </ul>
          </div>
        `,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Brand Identity Guidelines',
        type: 'Document',
        variables: JSON.stringify(['client_name', 'primary_color']),
        content: `
          <div style="font-family: 'Inter', sans-serif; color: #1e293b; line-height: 1.6; max-width: 800px; margin: 0 auto;">
            <div style="background: {{primary_color}}; height: 120px; border-radius: 12px 12px 0 0;"></div>
            <h1 style="color: #0f172a; font-size: 36px; font-weight: 800; padding-top: 24px; margin-bottom: 32px;">Brand Identity Guidelines</h1>
            <p style="font-size: 18px; color: #64748b; margin-bottom: 40px;">Official Branding Standards for <strong>{{client_name}}</strong></p>

            <h2 style="color: #334155; font-size: 24px; font-weight: 700; margin-top: 40px; margin-bottom: 16px;">1. Logo Usage</h2>
            <p>The primary logo should always be given ample breathing room (clear space) equal to the height of the brand mark. Do not stretch, skew, or recolor the logo outside of the approved palette.</p>

            <h2 style="color: #334155; font-size: 24px; font-weight: 700; margin-top: 40px; margin-bottom: 16px;">2. Typography</h2>
            <div style="display: flex; gap: 24px; margin-top: 16px;">
              <div style="flex: 1; padding: 24px; background: #f8fafc; border-radius: 12px;">
                <h3 style="margin-top: 0; font-family: 'Inter', sans-serif; font-weight: 800;">Primary: Inter</h3>
                <p style="font-size: 14px;">Used for all digital headings, UI elements, and marketing collateral.</p>
              </div>
              <div style="flex: 1; padding: 24px; background: #f8fafc; border-radius: 12px;">
                <h3 style="margin-top: 0; font-family: 'Georgia', serif; font-weight: 400;">Secondary: Georgia</h3>
                <p style="font-size: 14px;">Used strictly for long-form print copy and editorial styling.</p>
              </div>
            </div>

            <h2 style="color: #334155; font-size: 24px; font-weight: 700; margin-top: 40px; margin-bottom: 16px;">3. Brand Voice & Tone</h2>
            <p>Our voice is <strong>Authoritative, yet Accessible</strong>. We speak with expertise but avoid overly dense jargon. We aim to inspire confidence and clarity in every interaction.</p>
          </div>
        `,
        createdAt: now,
        updatedAt: now
      }
    ]
    
    const existingNames = existingPremium.map((t:any) => t.name)
    premiumTemplates.forEach(t => {
      if (!existingNames.includes(t.name)) {
        db.insert(templates).values(t).run()
      }
    })
    console.log('Premium templates seeded.')
  }

  console.log('Database seeded with default Brandex settings.')
}
