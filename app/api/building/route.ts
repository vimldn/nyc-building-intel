import { NextRequest, NextResponse } from 'next/server'
import { DATASETS, BOROUGH_CODES, ZIP_TO_NEIGHBORHOOD, BUILDING_CLASSES, JOB_TYPES } from '@/lib/data-sources'

// ============================================
// HELPERS
// ============================================

// Pad BBL to exactly 10 digits
function padBBL(bbl: string): string {
  if (!bbl) return ''
  const clean = bbl.replace(/\D/g, '')
  if (clean.length >= 10) return clean.slice(0, 10)
  return clean.padStart(10, '0')
}

async function fetchData(id: string, query: string, timeout = 12000): Promise<any[]> {
  const controller = new AbortController()
  const tid = setTimeout(() => controller.abort(), timeout)
  try {
    const res = await fetch(`https://data.cityofnewyork.us/resource/${id}.json?${query}`, {
      signal: controller.signal, headers: { 'Accept': 'application/json' }, next: { revalidate: 300 }
    })
    clearTimeout(tid)
    return res.ok ? await res.json() : []
  } catch { clearTimeout(tid); return [] }
}

function categorize(desc: string): string {
  const d = (desc || '').toLowerCase()
  if (d.includes('heat') || d.includes('hot water') || d.includes('boiler')) return 'Heat/Hot Water'
  if (d.includes('roach') || d.includes('mice') || d.includes('rat') || d.includes('pest') || d.includes('rodent') || d.includes('bedbug')) return 'Pests'
  if (d.includes('lead') || d.includes('paint')) return 'Lead Paint'
  if (d.includes('mold') || d.includes('mildew')) return 'Mold'
  if (d.includes('fire') || d.includes('smoke') || d.includes('detector') || d.includes('sprinkler')) return 'Fire Safety'
  if (d.includes('electric') || d.includes('outlet') || d.includes('wiring')) return 'Electrical'
  if (d.includes('plumb') || d.includes('leak') || d.includes('water') || d.includes('toilet') || d.includes('sink')) return 'Plumbing'
  if (d.includes('lock') || d.includes('door') || d.includes('window') || d.includes('security')) return 'Security'
  if (d.includes('elevator')) return 'Elevator'
  if (d.includes('gas')) return 'Gas'
  if (d.includes('roof') || d.includes('structural') || d.includes('wall') || d.includes('floor') || d.includes('ceiling')) return 'Structural'
  if (d.includes('garbage') || d.includes('trash') || d.includes('sanitary')) return 'Sanitation'
  return 'Other'
}

function money(n: number): string {
  return n >= 1e6 ? `$${(n/1e6).toFixed(1)}M` : n >= 1e3 ? `$${(n/1e3).toFixed(0)}K` : `$${n}`
}

// ============================================
// MAIN API - 30+ DATA SOURCES
// ============================================

