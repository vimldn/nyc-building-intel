'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Building2, Shield, TrendingUp, AlertTriangle, Users, Zap, ChevronRight, FileText, Scale, Bug, Clock, Database, BarChart3, Home, Flame, Gavel, DollarSign, History } from 'lucide-react'

interface Suggestion { bbl: string; address: string; borough: string; zipcode: string; neighborhood?: string; units?: number }

export default function HomePage() {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const router = useRouter()
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (query.length < 2) { setSuggestions([]); setShowDropdown(false); return }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/autocomplete?q=${encodeURIComponent(query)}`)
        const data = await res.json()
        if (data.suggestions?.length) { setSuggestions(data.suggestions); setShowDropdown(true) }
        else { setSuggestions([]); setShowDropdown(false) }
      } catch {}
    }, 200)
    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setShowDropdown(false) }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleSelect = (s: Suggestion) => { setLoading(true); setShowDropdown(false); router.push(`/building/${s.bbl}`) }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || !suggestions.length) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex(p => p < suggestions.length - 1 ? p + 1 : p) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex(p => p > 0 ? p - 1 : 0) }
    else if (e.key === 'Enter' && selectedIndex >= 0) { e.preventDefault(); handleSelect(suggestions[selectedIndex]) }
    else if (e.key === 'Escape') setShowDropdown(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedIndex >= 0 && suggestions[selectedIndex]) { handleSelect(suggestions[selectedIndex]); return }
    if (!query.trim()) return
    setLoading(true)
    try {
      const res = await fetch(`/api/lookup?address=${encodeURIComponent(query)}`)
      const data = await res.json()
      if (data.bbl) router.push(`/building/${data.bbl}`)
      else { setLoading(false); alert(data.error || 'Address not found. Try including borough name.') }
    } catch { setLoading(false); alert('Something went wrong. Please try again.') }
  }

  const features = [
    { icon: AlertTriangle, title: 'HPD Violations', desc: 'Class A, B, C violations with full 10+ year history', color: 'text-red-400', bg: 'bg-red-500/10' },
    { icon: FileText, title: 'DOB Records', desc: 'Building violations, permits, complaints, safety', color: 'text-orange-400', bg: 'bg-orange-500/10' },
    { icon: Gavel, title: 'Legal Cases', desc: 'HPD litigations and penalties against landlords', color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { icon: Users, title: 'Eviction History', desc: 'Marshal-executed evictions (5 year history)', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    { icon: DollarSign, title: 'Sales History', desc: 'ACRIS property transfers and sale prices', color: 'text-green-400', bg: 'bg-green-500/10' },
    { icon: Bug, title: 'Pest Reports', desc: 'Rodent inspections and bedbug filings', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { icon: Shield, title: 'Risk Assessment', desc: '6-factor analysis with category scores', color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { icon: History, title: '36-Month Timeline', desc: 'Full chronological event history', color: 'text-pink-400', bg: 'bg-pink-500/10' },
  ]

  const dataSources = [
    'PLUTO', 'HPD Violations', 'HPD Complaints', 'HPD Registrations', 'HPD Litigations', 'HPD Charges', 'HPD Vacates', 'HPD AEP', 'HPD CONH',
    'DOB Violations', 'DOB Complaints', 'DOB Permits', 'DOB Safety', 'ECB Violations', 'DOB Vacates',
    'ACRIS Legals', 'ACRIS Master', 'DOF Sales', 'Marshal Evictions', 'Rodent Inspections', 'Bedbug Reports',
    'Speculation Watch', 'Rent Stabilized', 'Subsidized Housing', 'NYCHA', '311 Requests'
  ]

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0e17]/90 backdrop-blur-xl border-b border-[#1e293b]">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold">BuildingIQ</span>
              <span className="hidden sm:inline text-sm text-[#64748b] ml-2">NYC Building Intelligence</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-[#64748b]">
            <Database size={14} />
            <span className="hidden sm:inline">30+ Data Sources</span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="relative min-h-screen flex items-center justify-center pt-16">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1534430480872-3498386e7856?w=2000')` }} />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0e17] via-[#0a0e17]/80 to-[#0a0e17]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 py-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm mb-8">
            <Zap size={14} />
            The most comprehensive NYC building database
          </div>

          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-[1.1]">
            Know <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400">Everything</span>
            <span className="block mt-2">About Any Building</span>
          </h1>

          <p className="text-xl text-[#94a3b8] mb-10 max-w-3xl mx-auto">
            <strong>30+ official NYC data sources.</strong> Violations, complaints, sales, evictions, litigations, permits, rent stabilization, landlord portfolios, and more.
          </p>

          {/* Search */}
          <div className="relative max-w-2xl mx-auto" ref={dropdownRef}>
            <form onSubmit={handleSubmit}>
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-cyan-500/20 to-emerald-500/20 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                <div className="relative">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#64748b]" size={22} />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); setSelectedIndex(-1) }}
                    onKeyDown={handleKeyDown}
                    onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
                    placeholder="Enter any NYC address..."
                    className="w-full pl-14 pr-32 py-5 bg-[#151c2c] border border-[#2a3441] rounded-2xl text-lg text-white placeholder-[#4a5568] focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    disabled={loading}
                  />
                  <button type="submit" disabled={loading} className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-xl font-semibold transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-blue-500/25">
                    {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Searching</> : <>Analyze<ChevronRight size={16} /></>}
                  </button>
                </div>
              </div>
            </form>

            {showDropdown && suggestions.length > 0 && (
              <div className="autocomplete-dropdown animate-slide-up">
                {suggestions.map((s, i) => (
                  <div key={s.bbl} className={`autocomplete-item ${i === selectedIndex ? 'selected' : ''}`} onClick={() => handleSelect(s)}>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-[#1e293b] rounded-lg flex items-center justify-center flex-shrink-0">
                        <Building2 size={18} className="text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-medium truncate">{s.address}</div>
                        <div className="text-sm text-[#64748b]">
                          {s.neighborhood ? `${s.neighborhood}, ` : ''}{s.borough} {s.zipcode}
                          {s.units ? ` • ${s.units} units` : ''}
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-[#4a5568] flex-shrink-0" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-6 mt-10 text-sm text-[#64748b]">
            <div className="flex items-center gap-2"><Building2 size={16} className="text-blue-400" />1M+ Buildings</div>
            <div className="flex items-center gap-2"><BarChart3 size={16} className="text-emerald-400" />Real-time Data</div>
            <div className="flex items-center gap-2"><Shield size={16} className="text-purple-400" />100% Free</div>
            <div className="flex items-center gap-2"><Database size={16} className="text-cyan-400" />30+ Sources</div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="py-24 bg-[#0a0e17]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Comprehensive Building Intelligence</h2>
            <p className="text-[#94a3b8] max-w-2xl mx-auto">More data than any other platform. Everything you need to research a building—in one place.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div key={i} className="card p-6 group hover:border-blue-500/30 transition-all">
                <div className={`w-12 h-12 ${f.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <f.icon className={f.color} size={24} />
                </div>
                <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                <p className="text-[#94a3b8] text-sm">{f.desc}</p>
              </div>
            ))}
          </div>

          {/* Data Sources */}
          <div className="mt-20 text-center">
            <p className="text-sm text-[#64748b] mb-6">Powered by 30+ official NYC Open Data sources</p>
            <div className="flex flex-wrap justify-center gap-2">
              {dataSources.map((s) => (
                <span key={s} className="px-3 py-1.5 bg-[#151c2c] rounded-lg border border-[#1e293b] text-xs text-[#94a3b8]">{s}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Comparison */}
      <div className="py-20 bg-[#0d1117]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-8">Why BuildingIQ?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card p-6">
              <div className="text-4xl font-black text-blue-400 mb-2">30+</div>
              <p className="text-[#94a3b8]">Data sources aggregated</p>
            </div>
            <div className="card p-6">
              <div className="text-4xl font-black text-emerald-400 mb-2">36</div>
              <p className="text-[#94a3b8]">Months of trend data</p>
            </div>
            <div className="card p-6">
              <div className="text-4xl font-black text-purple-400 mb-2">100%</div>
              <p className="text-[#94a3b8]">Free & Open</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-12 bg-[#0a0e17] border-t border-[#1e293b]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-[#64748b] text-sm mb-4">
            BuildingIQ aggregates data from NYC Open Data for informational purposes only.
            Scores are estimates based on public records. Always verify information independently and consult professionals.
          </p>
          <p className="text-[#4a5568] text-xs">© 2025 BuildingIQ. All data from NYC Open Data Portal.</p>
        </div>
      </footer>
    </main>
  )
}
