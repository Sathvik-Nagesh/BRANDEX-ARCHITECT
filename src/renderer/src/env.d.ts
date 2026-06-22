/// <reference types="vite/client" />

interface Window {
  electron: any
  api: {
    clients: {
      list: () => Promise<any[]>
      get: (id: string) => Promise<any>
      create: (data: any) => Promise<any>
      update: (id: string, data: any) => Promise<any>
      delete: (id: string) => Promise<{ success: boolean }>
    }
    projects: {
      list: () => Promise<any[]>
      getByClient: (clientId: string) => Promise<any[]>
      get: (id: string) => Promise<any>
      create: (data: any) => Promise<any>
      update: (id: string, data: any) => Promise<any>
      delete: (id: string) => Promise<{ success: boolean }>
    }
    features: {
      list: () => Promise<any[]>
      getByProject: (projectId: string) => Promise<any[]>
      get: (id: string) => Promise<any>
      create: (data: any) => Promise<any>
      update: (id: string, data: any) => Promise<any>
      delete: (id: string) => Promise<{ success: boolean }>
    }
    knowledge: {
      documents: {
        getByProject: (projectId: string) => Promise<any[]>
        create: (data: any) => Promise<any>
        update: (id: string, data: any) => Promise<any>
      }
      decisions: {
        getByProject: (projectId: string) => Promise<any[]>
        create: (data: any) => Promise<any>
      }
      meetings: {
        getByProject: (projectId: string) => Promise<any[]>
        create: (data: any) => Promise<any>
      }
    }
    export: {
      pdf: (htmlContent: string, defaultName?: string) => Promise<string | null>
      docx: (sections: any[], defaultName?: string) => Promise<string | null>
    }
    [key: string]: any // allow other dynamic api methods
  }
  brandexAPI: Window['api']
}
