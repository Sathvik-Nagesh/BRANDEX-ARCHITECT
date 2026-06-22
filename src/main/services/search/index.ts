import { sqlite } from '../../database/connection'

export interface SearchResult {
  id: string
  type: string
  contentSnippet: string
  projectId?: string
}

export class SearchService {
  /**
   * Search across all memory entries and entities using FTS5
   */
  globalSearch(query: string): SearchResult[] {
    if (!query || query.trim() === '') return []
    
    // SQLite FTS5 matching query
    // The '*' allows prefix matching
    const safeQuery = query.replace(/"/g, '""') + '*'
    
    const stmt = sqlite.prepare(`
      SELECT 
        entity_id as id,
        type,
        project_id as projectId,
        snippet(memory_fts, 0, '<b>', '</b>', '...', 64) as contentSnippet
      FROM memory_fts 
      WHERE memory_fts MATCH ? 
      ORDER BY rank 
      LIMIT 50
    `)
    
    return stmt.all(safeQuery) as SearchResult[]
  }

  /**
   * Index a new document/entity into the FTS table
   */
  indexEntity(entityId: string, type: string, projectId: string | null, content: string): void {
    const stmt = sqlite.prepare(`
      INSERT INTO memory_fts(entity_id, type, project_id, content) 
      VALUES (?, ?, ?, ?)
    `)
    stmt.run(entityId, type, projectId, content)
  }
  
  /**
   * Remove an entity from the index
   */
  removeEntity(entityId: string): void {
    const stmt = sqlite.prepare(`
      DELETE FROM memory_fts WHERE entity_id = ?
    `)
    stmt.run(entityId)
  }
}

export const searchService = new SearchService()
