import { db } from '../src/main/database/connection'
import { templates } from '../src/main/database/schema/templates'
import { v4 as uuidv4 } from 'uuid'

const now = new Date().toISOString()

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

async function seed() {
  console.log("Seeding premium templates...")
  for (const t of premiumTemplates) {
    db.insert(templates).values(t).run()
  }
  console.log("Premium templates successfully seeded!")
}

seed()
