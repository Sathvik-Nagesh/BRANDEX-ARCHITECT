import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {
  clients: {
    list: () => ipcRenderer.invoke('clients:list'),
    get: (id: string) => ipcRenderer.invoke('clients:get', id),
    create: (data: any) => ipcRenderer.invoke('clients:create', data),
    update: (id: string, data: any) => ipcRenderer.invoke('clients:update', { id, data }),
    delete: (id: string) => ipcRenderer.invoke('clients:delete', id)
  },
  projects: {
    list: () => ipcRenderer.invoke('projects:list'),
    getByClient: (clientId: string) => ipcRenderer.invoke('projects:getByClient', clientId),
    get: (id: string) => ipcRenderer.invoke('projects:get', id),
    create: (data: any) => ipcRenderer.invoke('projects:create', data),
    update: (id: string, data: any) => ipcRenderer.invoke('projects:update', { id, data }),
    delete: (id: string) => ipcRenderer.invoke('projects:delete', id),
    export: (id: string) => ipcRenderer.invoke('projects:export', id),
    import: () => ipcRenderer.invoke('projects:import'),
    clone: (id: string) => ipcRenderer.invoke('projects:clone', id),
    getHealth: (id: string) => ipcRenderer.invoke('projects:getHealth', id)
  },
  features: {
    list: () => ipcRenderer.invoke('features:list'),
    getByProject: (projectId: string) => ipcRenderer.invoke('features:getByProject', projectId),
    get: (id: string) => ipcRenderer.invoke('features:get', id),
    create: (data: any) => ipcRenderer.invoke('features:create', data),
    update: (id: string, data: any) => ipcRenderer.invoke('features:update', { id, data }),
    delete: (id: string) => ipcRenderer.invoke('features:delete', id)
  },
  knowledge: {
    documents: {
      getByProject: (projectId: string) => ipcRenderer.invoke('documents:getByProject', projectId),
      create: (data: any) => ipcRenderer.invoke('documents:create', data),
      update: (id: string, data: any) => ipcRenderer.invoke('documents:update', { id, data })
    },
    decisions: {
      list: () => ipcRenderer.invoke('decisions:list'),
      getByProject: (projectId: string) => ipcRenderer.invoke('decisions:getByProject', projectId),
      create: (data: any) => ipcRenderer.invoke('decisions:create', data)
    },
    meetings: {
      list: () => ipcRenderer.invoke('meetings:list'),
      getByProject: (projectId: string) => ipcRenderer.invoke('meetings:getByProject', projectId),
      create: (data: any) => ipcRenderer.invoke('meetings:create', data)
    }
  },
  backup: {
    create: () => ipcRenderer.invoke('backup:create'),
    restore: () => ipcRenderer.invoke('backup:restore')
  },
  export: {
    pdf: (htmlContent: string, defaultName?: string) => ipcRenderer.invoke('export:pdf', htmlContent, defaultName),
    docx: (sections: any[], defaultName?: string) => ipcRenderer.invoke('export:docx', sections, defaultName)
  },
  ai: {
    chat: (prompt: string, projectId?: string) => ipcRenderer.invoke('ai:chat', prompt, projectId)
  },
  proposals: {
    list: () => ipcRenderer.invoke('proposals:list'),
    create: (data: any) => ipcRenderer.invoke('proposals:create', data)
  },
  templates: {
    list: () => ipcRenderer.invoke('templates:list'),
    get: (id: string) => ipcRenderer.invoke('templates:get', id),
    create: (data: any) => ipcRenderer.invoke('templates:create', data),
    update: (id: string, data: any) => ipcRenderer.invoke('templates:update', { id, data }),
    delete: (id: string) => ipcRenderer.invoke('templates:delete', id)
  },
  clauses: {
    list: () => ipcRenderer.invoke('clauses:list'),
    get: (id: string) => ipcRenderer.invoke('clauses:get', id),
    create: (data: any) => ipcRenderer.invoke('clauses:create', data),
    update: (id: string, data: any) => ipcRenderer.invoke('clauses:update', { id, data }),
    delete: (id: string) => ipcRenderer.invoke('clauses:delete', id)
  },
  invoices: {
    list: () => ipcRenderer.invoke('invoices:list'),
    get: (id: string) => ipcRenderer.invoke('invoices:get', id),
    create: (data: any) => ipcRenderer.invoke('invoices:create', data),
    update: (id: string, data: any) => ipcRenderer.invoke('invoices:update', { id, data }),
    delete: (id: string) => ipcRenderer.invoke('invoices:delete', id)
  },
  projectTemplates: {
    list: () => ipcRenderer.invoke('project_templates:list')
  },
  changeRequests: {
    list: (projectId: string) => ipcRenderer.invoke('change_requests:list', projectId),
    create: (data: any) => ipcRenderer.invoke('change_requests:create', data)
  },
  playbook: {
    list: () => ipcRenderer.invoke('playbook:list'),
    save: (data: any) => ipcRenderer.invoke('playbook:save', data)
  },
  deliverables: {
    list: (projectId: string) => ipcRenderer.invoke('deliverables:list', projectId),
    save: (data: any) => ipcRenderer.invoke('deliverables:save', data)
  },
  lessons: {
    list: (projectId: string) => ipcRenderer.invoke('lessons:list', projectId),
    create: (data: any) => ipcRenderer.invoke('lessons:create', data)
  },
  snapshots: {
    list: (projectId: string) => ipcRenderer.invoke('snapshots:list', projectId),
    create: (projectId: string, name: string) => ipcRenderer.invoke('snapshots:create', projectId, name)
  },
  intelligence: {
    analyzeChangeRequest: (text: string) => ipcRenderer.invoke('intelligence:analyzeChangeRequest', text),
    generateProjectStructure: (prompt: string) => ipcRenderer.invoke('intelligence:generateProjectStructure', prompt)
  },
  settings: {
    get: (category: string, key?: string) => ipcRenderer.invoke('settings:get', category, key),
    set: (category: string, key: string, value: any) => ipcRenderer.invoke('settings:set', category, key, value)
  },
  system: {
    generateDemoData: () => ipcRenderer.invoke('system:generateDemoData'),
    getAppVersion: () => ipcRenderer.invoke('system:getAppVersion'),
    getDashboardStats: () => ipcRenderer.invoke('system:getDashboardStats'),
    search: (query: string) => ipcRenderer.invoke('system:search', query)
  },
  window: {
    minimize: () => ipcRenderer.invoke('window:minimize'),
    maximize: () => ipcRenderer.invoke('window:maximize'),
    close: () => ipcRenderer.invoke('window:close'),
    isMaximized: () => ipcRenderer.invoke('window:isMaximized'),
    onMaximizedChange: (callback: (isMaximized: boolean) => void) => {
      const handler = (_, value: boolean) => callback(value)
      ipcRenderer.on('window:maximizedChange', handler)
      return () => {
        ipcRenderer.removeListener('window:maximizedChange', handler)
      }
    }
  }
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('brandexAPI', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
  // @ts-ignore (define in dts)
  window.brandexAPI = api
}
