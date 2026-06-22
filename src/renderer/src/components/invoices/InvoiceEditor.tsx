import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Save, Plus, Trash2, Wand2, FileDown, ReceiptText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { v4 as uuidv4 } from 'uuid'

// A super simple Indian Number to Words converter for the invoice
function numberToWords(num: number): string {
  if (num === 0) return 'Zero'
  const a = ['','One ','Two ','Three ','Four ', 'Five ','Six ','Seven ','Eight ','Nine ','Ten ','Eleven ','Twelve ','Thirteen ','Fourteen ','Fifteen ','Sixteen ','Seventeen ','Eighteen ','Nineteen ']
  const b = ['', '', 'Twenty','Thirty','Forty','Fifty', 'Sixty','Seventy','Eighty','Ninety']
  
  const toWords = (n: number): string => {
    if (n < 20) return a[n]
    const digit = n % 10
    if (n < 100) return b[Math.floor(n / 10)] + (digit ? ' ' + a[digit] : '')
    if (n < 1000) return a[Math.floor(n / 100)] + 'Hundred ' + (n % 100 === 0 ? '' : 'and ' + toWords(n % 100))
    if (n < 100000) return toWords(Math.floor(n / 1000)) + 'Thousand ' + (n % 1000 === 0 ? '' : toWords(n % 1000))
    if (n < 10000000) return toWords(Math.floor(n / 100000)) + 'Lakh ' + (n % 100000 === 0 ? '' : toWords(n % 100000))
    return toWords(Math.floor(n / 10000000)) + 'Crore ' + (n % 10000000 === 0 ? '' : toWords(n % 10000000))
  }
  return toWords(Math.floor(num)).trim() + ' Rupees Only'
}

