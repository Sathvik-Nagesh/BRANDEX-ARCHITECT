import { registerClientHandlers } from './clients'
import { registerProjectHandlers } from './projects'
import { registerFeatureHandlers } from './features'
import { registerKnowledgeHandlers } from './knowledge'
import { registerExportHandlers } from './export'
import { registerSystemHandlers } from './system'
import { registerSettingsHandlers } from './settings'
import { registerProposalHandlers } from './proposals'
import { registerAIHandlers } from './ai'
import { registerBackupHandlers } from './backup'
import { registerProjectSyncHandlers } from './projectSync'
import { registerClauseHandlers } from './clauses'
import { registerInvoiceHandlers } from './invoices'
import { registerAgencyHandlers } from './agency'
import { registerIntelligenceHandlers } from './intelligence'
import { registerTemplateHandlers } from './templates'

export function registerIpcHandlers() {
  registerClientHandlers()
  registerProjectHandlers()
  registerFeatureHandlers()
  registerKnowledgeHandlers()
  registerExportHandlers()
  registerSystemHandlers()
  registerSettingsHandlers()
  registerProposalHandlers()
  registerAIHandlers()
  registerBackupHandlers()
  registerProjectSyncHandlers()
  registerClauseHandlers()
  registerInvoiceHandlers()
  registerAgencyHandlers()
  registerIntelligenceHandlers()
  registerTemplateHandlers()
}
