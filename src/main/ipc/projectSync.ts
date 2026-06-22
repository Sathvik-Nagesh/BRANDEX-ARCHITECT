import { app, dialog, ipcMain, BrowserWindow } from 'electron'
import AdmZip from 'adm-zip'
import * as path from 'path'
import * as fs from 'fs'
import { db } from '../database/connection'
import { eq } from 'drizzle-orm'
import {
  projects, scopeChanges
} from '../database/schema/projects'
import { features, featureVersions } from '../database/schema/features'
import { decisions, memoryEntries } from '../database/schema/knowledge'
import { meetings, extractedItems } from '../database/schema/meetings'
import { documents, documentVersions } from '../database/schema/documents'
import { proposals, proposalSections, onboardingPackages, onboardingSections } from '../database/schema/generated'

export function registerProjectSyncHandlers() {
  
  ipcMain.handle('projects:export', async (event, projectId: string) => {
    try {
      const window = BrowserWindow.fromWebContents(event.sender)
      if (!window) throw new Error('No window found')

      const projectData = await collectProjectData(projectId)
      if (!projectData || !projectData.project) return { success: false, error: 'Project not found' }

      const { canceled, filePath } = await dialog.showSaveDialog(window, {
        title: 'Export Project',
        defaultPath: `${projectData.project.name?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'project'}_export.brandexproject`,
        filters: [{ name: 'Brandex Project', extensions: ['brandexproject'] }]
      })

      if (canceled || !filePath) return { success: false, canceled: true }

      const zip = new AdmZip()
      zip.addFile('project_data.json', Buffer.from(JSON.stringify(projectData, null, 2), 'utf8'))
      zip.writeZip(filePath)

      return { success: true, filePath }
    } catch (error) {
      console.error('Project export failed', error)
      return { success: false, error: String(error) }
    }
  })

  ipcMain.handle('projects:import', async (event) => {
    try {
      const window = BrowserWindow.fromWebContents(event.sender)
      if (!window) throw new Error('No window found')

      const { canceled, filePaths } = await dialog.showOpenDialog(window, {
        title: 'Import Project',
        filters: [{ name: 'Brandex Project', extensions: ['brandexproject'] }],
        properties: ['openFile']
      })

      if (canceled || filePaths.length === 0) return { success: false, canceled: true }

      const filePath = filePaths[0]
      const zip = new AdmZip(filePath)
      
      const entry = zip.getEntry('project_data.json')
      if (!entry) throw new Error('Invalid project file format: missing project_data.json')

      const dataStr = zip.readAsText(entry)
      const projectData = JSON.parse(dataStr)

      const newProjectId = await injectProjectData(projectData)

      return { success: true, projectId: newProjectId }
    } catch (error) {
      console.error('Project import failed', error)
      return { success: false, error: String(error) }
    }
  })

  ipcMain.handle('projects:clone', async (event, projectId: string) => {
    try {
      // Cloning is basically an in-memory export followed by an in-memory import
      const projectData = await collectProjectData(projectId)
      if (!projectData || !projectData.project) return { success: false, error: 'Project not found' }
      
      // Tweak name slightly
      projectData.project.name = `${projectData.project.name} (Clone)`

      const newProjectId = await injectProjectData(projectData)
      return { success: true, projectId: newProjectId }
    } catch (error) {
      console.error('Project clone failed', error)
      return { success: false, error: String(error) }
    }
  })
}

// ----------------------------------------------------------------------
// CORE DATA EXTRACTION & INJECTION LOGIC
// ----------------------------------------------------------------------

async function collectProjectData(projectId: string) {
  // Grab project
  const projectList = await db.select().from(projects).where(eq(projects.id, projectId))
  if (projectList.length === 0) return null
  const project = projectList[0]

  // Children
  const pScopeChanges = await db.select().from(scopeChanges).where(eq(scopeChanges.projectId, projectId))
  const pFeatures = await db.select().from(features).where(eq(features.projectId, projectId))
  const pDecisions = await db.select().from(decisions).where(eq(decisions.projectId, projectId))
  const pMeetings = await db.select().from(meetings).where(eq(meetings.projectId, projectId))
  const pMemory = await db.select().from(memoryEntries).where(eq(memoryEntries.projectId, projectId))
  const pDocs = await db.select().from(documents).where(eq(documents.projectId, projectId))
  const pProposals = await db.select().from(proposals).where(eq(proposals.projectId, projectId))
  const pOnboarding = await db.select().from(onboardingPackages).where(eq(onboardingPackages.projectId, projectId))

  // Deep Children (O(N) queries could be optimized, but ok for local SQLite)
  const pFeatureVersions = []
  for (const f of pFeatures) {
    const versions = await db.select().from(featureVersions).where(eq(featureVersions.featureId, f.id))
    pFeatureVersions.push(...versions)
  }

  const pExtractedItems = []
  for (const m of pMeetings) {
    const items = await db.select().from(extractedItems).where(eq(extractedItems.meetingId, m.id))
    pExtractedItems.push(...items)
  }

  const pDocVersions = []
  for (const d of pDocs) {
    const versions = await db.select().from(documentVersions).where(eq(documentVersions.documentId, d.id))
    pDocVersions.push(...versions)
  }

  const pProposalSections = []
  for (const p of pProposals) {
    const secs = await db.select().from(proposalSections).where(eq(proposalSections.proposalId, p.id))
    pProposalSections.push(...secs)
  }

  const pOnboardingSections = []
  for (const o of pOnboarding) {
    const secs = await db.select().from(onboardingSections).where(eq(onboardingSections.packageId, o.id))
    pOnboardingSections.push(...secs)
  }

  return {
    project,
    scopeChanges: pScopeChanges,
    features: pFeatures,
    featureVersions: pFeatureVersions,
    decisions: pDecisions,
    meetings: pMeetings,
    extractedItems: pExtractedItems,
    memoryEntries: pMemory,
    documents: pDocs,
    documentVersions: pDocVersions,
    proposals: pProposals,
    proposalSections: pProposalSections,
    onboardingPackages: pOnboarding,
    onboardingSections: pOnboardingSections
  }
}

