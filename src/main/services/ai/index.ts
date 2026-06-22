export interface AIProviderConfig {
  apiKey: string
  model: string
  temperature: number
  maxTokens: number
}

export interface AIService {
  generateText(prompt: string, config?: Partial<AIProviderConfig>): Promise<string>
  analyzeContext(context: string, prompt: string): Promise<string>
}

export class GeminiProvider implements AIService {
  constructor(private config: AIProviderConfig) {}

  async generateText(prompt: string): Promise<string> {
    if (!this.config.apiKey) throw new Error('Gemini API key not configured')
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${this.config.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: this.config.temperature,
          maxOutputTokens: this.config.maxTokens
        }
      })
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.error?.message || 'Gemini API Error')
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.'
  }

  async analyzeContext(context: string, prompt: string): Promise<string> {
    return this.generateText(`Context:\n${context}\n\nTask: ${prompt}`)
  }
}

export class OpenRouterProvider implements AIService {
  constructor(private config: AIProviderConfig) {}

  async generateText(prompt: string): Promise<string> {
    if (!this.config.apiKey) throw new Error('OpenRouter API key not configured')
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Brandex Architect'
      },
      body: JSON.stringify({
        model: 'google/gemini-flash-1.5',
        messages: [{ role: 'user', content: prompt }],
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens
      })
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.error?.message || 'OpenRouter API Error')
    return data.choices?.[0]?.message?.content || 'No response generated.'
  }

  async analyzeContext(context: string, prompt: string): Promise<string> {
    return this.generateText(`Context:\n${context}\n\nTask: ${prompt}`)
  }
}

export class NvidiaNimProvider implements AIService {
  constructor(private config: AIProviderConfig) {}

  async generateText(prompt: string): Promise<string> {
    if (!this.config.apiKey) throw new Error('NVIDIA NIM API key not configured')
    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        model: this.config.model && this.config.model !== 'default' ? this.config.model : 'nvidia/nemotron-3-ultra-550b-a55b',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 16384,
        temperature: 1.00,
        top_p: 0.95,
        stream: false
      })
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.detail || data.error?.message || 'NVIDIA NIM API Error')
    return data.choices?.[0]?.message?.content || 'No response generated.'
  }

  async analyzeContext(context: string, prompt: string): Promise<string> {
    return this.generateText(`Context:\n${context}\n\nTask: ${prompt}`)
  }
}

import { db } from '../../database/connection'
import { systemSettings } from '../../database/schema/system'
import { eq } from 'drizzle-orm'

export class AIFactory {
  static getProvider(provider: 'gemini' | 'openRouter' | 'nim', config: AIProviderConfig): AIService {
    switch (provider) {
      case 'gemini': return new GeminiProvider(config)
      case 'openRouter': return new OpenRouterProvider(config)
      case 'nim': return new NvidiaNimProvider(config)
      default: throw new Error(`Unknown AI provider: ${provider}`)
    }
  }

  static async getActiveProvider(): Promise<AIService> {
    const settings = await db.select().from(systemSettings).where(eq(systemSettings.category, 'ai'))
    
    let providerName: 'gemini' | 'nim' | 'openRouter' = 'gemini'
    let apiKey = ''
    
    const gemini = settings.find(s => s.key === 'gemini_key')?.value
    const nvidia = settings.find(s => s.key === 'nvidia_key')?.value
    const openrouter = settings.find(s => s.key === 'openrouter_key')?.value

    if (nvidia) { providerName = 'nim'; apiKey = nvidia; }
    else if (openrouter) { providerName = 'openRouter'; apiKey = openrouter; }
    else if (gemini) { providerName = 'gemini'; apiKey = gemini; }

    if (!apiKey) {
      throw new Error("No AI API Key found. Please add one in Settings > AI Providers.")
    }

    return this.getProvider(providerName, {
      apiKey,
      model: 'default',
      temperature: 0.7,
      maxTokens: 2000
    })
  }
}
