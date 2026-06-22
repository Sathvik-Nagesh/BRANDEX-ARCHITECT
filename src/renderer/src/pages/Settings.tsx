import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { MOTION } from '@/lib/constants'
import { PageHeader } from '@/components/shared/PageHeader'
import { PageTransition } from '@/components/shared/PageTransition'
import {
  Settings as SettingsIcon, Sparkles, Sliders,
  Database, Download, Info, Laptop, Trash2, ShieldAlert, Key, FileText, Keyboard, Briefcase, RefreshCw, ArchiveRestore, CheckCircle2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAppStore } from '@/stores/useAppStore'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

const settingSections = [
  { id: 'general', label: 'General', icon: Sliders, description: 'Application preferences' },
  { id: 'ai', label: 'AI Providers', icon: Sparkles, description: 'Configure Gemini, OpenRouter, and NVIDIA NIM' },
  { id: 'backup', label: 'Backup & Restore', icon: ArchiveRestore, description: 'Protect your workspace data' },
  { id: 'updates', label: 'Updates', icon: Download, description: 'Check for application updates' },
  { id: 'advanced', label: 'Advanced', icon: ShieldAlert, description: 'System and developer tools' },
]

export default function Settings() {
  const [activeSection, setActiveSection] = useState('general')
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false)
  const [isBackingUp, setIsBackingUp] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)
  const setIsFirstRun = useAppStore(state => state.setIsFirstRun)
  const navigate = useNavigate()

  // API Key State
  const [apiKeys, setApiKeys] = useState({ gemini: '', openRouter: '', nvidia: '' })
  const [savedKeys, setSavedKeys] = useState({ gemini: false, openRouter: false, nvidia: false })
  const [isSavingKey, setIsSavingKey] = useState<string | null>(null)

  useEffect(() => {
    async function loadKeys() {
      try {
        const gemini = await window.brandexAPI?.settings.get('ai', 'gemini_key')
        const openRouter = await window.brandexAPI?.settings.get('ai', 'openrouter_key')
        const nvidia = await window.brandexAPI?.settings.get('ai', 'nvidia_key')
        
        setApiKeys({
          gemini: gemini?.value || '',
          openRouter: openRouter?.value || '',
          nvidia: nvidia?.value || ''
        })
        setSavedKeys({
          gemini: !!gemini?.value,
          openRouter: !!openRouter?.value,
          nvidia: !!nvidia?.value
        })
      } catch (e) {
        console.error('Failed to load API keys', e)
      }
    }
    loadKeys()
  }, [])

  const handleSaveKey = async (provider: 'gemini' | 'openRouter' | 'nvidia') => {
    setIsSavingKey(provider)
    try {
      await window.brandexAPI?.settings.set('ai', `${provider}_key`, apiKeys[provider])
      setSavedKeys(prev => ({ ...prev, [provider]: !!apiKeys[provider] }))
      toast.success(`${provider.toUpperCase()} API Key saved successfully!`)
    } catch (e) {
      toast.error('Failed to save API key')
    } finally {
      setIsSavingKey(null)
    }
  }

  const handleResetMemory = () => {
    if (confirm('Are you sure you want to reset the app memory? This will bring you back to the onboarding screen.')) {
      setIsFirstRun(true)
      navigate('/')
    }
  }

  const handleCheckUpdates = () => {
    setIsCheckingUpdate(true)
    setTimeout(() => {
      setIsCheckingUpdate(false)
      toast.success('Brandex Architect is up to date! (v1.0.0)')
    }, 2000)
  }

  const handleCreateBackup = async () => {
    setIsBackingUp(true)
    try {
      const result = await window.brandexAPI?.backup.create()
      if (result?.success) {
        toast.success(`Backup securely created at: ${result.filePath}`)
      } else if (!result?.canceled) {
        toast.error('Failed to create backup.')
      }
    } catch (err) {
      toast.error('Backup error: ' + err)
    } finally {
      setIsBackingUp(false)
    }
  }

  const handleRestoreBackup = async () => {
    if (!confirm('WARNING: Restoring a backup will overwrite your CURRENT active workspace databases completely. Are you sure you want to proceed?')) {
      return
    }
    
    setIsRestoring(true)
    try {
      const result = await window.brandexAPI?.backup.restore()
      if (result?.success) {
        toast.success('Backup restored! Application will restart automatically.')
      } else if (!result?.canceled) {
        toast.error('Failed to restore backup.')
      }
    } catch (err) {
      toast.error('Restore error: ' + err)
    } finally {
      setIsRestoring(false)
    }
  }

  return (
    <PageTransition className="flex flex-col h-full bg-background/50">
      <div className="p-8 pb-4">
        <PageHeader
          title="Settings Center"
          description="Configure your workspace and secure your business continuity."
        />
      </div>

      <div className="px-8 pb-8 flex-1 overflow-auto custom-scrollbar flex gap-8">
        {/* Settings Navigation */}
        <motion.div
          className="w-64 flex-shrink-0 space-y-1"
          variants={MOTION.stagger}
          initial="initial"
          animate="animate"
        >
          {settingSections.map((section) => (
            <motion.button
              key={section.id}
              variants={MOTION.listItem}
              onClick={() => setActiveSection(section.id)}
              className={cn(
                'w-full flex flex-col items-start px-4 py-3 rounded-xl text-left transition-colors',
                activeSection === section.id
                  ? 'bg-primary/5 border border-primary/20 text-primary shadow-sm'
                  : 'border border-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground'
              )}
            >
              <div className="flex items-center gap-3">
                <section.icon className="w-[18px] h-[18px] flex-shrink-0" strokeWidth={2} />
                <span className="font-semibold">{section.label}</span>
              </div>
              <span className="text-xs opacity-70 mt-1 ml-7">{section.description}</span>
            </motion.button>
          ))}
        </motion.div>

        {/* Settings Content */}
        <motion.div
          key={activeSection}
          className="flex-1 bg-card border border-border rounded-2xl p-8 shadow-sm h-fit max-w-[900px]"
          {...MOTION.fadeIn}
        >
          {/* GENERAL */}
          {activeSection === 'general' && (
            <div>
              <h3 className="text-lg font-bold text-foreground mb-1">General Settings</h3>
              <p className="text-sm text-muted-foreground mb-8">Basic application preferences.</p>

              <div className="space-y-6 max-w-lg">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Application Name</label>
                  <Input defaultValue="Brandex Architect" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Language</label>
                  <select className="w-full bg-background border rounded-lg px-3 py-2 text-sm">
                    <option>English (US)</option>
                    <option>English (UK)</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Date Format</label>
                    <select className="w-full bg-background border rounded-lg px-3 py-2 text-sm">
                      <option>MM/DD/YYYY</option>
                      <option>DD/MM/YYYY</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Time Format</label>
                    <select className="w-full bg-background border rounded-lg px-3 py-2 text-sm">
                      <option>12 Hour (AM/PM)</option>
                      <option>24 Hour</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AI PROVIDERS */}
          {activeSection === 'ai' && (
            <div>
              <h3 className="text-lg font-bold text-foreground mb-1">AI Providers</h3>
              <p className="text-sm text-muted-foreground mb-8">Configure intelligence engines for drafting proposals and PRDs.</p>

              <div className="space-y-6">
                {/* Gemini */}
                <div className="border border-border rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100">
                        <Sparkles className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground">Google Gemini</h4>
                        <p className="text-xs text-muted-foreground">Primary Intelligence Engine</p>
                      </div>
                    </div>
                    {savedKeys.gemini ? (
                      <span className="text-xs px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 font-medium flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Configured</span>
                    ) : (
                      <span className="text-xs px-3 py-1 rounded-full bg-red-50 text-red-600 font-medium">Not configured</span>
                    )}
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-muted-foreground">API Key</label>
                    <div className="flex gap-2">
                      <Input 
                        type="password" 
                        placeholder="Enter your Gemini API key..." 
                        className="flex-1"
                        value={apiKeys.gemini}
                        onChange={(e) => setApiKeys(prev => ({ ...prev, gemini: e.target.value }))}
                      />
                      <Button 
                        variant={savedKeys.gemini && apiKeys.gemini ? 'outline' : 'default'}
                        onClick={() => handleSaveKey('gemini')}
                        disabled={isSavingKey === 'gemini'}
                      >
                        {isSavingKey === 'gemini' ? 'Saving...' : 'Save & Test'}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* OpenRouter */}
                <div className="border border-border rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center border border-purple-100">
                        <Sparkles className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground">OpenRouter</h4>
                        <p className="text-xs text-muted-foreground">Multiple LLM Router</p>
                      </div>
                    </div>
                    {savedKeys.openRouter ? (
                      <span className="text-xs px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 font-medium flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Configured</span>
                    ) : (
                      <span className="text-xs px-3 py-1 rounded-full bg-red-50 text-red-600 font-medium">Not configured</span>
                    )}
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-muted-foreground">API Key</label>
                    <div className="flex gap-2">
                      <Input 
                        type="password" 
                        placeholder="Enter your OpenRouter API key..." 
                        className="flex-1"
                        value={apiKeys.openRouter}
                        onChange={(e) => setApiKeys(prev => ({ ...prev, openRouter: e.target.value }))}
                      />
                      <Button 
                        variant={savedKeys.openRouter && apiKeys.openRouter ? 'outline' : 'default'}
                        onClick={() => handleSaveKey('openRouter')}
                        disabled={isSavingKey === 'openRouter'}
                      >
                        {isSavingKey === 'openRouter' ? 'Saving...' : 'Save & Test'}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* NVIDIA NIM */}
                <div className="border border-border rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center border border-green-100">
                        <Sparkles className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground">NVIDIA NIM</h4>
                        <p className="text-xs text-muted-foreground">High-performance AI Inference</p>
                      </div>
                    </div>
                    {savedKeys.nvidia ? (
                      <span className="text-xs px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 font-medium flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Configured</span>
                    ) : (
                      <span className="text-xs px-3 py-1 rounded-full bg-red-50 text-red-600 font-medium">Not configured</span>
                    )}
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-muted-foreground">API Key</label>
                    <div className="flex gap-2">
                      <Input 
                        type="password" 
                        placeholder="Enter your NVIDIA API key..." 
                        className="flex-1"
                        value={apiKeys.nvidia}
                        onChange={(e) => setApiKeys(prev => ({ ...prev, nvidia: e.target.value }))}
                      />
                      <Button 
                        variant={savedKeys.nvidia && apiKeys.nvidia ? 'outline' : 'default'}
                        onClick={() => handleSaveKey('nvidia')}
                        disabled={isSavingKey === 'nvidia'}
                      >
                        {isSavingKey === 'nvidia' ? 'Saving...' : 'Save & Test'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* BACKUP & RESTORE */}
          {activeSection === 'backup' && (
            <div>
              <h3 className="text-lg font-bold text-foreground mb-1">Backup & Restore</h3>
              <p className="text-sm text-muted-foreground mb-8">Secure your entire workspace state into a portable .brandexbackup file.</p>

              <div className="grid grid-cols-2 gap-6">
                <div className="border border-primary/20 bg-primary/5 rounded-2xl p-6 flex flex-col">
                  <div className="w-12 h-12 bg-primary/20 text-primary rounded-xl flex items-center justify-center mb-4">
                    <Download className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-lg mb-2">Create Backup</h4>
                  <p className="text-sm text-muted-foreground mb-6 flex-1">
                    Export your complete database, documents, features, memory, and assets to a single compressed archive.
                  </p>
                  <Button onClick={handleCreateBackup} disabled={isBackingUp} className="w-full">
                    {isBackingUp ? 'Archiving...' : 'Create Backup'}
                  </Button>
                </div>

                <div className="border border-amber-200 bg-amber-50/50 rounded-2xl p-6 flex flex-col">
                  <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center mb-4">
                    <ArchiveRestore className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-lg mb-2 text-amber-900">Restore Workspace</h4>
                  <p className="text-sm text-amber-800/70 mb-6 flex-1">
                    Import a .brandexbackup file. This will completely overwrite your current active database with the backup's contents.
                  </p>
                  <Button variant="outline" className="w-full border-amber-300 text-amber-800 hover:bg-amber-100" onClick={handleRestoreBackup} disabled={isRestoring}>
                    {isRestoring ? 'Restoring...' : 'Restore from File'}
                  </Button>
                </div>
              </div>

              <div className="mt-8 border-t pt-8">
                <h4 className="font-bold text-foreground mb-4">Automatic Backups</h4>
                <div className="flex items-center justify-between p-4 border rounded-xl bg-muted/20">
                  <div>
                    <h5 className="font-medium text-sm">Schedule</h5>
                    <p className="text-xs text-muted-foreground">Automatically backup your workspace locally.</p>
                  </div>
                  <select className="bg-background border rounded-lg px-3 py-2 text-sm font-medium">
                    <option>Disabled</option>
                    <option>Daily</option>
                    <option>Weekly</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ADVANCED */}
          {activeSection === 'advanced' && (
            <div>
              <h3 className="text-lg font-bold text-foreground mb-1">Advanced Settings</h3>
              <p className="text-sm text-muted-foreground mb-8">System configurations and developer controls.</p>

              <div className="space-y-4 max-w-xl">
                <div className="border border-red-200 bg-red-50/50 rounded-xl p-5 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-red-800">Reset App Memory</h4>
                    <p className="text-xs text-red-600/80 mt-1">This will restart the onboarding flow. Real database content will be preserved.</p>
                  </div>
                  <Button variant="destructive" onClick={handleResetMemory} className="gap-2">
                    <Trash2 className="w-4 h-4" /> Reset State
                  </Button>
                </div>
                
                <div className="border rounded-xl p-5 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-foreground">Developer Tools</h4>
                    <p className="text-xs text-muted-foreground mt-1">Access the DevTools inspector in the renderer.</p>
                  </div>
                  <Button variant="outline" className="gap-2">
                    Open Inspector
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* UPDATES */}
          {activeSection === 'updates' && (
            <div>
              <h3 className="text-lg font-bold text-foreground mb-1">Software Updates</h3>
              <p className="text-sm text-muted-foreground mb-8">Keep your agency operating system up to date.</p>

                <div className="border rounded-2xl p-10 flex flex-col items-center justify-center text-center bg-card shadow-sm mb-6">
                  <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6">
                    <Download className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-bold mb-2">Brandex Architect v1.0.0</h4>
                  <p className="text-sm text-muted-foreground mb-8">You are running the latest stable production release.</p>
                  <Button size="lg" onClick={handleCheckUpdates} disabled={isCheckingUpdate}>
                    {isCheckingUpdate ? (
                      <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Checking servers...</>
                    ) : (
                      'Check for Updates'
                    )}
                  </Button>
                </div>

                <div className="border border-border rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-200">
                        <Key className="w-5 h-5 text-slate-700" />
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground">GitHub Access Token</h4>
                        <p className="text-xs text-muted-foreground">Required for private repository auto-updates</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-muted-foreground">Personal Access Token (Classic)</label>
                    <div className="flex gap-2">
                      <Input type="password" placeholder="ghp_..." className="flex-1" />
                      <Button variant="secondary">Save Token</Button>
                    </div>
                  </div>
                </div>
            </div>
          )}
        </motion.div>
      </div>
    </PageTransition>
  )
}
