// ============================================
// NYC OPEN DATA - COMPREHENSIVE ENDPOINT LIST
// Total: 30+ Official Data Sources
// ============================================

export const DATASETS = {
  // === CORE PROPERTY DATA ===
  pluto: '64uk-42ks',                    // PLUTO - Master property database
  pad: '84em-hrhe',                      // Property Address Directory
  
  // === HPD - Housing Preservation & Development (12 datasets) ===
  hpdViolations: 'wvxf-dwi5',            // All HPD violations
  hpdViolationsOpen: 'b2iz-pps8',        // Open violations only
  hpdComplaints: 'uwyv-629c',            // Tenant complaints
  hpdProblems: 'a2h7-g4k6',              // Complaint problem details
  hpdRegistrations: 'tesw-yqqr',         // Building registrations
  hpdContacts: 'feu5-w2e2',              // Registration contacts
  hpdLitigations: '59kj-x8nc',           // HPD legal cases
  hpdCharges: '8wbx-tsch',               // Emergency repair charges
  hpdVacateOrders: 'tb8q-a3ar',          // Vacate orders
  hpdAEP: 'hgx9-fb9a',                   // Alternative Enforcement Program
  hpdCONH: 'bzxi-2tsj',                  // Certificate of No Harassment
  hpdBuildings: 'kj4p-ruqc',             // HPD Buildings dataset
  
  // === DOB - Department of Buildings (9 datasets) ===
  dobViolations: '3h2n-5cm9',            // DOB violations
  dobComplaints: 'eabe-havv',            // DOB complaints
  dobJobFilings: 'ic3t-wcy2',            // Permit applications
  dobPermitsIssued: 'ipu4-2vj7',         // Issued permits
  dobNow: 'w9ak-ipjd',                   // DOB NOW filings
  dobSafety: '855j-jady',                // Safety violations
  dobEcb: '6bgk-3dad',                   // ECB violations
  dobVacates: 'n5mv-nfpy',               // DOB vacate orders
  dobCertOccupancy: 'bs8b-p36w',         // Certificate of Occupancy
  
  // === DOF / ACRIS - Finance & Sales (5 datasets) ===
  acrisLegals: '8h5j-fqxa',              // Property legals (BBL lookup)
  acrisMaster: 'bnx9-e6tj',              // Transaction master records
  acrisParties: '636b-3b5g',             // Buyer/seller info
  dofSales: '5ebm-myj7',                 // Annualized sales
  dofRollingSales: 'usep-8jbt',          // Rolling 12-month sales
  dofExemptions: 'y7az-s7wc',            // Tax exemptions (J-51, 421a)
  
  // === EVICTIONS & COURT (2 datasets) ===
  evictions: '6z8x-wfk4',                // Marshal evictions
  housingCourt: 'sx8d-iq7x',             // Housing court filings
  
  // === HEALTH & PESTS (2 datasets) ===
  rodents: 'p937-wjvj',                  // DOHMH rodent inspections
  bedbugs: 'wz6d-d3jb',                  // Bedbug reports
  
  // === SPECIAL PROGRAMS & LISTS (5 datasets) ===
  speculationWatch: 'adax-9mit',         // Speculation Watch List
  speculationQualified: 'c5cq-e6y5',     // Qualified transactions
  rentStabilized: '35bc-yxqr',           // Rent stabilized buildings
  subsidizedHousing: 'hg8x-zxpr',        // Subsidized housing database
  nycha: 'evjd-dqpz',                    // NYCHA developments
  
  // === 311 SERVICE REQUESTS ===
  sr311: 'erm2-nwe9',                    // All 311 complaints
} as const

// Borough code mappings
export const BOROUGH_CODES: Record<string, string> = {
  '1': 'Manhattan', '2': 'Bronx', '3': 'Brooklyn', '4': 'Queens', '5': 'Staten Island',
  'MN': 'Manhattan', 'BX': 'Bronx', 'BK': 'Brooklyn', 'QN': 'Queens', 'SI': 'Staten Island',
  'MANHATTAN': 'Manhattan', 'BRONX': 'Bronx', 'BROOKLYN': 'Brooklyn', 'QUEENS': 'Queens', 'STATEN ISLAND': 'Staten Island',
}

