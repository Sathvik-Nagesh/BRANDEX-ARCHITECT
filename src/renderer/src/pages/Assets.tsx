import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MOTION } from '@/lib/constants'
import { PageHeader } from '@/components/shared/PageHeader'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Package, Image, Building2, Scale, FileText,
  UserCircle, Camera, Upload, CheckCircle2, ChevronRight, Save, BookOpen
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ClauseLibrary } from '@/components/assets/ClauseLibrary'

const assetCategories = [
  {
    id: 'brand',
    title: 'Brand Assets',
    description: 'Logos, colors, and brand guidelines',
    icon: Image,
    fields: [
      { key: 'main_logo', label: 'Main Logo', type: 'image' },
      { key: 'dark_logo', label: 'Dark Logo', type: 'image' },
      { key: 'brand_color', label: 'Primary Brand Color (Hex)', type: 'text' }
    ]
  },
  {
    id: 'company',
    title: 'Company Information',
    description: 'Company details and contact information',
    icon: Building2,
    fields: [
      { key: 'company_name', label: 'Company Name', type: 'text' },
      { key: 'address', label: 'Address', type: 'text' },
      { key: 'phone', label: 'Phone Number', type: 'text' },
      { key: 'email', label: 'Email Address', type: 'text' },
      { key: 'website', label: 'Website URL', type: 'text' },
      { key: 'gst', label: 'GST Number', type: 'text' },
      { key: 'bank_name', label: 'Bank Name', type: 'text' },
      { key: 'account_no', label: 'Account Number', type: 'text' },
      { key: 'ifsc', label: 'IFSC Code', type: 'text' },
      { key: 'upi_id', label: 'UPI ID', type: 'text' }
    ]
  },
  {
    id: 'clauses',
    title: 'Clause Library',
    description: 'Reusable legal and commercial clauses',
    icon: BookOpen,
    fields: []
  }
]

export default function Assets() {
  const [activeCategory, setActiveCategory] = useState(assetCategories[0])
  const [localData, setLocalData] = useState<Record<string, string>>({})
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [activeUploadKey, setActiveUploadKey] = useState<string | null>(null)

  const { data: settings } = useQuery({
    queryKey: ['settings', activeCategory.id],
    queryFn: async () => {
      if (activeCategory.id === 'clauses') return {}
      const res = await window.brandexAPI?.settings.get(activeCategory.id)
      const dataMap: Record<string, string> = {}
      if (res) {
        res.forEach((s: any) => { dataMap[s.key] = s.value })
      }
      setLocalData(dataMap)
      return dataMap
    },
    enabled: activeCategory.id !== 'clauses'
  })

  const saveMutation = useMutation({
    mutationFn: async () => {
      for (const [key, value] of Object.entries(localData)) {
        await window.brandexAPI?.settings.set(activeCategory.id, key, value)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', activeCategory.id] })
      toast.success('Assets successfully saved!')
    }
  })

  const handleSave = () => {
    saveMutation.mutate()
  }

  const triggerUpload = (key: string) => {
    setActiveUploadKey(key)
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !activeUploadKey) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const base64 = event.target?.result as string
      setLocalData(prev => ({ ...prev, [activeUploadKey]: base64 }))
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="p-8 h-full flex flex-col">
      <PageHeader
        title="Assets Center"
        description="Global source of truth for Brandex resources"
      />

      <input type="file" ref={fileInputRef} className="hidden" accept="image/png, image/jpeg, image/svg+xml" onChange={handleFileChange} />

      <div className="flex-1 flex gap-8 mt-4 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 flex flex-col gap-2 overflow-y-auto custom-scrollbar pr-2">
          {assetCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category)}
              className={`w-full text-left p-3 rounded-xl flex items-center justify-between transition-colors ${
                activeCategory.id === category.id 
                  ? 'bg-primary/10 border border-primary/20' 
                  : 'hover:bg-muted border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <category.icon className={`w-4 h-4 ${activeCategory.id === category.id ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className={`text-sm font-medium ${activeCategory.id === category.id ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {category.title}
                </span>
              </div>
              {activeCategory.id === category.id && <ChevronRight className="w-4 h-4 text-primary" />}
            </button>
          ))}
        </div>

        {/* Editor Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {activeCategory.id === 'clauses' ? (
            <ClauseLibrary />
          ) : (
            <div className="flex-1 bg-card border rounded-2xl flex flex-col overflow-hidden">
              <div className="p-6 border-b flex items-center justify-between bg-muted/10">
                <div>
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <activeCategory.icon className="w-5 h-5 text-muted-foreground" />
                    {activeCategory.title}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">{activeCategory.description}</p>
                </div>
                <Button onClick={handleSave} disabled={saveMutation.isPending} className="gap-2">
                  <Save className="w-4 h-4" />
                  {saveMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeCategory.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6 max-w-xl"
                  >
                    {activeCategory.fields.map((field) => (
                      <div key={field.key} className="space-y-2">
                        <label className="text-sm font-medium text-foreground">
                          {field.label}
                        </label>
                        {field.type === 'image' ? (
                          <div className="flex items-center gap-4">
                            <div className="w-24 h-24 rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-muted/20 overflow-hidden relative">
                              {localData[field.key] ? (
                                <img src={localData[field.key]} className="w-full h-full object-contain p-2" />
                              ) : (
                                <Image className="w-6 h-6 text-muted-foreground/30" />
                              )}
                            </div>
                            <Button variant="outline" onClick={() => triggerUpload(field.key)}>
                              <Upload className="w-4 h-4 mr-2" />
                              Upload Image
                            </Button>
                          </div>
                        ) : (
                          <Input
                            value={localData[field.key] || ''}
                            onChange={(e) => setLocalData({ ...localData, [field.key]: e.target.value })}
                            placeholder={`Enter ${field.label.toLowerCase()}`}
                            className="bg-background"
                          />
                        )}
                      </div>
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
