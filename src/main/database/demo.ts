import { db } from './connection'
import { clients } from './schema/clients'
import { projects } from './schema/projects'
import { features } from './schema/features'

export function generateDemoData() {
  console.log('Generating demo data...')
  
  // Truncate
  db.delete(features).run()
  db.delete(projects).run()
  db.delete(clients).run()

  // Insert Clients
  const acmeId = crypto.randomUUID()
  const bankifyId = crypto.randomUUID()

  db.insert(clients).values([
    {
      id: acmeId,
      name: 'Acme Corp',
      industry: 'Manufacturing',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: bankifyId,
      name: 'Bankify',
      industry: 'Fintech',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]).run()

  // Insert Projects
  const webProjectId = crypto.randomUUID()
  db.insert(projects).values([
    {
      id: webProjectId,
      clientId: acmeId,
      name: 'Corporate Website Redesign',
      status: 'planning',
      description: 'A complete replatform of the legacy Acme Corp website.',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: crypto.randomUUID(),
      clientId: bankifyId,
      name: 'Mobile Banking App',
      status: 'active',
      description: 'iOS and Android application for retail banking.',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]).run()

  // Insert Features
  db.insert(features).values([
    {
      id: crypto.randomUUID(),
      projectId: webProjectId,
      title: 'Authentication System',
      description: 'JWT based login with OAuth2 support.',
      status: 'planning',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: crypto.randomUUID(),
      projectId: webProjectId,
      title: 'Dashboard Analytics',
      description: 'Real-time charts showing user engagement.',
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]).run()

  console.log('Demo data generated successfully.')
  return { success: true }
}