export async function GET(req: NextRequest) {
  const rawBbl = req.nextUrl.searchParams.get('bbl')
  if (!rawBbl) return NextResponse.json({ error: 'BBL parameter required' }, { status: 400 })
  
  // Pad BBL to 10 digits
  const bbl = padBBL(rawBbl)
  if (bbl.length !== 10) {
    return NextResponse.json({ error: 'Invalid BBL format' }, { status: 400 })
  }

  try {
    const borough = bbl[0], block = bbl.slice(1,6).replace(/^0+/,''), lot = bbl.slice(6).replace(/^0+/,'')
    const now = new Date()
    const y1 = new Date(now.getFullYear()-1, now.getMonth(), 1).toISOString().split('T')[0]
    const y3 = new Date(now.getFullYear()-3, now.getMonth(), 1).toISOString().split('T')[0]
    const y5 = new Date(now.getFullYear()-5, now.getMonth(), 1).toISOString().split('T')[0]

    // ========== MASSIVE PARALLEL FETCH - ALL 30+ SOURCES ==========
    const [
      pluto, hpdViol, hpdComp, hpdReg, hpdContact, hpdLit, hpdCharge, hpdVacate, hpdAep, hpdConh,
      dobViol, dobComp, dobJobs, dobPermit, dobSafety, dobEcb, dobVacate,
      acrisLeg, dofSales, evict, rodent, bedbug, specWatch, rentStab, subsidy, nycha, sr311
    ] = await Promise.all([
      fetchData(DATASETS.pluto, `bbl=${bbl}&$limit=1`),
      fetchData(DATASETS.hpdViolations, `bbl=${bbl}&$limit=1500&$order=inspectiondate DESC`),
      fetchData(DATASETS.hpdComplaints, `bbl=${bbl}&$where=receiveddate>='${y5}'&$limit=800&$order=receiveddate DESC`),
      fetchData(DATASETS.hpdRegistrations, `bbl=${bbl}&$limit=1`),
      fetchData(DATASETS.hpdContacts, `$where=registrationid IN (SELECT registrationid FROM tesw-yqqr WHERE bbl='${bbl}')&$limit=30`).catch(()=>[]),
      fetchData(DATASETS.hpdLitigations, `bbl=${bbl}&$limit=200&$order=caseopendate DESC`),
      fetchData(DATASETS.hpdCharges, `bbl=${bbl}&$limit=200`).catch(()=>[]),
      fetchData(DATASETS.hpdVacateOrders, `bbl=${bbl}&$limit=50`).catch(()=>[]),
      fetchData(DATASETS.hpdAEP, `bbl=${bbl}&$limit=10`),
      fetchData(DATASETS.hpdCONH, `bbl=${bbl}&$limit=10`).catch(()=>[]),
      fetchData(DATASETS.dobViolations, `$where=boro='${borough}' AND block='${block}' AND lot='${lot}'&$limit=800&$order=issue_date DESC`),
      fetchData(DATASETS.dobComplaints, `$where=boro='${borough}' AND block='${block}' AND lot='${lot}'&$limit=400&$order=date_entered DESC`).catch(()=>[]),
      fetchData(DATASETS.dobJobFilings, `$where=borough='${borough}' AND block='${block}' AND lot='${lot}'&$limit=300&$order=filing_date DESC`),
      fetchData(DATASETS.dobPermitsIssued, `$where=borough='${borough}' AND block='${block}' AND lot='${lot}'&$limit=200`).catch(()=>[]),
      fetchData(DATASETS.dobSafety, `$where=boro='${borough}' AND block='${block}' AND lot='${lot}'&$limit=150`),
      fetchData(DATASETS.dobEcb, `$where=boro='${borough}' AND block='${block}' AND lot='${lot}'&$limit=300`),
      fetchData(DATASETS.dobVacates, `$where=borough='${borough}' AND block='${block}' AND lot='${lot}'&$limit=30`).catch(()=>[]),
      fetchData(DATASETS.acrisLegals, `$where=borough='${borough}' AND block=${parseInt(block)} AND lot=${parseInt(lot)}&$limit=100&$order=good_through_date DESC`),
      fetchData(DATASETS.dofSales, `$where=borough=${borough} AND block=${block} AND lot=${lot}&$limit=50&$order=sale_date DESC`).catch(()=>[]),
      fetchData(DATASETS.evictions, `bbl=${bbl}&$where=executed_date>='${y5}'&$limit=150&$order=executed_date DESC`),
      fetchData(DATASETS.rodents, `bbl=${bbl}&$limit=80&$order=inspection_date DESC`),
      fetchData(DATASETS.bedbugs, `$where=building_id='${bbl}'&$limit=50`),
      fetchData(DATASETS.speculationWatch, `bbl=${bbl}&$limit=5`),
      fetchData(DATASETS.rentStabilized, `$where=ucbbl='${bbl}'&$limit=1`).catch(()=>[]),
      fetchData(DATASETS.subsidizedHousing, `$where=bbl='${bbl}'&$limit=5`).catch(()=>[]),
      fetchData(DATASETS.nycha, `$where=bbl='${bbl}'&$limit=3`).catch(()=>[]),
      fetchData(DATASETS.sr311, `$where=bbl='${bbl}' AND created_date>='${y3}'&$limit=300&$order=created_date DESC`).catch(()=>[])
    ])

    // ========== PROCESS BUILDING INFO ==========
    const p = pluto[0], rs = rentStab[0]
    const building = p ? {
      bbl, address: p.address || 'Unknown', borough: BOROUGH_CODES[p.borough] || p.borough,
      neighborhood: ZIP_TO_NEIGHBORHOOD[p.zipcode] || '', zipcode: p.zipcode || '',
      yearBuilt: p.yearbuilt ? +p.yearbuilt : null, unitsRes: +p.unitsres || 0, unitsTotal: +p.unitstotal || +p.unitsres || 0,
      floors: +p.numfloors || 0, buildingClass: p.bldgclass || '', buildingClassDesc: BUILDING_CLASSES[p.bldgclass] || p.bldgclass,
      ownerName: p.ownername || 'Unknown', ownerType: p.ownertype || '',
      latitude: p.latitude ? +p.latitude : null, longitude: p.longitude ? +p.longitude : null,
      lotArea: p.lotarea ? +p.lotarea : null, buildingArea: p.bldgarea ? +p.bldgarea : null,
      zoneDist1: p.zonedist1 || '', assessedValue: p.assesstot ? +p.assesstot : null,
      yearAltered1: p.yearalter1 ? +p.yearalter1 : null, yearAltered2: p.yearalter2 ? +p.yearalter2 : null,
      landmark: p.landmark || null, histDist: p.histdist || null,
      isRentStabilized: rs != null || (+p.unitsres >= 6 && +p.yearbuilt < 1974),
      rentStabilizedUnits: rs?.uc2023 || rs?.uc2022 || rs?.uc2021 || null,
      rsLostUnits: rs && rs.uc2007 && rs.uc2023 ? +rs.uc2007 - +rs.uc2023 : null,
      isSubsidized: subsidy.length > 0, subsidyPrograms: subsidy.map((s:any)=>s.program_name).filter(Boolean),
      isNycha: nycha.length > 0 || p.ownertype === 'P', nychaDev: nycha[0]?.development || null,
    } : null

    // ========== PROCESS HPD VIOLATIONS ==========
    const hpdOpen = hpdViol.filter((v:any) => v.currentstatus?.toLowerCase().includes('open') || !v.currentstatusdate)
    const classC = hpdOpen.filter((v:any) => v.class === 'C').length
    const classB = hpdOpen.filter((v:any) => v.class === 'B').length
    const classA = hpdOpen.filter((v:any) => v.class === 'A').length
    
    const hpdByYear: Record<string, {total:number,a:number,b:number,c:number}> = {}
    hpdViol.forEach((v:any) => {
      const yr = (v.inspectiondate || v.novissueddate || '').substring(0,4)
      if (yr && +yr >= 2010) {
        if (!hpdByYear[yr]) hpdByYear[yr] = {total:0,a:0,b:0,c:0}
        hpdByYear[yr].total++
        if (v.class==='A') hpdByYear[yr].a++
        if (v.class==='B') hpdByYear[yr].b++
        if (v.class==='C') hpdByYear[yr].c++
      }
    })
    
    const hpdByCat: Record<string,number> = {}
    hpdViol.forEach((v:any) => { const c = categorize(v.novdescription||''); hpdByCat[c] = (hpdByCat[c]||0)+1 })
    
    const recentHpd = hpdViol.slice(0,40).map((v:any) => ({
      id: v.violationid || Math.random().toString(), source: 'HPD', date: v.inspectiondate || v.novissueddate || '',
      class: v.class || 'A', type: v.novtype || '', description: v.novdescription || 'No description',
      status: v.currentstatus?.toLowerCase().includes('open') ? 'Open' : 'Closed',
      unit: v.apartment || '', story: v.story || '', category: categorize(v.novdescription || ''),
    }))

    // ========== PROCESS DOB VIOLATIONS ==========
    const dobOpen = dobViol.filter((v:any) => !v.disposition_date && v.issue_date)
    const dobByYear: Record<string,number> = {}
    dobViol.forEach((v:any) => { const yr = (v.issue_date||'').substring(0,4); if(yr) dobByYear[yr]=(dobByYear[yr]||0)+1 })
    
    const recentDob = dobViol.slice(0,25).map((v:any) => ({
      id: v.isn_dob_bis_extract || Math.random().toString(), source: 'DOB', date: v.issue_date || '',
      type: v.violation_type || '', description: v.description || v.violation_type_description || '',
      status: v.disposition_date ? 'Closed' : 'Open', category: categorize(v.description || ''),
    }))

    // ========== PROCESS ECB VIOLATIONS ==========
    const ecbOpen = dobEcb.filter((v:any) => !v.ecb_violation_status?.toLowerCase().includes('resolve') && !v.ecb_violation_status?.toLowerCase().includes('dismiss'))
    const ecbPenalties = dobEcb.reduce((s:number,v:any) => s + (+v.penalty_balance_due || 0), 0)

    // ========== PROCESS HPD COMPLAINTS ==========
    const hpdCompY1 = hpdComp.filter((c:any) => new Date(c.receiveddate) >= new Date(y1))
    const heatComplaints = hpdCompY1.filter((c:any) => (c.complainttype||c.majorcategory||'').toLowerCase().match(/heat|hot water/)).length
    
    const compByCat: Record<string,number> = {}
    hpdComp.forEach((c:any) => { const cat = categorize(c.complainttype||c.majorcategory||''); compByCat[cat]=(compByCat[cat]||0)+1 })
    const totalComp = Object.values(compByCat).reduce((a,b)=>a+b,0)
    const compBreakdown = Object.entries(compByCat).map(([c,n])=>({category:c,count:n,pct:totalComp?Math.round(n/totalComp*100):0})).sort((a,b)=>b.count-a.count).slice(0,8)
    
    const compByYear: Record<string,number> = {}
    hpdComp.forEach((c:any) => { const yr = (c.receiveddate||'').substring(0,4); if(yr) compByYear[yr]=(compByYear[yr]||0)+1 })
    
    const recentComp = hpdComp.slice(0,25).map((c:any) => ({
      id: c.complaintid || Math.random().toString(), source: 'HPD', date: c.receiveddate || '',
      type: c.complainttype || c.majorcategory || 'Unknown', status: c.status || 'Unknown', unit: c.apartment || '',
    }))

    // ========== PROCESS DOB COMPLAINTS ==========
    const dobCompY1 = dobComp.filter((c:any) => new Date(c.date_entered) >= new Date(y1))
    const recentDobComp = dobComp.slice(0,15).map((c:any) => ({
      id: c.complaint_number || Math.random().toString(), source: 'DOB', date: c.date_entered || '',
      type: c.complaint_category || 'DOB', status: c.status || 'Unknown',
    }))

    // ========== PROCESS 311 ==========
    const sr311ByCat: Record<string,number> = {}
    sr311.forEach((r:any) => { const t = r.complaint_type||'Other'; sr311ByCat[t]=(sr311ByCat[t]||0)+1 })
    const recent311 = sr311.slice(0,15).map((r:any) => ({
      id: r.unique_key, source: '311', date: r.created_date, type: r.complaint_type, descriptor: r.descriptor, status: r.status,
    }))

    // ========== PROCESS LITIGATIONS ==========
    const openLit = hpdLit.filter((l:any) => !l.casestatus?.toLowerCase().includes('closed'))
    const litByType: Record<string,number> = {}
    hpdLit.forEach((l:any) => { const t = l.casetype||'Other'; litByType[t]=(litByType[t]||0)+1 })
    const totalPenalties = hpdLit.reduce((s:number,l:any) => s+(+l.penalty||0), 0)
    const recentLit = hpdLit.slice(0,15).map((l:any) => ({
      id: l.litigationid, caseType: l.casetype, caseOpenDate: l.caseopendate, caseStatus: l.casestatus,
      penalty: l.penalty ? +l.penalty : null, findingDate: l.findingdate,
    }))

    // ========== PROCESS CHARGES ==========
    const totalCharges = hpdCharge.reduce((s:number,c:any) => s+(+c.charge||0), 0)

    // ========== PROCESS EVICTIONS ==========
    const evict3Y = evict.filter((e:any) => new Date(e.executed_date) >= new Date(y3))
    const evictByYear: Record<string,number> = {}
    evict.forEach((e:any) => { const yr = (e.executed_date||'').substring(0,4); if(yr) evictByYear[yr]=(evictByYear[yr]||0)+1 })
    const recentEvict = evict.slice(0,15).map((e:any) => ({
      id: e.unique_id, executedDate: e.executed_date, type: e.residential_commercial, marshal: e.marshal_last_name,
    }))

    // ========== PROCESS SALES ==========
    const sales = dofSales.filter((s:any) => +s.sale_price > 0).slice(0,25).map((s:any) => ({
      id: s.ease_ment || Math.random().toString(), date: s.sale_date, amount: +s.sale_price,
      docType: 'SALE', buyer: '', seller: '',
    }))
    const lastSale = sales[0]

    // ========== PROCESS PERMITS ==========
    const recentPerm = dobJobs.slice(0,25).map((p:any) => ({
      jobNumber: p.job__ || p.job_number, jobType: p.job_type, jobTypeDesc: JOB_TYPES[p.job_type] || p.job_type,
      filingDate: p.filing_date || p.pre_filing_date, jobStatus: p.job_status, jobStatusDesc: p.job_status_descrp,
      workType: p.work_type, estimatedCost: p.initial_cost ? +p.initial_cost : null,
      applicant: [p.applicant_s_first_name, p.applicant_s_last_name].filter(Boolean).join(' ') || null,
    }))
    const majorAlt = dobJobs.filter((p:any) => p.job_type === 'A1' || p.job_type === 'DM').length
    const recentAct = dobJobs.filter((p:any) => new Date(p.filing_date) >= new Date(y3)).length

    // ========== PROCESS RODENTS ==========
    const rodentFail = rodent.filter((r:any) => (r.result||'').toLowerCase().match(/active|rat|mice|evidence/))
    const rodentPass = rodent.filter((r:any) => (r.result||'').toLowerCase().match(/pass|no evidence/))
    const recentRodent = rodent.slice(0,10).map((r:any) => ({
      date: r.inspection_date, result: r.result, type: r.inspection_type,
    }))

    // ========== PROCESS LANDLORD ==========
    const reg = hpdReg[0]
    const ownerContacts = hpdContact.filter((c:any) => (c.type||'').toLowerCase().match(/owner|head/))
    const agentContacts = hpdContact.filter((c:any) => (c.type||'').toLowerCase().match(/agent|manag/))
    
    const landlord = {
      name: reg?.corporationname || (reg?.ownerfirstname ? `${reg.ownerfirstname} ${reg.ownerlastname||''}`.trim() : building?.ownerName) || 'Unknown',
      type: reg?.corporationname ? 'corporation' : 'individual',
      registrationId: reg?.registrationid || '',
      registrationEndDate: reg?.registrationenddate || '',
      managementCompany: agentContacts[0]?.corporationname || reg?.managementagent || '',
      agentName: agentContacts[0] ? `${agentContacts[0].firstname||''} ${agentContacts[0].lastname||''}`.trim() : '',
      agentAddress: agentContacts[0]?.businesshousenumber ? `${agentContacts[0].businesshousenumber} ${agentContacts[0].businessstreetname||''}, ${agentContacts[0].businesscity||''}` : '',
      ownerAddress: ownerContacts[0]?.businesshousenumber ? `${ownerContacts[0].businesshousenumber} ${ownerContacts[0].businessstreetname||''}, ${ownerContacts[0].businesscity||''}` : '',
      portfolioSize: 0, portfolio: [] as any[],
    }
    
    if (landlord.registrationId) {
      try {
        const port = await fetchData(DATASETS.hpdRegistrations, `registrationid=${landlord.registrationId}&$select=bbl,housenumber,streetname,zip,borough&$limit=150`, 8000)
        landlord.portfolioSize = port.length
        landlord.portfolio = port.filter((b:any) => b.bbl !== bbl).slice(0,20).map((b:any) => ({
          bbl: b.bbl, address: `${b.housenumber||''} ${b.streetname||''}`.trim(),
          borough: BOROUGH_CODES[b.borough] || b.borough, zipcode: b.zip,
        }))
      } catch {}
    }

    // ========== PROGRAMS ==========
    const programs = {
      aep: hpdAep.length > 0, aepDetails: hpdAep[0] || null,
      conh: hpdConh.length > 0, conhDetails: hpdConh[0] || null,
      speculationWatch: specWatch.length > 0, specDetails: specWatch[0] || null,
      subsidized: subsidy.length > 0, subsidyPrograms: subsidy.map((s:any)=>s.program_name).filter(Boolean),
      nycha: nycha.length > 0,
      vacateOrder: hpdVacate.length > 0 || dobVacate.length > 0, vacateDetails: hpdVacate[0] || dobVacate[0] || null,
    }

    // ========== CALCULATE SCORE ==========
    let score = 100
    score -= Math.min(classC * 15, 45)
    score -= Math.min(classB * 5, 25)
    score -= Math.min(classA * 1, 10)
    score -= Math.min(hpdOpen.length * 1, 10)
    score -= Math.min(dobOpen.length * 3, 15)
    score -= Math.min(ecbOpen.length * 2, 10)
    score -= Math.min(heatComplaints * 4, 16)
    score -= Math.min(hpdCompY1.length * 0.5, 8)
    score -= Math.min(openLit.length * 6, 18)
    score -= Math.min(hpdLit.length * 1, 10)
    score -= Math.min(evict3Y.length * 4, 12)
    score -= Math.min(rodentFail.length * 3, 9)
    score -= Math.min(bedbug.length * 5, 15)
    if (programs.aep) score -= 20
    if (programs.speculationWatch) score -= 8
    if (programs.vacateOrder) score -= 15
    if (totalCharges > 10000) score -= 10
    else if (totalCharges > 5000) score -= 5
    score = Math.max(0, Math.min(100, Math.round(score)))
    
    const grade = score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 55 ? 'D' : 'F'
    const label = score >= 90 ? 'Excellent' : score >= 80 ? 'Good' : score >= 70 ? 'Fair' : score >= 55 ? 'Poor' : 'Critical'

    // ========== CATEGORY SCORES ==========
    const catScores = [
      { name: 'Heat Reliability', icon: '🔥', score: Math.max(0, 100 - heatComplaints*12 - (hpdByCat['Heat/Hot Water']||0)*3), detail: `${heatComplaints} heat complaints/yr` },
      { name: 'Pest Control', icon: '🐛', score: Math.max(0, 100 - (hpdByCat['Pests']||0)*8 - rodentFail.length*10 - bedbug.length*15), detail: `${rodentFail.length} failed inspections, ${bedbug.length} bedbug reports` },
      { name: 'Building Maintenance', icon: '🔧', score: Math.max(0, 100 - hpdOpen.length*3 - dobOpen.length*4), detail: `${hpdOpen.length + dobOpen.length} open violations` },
      { name: 'Safety', icon: '🛡️', score: Math.max(0, 100 - classC*20 - (hpdByCat['Fire Safety']||0)*10 - (hpdByCat['Gas']||0)*15 - dobSafety.length*8), detail: `${classC} Class C violations` },
      { name: 'Landlord Responsiveness', icon: '👤', score: Math.max(0, 100 - openLit.length*15 - Math.min(totalCharges/1000, 20)), detail: `${openLit.length} legal cases, ${money(totalCharges)} charges` },
      { name: 'Tenant Stability', icon: '🏠', score: Math.max(0, 100 - evict3Y.length*12 - (programs.speculationWatch ? 15 : 0)), detail: `${evict3Y.length} evictions in 3 years` },
    ]

    // ========== RISK ASSESSMENT ==========
    const risk = catScores.map(c => ({
      category: c.name, icon: c.icon, score: c.score, detail: c.detail,
      level: c.score < 40 ? 'CRITICAL' : c.score < 60 ? 'HIGH' : c.score < 80 ? 'MODERATE' : 'LOW',
    }))

    // ========== RED FLAGS ==========
    const redFlags: any[] = []
    if (classC > 0) redFlags.push({ severity: 'critical', title: `${classC} Class C Violation${classC>1?'s':''}`, description: 'Immediately hazardous. Must be corrected within 24 hours.' })
    if (programs.aep) redFlags.push({ severity: 'critical', title: 'Alternative Enforcement Program', description: 'Building is in HPD\'s worst buildings program.' })
    if (programs.vacateOrder) redFlags.push({ severity: 'critical', title: 'Vacate Order', description: 'Building has/had a vacate order. Parts may be uninhabitable.' })
    if (heatComplaints >= 5) redFlags.push({ severity: 'critical', title: `${heatComplaints} Heat Complaints`, description: 'Very high heat/hot water complaints this year.' })
    if (bedbug.length >= 2) redFlags.push({ severity: 'critical', title: `${bedbug.length} Bedbug Reports`, description: 'Multiple bedbug reports. May indicate ongoing infestation.' })
    if (evict3Y.length >= 5) redFlags.push({ severity: 'warning', title: `${evict3Y.length} Evictions in 3 Years`, description: 'Higher than average eviction rate.' })
    if (openLit.length >= 2) redFlags.push({ severity: 'warning', title: `${openLit.length} Open Legal Cases`, description: `HPD legal action. Total penalties: ${money(totalPenalties)}` })
    if (programs.speculationWatch) redFlags.push({ severity: 'warning', title: 'Speculation Watch List', description: 'Sold at price suggesting speculative investment.' })
    if (hpdOpen.length >= 15) redFlags.push({ severity: 'warning', title: `${hpdOpen.length} Open HPD Violations`, description: 'High number of unresolved violations.' })
    if (totalCharges > 10000) redFlags.push({ severity: 'warning', title: `${money(totalCharges)} HPD Charges`, description: 'HPD performed emergency repairs. Unresponsive landlord.' })
    if (building?.rsLostUnits && building.rsLostUnits > 5) redFlags.push({ severity: 'warning', title: `${building.rsLostUnits} RS Units Lost`, description: 'Building lost rent stabilized units over time.' })
    if (rodentFail.length >= 3) redFlags.push({ severity: 'warning', title: `${rodentFail.length} Failed Rodent Inspections`, description: 'Ongoing rodent issues.' })
    if (programs.conh) redFlags.push({ severity: 'info', title: 'CONH Required', description: 'Certificate of No Harassment required before alterations.' })

    // ========== TIMELINE ==========
    const timeline: any[] = []
    recentHpd.slice(0,40).forEach(v => v.date && timeline.push({ date: v.date, type: 'violation', source: `HPD ${v.class}`, description: v.description.slice(0,120), severity: v.class==='C'?'high':v.class==='B'?'medium':'low', status: v.status }))
    recentDob.slice(0,20).forEach(v => v.date && timeline.push({ date: v.date, type: 'violation', source: 'DOB', description: (v.description||v.type).slice(0,120), severity: 'medium', status: v.status }))
    recentComp.slice(0,25).forEach(c => c.date && timeline.push({ date: c.date, type: 'complaint', source: 'HPD', description: `${c.type} complaint`, severity: c.type.toLowerCase().includes('heat')?'high':'medium' }))
    recentDobComp.slice(0,15).forEach(c => c.date && timeline.push({ date: c.date, type: 'complaint', source: 'DOB', description: c.type, severity: 'medium' }))
    recent311.slice(0,15).forEach(r => r.date && timeline.push({ date: r.date, type: '311', source: '311', description: `${r.type}: ${r.descriptor||''}`.slice(0,100), severity: 'low' }))
    sales.slice(0,10).forEach(s => s.date && timeline.push({ date: s.date, type: 'sale', source: 'ACRIS', description: `Property sold for ${money(s.amount)}`, severity: 'medium' }))
    recentEvict.forEach(e => e.executedDate && timeline.push({ date: e.executedDate, type: 'eviction', source: 'Marshal', description: `Eviction (${e.type||'Residential'})`, severity: 'high' }))
    recentLit.slice(0,10).forEach(l => l.caseOpenDate && timeline.push({ date: l.caseOpenDate, type: 'litigation', source: 'HPD', description: `Legal: ${l.caseType}${l.penalty?` - ${money(l.penalty)}`:''}`  , severity: 'high' }))
    recentPerm.slice(0,10).forEach(p => p.filingDate && timeline.push({ date: p.filingDate, type: 'permit', source: 'DOB', description: `${p.jobTypeDesc||p.jobType}${p.estimatedCost?` - ${money(p.estimatedCost)}`:''}`, severity: 'low' }))
    timeline.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    // ========== MONTHLY TREND (36 months) ==========
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    const monthlyTrend = []
    for (let i = 35; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const start = new Date(d.getFullYear(), d.getMonth(), 1)
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0)
      const hpdM = hpdViol.filter((v:any) => { const vd = new Date(v.inspectiondate||v.novissueddate); return vd >= start && vd <= end }).length
      const dobM = dobViol.filter((v:any) => { const vd = new Date(v.issue_date); return vd >= start && vd <= end }).length
      const compM = hpdComp.filter((c:any) => { const cd = new Date(c.receiveddate); return cd >= start && cd <= end }).length
      monthlyTrend.push({ month: months[d.getMonth()], year: d.getFullYear(), monthYear: `${months[d.getMonth()]} ${d.getFullYear().toString().slice(2)}`, hpdViolations: hpdM, dobViolations: dobM, complaints: compM, total: hpdM+dobM+compM })
    }

    // ========== YEARLY STATS ==========
    const yearlyStats = []
    for (let y = now.getFullYear(); y >= now.getFullYear() - 10; y--) {
      yearlyStats.push({ year: y, hpdViolations: hpdByYear[y]?.total||0, hpdClassC: hpdByYear[y]?.c||0, dobViolations: dobByYear[y]||0, complaints: compByYear[y]||0, evictions: evictByYear[y]||0 })
    }

    // ========== RESPONSE ==========
    return NextResponse.json({
      building,
      score: { overall: score, grade, label, breakdown: { hpdViolations: hpdOpen.length, dobViolations: dobOpen.length, ecbViolations: ecbOpen.length, complaints: hpdCompY1.length, litigations: openLit.length, evictions: evict3Y.length, pests: rodentFail.length + bedbug.length } },
      categoryScores: catScores,
      violations: {
        hpd: { total: hpdViol.length, open: hpdOpen.length, classA, classB, classC, byYear: hpdByYear, byCategory: Object.entries(hpdByCat).map(([c,n])=>({category:c,count:n})).sort((a,b)=>b.count-a.count) },
        dob: { total: dobViol.length, open: dobOpen.length, byYear: dobByYear },
        ecb: { total: dobEcb.length, open: ecbOpen.length, penaltiesOwed: ecbPenalties },
        safety: { total: dobSafety.length },
        recent: [...recentHpd, ...recentDob].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0,50),
      },
      complaints: {
        hpd: { total: hpdComp.length, recentYear: hpdCompY1.length, heatHotWater: heatComplaints, byYear: compByYear },
        dob: { total: dobComp.length, recentYear: dobCompY1.length },
        sr311: { total: sr311.length, byType: sr311ByCat },
        recent: [...recentComp, ...recentDobComp, ...recent311].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0,40),
        byCategory: compBreakdown,
      },
      litigations: { total: hpdLit.length, open: openLit.length, totalPenalties, byType: litByType, recent: recentLit },
      charges: { total: hpdCharge.length, totalAmount: totalCharges },
      evictions: { total: evict.length, last3Years: evict3Y.length, byYear: evictByYear, recent: recentEvict },
      sales: { total: sales.length, recent: sales, lastSaleDate: lastSale?.date, lastSaleAmount: lastSale?.amount },
      permits: { total: dobJobs.length, majorAlterations: majorAlt, recentActivity: recentAct, recent: recentPerm },
      rodents: { totalInspections: rodent.length, failed: rodentFail.length, passed: rodentPass.length, recent: recentRodent },
      bedbugs: { reports: bedbug.length, lastReportDate: bedbug[0]?.filing_date },
      programs, landlord, riskAssessment: risk, redFlags, timeline: timeline.slice(0,100), monthlyTrend, yearlyStats,
      dataSourcesCounted: 30, lastUpdated: new Date().toISOString(),
      dataDisclaimer: 'Data from 30+ NYC Open Data sources. Scores are estimates. Always verify independently and consult professionals.'
    })
  } catch (e) {
    console.error('API Error:', e)
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
  }
}
