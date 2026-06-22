import React, { useState } from 'react'
import { PageHeader } from '@/components/shared/PageHeader'
import { PageTransition } from '@/components/shared/PageTransition'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Plus, ReceiptText, Calendar, IndianRupee, FileDown, Search } from 'lucide-react'
import { InvoiceEditor } from '@/components/invoices/InvoiceEditor'
import { Input } from '@/components/ui/input'
import { StatusBadge } from '@/components/shared/StatusBadge'

export default function Invoices() {
  const [isEditing, setIsEditing] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null)
  const [search, setSearch] = useState('')

  const { data: invoices, isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => window.brandexAPI?.invoices.list()
  })

  const { data: clients } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => window.brandexAPI?.clients.list()
  })

  const getClientName = (id: string) => clients?.find(c => c.id === id)?.name || 'Unknown Client'

  const handleCreate = () => {
    setSelectedInvoice(null)
    setIsEditing(true)
  }

  const handleEdit = async (invoice: any) => {
    const fullInvoice = await window.brandexAPI?.invoices.get(invoice.id)
    setSelectedInvoice(fullInvoice)
    setIsEditing(true)
  }

  if (isEditing) {
    return <InvoiceEditor invoice={selectedInvoice} onBack={() => setIsEditing(false)} />
  }

  const filteredInvoices = invoices?.filter(i => 
    i.invoiceNumber.toLowerCase().includes(search.toLowerCase()) || 
    getClientName(i.clientId).toLowerCase().includes(search.toLowerCase())
  ) || []

  // Metrics
  const totalInvoices = invoices?.length || 0
  const totalAmount = invoices?.reduce((sum, inv) => sum + inv.total, 0) || 0
  const paidAmount = invoices?.filter(i => i.status === 'Paid').reduce((sum, inv) => sum + inv.total, 0) || 0
  const pendingAmount = totalAmount - paidAmount

  return (
    <PageTransition className="flex flex-col h-full bg-background/50">
      <div className="p-8 pb-4">
        <PageHeader 
          title="Invoices" 
          description="Manage billing, create smart invoices, and track revenue."
          actions={
            <Button onClick={handleCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Create Invoice
            </Button>
          }
        />
      </div>

      <div className="px-8 pb-8 flex-1 overflow-auto custom-scrollbar">
        {/* Dashboard Metrics */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="p-5 border bg-card rounded-xl">
            <p className="text-sm text-muted-foreground font-medium mb-1">Total Invoices</p>
            <p className="text-2xl font-bold">{totalInvoices}</p>
          </div>
          <div className="p-5 border bg-card rounded-xl">
            <p className="text-sm text-muted-foreground font-medium mb-1">Total Billed</p>
            <p className="text-2xl font-bold text-foreground">₹{totalAmount.toLocaleString()}</p>
          </div>
          <div className="p-5 border bg-emerald-50/50 rounded-xl border-emerald-100">
            <p className="text-sm text-emerald-600 font-medium mb-1">Amount Paid</p>
            <p className="text-2xl font-bold text-emerald-700">₹{paidAmount.toLocaleString()}</p>
          </div>
          <div className="p-5 border bg-amber-50/50 rounded-xl border-amber-100">
            <p className="text-sm text-amber-600 font-medium mb-1">Outstanding</p>
            <p className="text-2xl font-bold text-amber-700">₹{pendingAmount.toLocaleString()}</p>
          </div>
        </div>

        {/* Invoice List */}
        <div className="bg-card border rounded-2xl overflow-hidden">
          <div className="p-4 border-b flex justify-between items-center bg-muted/10">
            <h3 className="font-semibold text-lg">Recent Invoices</h3>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search invoices..." 
                className="pl-9 h-9"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
          
          <div className="divide-y">
            {filteredInvoices.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <ReceiptText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                No invoices found. Create one to get started.
              </div>
            ) : (
              filteredInvoices.map((inv: any) => (
                <div key={inv.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => handleEdit(inv)}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                      {inv.invoiceNumber.replace('INV-', '')}
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{getClientName(inv.clientId)}</h4>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(inv.date).toLocaleDateString()}</span>
                        <span>Due: {new Date(inv.dueDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <p className="font-bold text-foreground">₹{inv.total.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{inv.currency}</p>
                    </div>
                    <div className="w-24 flex justify-end">
                      <StatusBadge status={inv.status.toLowerCase()} />
                    </div>
                    <Button variant="ghost" size="icon" className="text-muted-foreground">
                      <FileDown className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
