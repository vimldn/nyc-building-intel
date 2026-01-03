'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Building2, AlertTriangle, CheckCircle, XCircle, Search, ChevronRight, ChevronLeft, ExternalLink, Home, FileText, Users, Scale, TrendingUp, History, Hammer, Bug, Flame, MapPin, Calendar, DollarSign, Clock, Shield, BarChart3 } from 'lucide-react'
import { AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, LineChart, Line } from 'recharts'

type Tab = 'overview' | 'violations' | 'complaints' | 'timeline' | 'landlord' | 'permits' | 'sales'

export default function BuildingPage() {
  const params = useParams()
  const router = useRouter()
  const bbl = params.bbl as string
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<Tab>('overview')
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/building?bbl=${bbl}`)
        const json = await res.json()
        if (json.error) setError(json.error)
        else setData(json)
      } catch { setError('Failed to load data') }
      finally { setLoading(false) }
    }
    if (bbl) load()
  }, [bbl])

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); if (search.trim()) router.push(`/?q=${encodeURIComponent(search)}`) }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0e17]">
      <div className="text-center">
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className="absolute inset-0 border-4 border-[#1e293b] rounded-full" />
          <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin" />
        </div>
        <p className="text-[#94a3b8] text-xl mb-2">Analyzing building...</p>
        <p className="text-[#64748b] text-sm">Fetching from 30+ data sources</p>
      </div>
    </div>
  )

  if (error || !data) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0e17]">
      <div className="text-center max-w-md px-4">
        <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Building Not Found</h1>
        <p className="text-[#94a3b8] mb-6">{error}</p>
        <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-xl font-semibold">
          <ChevronLeft size={18} />Back to Search
        </Link>
      </div>
    </div>
  )

  const { building: b, score: s } = data
  const scoreColor = s.overall >= 80 ? '#10b981' : s.overall >= 60 ? '#f59e0b' : '#ef4444'
  const scoreBadge = s.overall >= 80 ? { text: 'GOOD', cls: 'badge-green' } : s.overall >= 60 ? { text: 'FAIR', cls: 'badge-yellow' } : { text: 'POOR', cls: 'badge-red' }
  const circumference = 2 * Math.PI * 42
  const strokeDashoffset = circumference - (s.overall / 100) * circumference
  const COLORS = ['#f97316', '#ef4444', '#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#64748b']

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'violations', label: 'Violations', icon: AlertTriangle },
    { id: 'complaints', label: 'Complaints', icon: FileText },
    { id: 'timeline', label: 'Timeline', icon: History },
    { id: 'landlord', label: 'Landlord', icon: Users },
    { id: 'permits', label: 'Permits', icon: Hammer },
    { id: 'sales', label: 'Sales', icon: DollarSign },
  ]

  return (
    <div className="min-h-screen bg-[#0a0e17]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0a0e17]/95 backdrop-blur-xl border-b border-[#1e293b]">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Building2 size={18} className="text-white" />
            </div>
            <span className="text-lg font-bold hidden sm:block">BuildingIQ</span>
          </Link>
          <form onSubmit={handleSearch} className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4a5568]" size={18} />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder={b?.address || "Search..."} className="w-full pl-10 pr-4 py-2.5 bg-[#151c2c] border border-[#1e293b] rounded-xl text-sm text-white placeholder-[#4a5568] focus:outline-none focus:border-blue-500/50" />
            </div>
          </form>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Building Header */}
        <div className="card p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-start gap-6">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <h1 className="text-2xl md:text-3xl font-bold">{b?.address || 'Unknown'}</h1>
                <span className={`badge ${scoreBadge.cls}`}>{scoreBadge.text}</span>
                {b?.isRentStabilized && <span className="badge badge-cyan">Rent Stabilized</span>}
                {data.programs?.aep && <span className="badge badge-red">AEP Building</span>}
                {data.programs?.speculationWatch && <span className="badge badge-orange">Speculation Watch</span>}
                {b?.isNycha && <span className="badge badge-purple">NYCHA</span>}
                {b?.isSubsidized && <span className="badge badge-green">Subsidized</span>}
              </div>
              <p className="text-[#94a3b8] text-lg mb-4">
                {b?.neighborhood && `${b.neighborhood}, `}{b?.borough}, NY {b?.zipcode}
              </p>
              <div className="flex flex-wrap gap-3">
                {b?.unitsRes > 0 && <div className="px-3 py-2 bg-[#1a2235] rounded-lg"><span className="text-[#64748b] text-xs">Units</span><span className="ml-2 text-white font-semibold">{b.unitsRes}</span></div>}
                {b?.yearBuilt && <div className="px-3 py-2 bg-[#1a2235] rounded-lg"><span className="text-[#64748b] text-xs">Built</span><span className="ml-2 text-white font-semibold">{b.yearBuilt}</span></div>}
                {b?.floors > 0 && <div className="px-3 py-2 bg-[#1a2235] rounded-lg"><span className="text-[#64748b] text-xs">Floors</span><span className="ml-2 text-white font-semibold">{b.floors}</span></div>}
                {b?.buildingClassDesc && <div className="px-3 py-2 bg-[#1a2235] rounded-lg"><span className="text-[#64748b] text-xs">Type</span><span className="ml-2 text-white font-semibold">{b.buildingClassDesc}</span></div>}
                {b?.rentStabilizedUnits && <div className="px-3 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-lg"><span className="text-cyan-400 text-xs">RS Units</span><span className="ml-2 text-cyan-300 font-semibold">{b.rentStabilizedUnits}</span></div>}
              </div>
            </div>
            <div className="flex-shrink-0 flex flex-col items-center">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full score-ring" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#1e293b" strokeWidth="8" />
                  <circle cx="50" cy="50" r="42" fill="none" stroke={scoreColor} strokeWidth="8" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} className="transition-all duration-1000" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold" style={{ color: scoreColor }}>{s.overall}</span>
                  <span className="text-xs text-[#64748b]">/ 100</span>
                </div>
              </div>
              <p className="text-sm font-medium mt-2" style={{ color: scoreColor }}>{s.label}</p>
            </div>
          </div>
        </div>

        {/* Red Flags */}
        {data.redFlags?.length > 0 && (
          <div className="card card-warning p-5 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="text-red-400" size={20} />
              </div>
              <div>
                <h2 className="font-bold text-red-400 mb-2">{data.redFlags.length} Red Flag{data.redFlags.length > 1 ? 's' : ''} Detected</h2>
                <ul className="space-y-2">
                  {data.redFlags.slice(0, 8).map((f: any, i: number) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${f.severity === 'critical' ? 'bg-red-500' : f.severity === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'}`} />
                      <div className={f.severity === 'critical' ? 'text-red-300' : 'text-[#94a3b8]'}><strong>{f.title}</strong> — {f.description}</div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id as Tab)} className={`tab flex items-center gap-2 ${tab === t.id ? 'tab-active' : ''}`}>
              <t.icon size={16} />{t.label}
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {tab === 'overview' && (
          <div className="space-y-6 animate-fade-in">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="card p-4 stat-red"><div className="text-[#64748b] text-xs mb-1">HPD Open</div><div className="text-2xl font-bold text-red-400">{data.violations.hpd.open}</div><div className="text-xs text-[#64748b]">{data.violations.hpd.classC} Class C</div></div>
              <div className="card p-4 stat-orange"><div className="text-[#64748b] text-xs mb-1">DOB Open</div><div className="text-2xl font-bold text-orange-400">{data.violations.dob.open}</div><div className="text-xs text-[#64748b]">{data.violations.dob.total} total</div></div>
              <div className="card p-4 stat-yellow"><div className="text-[#64748b] text-xs mb-1">Heat Issues</div><div className="text-2xl font-bold text-yellow-400">{data.complaints.hpd.heatHotWater}</div><div className="text-xs text-[#64748b]">last 12mo</div></div>
              <div className="card p-4 stat-purple"><div className="text-[#64748b] text-xs mb-1">Legal Cases</div><div className="text-2xl font-bold text-purple-400">{data.litigations.open}</div><div className="text-xs text-[#64748b]">{data.litigations.total} total</div></div>
              <div className="card p-4 stat-blue"><div className="text-[#64748b] text-xs mb-1">Evictions</div><div className="text-2xl font-bold">{data.evictions.last3Years}</div><div className="text-xs text-[#64748b]">last 3 years</div></div>
              <div className="card p-4 stat-green"><div className="text-[#64748b] text-xs mb-1">Pest Issues</div><div className="text-2xl font-bold text-green-400">{data.rodents.failed + data.bedbugs.reports}</div><div className="text-xs text-[#64748b]">rodents + bugs</div></div>
            </div>

            {/* Trend Chart */}
            <div className="card p-6">
              <h3 className="font-bold mb-6 text-lg">36-Month Trend</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.monthlyTrend.slice(-24)} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                    <defs>
                      <linearGradient id="vG" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient>
                      <linearGradient id="cG" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/><stop offset="95%" stopColor="#ef4444" stopOpacity={0}/></linearGradient>
                    </defs>
                    <XAxis dataKey="monthYear" stroke="#4a5568" fontSize={10} tickLine={false} interval={2} />
                    <YAxis stroke="#4a5568" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#151c2c', border: '1px solid #2a3441', borderRadius: '10px', fontSize: '12px' }} />
                    <Area type="monotone" dataKey="hpdViolations" stroke="#3b82f6" strokeWidth={2} fill="url(#vG)" name="HPD Violations" />
                    <Area type="monotone" dataKey="complaints" stroke="#ef4444" strokeWidth={2} fill="url(#cG)" name="Complaints" />
                    <Legend />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Risk + Complaints */}
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="card p-6">
                <h3 className="font-bold mb-6 text-lg">Risk Assessment</h3>
                <div className="space-y-4">
                  {data.riskAssessment?.map((r: any) => (
                    <div key={r.category} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{r.icon}</span>
                        <div><div className="text-sm font-medium">{r.category}</div><div className="text-xs text-[#64748b]">{r.detail}</div></div>
                      </div>
                      <span className={`risk-${r.level.toLowerCase()} px-3 py-1 rounded text-xs font-bold`}>{r.level}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card p-6">
                <h3 className="font-bold mb-6 text-lg">Complaint Breakdown</h3>
                {data.complaints.byCategory?.length > 0 ? (
                  <>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart><Pie data={data.complaints.byCategory} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2} dataKey="count" nameKey="category">{data.complaints.byCategory.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip contentStyle={{ backgroundColor: '#151c2c', border: '1px solid #2a3441', borderRadius: '10px' }} /></PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-4">{data.complaints.byCategory.slice(0, 6).map((c: any, i: number) => (<div key={c.category} className="flex items-center gap-2 text-xs"><span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} /><span className="text-[#94a3b8] truncate">{c.category}</span><span className="text-white font-medium ml-auto">{c.pct}%</span></div>))}</div>
                  </>
                ) : <div className="h-48 flex items-center justify-center text-[#64748b]">No complaints data</div>}
              </div>
            </div>

            {/* Category Scores */}
            <div className="card p-6">
              <h3 className="font-bold mb-6 text-lg">Category Scores</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.categoryScores?.map((c: any) => (
                  <div key={c.name} className="p-4 bg-[#1a2235] rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2"><span className="text-lg">{c.icon}</span><span className="font-medium">{c.name}</span></div>
                      <span className={`font-bold ${c.score >= 80 ? 'text-emerald-400' : c.score >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>{c.score}</span>
                    </div>
                    <div className="progress-bar"><div className="progress-fill" style={{ width: `${c.score}%`, backgroundColor: c.score >= 80 ? '#10b981' : c.score >= 60 ? '#f59e0b' : '#ef4444' }} /></div>
                    <p className="text-xs text-[#64748b] mt-2">{c.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VIOLATIONS TAB */}
        {tab === 'violations' && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
              <div className="card p-4 text-center"><div className="text-2xl font-bold text-red-400">{data.violations.hpd.classC}</div><div className="text-xs text-[#64748b]">Class C</div></div>
              <div className="card p-4 text-center"><div className="text-2xl font-bold text-yellow-400">{data.violations.hpd.classB}</div><div className="text-xs text-[#64748b]">Class B</div></div>
              <div className="card p-4 text-center"><div className="text-2xl font-bold text-blue-400">{data.violations.hpd.classA}</div><div className="text-xs text-[#64748b]">Class A</div></div>
              <div className="card p-4 text-center"><div className="text-2xl font-bold">{data.violations.hpd.total}</div><div className="text-xs text-[#64748b]">Total HPD</div></div>
              <div className="card p-4 text-center"><div className="text-2xl font-bold text-orange-400">{data.violations.dob.total}</div><div className="text-xs text-[#64748b]">DOB</div></div>
              <div className="card p-4 text-center"><div className="text-2xl font-bold text-purple-400">{data.violations.ecb.total}</div><div className="text-xs text-[#64748b]">ECB</div></div>
            </div>

            {/* Yearly Chart */}
            <div className="card p-6">
              <h3 className="font-bold mb-4">Violations by Year</h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.yearlyStats?.slice(0, 8).reverse()}>
                    <XAxis dataKey="year" stroke="#4a5568" fontSize={11} />
                    <YAxis stroke="#4a5568" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#151c2c', border: '1px solid #2a3441', borderRadius: '8px' }} />
                    <Bar dataKey="hpdViolations" fill="#3b82f6" name="HPD" radius={[4,4,0,0]} />
                    <Bar dataKey="dobViolations" fill="#f97316" name="DOB" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="font-bold mb-4">Recent Violations ({data.violations.recent?.length})</h3>
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {data.violations.recent?.length > 0 ? data.violations.recent.map((v: any) => (
                  <div key={v.id} className="p-4 bg-[#1a2235] rounded-xl border border-[#1e293b]">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${v.class === 'C' ? 'violation-c' : v.class === 'B' ? 'violation-b' : v.source === 'DOB' ? 'badge-orange' : 'violation-a'}`}>{v.source}{v.class ? ` ${v.class}` : ''}</span>
                        <div><p className="text-sm">{v.description}</p><div className="flex gap-3 mt-1 text-xs text-[#64748b]"><span>{v.category}</span>{v.unit && <span>Unit: {v.unit}</span>}</div></div>
                      </div>
                      <div className="text-right flex-shrink-0"><span className={`text-xs font-medium ${v.status === 'Open' ? 'text-red-400' : 'text-[#64748b]'}`}>{v.status}</span><p className="text-xs text-[#4a5568] mt-1">{v.date && new Date(v.date).toLocaleDateString()}</p></div>
                    </div>
                  </div>
                )) : <div className="text-center py-8 text-[#64748b]"><CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-2" />No violations</div>}
              </div>
            </div>
          </div>
        )}

        {/* COMPLAINTS TAB */}
        {tab === 'complaints' && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="card p-4 text-center"><div className="text-2xl font-bold">{data.complaints.hpd.total}</div><div className="text-xs text-[#64748b]">Total HPD</div></div>
              <div className="card p-4 text-center"><div className="text-2xl font-bold text-yellow-400">{data.complaints.hpd.recentYear}</div><div className="text-xs text-[#64748b]">Last 12mo</div></div>
              <div className="card p-4 text-center"><div className="text-2xl font-bold text-orange-400">{data.complaints.hpd.heatHotWater}</div><div className="text-xs text-[#64748b]">Heat/Hot Water</div></div>
              <div className="card p-4 text-center"><div className="text-2xl font-bold text-blue-400">{data.complaints.sr311.total}</div><div className="text-xs text-[#64748b]">311 Requests</div></div>
            </div>
            <div className="card p-6">
              <h3 className="font-bold mb-4">Recent Complaints</h3>
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {data.complaints.recent?.length > 0 ? data.complaints.recent.map((c: any) => (
                  <div key={c.id} className="p-4 bg-[#1a2235] rounded-xl border border-[#1e293b] flex items-center justify-between">
                    <div><span className={`badge ${c.source === 'HPD' ? 'badge-blue' : c.source === '311' ? 'badge-purple' : 'badge-orange'} mr-2`}>{c.source}</span><span className="text-sm">{c.type}</span>{c.descriptor && <span className="text-xs text-[#64748b] ml-2">({c.descriptor})</span>}</div>
                    <div className="text-right"><span className="text-xs text-[#64748b]">{c.status}</span><p className="text-xs text-[#4a5568]">{c.date && new Date(c.date).toLocaleDateString()}</p></div>
                  </div>
                )) : <div className="text-center py-8 text-[#64748b]">No complaints</div>}
              </div>
            </div>
          </div>
        )}

        {/* TIMELINE TAB */}
        {tab === 'timeline' && (
          <div className="card p-6 animate-fade-in">
            <h3 className="font-bold mb-6 text-lg">Building Timeline ({data.timeline?.length} events)</h3>
            <div className="space-y-4 max-h-[700px] overflow-y-auto">
              {data.timeline?.length > 0 ? data.timeline.map((e: any, i: number) => (
                <div key={i} className={`timeline-item severity-${e.severity || 'low'} pb-4`}>
                  <div className="flex items-start justify-between">
                    <div><span className={`badge ${e.type === 'violation' ? 'badge-red' : e.type === 'complaint' ? 'badge-yellow' : e.type === 'sale' ? 'badge-green' : e.type === 'eviction' ? 'badge-purple' : e.type === 'litigation' ? 'badge-orange' : 'badge-blue'} mr-2`}>{e.type}</span><span className="text-xs text-[#64748b]">{e.source}</span><p className="text-sm mt-1">{e.description}</p></div>
                    <span className="text-xs text-[#64748b] flex-shrink-0">{e.date && new Date(e.date).toLocaleDateString()}</span>
                  </div>
                </div>
              )) : <div className="text-center py-8 text-[#64748b]">No events</div>}
            </div>
          </div>
        )}

        {/* LANDLORD TAB */}
        {tab === 'landlord' && (
          <div className="space-y-6 animate-fade-in">
            <div className="card p-6">
              <h3 className="font-bold mb-6 text-lg">Owner Information</h3>
              <div className="grid sm:grid-cols-2 gap-6">
                <div><div className="text-xs text-[#64748b] uppercase mb-1">Registered Owner</div><div className="text-lg font-semibold">{data.landlord.name}</div></div>
                {data.landlord.registrationId && <div><div className="text-xs text-[#64748b] uppercase mb-1">HPD Registration</div><div className="font-mono">{data.landlord.registrationId}</div></div>}
                {data.landlord.managementCompany && <div><div className="text-xs text-[#64748b] uppercase mb-1">Management</div><div>{data.landlord.managementCompany}</div></div>}
                {data.landlord.portfolioSize > 0 && <div><div className="text-xs text-[#64748b] uppercase mb-1">Portfolio Size</div><div className="text-lg font-semibold text-blue-400">{data.landlord.portfolioSize} buildings</div></div>}
                {data.landlord.agentName && <div><div className="text-xs text-[#64748b] uppercase mb-1">Agent</div><div>{data.landlord.agentName}</div></div>}
                {data.landlord.ownerAddress && <div><div className="text-xs text-[#64748b] uppercase mb-1">Owner Address</div><div className="text-sm">{data.landlord.ownerAddress}</div></div>}
              </div>
              <div className="mt-6 pt-6 border-t border-[#1e293b] flex flex-wrap gap-3">
                <a href={`https://whoownswhat.justfix.org/bbl/${bbl}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-lg text-blue-400 text-sm">Who Owns What <ExternalLink size={14} /></a>
                <a href={`https://hpdonline.nyc.gov/hpdonline/building/${bbl}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a2235] hover:bg-[#232938] rounded-lg text-sm">HPD Profile <ExternalLink size={14} /></a>
              </div>
            </div>
            {data.landlord.portfolio?.length > 0 && (
              <div className="card p-6">
                <h3 className="font-bold mb-4">Other Buildings by Owner ({data.landlord.portfolioSize})</h3>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">{data.landlord.portfolio.map((p: any) => (<Link key={p.bbl} href={`/building/${p.bbl}`} className="block p-3 bg-[#1a2235] rounded-lg hover:bg-[#232938]"><div className="flex items-center justify-between"><div><div className="font-medium">{p.address}</div><div className="text-xs text-[#64748b]">{p.borough} {p.zipcode}</div></div><ChevronRight size={16} className="text-[#4a5568]" /></div></Link>))}</div>
              </div>
            )}
            {data.litigations.recent?.length > 0 && (
              <div className="card p-6">
                <h3 className="font-bold mb-4">HPD Legal Actions ({data.litigations.total})</h3>
                <div className="space-y-3">{data.litigations.recent.map((l: any) => (<div key={l.id} className="p-4 bg-[#1a2235] rounded-xl flex items-center justify-between"><div><span className="badge badge-purple mr-2">{l.caseType}</span><span className="text-sm">{l.caseStatus}</span>{l.penalty && <span className="text-emerald-400 text-sm ml-2">${l.penalty.toLocaleString()}</span>}</div><span className="text-xs text-[#64748b]">{l.caseOpenDate && new Date(l.caseOpenDate).toLocaleDateString()}</span></div>))}</div>
              </div>
            )}
            {data.evictions.recent?.length > 0 && (
              <div className="card p-6">
                <h3 className="font-bold mb-4">Eviction History ({data.evictions.total})</h3>
                <div className="space-y-3">{data.evictions.recent.map((e: any) => (<div key={e.id} className="p-4 bg-[#1a2235] rounded-xl flex items-center justify-between"><div><span className="badge badge-red mr-2">Eviction</span><span className="text-sm">{e.type}</span></div><span className="text-xs text-[#64748b]">{e.executedDate && new Date(e.executedDate).toLocaleDateString()}</span></div>))}</div>
              </div>
            )}
          </div>
        )}

        {/* PERMITS TAB */}
        {tab === 'permits' && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-3 gap-4">
              <div className="card p-4 text-center"><div className="text-2xl font-bold">{data.permits.total}</div><div className="text-xs text-[#64748b]">Total Filings</div></div>
              <div className="card p-4 text-center"><div className="text-2xl font-bold text-orange-400">{data.permits.majorAlterations}</div><div className="text-xs text-[#64748b]">Major Alterations</div></div>
              <div className="card p-4 text-center"><div className="text-2xl font-bold text-blue-400">{data.permits.recentActivity}</div><div className="text-xs text-[#64748b]">Last 3 Years</div></div>
            </div>
            <div className="card p-6">
              <h3 className="font-bold mb-4">Recent Permits & Filings</h3>
              <div className="space-y-3 max-h-[500px] overflow-y-auto">{data.permits.recent?.length > 0 ? data.permits.recent.map((p: any) => (<div key={p.jobNumber} className="p-4 bg-[#1a2235] rounded-xl"><div className="flex items-center justify-between mb-2"><span className="badge badge-blue">{p.jobTypeDesc || p.jobType}</span><span className="text-xs text-[#64748b]">{p.filingDate && new Date(p.filingDate).toLocaleDateString()}</span></div><div className="text-sm">{p.workType || 'Work filing'}</div>{p.estimatedCost && <div className="text-xs text-emerald-400 mt-1">Est. Cost: ${p.estimatedCost.toLocaleString()}</div>}<div className="text-xs text-[#64748b] mt-1">Status: {p.jobStatusDesc || p.jobStatus}</div></div>)) : <div className="text-center py-8 text-[#64748b]">No permits</div>}</div>
            </div>
          </div>
        )}

        {/* SALES TAB */}
        {tab === 'sales' && (
          <div className="space-y-6 animate-fade-in">
            {data.sales.recent?.length > 0 ? (
              <div className="card p-6">
                <h3 className="font-bold mb-4">Property Sales History</h3>
                <div className="space-y-3">{data.sales.recent.map((s: any) => (<div key={s.id} className="p-4 bg-[#1a2235] rounded-xl flex items-center justify-between"><div className="flex items-center gap-3"><DollarSign className="text-green-400" size={20} /><div><div className="font-semibold text-green-400">${s.amount.toLocaleString()}</div><div className="text-xs text-[#64748b]">{s.docType}</div></div></div><span className="text-sm text-[#64748b]">{s.date && new Date(s.date).toLocaleDateString()}</span></div>))}</div>
              </div>
            ) : <div className="card p-6 text-center text-[#64748b]">No sales data available</div>}
            <div className="card p-6">
              <h3 className="font-bold mb-4">External Records</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                <a href={`https://a836-acris.nyc.gov/bblsearch/bblsearch.asp?borough=${bbl[0]}&block=${bbl.slice(1,6)}&lot=${bbl.slice(6)}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 bg-[#1a2235] rounded-xl hover:bg-[#232938]"><span>ACRIS (Full History)</span><ExternalLink size={14} className="text-[#4a5568]" /></a>
                <a href={`https://zola.planning.nyc.gov/lot/${bbl[0]}/${bbl.slice(1,6).replace(/^0+/, '')}/${bbl.slice(6).replace(/^0+/, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 bg-[#1a2235] rounded-xl hover:bg-[#232938]"><span>ZoLa (Zoning)</span><ExternalLink size={14} className="text-[#4a5568]" /></a>
              </div>
            </div>
          </div>
        )}

        {/* External Links */}
        <div className="card p-6 mt-6">
          <h3 className="font-bold mb-4">Official Records</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'HPD Building Profile', url: `https://hpdonline.nyc.gov/hpdonline/building/${bbl}` },
              { label: 'DOB Building Info', url: `https://a810-bisweb.nyc.gov/bisweb/PropertyProfileOverviewServlet?boro=${bbl[0]}&block=${bbl.slice(1,6)}&lot=${bbl.slice(6)}` },
              { label: 'ACRIS (Sales)', url: `https://a836-acris.nyc.gov/bblsearch/bblsearch.asp?borough=${bbl[0]}&block=${bbl.slice(1,6)}&lot=${bbl.slice(6)}` },
              { label: 'Who Owns What', url: `https://whoownswhat.justfix.org/bbl/${bbl}` },
            ].map(link => (<a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 bg-[#1a2235] rounded-xl hover:bg-[#232938] text-sm"><span>{link.label}</span><ExternalLink size={14} className="text-[#4a5568]" /></a>))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 p-4 bg-[#151c2c] rounded-xl border border-[#1e293b] text-center">
          <p className="text-xs text-[#64748b]">{data.dataDisclaimer}</p>
        </div>
      </main>
    </div>
  )
}
