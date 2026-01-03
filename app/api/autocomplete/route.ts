import { NextRequest, NextResponse } from 'next/server'
import { BOROUGH_CODES, ZIP_TO_NEIGHBORHOOD } from '@/lib/data-sources'

// Pad BBL to exactly 10 digits
function padBBL(bbl: string): string {
  if (!bbl) return ''
  // BBL format: 1 digit borough + 5 digit block + 4 digit lot = 10 total
  const clean = bbl.replace(/\D/g, '')
  if (clean.length === 10) return clean
  if (clean.length < 10) return clean.padStart(10, '0')
  return clean.slice(0, 10)
}

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('q')
  if (!query || query.length < 2) return NextResponse.json({ suggestions: [] })

  try {
    // Use full-text search on address field for better results
    const searchQuery = `https://data.cityofnewyork.us/resource/64uk-42ks.json?$where=address LIKE '%25${query.toUpperCase().replace(/'/g, "''")}%25'&$limit=15&$select=bbl,address,borough,zipcode,unitsres&$order=unitsres DESC`
    
    const res = await fetch(searchQuery, { 
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 60 }
    })
    
    let data = await res.json()
    
    // If no results with LIKE, try full-text search
    if (!data?.length || data.length === 0) {
      const fallbackQuery = `https://data.cityofnewyork.us/resource/64uk-42ks.json?$q=${encodeURIComponent(query)}&$limit=15&$select=bbl,address,borough,zipcode,unitsres`
      const fallbackRes = await fetch(fallbackQuery, { headers: { 'Accept': 'application/json' } })
      data = await fallbackRes.json()
    }

    if (!Array.isArray(data)) return NextResponse.json({ suggestions: [] })

    const seen = new Set<string>()
    const suggestions = data
      .filter((item: any) => {
        if (!item.address || !item.bbl) return false
        const paddedBBL = padBBL(item.bbl)
        if (paddedBBL.length !== 10 || seen.has(item.address)) return false
        seen.add(item.address)
        return true
      })
      .map((item: any) => ({
        bbl: padBBL(item.bbl),
        address: item.address,
        borough: BOROUGH_CODES[item.borough] || item.borough || '',
        zipcode: item.zipcode || '',
        neighborhood: ZIP_TO_NEIGHBORHOOD[item.zipcode] || '',
        units: +item.unitsres || 0,
      }))
      .slice(0, 8)

    return NextResponse.json({ suggestions })
  } catch (e) {
    console.error('Autocomplete error:', e)
    return NextResponse.json({ suggestions: [] })
  }
}