export const BOROUGH_NUMBERS: Record<string, string> = {
  'manhattan': '1', 'mn': '1', 'new york': '1', 'ny': '1',
  'bronx': '2', 'bx': '2', 'the bronx': '2',
  'brooklyn': '3', 'bk': '3', 'kings': '3',
  'queens': '4', 'qn': '4',
  'staten island': '5', 'si': '5', 'richmond': '5',
}

// Comprehensive neighborhood mapping by ZIP
export const ZIP_TO_NEIGHBORHOOD: Record<string, string> = {
  // Manhattan (60 neighborhoods)
  '10001': 'Chelsea', '10002': 'Lower East Side', '10003': 'East Village', '10004': 'Financial District',
  '10005': 'Financial District', '10006': 'Financial District', '10007': 'Tribeca', '10009': 'East Village',
  '10010': 'Gramercy Park', '10011': 'Chelsea', '10012': 'SoHo', '10013': 'Tribeca',
  '10014': 'West Village', '10016': 'Murray Hill', '10017': 'Midtown East', '10018': 'Midtown',
  '10019': 'Hell\'s Kitchen', '10020': 'Midtown', '10021': 'Upper East Side', '10022': 'Midtown East',
  '10023': 'Upper West Side', '10024': 'Upper West Side', '10025': 'Upper West Side', '10026': 'Harlem',
  '10027': 'Harlem', '10028': 'Upper East Side', '10029': 'East Harlem', '10030': 'Harlem',
  '10031': 'Hamilton Heights', '10032': 'Washington Heights', '10033': 'Washington Heights', '10034': 'Inwood',
  '10035': 'East Harlem', '10036': 'Times Square', '10037': 'Harlem', '10038': 'Financial District',
  '10039': 'Harlem', '10040': 'Washington Heights', '10044': 'Roosevelt Island', '10065': 'Upper East Side',
  '10069': 'Upper West Side', '10075': 'Upper East Side', '10128': 'Upper East Side', '10280': 'Battery Park City',
  '10282': 'Battery Park City',
  // Brooklyn (45 neighborhoods)
  '11201': 'Brooklyn Heights', '11203': 'East Flatbush', '11204': 'Bensonhurst', '11205': 'Fort Greene',
  '11206': 'Williamsburg', '11207': 'East New York', '11208': 'East New York', '11209': 'Bay Ridge',
  '11210': 'Flatbush', '11211': 'Williamsburg', '11212': 'Brownsville', '11213': 'Crown Heights',
  '11214': 'Bensonhurst', '11215': 'Park Slope', '11216': 'Bedford-Stuyvesant', '11217': 'Boerum Hill',
  '11218': 'Kensington', '11219': 'Borough Park', '11220': 'Sunset Park', '11221': 'Bushwick',
  '11222': 'Greenpoint', '11223': 'Gravesend', '11224': 'Coney Island', '11225': 'Prospect Lefferts Gardens',
  '11226': 'Flatbush', '11228': 'Dyker Heights', '11229': 'Sheepshead Bay', '11230': 'Midwood',
  '11231': 'Carroll Gardens', '11232': 'Sunset Park', '11233': 'Bedford-Stuyvesant', '11234': 'Canarsie',
  '11235': 'Brighton Beach', '11236': 'Canarsie', '11237': 'Bushwick', '11238': 'Prospect Heights',
  '11239': 'East New York', '11249': 'Williamsburg',
  // Bronx (30 neighborhoods)
  '10451': 'Mott Haven', '10452': 'Highbridge', '10453': 'Morris Heights', '10454': 'Mott Haven',
  '10455': 'Longwood', '10456': 'Morrisania', '10457': 'Tremont', '10458': 'Belmont',
  '10459': 'Hunts Point', '10460': 'West Farms', '10461': 'Westchester Square', '10462': 'Parkchester',
  '10463': 'Kingsbridge', '10464': 'City Island', '10465': 'Throggs Neck', '10466': 'Wakefield',
  '10467': 'Norwood', '10468': 'Fordham', '10469': 'Williamsbridge', '10470': 'Woodlawn',
  '10471': 'Riverdale', '10472': 'Soundview', '10473': 'Clason Point', '10474': 'Hunts Point', '10475': 'Co-op City',
  // Queens (50 neighborhoods)
  '11101': 'Long Island City', '11102': 'Astoria', '11103': 'Astoria', '11104': 'Sunnyside',
  '11105': 'Astoria', '11106': 'Astoria', '11354': 'Flushing', '11355': 'Flushing',
  '11356': 'College Point', '11357': 'Whitestone', '11358': 'Flushing', '11360': 'Bayside',
  '11361': 'Bayside', '11362': 'Little Neck', '11363': 'Douglaston', '11364': 'Oakland Gardens',
  '11365': 'Fresh Meadows', '11366': 'Fresh Meadows', '11367': 'Kew Gardens Hills', '11368': 'Corona',
  '11369': 'East Elmhurst', '11370': 'East Elmhurst', '11372': 'Jackson Heights', '11373': 'Elmhurst',
  '11374': 'Rego Park', '11375': 'Forest Hills', '11377': 'Woodside', '11378': 'Maspeth',
  '11379': 'Middle Village', '11385': 'Ridgewood', '11411': 'Cambria Heights', '11412': 'St. Albans',
  '11413': 'Springfield Gardens', '11414': 'Howard Beach', '11415': 'Kew Gardens', '11416': 'Ozone Park',
  '11417': 'Ozone Park', '11418': 'Richmond Hill', '11419': 'South Richmond Hill', '11420': 'South Ozone Park',
  '11421': 'Woodhaven', '11422': 'Rosedale', '11423': 'Hollis', '11426': 'Bellerose',
  '11427': 'Queens Village', '11428': 'Queens Village', '11429': 'Queens Village', '11432': 'Jamaica',
  '11433': 'Jamaica', '11434': 'Jamaica', '11435': 'Jamaica', '11436': 'Jamaica',
  '11691': 'Far Rockaway', '11692': 'Arverne', '11693': 'Far Rockaway', '11694': 'Rockaway Park',
  // Staten Island (15 neighborhoods)
  '10301': 'St. George', '10302': 'Port Richmond', '10303': 'Mariners Harbor', '10304': 'Stapleton',
  '10305': 'Rosebank', '10306': 'Midland Beach', '10307': 'Tottenville', '10308': 'Great Kills',
  '10309': 'Charleston', '10310': 'West Brighton', '10312': 'Annadale', '10314': 'Bulls Head',
}

