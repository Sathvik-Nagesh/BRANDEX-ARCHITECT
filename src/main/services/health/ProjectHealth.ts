import { db } from '../../database/connection'
import { features } from '../../database/schema/features'
import { documents } from '../../database/schema/documents'
import { meetings } from '../../database/schema/meetings'
import { decisions } from '../../database/schema/relationships' // Wait, decisions are in knowledge
import { eq } from 'drizzle-orm'

export interface ProjectHealth {
  status: 'Healthy' | 'Needs Attention' | 'At Risk'
  score: number
  reasons: string[]
}

export class ProjectHealthEngine {
  async evaluateProject(projectId: string): Promise<ProjectHealth> {
    try {
      const projectFeatures = await db.select().from(features).where(eq(features.projectId, projectId))
      const projectDocs = await db.select().from(documents).where(eq(documents.projectId, projectId))
      const projectMeetings = await db.select().from(meetings).where(eq(meetings.projectId, projectId))
      
      let score = 100
      const reasons: string[] = []

      // 1. Documentation Coverage (Max 30 pts)
      const hasPRD = projectDocs.some(d => d.type === 'prd')
      if (!hasPRD) {
        score -= 20
        reasons.push('Missing PRD documentation')
      }
      
      // 2. Feature Completion
      const totalFeatures = projectFeatures.length
      const completedFeatures = projectFeatures.filter(f => f.status === 'completed').length
      if (totalFeatures > 0) {
        const percentComplete = completedFeatures / totalFeatures
        if (percentComplete === 0 && projectMeetings.length > 3) {
          score -= 15
          reasons.push('High meeting count but 0% feature completion')
        }
      } else {
        score -= 10
        reasons.push('No features defined')
      }

      // 3. Meeting Activity
      if (projectMeetings.length === 0) {
        score -= 15
        reasons.push('No meetings logged')
      }

      let status: 'Healthy' | 'Needs Attention' | 'At Risk' = 'Healthy'
      if (score < 60) status = 'At Risk'
      else if (score < 85) status = 'Needs Attention'

      if (reasons.length === 0) {
        reasons.push('Project is well documented and progressing normally')
      }

      return { status, score, reasons }
    } catch (e) {
      console.error('Failed to compute health', e)
      return { status: 'Needs Attention', score: 70, reasons: ['Could not compute health data'] }
    }
  }
}

export const healthEngine = new ProjectHealthEngine()
