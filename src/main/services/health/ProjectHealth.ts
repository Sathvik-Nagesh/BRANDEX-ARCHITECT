import { db } from '../../database/connection'
import { features } from '../../database/schema/features'
import { documents } from '../../database/schema/documents'
import { meetings } from '../../database/schema/meetings'
import { eq, and, count } from 'drizzle-orm'

export interface ProjectHealth {
  status: 'Healthy' | 'Needs Attention' | 'At Risk'
  score: number
  reasons: string[]
}

export async function evaluateProject(projectId: string): Promise<ProjectHealth> {
    try {
      const [docStats] = await db.select({ prdCount: count() }).from(documents).where(and(eq(documents.projectId, projectId), eq(documents.type, 'prd')))
      const [featureStats] = await db.select({ total: count() }).from(features).where(eq(features.projectId, projectId))
      const [completedFeatureStats] = await db.select({ total: count() }).from(features).where(and(eq(features.projectId, projectId), eq(features.status, 'completed')))
      const [meetingStats] = await db.select({ total: count() }).from(meetings).where(eq(meetings.projectId, projectId))
      
      let score = 100
      const reasons: string[] = []

      if (docStats.prdCount === 0) {
        score -= 20
        reasons.push('Missing PRD documentation')
      }
      
      if (featureStats.total > 0) {
        const percentComplete = completedFeatureStats.total / featureStats.total
        if (percentComplete === 0 && meetingStats.total > 3) {
          score -= 15
          reasons.push('High meeting count but 0% feature completion')
        }
      } else {
        score -= 10
        reasons.push('No features defined')
      }

      if (meetingStats.total === 0) {
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
      console.error('Health evaluation failed:', e)
      return { status: 'At Risk', score: 0, reasons: ['System error evaluating project health'] }
    }
  }
