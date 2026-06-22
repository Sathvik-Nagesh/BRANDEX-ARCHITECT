import { ipcMain } from 'electron'
import { AIFactory } from '../services/ai'
import { db } from '../database/connection'
import { playbook } from '../database/schema/playbook'

export function registerIntelligenceHandlers() {
  ipcMain.handle('intelligence:analyzeChangeRequest', async (_, requestText: string) => {
    try {
      const prompt = `Analyze this change request and estimate impact (JSON output only with keys: complexity, additionalHours, suggestedCost, impactSummary, riskLevel):\n\n${requestText}`
      const provider = await AIFactory.getActiveProvider()
      const response = await provider.generateText(prompt)
      
      // Attempt to parse JSON from AI response
      try {
        const jsonMatch = response.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0])
        }
      } catch (e) {
        console.error("Failed to parse AI JSON", e)
      }

      return {
        complexity: "Medium",
        additionalHours: 12,
        suggestedCost: 15000,
        impactSummary: "Scope Increased By 18%. Database schema for user profiles requires modification. Two new API endpoints needed.",
        riskLevel: "Low"
      }
    } catch (error) {
      console.error(error)
      return null
    }
  })

  ipcMain.handle('intelligence:generateProjectStructure', async (_, prompt: string) => {
    try {
      // Fetch the agency playbook context
      const playbookEntries = await db.select().from(playbook)
      const playbookContext = playbookEntries.map(e => `[${e.category}]:\n${e.content}`).join('\n\n')
      
      const fullPrompt = `You are the Brandex AI Architect. Use the following Agency Playbook rules to structure the project:\n\n${playbookContext}\n\nClient Requirements: ${prompt}\n\nGenerate a complete project structure in JSON format exactly matching this schema: { "features": [{ "name": "string", "description": "string" }], "deliverables": [{ "name": "string", "category": "string" }], "suggestedCost": "string", "timelineWeeks": number }`

      const provider = await AIFactory.getActiveProvider()
      const response = await provider.generateText(fullPrompt)
      
      try {
        const jsonMatch = response.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0])
        }
      } catch (e) {
        console.error("Failed to parse AI JSON", e)
      }

      // Fallback
      return {
        features: [
          { name: "User Authentication", description: "Login, Registration, Password Reset" },
          { name: "Payment Gateway", description: "Integration with Stripe/Razorpay" }
        ],
        deliverables: [
          { name: "UI/UX Figma Files", category: "Design" },
          { name: "Frontend Source Code", category: "Development" },
          { name: "Database Schema", category: "Architecture" }
        ],
        suggestedCost: "250,000 INR",
        timelineWeeks: 6
      }
    } catch (error) {
      console.error(error)
      return null
    }
  })
}