async function injectProjectData(data: any): Promise<string> {
  const idMap = new Map<string, string>()

  const getNewId = (oldId: string | null | undefined): string | null => {
    if (!oldId) return null
    if (!idMap.has(oldId)) {
      idMap.set(oldId, crypto.randomUUID())
    }
    return idMap.get(oldId)!
  }

  // 1. Map IDs
  const newProject = { ...data.project, id: getNewId(data.project.id), createdAt: new Date(), updatedAt: new Date() }
  
  // Cleanly map an array of entities, generating new primary IDs and swapping out foreign keys
  const mapEntities = (arr: any[], idKey = 'id', foreignKeyConfigs: {key: string, parentCollection?: string}[] = []) => {
    return (arr || []).map(item => {
      const newItem = { ...item, [idKey]: getNewId(item[idKey]), createdAt: new Date(), updatedAt: new Date() }
      for (const fk of foreignKeyConfigs) {
        if (item[fk.key]) {
          newItem[fk.key] = getNewId(item[fk.key])
        }
      }
      return newItem
    })
  }

  const newScopeChanges = mapEntities(data.scopeChanges, 'id', [{key: 'projectId'}])
  const newFeatures = mapEntities(data.features, 'id', [{key: 'projectId'}])
  const newFeatureVersions = mapEntities(data.featureVersions, 'id', [{key: 'featureId'}])
  const newDecisions = mapEntities(data.decisions, 'id', [{key: 'projectId'}])
  const newMeetings = mapEntities(data.meetings, 'id', [{key: 'projectId'}])
  const newExtractedItems = mapEntities(data.extractedItems, 'id', [{key: 'meetingId'}])
  const newMemory = mapEntities(data.memoryEntries, 'id', [{key: 'projectId'}])
  const newDocs = mapEntities(data.documents, 'id', [{key: 'projectId'}])
  const newDocVersions = mapEntities(data.documentVersions, 'id', [{key: 'documentId'}])
  const newProposals = mapEntities(data.proposals, 'id', [{key: 'projectId'}])
  const newProposalSections = mapEntities(data.proposalSections, 'id', [{key: 'proposalId'}])
  const newOnboarding = mapEntities(data.onboardingPackages, 'id', [{key: 'projectId'}])
  const newOnboardingSections = mapEntities(data.onboardingSections, 'id', [{key: 'packageId'}])

  // 2. Insert into DB inside a transaction
  db.transaction((tx) => {
    tx.insert(projects).values(newProject).run()
    if (newScopeChanges.length > 0) tx.insert(scopeChanges).values(newScopeChanges).run()
    if (newFeatures.length > 0) tx.insert(features).values(newFeatures).run()
    if (newFeatureVersions.length > 0) tx.insert(featureVersions).values(newFeatureVersions).run()
    if (newDecisions.length > 0) tx.insert(decisions).values(newDecisions).run()
    if (newMeetings.length > 0) tx.insert(meetings).values(newMeetings).run()
    if (newExtractedItems.length > 0) tx.insert(extractedItems).values(newExtractedItems).run()
    if (newMemory.length > 0) tx.insert(memoryEntries).values(newMemory).run()
    if (newDocs.length > 0) tx.insert(documents).values(newDocs).run()
    if (newDocVersions.length > 0) tx.insert(documentVersions).values(newDocVersions).run()
    if (newProposals.length > 0) tx.insert(proposals).values(newProposals).run()
    if (newProposalSections.length > 0) tx.insert(proposalSections).values(newProposalSections).run()
    if (newOnboarding.length > 0) tx.insert(onboardingPackages).values(newOnboarding).run()
    if (newOnboardingSections.length > 0) tx.insert(onboardingSections).values(newOnboardingSections).run()
  })

  return newProject.id
}
