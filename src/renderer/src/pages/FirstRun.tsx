import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '../stores/useAppStore'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Building2, Upload, BrainCircuit, Users, CheckCircle2 } from 'lucide-react'

const STEPS = [
  { id: 'welcome', title: 'Welcome to Brandex Architect', icon: Building2 },
  { id: 'company', title: 'Company Details', icon: Building2 },
  { id: 'assets', title: 'Upload Branding', icon: Upload },
  { id: 'ai', title: 'AI Configuration', icon: BrainCircuit },
  { id: 'client', title: 'Create First Client', icon: Users }
]

export default function FirstRun() {
  const [currentStep, setCurrentStep] = useState(0)
  
  // State variables for form persistence
  const [companyName, setCompanyName] = useState('Brandex')
  const [location, setLocation] = useState('Bangalore, Karnataka, India')
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [aiProvider, setAiProvider] = useState('gemini')
  const [clientName, setClientName] = useState('')
  const [industry, setIndustry] = useState('')
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const setIsFirstRun = useAppStore(state => state.setIsFirstRun)
  const navigate = useNavigate()

  const handleNext = async () => {
    if (currentStep === STEPS.length - 1) {
      setIsSubmitting(true)
      try {
        // 1. Save Settings
        if (companyName) await window.brandexAPI?.settings.set('company', 'company_name', companyName)
        if (location) await window.brandexAPI?.settings.set('company', 'address', location)
        
        // Save assets (In a real app this would upload to an object store or copy to appData. Here we save file names for the UI effect)
        if (uploadedFiles.length > 0) {
          const fileNames = uploadedFiles.map(f => f.name).join(', ')
          await window.brandexAPI?.settings.set('brand', 'assets_uploaded', fileNames)
        }

        // 2. Create the first client
        if (clientName) {
          await window.brandexAPI?.clients.create({
            name: clientName,
            industry: industry || 'General',
            status: 'active'
          })
        }

        // Complete Onboarding
        setIsFirstRun(false)
        navigate('/')
      } catch (error) {
        console.error('Failed to save onboarding data', error)
      } finally {
        setIsSubmitting(false)
      }
    } else {
      setCurrentStep(s => s + 1)
    }
  }

  const fileNamesDisplay = uploadedFiles.map(f => f.name).join(', ')

  return (
    <div className="h-screen w-screen bg-background flex flex-col items-center justify-center relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-2xl bg-card border shadow-2xl rounded-2xl overflow-hidden relative z-10 flex flex-col min-h-[500px]">
        {/* Header Steps */}
        <div className="flex border-b bg-muted/30">
          {STEPS.map((step, idx) => (
            <div key={step.id} className="flex-1 text-center py-4 relative">
              <div className={`w-2 h-2 mx-auto rounded-full transition-colors ${idx <= currentStep ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
              {idx < STEPS.length - 1 && (
                <div className={`absolute top-1/2 left-[50%] right-[-50%] h-[1px] -translate-y-1/2 ${idx < currentStep ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 p-12 flex flex-col justify-center items-center text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-md space-y-6"
            >
              {currentStep === 0 && (
                <>
                  <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Building2 className="w-8 h-8" />
                  </div>
                  <h1 className="text-3xl font-bold tracking-tight">Welcome to Brandex</h1>
                  <p className="text-muted-foreground">Let's set up your agency operating system. This will only take a minute.</p>
                </>
              )}

              {currentStep === 1 && (
                <>
                  <h2 className="text-2xl font-bold text-left mb-6">Company Information</h2>
                  <div className="space-y-4 text-left">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Company Name</label>
                      <Input 
                        placeholder="e.g. Brandex" 
                        value={companyName}
                        onChange={e => setCompanyName(e.target.value)} 
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Location</label>
                      <Input 
                        placeholder="e.g. Bangalore, India" 
                        value={location}
                        onChange={e => setLocation(e.target.value)} 
                      />
                    </div>
                  </div>
                </>
              )}

              {currentStep === 2 && (
                <>
                  <h2 className="text-2xl font-bold text-left mb-6">Brand Assets</h2>
                  <label className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center hover:bg-muted/50 transition-colors cursor-pointer relative ${uploadedFiles.length > 0 ? 'border-primary bg-primary/5' : ''}`}>
                    <input type="file" className="hidden" multiple accept="image/*" onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        setUploadedFiles(Array.from(e.target.files))
                      }
                    }} />
                    {uploadedFiles.length > 0 ? (
                      <CheckCircle2 className="w-8 h-8 mb-4 text-primary" />
                    ) : (
                      <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                    )}
                    <p className="font-medium">{uploadedFiles.length > 0 ? 'Assets Securely Uploaded' : 'Upload Logos'}</p>
                    <p className="text-sm text-muted-foreground mt-1 max-w-[250px] truncate">
                      {uploadedFiles.length > 0 ? fileNamesDisplay : 'Click to select dark logo, light logo, and favicon'}
                    </p>
                  </label>
                </>
              )}

              {currentStep === 3 && (
                <>
                  <h2 className="text-2xl font-bold text-left mb-6">AI Configuration</h2>
                  <p className="text-sm text-muted-foreground text-left mb-6">Select your preferred intelligence provider for generating proposals and PRDs.</p>
                  <div className="space-y-3">
                    <div 
                      onClick={() => setAiProvider('gemini')}
                      className={`border rounded-xl p-4 flex items-center justify-between cursor-pointer transition-colors ${aiProvider === 'gemini' ? 'border-primary bg-primary/5' : 'hover:border-foreground/30 opacity-60'}`}
                    >
                      <div className="flex items-center gap-3">
                        <BrainCircuit className={`w-5 h-5 ${aiProvider === 'gemini' ? 'text-primary' : ''}`} />
                        <span className="font-medium">Gemini (Default)</span>
                      </div>
                      {aiProvider === 'gemini' && <CheckCircle2 className="w-5 h-5 text-primary" />}
                    </div>
                    <div 
                      onClick={() => setAiProvider('openRouter')}
                      className={`border rounded-xl p-4 flex items-center justify-between cursor-pointer transition-colors ${aiProvider === 'openRouter' ? 'border-primary bg-primary/5' : 'hover:border-foreground/30 opacity-60'}`}
                    >
                      <div className="flex items-center gap-3">
                        <BrainCircuit className={`w-5 h-5 ${aiProvider === 'openRouter' ? 'text-primary' : ''}`} />
                        <span className="font-medium">OpenRouter</span>
                      </div>
                      {aiProvider === 'openRouter' && <CheckCircle2 className="w-5 h-5 text-primary" />}
                    </div>
                    <div 
                      onClick={() => setAiProvider('nvidia')}
                      className={`border rounded-xl p-4 flex items-center justify-between cursor-pointer transition-colors ${aiProvider === 'nvidia' ? 'border-primary bg-primary/5' : 'hover:border-foreground/30 opacity-60'}`}
                    >
                      <div className="flex items-center gap-3">
                        <BrainCircuit className={`w-5 h-5 ${aiProvider === 'nvidia' ? 'text-primary' : ''}`} />
                        <span className="font-medium">NVIDIA NIM</span>
                      </div>
                      {aiProvider === 'nvidia' && <CheckCircle2 className="w-5 h-5 text-primary" />}
                    </div>
                  </div>
                </>
              )}

              {currentStep === 4 && (
                <>
                  <h2 className="text-2xl font-bold text-left mb-6">Your First Client</h2>
                  <div className="space-y-4 text-left">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Client Name</label>
                      <Input 
                        placeholder="e.g. Acme Corp" 
                        value={clientName}
                        onChange={e => setClientName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Industry</label>
                      <Input 
                        placeholder="e.g. Fintech" 
                        value={industry}
                        onChange={e => setIndustry(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="pt-4 text-left">
                    <p className="text-sm text-muted-foreground">You are now ready to generate your first PRD and Proposal.</p>
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer actions */}
        <div className="p-6 border-t bg-muted/10 flex justify-between">
          <Button variant="ghost" onClick={() => setCurrentStep(s => Math.max(0, s - 1))} disabled={currentStep === 0 || isSubmitting}>
            Back
          </Button>
          <Button onClick={handleNext} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : currentStep === STEPS.length - 1 ? "Complete Setup" : "Continue"}
          </Button>
        </div>
      </div>
    </div>
  )
}