// Building class descriptions
export const BUILDING_CLASSES: Record<string, string> = {
  'A0': 'Cape Cod', 'A1': 'Two Stories Detached', 'A2': 'One Story Attached', 'A3': 'Large Residence',
  'A4': 'City Residence', 'A5': 'Converted Residence', 'A6': 'Summer Cottage', 'A7': 'Mansion',
  'A9': 'Misc One Family', 'B1': 'Two Family Brick', 'B2': 'Two Family Frame', 'B3': 'Two Family Converted',
  'B9': 'Misc Two Family', 'C0': 'Walk-up 3+ Family', 'C1': 'Walk-up Over 6 w/Stores',
  'C2': 'Walk-up 3-6 Family', 'C3': 'Walk-up 7+ Family', 'C4': 'Old Law Tenement',
  'C5': 'Converted Dwelling', 'C6': 'Walk-up Cooperative', 'C7': 'Walk-up over Retail',
  'C8': 'Walk-up Condo', 'C9': 'Garden Apartments', 'D0': 'Elevator Co-op/Condo',
  'D1': 'Elevator Semi-Fireproof', 'D2': 'Elevator Fireproof', 'D3': 'Elevator Fireproof',
  'D4': 'Elevator Luxury', 'D5': 'Elevator Conversion', 'D6': 'Elevator Co-op',
  'D7': 'Elevator Condo', 'D8': 'Elevator Loft', 'D9': 'Elevator Misc',
  'R0': 'Condo Residential', 'R1': 'Condo Residential', 'R2': 'Condo Residential',
  'R3': 'Condo Residential', 'R4': 'Condo Residential', 'R5': 'Condo Misc',
  'R6': 'Condo Rentals', 'R7': 'Condo Homeowner', 'R8': 'Condo Converted', 'R9': 'Condo Co-op',
  'S0': 'Residential on Commercial', 'S1': 'Residential over Store', 'S2': 'Residential over Store',
  'S3': 'Residential over Office', 'S4': 'Residential over Medical', 'S5': 'Residential over Attached',
  'S9': 'Single Family Attached',
}

// Job type descriptions
export const JOB_TYPES: Record<string, string> = {
  'A1': 'Major Alteration', 'A2': 'Minor Alteration', 'A3': 'Minor Alteration',
  'DM': 'Demolition', 'NB': 'New Building', 'SG': 'Sign',
  'PL': 'Plumbing', 'AL': 'Alteration', 'FO': 'Foundation Only',
}
