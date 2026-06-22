import { motion } from 'framer-motion'
import { MOTION } from '@/lib/constants'
import { PageHeader } from '@/components/shared/PageHeader'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  FolderKanban, FileText, GitBranch, Clock, AlertCircle,
  ArrowRight, Users, Layers, TrendingUp, Search, CheckCircle2, Trophy, IndianRupee
} from 'lucide-react'

export default function Dashboard() {
  const navigate = useNavigate()

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const res = await window.brandexAPI?.system.getDashboardStats()
      return res || {
        stats: { clients: 0, projects: 0, features: 0, documents: 0 },
        bi: { activeClients: 0, activeProjects: 0, deliveredProjects: 0, proposalCount: 0, pendingInvoices: 0, amcRevenue: 0, totalRevenue: 0, winRate: 0 },
        activeProjects: [],
        recentDocs: []
      }
    }
  })

  if (isLoading) return <div className="p-8 text-muted-foreground">Loading dashboard...</div>

  const biStats = [
    { label: 'Active Clients', value: dashboardData?.bi.activeClients || 0, icon: Users },
    { label: 'Active Projects', value: dashboardData?.bi.activeProjects || 0, icon: FolderKanban },
    { label: 'Delivered Projects', value: dashboardData?.bi.deliveredProjects || 0, icon: CheckCircle2 },
    { label: 'Win Rate', value: `${dashboardData?.bi.winRate || 0}%`, icon: Trophy },
    { label: 'Total Proposals', value: dashboardData?.bi.proposalCount || 0, icon: FileText },
    { label: 'Pending Invoices', value: dashboardData?.bi.pendingInvoices || 0, icon: AlertCircle },
    { label: 'AMC Revenue', value: `₹${(dashboardData?.bi.amcRevenue || 0).toLocaleString()}`, icon: TrendingUp },
    { label: 'Total Revenue', value: `₹${(dashboardData?.bi.totalRevenue || 0).toLocaleString()}`, icon: IndianRupee },
  ]

  return (
    <div className="p-8 h-full overflow-y-auto custom-scrollbar">
      <PageHeader
        title="Business Intelligence Dashboard"
        description="Executive overview of agency performance, revenue, and active operations."
      />

      {/* BI Stats Grid */}
      <motion.div
        className="grid grid-cols-4 gap-4 mb-8 mt-4"
        variants={MOTION.stagger}
        initial="initial"
        animate="animate"
      >
        {biStats.map((stat) => (
          <motion.div
            key={stat.label}
            variants={MOTION.listItem}
            className="bg-card border border-border rounded-xl p-5 card-hover shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <stat.icon className="w-5 h-5 text-primary/70" strokeWidth={1.5} />
            </div>
            <div className="text-3xl font-bold text-foreground tracking-tight">{stat.value}</div>
            <div className="text-xs font-medium text-muted-foreground mt-1 uppercase tracking-wider">{stat.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Content Grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Active Projects */}
        <motion.div
          className="col-span-2 bg-background border border-border rounded-xl p-5 flex flex-col max-h-[400px]"
          variants={MOTION.listItem}
          initial="initial"
          animate="animate"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Active Projects</h3>
            <button onClick={() => navigate('/projects')} className="text-[12px] text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
            {dashboardData?.activeProjects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center mb-3">
                  <FolderKanban className="w-5 h-5 text-muted-foreground/30" strokeWidth={1.5} />
                </div>
                <p className="text-sm text-muted-foreground">No active projects</p>
              </div>
            ) : (
              dashboardData?.activeProjects.map((p: any) => (
                <div key={p.id} onClick={() => navigate(`/projects/${p.id}`)} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                  <div>
                    <h4 className="font-medium text-sm">{p.name}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Updated {new Date(p.updatedAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                    {p.status}
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Recent Documents */}
        <motion.div
          className="bg-background border border-border rounded-xl p-5 flex flex-col max-h-[400px]"
          variants={MOTION.listItem}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.15 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Recent Documents</h3>
            <FileText className="w-4 h-4 text-muted-foreground/40" />
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
            {dashboardData?.recentDocs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-sm text-muted-foreground">No documents yet</p>
              </div>
            ) : (
              dashboardData?.recentDocs.map((d: any) => (
                <div key={d.id} className="p-3 border rounded-lg flex items-start gap-3">
                  <FileText className="w-4 h-4 text-primary mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium line-clamp-1">{d.title}</h4>
                    <p className="text-[11px] text-muted-foreground mt-1 capitalize">{d.type}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
