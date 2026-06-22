import { ipcMain } from 'electron'
import { db } from '../database/connection'
import { eq, desc } from 'drizzle-orm'
import { invoices, invoiceItems } from '../database/schema/invoices'
import { v4 as uuidv4 } from 'uuid'

export function registerInvoiceHandlers() {
  ipcMain.handle('invoices:list', async () => {
    return await db.select().from(invoices).orderBy(desc(invoices.createdAt))
  })

  ipcMain.handle('invoices:get', async (_, id: string) => {
    const list = await db.select().from(invoices).where(eq(invoices.id, id))
    if (!list.length) return null

    const items = await db.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, id)).orderBy(invoiceItems.sortOrder)
    return { ...list[0], items }
  })

  ipcMain.handle('invoices:create', async (_, data: any) => {
    const { items, ...invoiceData } = data
    
    const newInvoice = {
      ...invoiceData,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date()
    }

    db.transaction((tx) => {
      tx.insert(invoices).values(newInvoice).run()
      
      if (items && items.length > 0) {
        const newItems = items.map((item: any, idx: number) => ({
          ...item,
          id: uuidv4(),
          invoiceId: newInvoice.id,
          sortOrder: idx,
          createdAt: new Date()
        }))
        tx.insert(invoiceItems).values(newItems).run()
      }
    })

    return newInvoice
  })

  ipcMain.handle('invoices:update', async (_, { id, data }: { id: string, data: any }) => {
    const { items, ...invoiceData } = data
    
    const updated = {
      ...invoiceData,
      updatedAt: new Date()
    }

    db.transaction((tx) => {
      tx.update(invoices).set(updated).where(eq(invoices.id, id)).run()
      
      if (items !== undefined) {
        // Delete old items and insert new ones to handle reordering/deletions easily
        tx.delete(invoiceItems).where(eq(invoiceItems.invoiceId, id)).run()
        
        if (items.length > 0) {
          const newItems = items.map((item: any, idx: number) => ({
            ...item,
            id: uuidv4(),
            invoiceId: id,
            sortOrder: idx,
            createdAt: new Date()
          }))
          tx.insert(invoiceItems).values(newItems).run()
        }
      }
    })

    return { id, ...updated }
  })

  ipcMain.handle('invoices:delete', async (_, id: string) => {
    await db.delete(invoices).where(eq(invoices.id, id))
    return { success: true }
  })
}