export function InvoiceEditor({ invoice, onBack }: { invoice: any, onBack: () => void }) {
  const queryClient = useQueryClient()
  const isNew = !invoice
  
  const [form, setForm] = useState({
    invoiceNumber: invoice?.invoiceNumber || `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
    clientId: invoice?.clientId || '',
    projectId: invoice?.projectId || '',
    date: invoice?.date || new Date().toISOString().split('T')[0],
    dueDate: invoice?.dueDate || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 15 days
    currency: invoice?.currency || 'INR',
    status: invoice?.status || 'Draft',
    notes: invoice?.notes || '',
    terms: invoice?.terms || '',
    tax: invoice?.tax || 0,
    discount: invoice?.discount || 0
  })

  const [items, setItems] = useState<any[]>(invoice?.items || [
    { id: uuidv4(), description: '', quantity: 1, rate: 0, amount: 0 }
  ])

  const { data: clients } = useQuery({ queryKey: ['clients'], queryFn: async () => window.brandexAPI?.clients.list() })
  const { data: projects } = useQuery({ queryKey: ['projects'], queryFn: async () => window.brandexAPI?.projects.list() })
  const { data: clauses } = useQuery({ queryKey: ['clauses'], queryFn: async () => window.brandexAPI?.clauses.list() })

  // Auto Calculations
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0)
  const total = subtotal + form.tax - form.discount
  const amountInWords = numberToWords(total)

  // Update item amounts
  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items]
    newItems[index][field] = value
    if (field === 'quantity' || field === 'rate') {
      newItems[index].amount = newItems[index].quantity * newItems[index].rate
    }
    setItems(newItems)
  }

  const addItem = () => setItems([...items, { id: uuidv4(), description: '', quantity: 1, rate: 0, amount: 0 }])
  const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx))

  const handleAIAutoFill = async () => {
    if (!form.projectId) {
      toast.error('Select a project first')
      return
    }
    
    toast.loading('Analyzing project scope...')
    // Simulating AI analyzing project features and mapping them to line items
    setTimeout(() => {
      toast.dismiss()
      setItems([
        { id: uuidv4(), description: 'UI/UX Design Phase', quantity: 1, rate: 25000, amount: 25000 },
        { id: uuidv4(), description: 'Frontend Development (React/Vite)', quantity: 1, rate: 45000, amount: 45000 },
        { id: uuidv4(), description: 'Backend Architecture & Database', quantity: 1, rate: 30000, amount: 30000 }
      ])
      
      // Suggesting a clause
      const paymentClause = clauses?.find((c: any) => c.category === 'Payment Terms')
      if (paymentClause) {
        setForm(f => ({ ...f, terms: f.terms + '\n\n' + paymentClause.content }))
      }
      
      toast.success('Line items and clauses populated!')
    }, 1500)
  }

  const handleExportPDF = async () => {
    // We will build a styled HTML block and pass it to the PDF exporter
    // We will replace {{variables}} with actual data
    const client = clients?.find((c: any) => c.id === form.clientId)
    
    // Fetch company info from settings
    const brandSettings = await window.brandexAPI?.settings.get('brand')
    const companySettings = await window.brandexAPI?.settings.get('company')
    const getS = (arr: any[], k: string) => arr?.find((s:any) => s.key === k)?.value || ''
    
    const cInfo = {
      logoUrl: getS(brandSettings, 'main_logo'),
      companyName: getS(companySettings, 'company_name'),
      address: getS(companySettings, 'address'),
      gstNumber: getS(companySettings, 'gst'),
      upiId: getS(companySettings, 'upi_id'),
      bankName: getS(companySettings, 'bank_name'),
      accountNo: getS(companySettings, 'account_no'),
      ifsc: getS(companySettings, 'ifsc')
    }

    let qrCodeHtml = ''
    if (cInfo.upiId && total > 0) {
      const upiString = `upi://pay?pa=${encodeURIComponent(cInfo.upiId)}&pn=${encodeURIComponent(cInfo.companyName || 'Company')}&am=${total}&cu=INR`
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(upiString)}`
      qrCodeHtml = `
        <div class="qr-code">
          <img src="${qrUrl}" width="100" height="100" />
          <p>Scan to Pay via UPI</p>
        </div>
      `
    }

    let html = `
      <html>
        <head>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
            body { font-family: 'Inter', sans-serif; color: #1e293b; line-height: 1.5; margin: 0; padding: 30px; background: #ffffff; }
            * { box-sizing: border-box; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; }
            .header-left { max-width: 50%; }
            .brand-name { font-size: 28px; font-weight: 800; color: #0f172a; margin: 0 0 10px 0; letter-spacing: -0.5px; }
            .company-address { font-size: 13px; color: #64748b; margin: 0 0 4px 0; line-height: 1.4; }
            .title { font-size: 36px; font-weight: 800; color: #0f172a; margin: 0 0 4px 0; text-transform: uppercase; letter-spacing: -1px; }
            .invoice-number { font-size: 16px; color: #64748b; font-weight: 600; margin: 0; }
            .dates { display: flex; gap: 24px; margin-top: 16px; justify-content: flex-end; }
            .date-block { display: flex; flex-direction: column; text-align: right; }
            .date-label { font-size: 11px; text-transform: uppercase; font-weight: 600; color: #94a3b8; margin-bottom: 4px; letter-spacing: 0.5px; }
            .date-value { font-size: 14px; font-weight: 600; color: #0f172a; }
            .details { display: flex; justify-content: space-between; margin-bottom: 30px; padding: 16px 24px; background: #f8fafc; border-radius: 12px; }
            .col h4 { color: #64748b; font-size: 11px; text-transform: uppercase; font-weight: 700; margin: 0 0 8px 0; letter-spacing: 0.5px; }
            .col p { margin: 0 0 6px 0; font-size: 14px; color: #0f172a; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
            th { text-align: left; padding: 12px; border-bottom: 2px solid #e2e8f0; color: #64748b; font-size: 11px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; }
            td { padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #1e293b; }
            .right { text-align: right; }
            .totals { width: 320px; margin-left: auto; background: #f8fafc; border-radius: 12px; padding: 16px 24px; }
            .total-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; color: #475569; }
            .grand-total { font-weight: 700; font-size: 20px; color: #0f172a; border-top: 2px solid #e2e8f0; padding-top: 12px; margin-top: 8px; }
            .words { background: #eff6ff; padding: 12px 20px; border-radius: 12px; font-size: 13px; margin-bottom: 30px; font-weight: 500; color: #1e40af; border: 1px solid #dbeafe; }
            .footer-grid { display: flex; justify-content: space-between; border-top: 2px solid #f1f5f9; padding-top: 24px; page-break-inside: avoid; break-inside: avoid; }
            .payment-info { width: 45%; }
            .terms-info { width: 50%; }
            .qr-code { text-align: center; background: white; padding: 12px; border: 1px solid #e2e8f0; border-radius: 12px; display: inline-block; margin-top: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
            .qr-code img { display: block; margin: 0 auto; }
            .qr-code p { font-size: 11px; font-weight: 600; color: #64748b; margin: 8px 0 0 0; text-transform: uppercase; letter-spacing: 0.5px; }
            .terms { font-size: 12px; color: #64748b; white-space: pre-wrap; line-height: 1.5; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="header-left">
              ${cInfo.logoUrl ? `<img src="${cInfo.logoUrl}" style="max-height: 64px; margin-bottom: 20px;" />` : `<h1 class="brand-name">${cInfo.companyName || 'Brandex'}</h1>`}
              <p class="company-address">${cInfo.address || ''}</p>
              ${cInfo.gstNumber ? `<p class="company-address">GSTIN: ${cInfo.gstNumber}</p>` : ''}
            </div>
            <div class="text-right">
              <h2 class="title">INVOICE</h2>
              <p class="invoice-number">#${form.invoiceNumber}</p>
              <div class="dates">
                <div class="date-block">
                  <span class="date-label">Issue Date</span>
                  <span class="date-value">${new Date(form.date).toLocaleDateString()}</span>
                </div>
                <div class="date-block">
                  <span class="date-label">Due Date</span>
                  <span class="date-value">${new Date(form.dueDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="details">
            <div class="col">
              <h4>Billed To</h4>
              <p style="font-weight: 700; font-size: 16px;">${client?.name || 'Client Name'}</p>
              ${client?.email ? `<p>${client.email}</p>` : ''}
              ${client?.phone ? `<p>${client.phone}</p>` : ''}
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th class="right">Rate</th>
                <th class="right">Qty</th>
                <th class="right">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${items.map(item => `
                <tr>
                  <td style="font-weight: 500;">${item.description}</td>
                  <td class="right">₹${item.rate.toLocaleString()}</td>
                  <td class="right">${item.quantity}</td>
                  <td class="right" style="font-weight: 600;">₹${item.amount.toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="totals">
            <div class="total-row"><span>Subtotal</span><span style="font-weight: 600;">₹${subtotal.toLocaleString()}</span></div>
            ${form.tax > 0 ? `<div class="total-row"><span>Tax</span><span style="font-weight: 600;">₹${form.tax.toLocaleString()}</span></div>` : ''}
            ${form.discount > 0 ? `<div class="total-row"><span>Discount</span><span style="font-weight: 600; color: #ef4444;">-₹${form.discount.toLocaleString()}</span></div>` : ''}
            <div class="total-row grand-total"><span>Total Due</span><span>₹${total.toLocaleString()}</span></div>
          </div>

          <div class="words">Amount in words: ${amountInWords}</div>

          <div class="footer-grid">
            <div class="col payment-info">
              <h4>Payment Information</h4>
              <p><strong>Bank:</strong> ${cInfo.bankName || '-'}</p>
              <p><strong>Account:</strong> ${cInfo.accountNo || '-'}</p>
              <p><strong>IFSC:</strong> ${cInfo.ifsc || '-'}</p>
              ${qrCodeHtml}
            </div>

            <div class="col terms-info">
              <h4>Terms & Conditions</h4>
              <div class="terms">${form.terms.replace(/{{client_name}}/g, client?.name || 'Client')}</div>
            </div>
          </div>
        </body>
      </html>
    `

    try {
      const res = await window.brandexAPI?.export.pdf(html, `${form.invoiceNumber}.pdf`)
      if (res?.success) toast.success(`Saved to ${res.filePath}`)
    } catch(e) {
      toast.error('Failed to export PDF')
    }
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = { ...form, subtotal, total, amountInWords, items }
      if (isNew) return window.brandexAPI?.invoices.create(payload)
      return window.brandexAPI?.invoices.update(invoice.id, payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      toast.success('Invoice saved successfully')
      onBack()
    }
  })

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Editor Header */}
      <div className="h-16 border-b flex items-center justify-between px-6 bg-card shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="w-5 h-5" /></Button>
          <div>
            <h2 className="font-bold text-lg">{isNew ? 'Create Invoice' : `Edit ${form.invoiceNumber}`}</h2>
            <p className="text-xs text-muted-foreground">Drafting standard document</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleAIAutoFill} className="border-purple-200 text-purple-700 hover:bg-purple-50">
            <Wand2 className="w-4 h-4 mr-2" />
            Auto-Fill from Project
          </Button>
          {!isNew && (
            <Button variant="outline" onClick={handleExportPDF}>
              <FileDown className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
          )}
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
            <Save className="w-4 h-4 mr-2" />
            {saveMutation.isPending ? 'Saving...' : 'Save Invoice'}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 max-w-5xl mx-auto w-full">
        <div className="bg-card border rounded-2xl p-8 shadow-sm space-y-8">
          
          {/* Top Metadata */}
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Client</label>
                <select className="w-full h-10 px-3 rounded-lg border bg-background" value={form.clientId} onChange={e => setForm({...form, clientId: e.target.value})}>
                  <option value="">Select a client...</option>
                  {clients?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Project (Optional)</label>
                <select className="w-full h-10 px-3 rounded-lg border bg-background" value={form.projectId} onChange={e => setForm({...form, projectId: e.target.value})}>
                  <option value="">Select a project...</option>
                  {projects?.filter((p:any) => p.clientId === form.clientId).map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1 space-y-1.5">
                  <label className="text-sm font-medium">Invoice Number</label>
                  <Input value={form.invoiceNumber} onChange={e => setForm({...form, invoiceNumber: e.target.value})} />
                </div>
                <div className="flex-1 space-y-1.5">
                  <label className="text-sm font-medium">Status</label>
                  <select className="w-full h-10 px-3 rounded-lg border bg-background" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                    <option>Draft</option><option>Sent</option><option>Paid</option><option>Overdue</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1 space-y-1.5">
                  <label className="text-sm font-medium">Issue Date</label>
                  <Input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
                </div>
                <div className="flex-1 space-y-1.5">
                  <label className="text-sm font-medium">Due Date</label>
                  <Input type="date" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} />
                </div>
              </div>
            </div>
          </div>

          <hr />

          {/* Line Items */}
          <div>
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <ReceiptText className="w-5 h-5 text-muted-foreground" />
              Line Items
            </h3>
            
            <div className="space-y-3">
              <div className="flex gap-3 text-xs font-semibold text-muted-foreground uppercase px-2">
                <div className="flex-[3]">Description</div>
                <div className="flex-1">Rate</div>
                <div className="w-20">Qty</div>
                <div className="flex-1 text-right pr-12">Amount</div>
              </div>
              
              {items.map((item, idx) => (
                <div key={item.id} className="flex gap-3 items-start relative group">
                  <Input className="flex-[3]" value={item.description} onChange={e => updateItem(idx, 'description', e.target.value)} placeholder="Service description..." />
                  <Input type="number" className="flex-1" value={item.rate || ''} onChange={e => updateItem(idx, 'rate', parseFloat(e.target.value) || 0)} />
                  <Input type="number" className="w-20" value={item.quantity || ''} onChange={e => updateItem(idx, 'quantity', parseFloat(e.target.value) || 0)} />
                  <div className="flex-1 h-10 flex items-center justify-end font-medium bg-muted/20 rounded-lg px-3">
                    ₹{item.amount.toLocaleString()}
                  </div>
                  <Button variant="ghost" size="icon" className="text-muted-foreground opacity-0 group-hover:opacity-100 absolute -right-12 top-0" onClick={() => removeItem(idx)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}

              <Button variant="ghost" className="mt-2 text-primary" onClick={addItem}>
                <Plus className="w-4 h-4 mr-2" /> Add Item
              </Button>
            </div>
          </div>

          {/* Totals & Notes */}
          <div className="flex gap-12">
            <div className="flex-1 space-y-4">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Terms & Conditions</label>
                  <select 
                    className="text-xs border rounded px-2 py-1 bg-muted/20 text-muted-foreground outline-none"
                    onChange={e => {
                      if (!e.target.value) return
                      const clause = clauses?.find((c: any) => c.id === e.target.value)
                      if (clause) {
                        setForm({...form, terms: form.terms ? form.terms + '\n\n' + clause.content : clause.content})
                        e.target.value = ""
                      }
                    }}
                  >
                    <option value="">Insert template...</option>
                    {clauses?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <textarea 
                  className="w-full h-32 p-3 text-sm bg-muted/20 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                  value={form.terms}
                  onChange={e => setForm({...form, terms: e.target.value})}
                  placeholder="Payment is due within 15 days..."
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Internal Notes</label>
                <Input value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
              </div>
            </div>

            <div className="w-80 space-y-3 bg-muted/10 p-6 rounded-xl border border-border">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Tax</span>
                <Input type="number" className="w-24 h-8 text-right" value={form.tax || ''} onChange={e => setForm({...form, tax: parseFloat(e.target.value) || 0})} />
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Discount</span>
                <Input type="number" className="w-24 h-8 text-right" value={form.discount || ''} onChange={e => setForm({...form, discount: parseFloat(e.target.value) || 0})} />
              </div>
              <hr />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>₹{total.toLocaleString()}</span>
              </div>
              <p className="text-[10px] text-muted-foreground text-right italic leading-tight mt-2">
                {amountInWords}
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
